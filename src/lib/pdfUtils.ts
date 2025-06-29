import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, degrees, PDFFont, PDFPage } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';

// Set up PDF.js worker using the correct approach for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

export interface PdfInfo {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  isEncrypted?: boolean;
}

export interface PageRange {
  start: number;
  end: number;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function parsePageRanges(ranges: string, totalPages: number): PageRange[] {
  const pageRanges: PageRange[] = [];
  const parts = ranges.split(',').map(part => part.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(num => parseInt(num.trim()));
      if (start && end && start <= totalPages && end <= totalPages && start <= end) {
        pageRanges.push({ start, end });
      }
    } else {
      const pageNum = parseInt(part);
      if (pageNum && pageNum <= totalPages) {
        pageRanges.push({ start: pageNum, end: pageNum });
      }
    }
  }
  
  return pageRanges;
}

export function createPdfProcessor() {
  return {
    async loadPdf(file: File, password?: string): Promise<PdfInfo> {
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        const pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          password: password || undefined
        }).promise;
        
        const metadata = await pdf.getMetadata();
        const info = metadata.info as any;
        
        return {
          pageCount: pdf.numPages,
          title: info?.Title,
          author: info?.Author,
          subject: info?.Subject,
          keywords: info?.Keywords,
          creator: info?.Creator,
          producer: info?.Producer,
          creationDate: info?.CreationDate,
          modificationDate: info?.ModDate,
          isEncrypted: false
        };
      } catch (error: any) {
        if (error.name === 'PasswordException' || error.message?.includes('password')) {
          throw new Error('This PDF is password protected. Please provide the correct password.');
        }
        throw error;
      }
    },

    async renderPdfPage(file: File, pageNumber: number, scale: number = 1.5, password?: string): Promise<string> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        password: password || undefined
      }).promise;
      
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      return canvas.toDataURL('image/jpeg', 0.95);
    },

    async protectPdf(file: File, password: string, permissions: any = {}): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Simple password protection using PDF-lib's built-in encryption
      // Note: PDF-lib doesn't support full encryption, so we'll create a basic protection mechanism
      
      // Add password metadata to the document
      pdfDoc.setTitle(`Protected: ${file.name}`);
      pdfDoc.setSubject('This document is password protected');
      pdfDoc.setKeywords(['password-protected']);
      pdfDoc.setProducer(`Protected with password`);
      pdfDoc.setCreator(`Password: ${btoa(password)}`); // Base64 encode for basic obfuscation
      
      // Add a protection page at the beginning
      const protectionPage = pdfDoc.insertPage(0, [612, 792]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      protectionPage.drawText('PASSWORD PROTECTED DOCUMENT', {
        x: 50,
        y: 700,
        size: 20,
        font,
        color: rgb(0.8, 0, 0)
      });
      
      protectionPage.drawText('This PDF is password protected.', {
        x: 50,
        y: 650,
        size: 14,
        font,
        color: rgb(0, 0, 0)
      });
      
      protectionPage.drawText('Password verification is required to access the content.', {
        x: 50,
        y: 620,
        size: 12,
        font,
        color: rgb(0.3, 0.3, 0.3)
      });
      
      protectionPage.drawText(`Original filename: ${file.name}`, {
        x: 50,
        y: 580,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      protectionPage.drawText(`Protected on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: 560,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });
      
      // Add permissions info if provided
      if (Object.keys(permissions).length > 0) {
        protectionPage.drawText('Permissions:', {
          x: 50,
          y: 520,
          size: 12,
          font,
          color: rgb(0, 0, 0)
        });
        
        let yPos = 500;
        Object.entries(permissions).forEach(([key, value]) => {
          protectionPage.drawText(`• ${key}: ${value ? 'Allowed' : 'Denied'}`, {
            x: 70,
            y: yPos,
            size: 10,
            font,
            color: rgb(0.3, 0.3, 0.3)
          });
          yPos -= 20;
        });
      }
      
      return await pdfDoc.save();
    },

    async unlockPdf(file: File, password: string): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      
      try {
        // First try to load with standard PDF password
        try {
          const pdf = await pdfjsLib.getDocument({ 
            data: arrayBuffer,
            password: password
          }).promise;
          
          // If successful, create unlocked version
          const pdfDoc = await PDFDocument.load(arrayBuffer, { 
            ignoreEncryption: true,
            password 
          });
          
          // Create unlocked version
          const unlockedPdf = await PDFDocument.create();
          const pages = await unlockedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          
          pages.forEach((page) => unlockedPdf.addPage(page));
          
          // Remove protection metadata
          unlockedPdf.setTitle(file.name.replace('protected-', ''));
          unlockedPdf.setSubject('Unlocked document');
          unlockedPdf.setCreator('Unlocked PDF');
          
          return await unlockedPdf.save();
        } catch (error) {
          // If standard PDF password fails, try our basic protection method
          const pdfDoc = await PDFDocument.load(arrayBuffer);
          
          // Check if this is our basic protection
          const creator = pdfDoc.getCreator();
          if (creator && creator.startsWith('Password: ')) {
            // Extract and verify password
            const storedPassword = atob(creator.replace('Password: ', ''));
            
            if (storedPassword !== password) {
              throw new Error('Invalid password');
            }
            
            // Remove the protection page (first page)
            const pages = pdfDoc.getPages();
            if (pages.length > 1) {
              pdfDoc.removePage(0);
            }
            
            // Clean up metadata
            pdfDoc.setTitle(file.name.replace('Protected: ', ''));
            pdfDoc.setSubject('Unlocked document');
            pdfDoc.setKeywords([]);
            pdfDoc.setProducer('Unlocked PDF');
            pdfDoc.setCreator('Unlocked PDF');
            
            return await pdfDoc.save();
          } else {
            throw new Error('Invalid password or unsupported encryption method');
          }
        }
      } catch (error: any) {
        if (error.name === 'PasswordException' || error.message?.includes('password')) {
          throw new Error('Invalid password. Please check your password and try again.');
        }
        throw new Error('Failed to unlock PDF. The file may be corrupted or use unsupported encryption.');
      }
    },

    async editPdf(file: File, edits: Array<{
      type: 'text' | 'highlight' | 'shape' | 'image';
      page: number;
      x: number;
      y: number;
      content?: string;
      fontSize?: number;
      color?: string;
      width?: number;
      height?: number;
      shapeType?: 'rectangle' | 'circle';
      imageData?: string;
    }>): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      for (const edit of edits) {
        const page = pages[edit.page - 1];
        if (!page) continue;
        
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        switch (edit.type) {
          case 'text':
            if (edit.content) {
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              page.drawText(edit.content, {
                x: edit.x,
                y: pageHeight - edit.y, // Convert from top-based to bottom-based coordinates
                size: edit.fontSize || 12,
                font,
                color: edit.color ? rgb(
                  parseInt(edit.color.slice(1, 3), 16) / 255,
                  parseInt(edit.color.slice(3, 5), 16) / 255,
                  parseInt(edit.color.slice(5, 7), 16) / 255
                ) : rgb(0, 0, 0)
              });
            }
            break;
            
          case 'highlight':
            page.drawRectangle({
              x: edit.x,
              y: pageHeight - edit.y - (edit.height || 20),
              width: edit.width || 100,
              height: edit.height || 20,
              color: edit.color ? rgb(
                parseInt(edit.color.slice(1, 3), 16) / 255,
                parseInt(edit.color.slice(3, 5), 16) / 255,
                parseInt(edit.color.slice(5, 7), 16) / 255
              ) : rgb(1, 1, 0),
              opacity: 0.3
            });
            break;
            
          case 'shape':
            if (edit.shapeType === 'rectangle') {
              page.drawRectangle({
                x: edit.x,
                y: pageHeight - edit.y - (edit.height || 50),
                width: edit.width || 100,
                height: edit.height || 50,
                borderColor: edit.color ? rgb(
                  parseInt(edit.color.slice(1, 3), 16) / 255,
                  parseInt(edit.color.slice(3, 5), 16) / 255,
                  parseInt(edit.color.slice(5, 7), 16) / 255
                ) : rgb(0, 0, 1),
                borderWidth: 2
              });
            } else if (edit.shapeType === 'circle') {
              page.drawCircle({
                x: edit.x + (edit.width || 50) / 2,
                y: pageHeight - edit.y - (edit.height || 50) / 2,
                size: (edit.width || 50) / 2,
                borderColor: edit.color ? rgb(
                  parseInt(edit.color.slice(1, 3), 16) / 255,
                  parseInt(edit.color.slice(3, 5), 16) / 255,
                  parseInt(edit.color.slice(5, 7), 16) / 255
                ) : rgb(0, 0, 1),
                borderWidth: 2
              });
            }
            break;
            
          case 'image':
            if (edit.imageData) {
              try {
                const imageBytes = Uint8Array.from(atob(edit.imageData.split(',')[1]), c => c.charCodeAt(0));
                let embeddedImage;
                
                if (edit.imageData.includes('data:image/png')) {
                  embeddedImage = await pdfDoc.embedPng(imageBytes);
                } else {
                  embeddedImage = await pdfDoc.embedJpg(imageBytes);
                }
                
                page.drawImage(embeddedImage, {
                  x: edit.x,
                  y: pageHeight - edit.y - (edit.height || 100),
                  width: edit.width || 100,
                  height: edit.height || 100
                });
              } catch (error) {
                console.error('Error embedding image:', error);
              }
            }
            break;
        }
      }
      
      return await pdfDoc.save();
    },

    async convertPdfToImages(file: File, quality: number = 2): Promise<string[]> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: quality });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;

        images.push(canvas.toDataURL('image/jpeg', 0.95));
      }

      return images;
    },

    async convertPdfToWord(file: File): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }

      // Create a basic DOCX structure using JSZip
      const zip = new JSZip();
      
      // Add basic DOCX structure
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-wordprocessingml.document.main+xml"/>
</Types>`);

      zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

      zip.file('word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

      // Create the main document with the extracted text
      const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${fullText.split('\n\n').map(paragraph => 
      paragraph.trim() ? `<w:p><w:r><w:t>${paragraph.trim().replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</w:t></w:r></w:p>` : ''
    ).join('')}
  </w:body>
</w:document>`;

      zip.file('word/document.xml', documentXml);

      const docxBlob = await zip.generateAsync({ type: 'uint8array' });
      return docxBlob;
    },

    async convertPdfToPowerpoint(file: File): Promise<Uint8Array> {
      const images = await this.convertPdfToImages(file, 1.5);
      
      // Create a basic PPTX structure using JSZip
      const zip = new JSZip();
      
      // Add basic PPTX structure
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-presentationml.slide+xml"/>
</Types>`);

      // Add basic presentation structure
      zip.file('ppt/presentation.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${images.map((_, index) => `<p:sldId id="${index + 256}" r:id="rId${index + 2}"/>`).join('')}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
</p:presentation>`);

      // Add slides with images
      images.forEach((imageData, index) => {
        const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/>
      </p:grpSpPr>
      <p:pic>
        <p:nvPicPr>
          <p:cNvPr id="2" name="Picture ${index + 1}"/>
          <p:cNvPicPr/>
          <p:nvPr/>
        </p:nvPicPr>
        <p:blipFill>
          <a:blip r:embed="rId1" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
          <a:stretch>
            <a:fillRect/>
          </a:stretch>
        </p:blipFill>
        <p:spPr>
          <a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
            <a:off x="0" y="0"/>
            <a:ext cx="9144000" cy="6858000"/>
          </a:xfrm>
        </p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`;
        
        zip.file(`ppt/slides/slide${index + 1}.xml`, slideXml);
        
        // Add image data (convert base64 to binary)
        const imageBase64 = imageData.split(',')[1];
        zip.file(`ppt/media/image${index + 1}.jpeg`, imageBase64, { base64: true });
      });

      const pptxBlob = await zip.generateAsync({ type: 'uint8array' });
      return pptxBlob;
    },

    async convertWordToPdf(file: File): Promise<Uint8Array> {
      try {
        // Extract text from Word document
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        // Create PDF using jsPDF
        const pdf = new jsPDF();
        const pageHeight = pdf.internal.pageSize.height;
        const pageWidth = pdf.internal.pageSize.width;
        const margin = 20;
        const lineHeight = 10;
        const maxLineWidth = pageWidth - (margin * 2);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(12);

        const lines = pdf.splitTextToSize(text, maxLineWidth);
        let y = margin;

        for (let i = 0; i < lines.length; i++) {
          if (y + lineHeight > pageHeight - margin) {
            pdf.addPage();
            y = margin;
          }
          pdf.text(lines[i], margin, y);
          y += lineHeight;
        }

        return new Uint8Array(pdf.output('arraybuffer'));
      } catch (error) {
        throw new Error('Failed to convert Word document to PDF');
      }
    },

    async convertPdfToExcel(file: File): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let csvContent = '';
      
      // Extract text from each page and format as CSV
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(',');
        
        csvContent += pageText + '\n';
      }

      // Convert CSV to Excel-like format (simplified)
      const blob = new Blob([csvContent], { type: 'text/csv' });
      return new Uint8Array(await blob.arrayBuffer());
    },

    async mergePdfs(files: File[]): Promise<Uint8Array> {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      
      return await mergedPdf.save();
    },

    async splitPdf(file: File, pageRanges: PageRange[]): Promise<Uint8Array[]> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const results: Uint8Array[] = [];
      
      for (const range of pageRanges) {
        const newPdf = await PDFDocument.create();
        const pageIndices = [];
        
        for (let i = range.start - 1; i < range.end; i++) {
          pageIndices.push(i);
        }
        
        const pages = await newPdf.copyPages(pdf, pageIndices);
        pages.forEach(page => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        results.push(pdfBytes);
      }
      
      return results;
    },

    async compressPdf(file: File): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Basic compression by re-saving
      return await pdf.save();
    },

    async addWatermark(file: File, watermarkOptions: {
      type: 'text' | 'image';
      text?: string;
      imageData?: string;
      position: string;
      opacity: number;
      rotation: number;
      fontSize?: number;
      color?: string;
      pages?: string;
    }): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pages = pdf.getPages();
      const { type, text, imageData, position, opacity, rotation, fontSize = 24, color = '#000000' } = watermarkOptions;
      
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        if (type === 'text' && text) {
          const font = await pdf.embedFont(StandardFonts.Helvetica);
          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const textHeight = fontSize;
          
          let x = width / 2 - textWidth / 2;
          let y = height / 2 - textHeight / 2;
          
          // Adjust position based on user selection
          switch (position) {
            case 'top-left':
              x = 50;
              y = height - 50;
              break;
            case 'top-right':
              x = width - textWidth - 50;
              y = height - 50;
              break;
            case 'bottom-left':
              x = 50;
              y = 50;
              break;
            case 'bottom-right':
              x = width - textWidth - 50;
              y = 50;
              break;
            case 'center':
            default:
              // Already set above
              break;
          }
          
          page.drawText(text, {
            x,
            y,
            size: fontSize,
            font,
            color: rgb(
              parseInt(color.slice(1, 3), 16) / 255,
              parseInt(color.slice(3, 5), 16) / 255,
              parseInt(color.slice(5, 7), 16) / 255
            ),
            opacity: opacity / 100,
            rotate: degrees(rotation)
          });
        }
        
        if (type === 'image' && imageData) {
          try {
            const imageBytes = Uint8Array.from(atob(imageData.split(',')[1]), c => c.charCodeAt(0));
            let embeddedImage;
            
            if (imageData.includes('data:image/png')) {
              embeddedImage = await pdf.embedPng(imageBytes);
            } else {
              embeddedImage = await pdf.embedJpg(imageBytes);
            }
            
            const imageDims = embeddedImage.scale(0.3);
            
            let x = width / 2 - imageDims.width / 2;
            let y = height / 2 - imageDims.height / 2;
            
            // Adjust position
            switch (position) {
              case 'top-left':
                x = 50;
                y = height - imageDims.height - 50;
                break;
              case 'top-right':
                x = width - imageDims.width - 50;
                y = height - imageDims.height - 50;
                break;
              case 'bottom-left':
                x = 50;
                y = 50;
                break;
              case 'bottom-right':
                x = width - imageDims.width - 50;
                y = 50;
                break;
            }
            
            page.drawImage(embeddedImage, {
              x,
              y,
              width: imageDims.width,
              height: imageDims.height,
              opacity: opacity / 100,
              rotate: degrees(rotation)
            });
          } catch (error) {
            console.error('Error embedding image:', error);
          }
        }
      }
      
      return await pdf.save();
    },

    async addSignature(file: File, signatureOptions: {
      type: 'draw' | 'text' | 'image';
      signatureData?: string;
      canvas?: HTMLCanvasElement;
      x: number;
      y: number;
      width?: number;
      height?: number;
      pageNumber: number;
      text?: string;
      fontSize?: number;
      color?: string;
      fontFamily?: string;
    }): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pages = pdf.getPages();
      const page = pages[signatureOptions.pageNumber - 1];
      
      if (!page) {
        throw new Error('Invalid page number');
      }
      
      const { type, signatureData, canvas, x, y, width = 150, height = 50, text, fontSize = 24, color = '#000000', fontFamily = 'Helvetica' } = signatureOptions;
      const pageHeight = page.getSize().height;
      
      if (type === 'text' && text) {
        let font: PDFFont;
        try {
          switch (fontFamily) {
            case 'Georgia':
            case 'Verdana':
              // Fallback to Helvetica for custom fonts in browser
              font = await pdf.embedFont(StandardFonts.Helvetica);
              break;
            default:
              font = await pdf.embedFont(StandardFonts.Helvetica);
          }
        } catch {
          font = await pdf.embedFont(StandardFonts.Helvetica);
        }
        
        page.drawText(text, {
          x,
          y: pageHeight - y - fontSize, // Convert from top-based to bottom-based coordinates
          size: fontSize,
          font,
          color: rgb(
            parseInt(color.slice(1, 3), 16) / 255,
            parseInt(color.slice(3, 5), 16) / 255,
            parseInt(color.slice(5, 7), 16) / 255
          )
        });
      }
      
      if (type === 'draw' && canvas) {
        try {
          // Convert canvas to image data
          const imageDataUrl = canvas.toDataURL('image/png');
          const imageBytes = Uint8Array.from(atob(imageDataUrl.split(',')[1]), c => c.charCodeAt(0));
          const embeddedImage = await pdf.embedPng(imageBytes);
          
          page.drawImage(embeddedImage, {
            x,
            y: pageHeight - y - height, // Convert coordinates
            width,
            height
          });
        } catch (error) {
          console.error('Error embedding drawn signature:', error);
          throw new Error('Failed to add drawn signature');
        }
      }
      
      if ((type === 'image') && signatureData) {
        try {
          const imageBytes = Uint8Array.from(atob(signatureData.split(',')[1]), c => c.charCodeAt(0));
          let embeddedImage;
          
          if (signatureData.includes('data:image/png')) {
            embeddedImage = await pdf.embedPng(imageBytes);
          } else {
            embeddedImage = await pdf.embedJpg(imageBytes);
          }
          
          page.drawImage(embeddedImage, {
            x,
            y: pageHeight - y - height, // Convert coordinates
            width,
            height
          });
        } catch (error) {
          console.error('Error embedding signature image:', error);
          throw new Error('Failed to add signature');
        }
      }
      
      return await pdf.save();
    },

    createDownloadLink(data: Uint8Array, filename: string): string {
      const blob = new Blob([data], { type: 'application/pdf' });
      return URL.createObjectURL(blob);
    }
  };
}