import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import mammoth from 'mammoth';
import jsPDF from 'jspdf';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
    async loadPdf(file: File): Promise<PdfInfo> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
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
      };
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

      // Create a simple HTML structure that can be converted to DOCX
      const htmlContent = `
        <html>
          <head>
            <meta charset="utf-8">
            <title>Converted Document</title>
          </head>
          <body>
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              ${fullText.split('\n\n').map(paragraph => 
                paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
              ).join('')}
            </div>
          </body>
        </html>
      `;

      // Convert HTML to DOCX using html-docx-js
      const { default: htmlDocx } = await import('html-docx-js/dist/html-docx');
      const docxBlob = htmlDocx.asBlob(htmlContent);
      
      return new Uint8Array(await docxBlob.arrayBuffer());
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

    async protectPdf(file: File, password: string): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Note: pdf-lib doesn't support password protection in the browser
      // This is a limitation of the library. For now, we'll return the original PDF
      // and show a message to the user about this limitation
      console.warn('PDF password protection is not supported in browser environments');
      
      // Return the original PDF bytes for now
      return await pdf.save();
    },

    async unlockPdf(file: File, password: string): Promise<Uint8Array> {
      try {
        const arrayBuffer = await file.arrayBuffer();
        // Note: pdf-lib doesn't support password-protected PDF loading in browser
        // This is a limitation of the library
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // Save without any restrictions
        const pdfBytes = await pdf.save();
        return pdfBytes;
      } catch (error) {
        throw new Error('Cannot unlock PDF: Password protection/unlocking is not supported in browser environments');
      }
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
      signatureData: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
      pageNumber: number;
      text?: string;
      fontSize?: number;
      color?: string;
    }): Promise<Uint8Array> {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pages = pdf.getPages();
      const page = pages[signatureOptions.pageNumber - 1];
      
      if (!page) {
        throw new Error('Invalid page number');
      }
      
      const { type, signatureData, x, y, width = 150, height = 50, text, fontSize = 24, color = '#000000' } = signatureOptions;
      
      if (type === 'text' && text) {
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        
        page.drawText(text, {
          x,
          y: page.getHeight() - y - fontSize, // Flip Y coordinate
          size: fontSize,
          font,
          color: rgb(
            parseInt(color.slice(1, 3), 16) / 255,
            parseInt(color.slice(3, 5), 16) / 255,
            parseInt(color.slice(5, 7), 16) / 255
          )
        });
      }
      
      if ((type === 'draw' || type === 'image') && signatureData) {
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
            y: page.getHeight() - y - height, // Flip Y coordinate
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
