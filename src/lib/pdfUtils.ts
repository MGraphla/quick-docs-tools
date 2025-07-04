
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.js';

export interface PdfInfo {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const createPdfProcessor = () => {
  const loadPdf = async (file: File): Promise<PdfInfo> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
      
      return {
        pageCount: pdf.numPages,
        title: metadata.info?.Title || file.name,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        creator: metadata.info?.Creator,
        producer: metadata.info?.Producer,
        creationDate: metadata.info?.CreationDate ? new Date(metadata.info.CreationDate) : undefined,
        modificationDate: metadata.info?.ModDate ? new Date(metadata.info.ModDate) : undefined,
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF. Please ensure it\'s a valid PDF file.');
    }
  };

  const convertPdfToWord = async (file: File): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        let pageText = '';
        textContent.items.forEach((item: any) => {
          if (item.str) {
            pageText += item.str + ' ';
          }
        });
        
        fullText += pageText.trim() + '\n\n';
      }
      
      // Create a simple Word document structure
      const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Title"/>
      </w:pPr>
      <w:r>
        <w:t>Converted from ${file.name}</w:t>
      </w:r>
    </w:p>
    ${fullText.split('\n\n').map(paragraph => 
      paragraph.trim() ? `
    <w:p>
      <w:r>
        <w:t>${paragraph.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
      </w:r>
    </w:p>` : ''
    ).join('')}
  </w:body>
</w:document>`;

      // Create Word document using JSZip
      const zip = new JSZip();
      
      // Add required Word document structure
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

      zip.folder('_rels')?.file('.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

      zip.folder('word')?.file('document.xml', docContent);
      
      zip.folder('word/_rels')?.file('document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

      return new Uint8Array(await zip.generateAsync({ type: 'arraybuffer' }));
    } catch (error) {
      console.error('Error converting PDF to Word:', error);
      throw new Error('Failed to convert PDF to Word document.');
    }
  };

  const convertPdfToImages = async (file: File): Promise<string[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const images: string[] = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };
        
        await page.render(renderContext).promise;
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        images.push(imageDataUrl);
      }
      
      return images;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error('Failed to convert PDF to images.');
    }
  };

  const convertWordToPdf = async (file: File): Promise<Uint8Array> => {
    try {
      // Extract text from Word document
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 12;
      const margin = 50;
      
      const lines = text.split('\n');
      let page = pdfDoc.addPage();
      let yPosition = page.getHeight() - margin;
      
      for (const line of lines) {
        if (yPosition < margin + 20) {
          page = pdfDoc.addPage();
          yPosition = page.getHeight() - margin;
        }
        
        const wrappedLines = wrapText(line, font, fontSize, page.getWidth() - 2 * margin);
        
        for (const wrappedLine of wrappedLines) {
          if (yPosition < margin + 20) {
            page = pdfDoc.addPage();
            yPosition = page.getHeight() - margin;
          }
          
          page.drawText(wrappedLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font,
            color: rgb(0, 0, 0),
          });
          
          yPosition -= fontSize + 4;
        }
      }
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting Word to PDF:', error);
      throw new Error('Failed to convert Word document to PDF.');
    }
  };

  const convertExcelToPdf = async (file: File): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontSize = 10;
      const margin = 40;
      
      workbook.SheetNames.forEach((sheetName, sheetIndex) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) return;
        
        const page = pdfDoc.addPage();
        let yPosition = page.getHeight() - margin;
        
        // Add sheet title
        page.drawText(`Sheet: ${sheetName}`, {
          x: margin,
          y: yPosition,
          size: fontSize + 2,
          font,
          color: rgb(0, 0, 0),
        });
        yPosition -= fontSize + 10;
        
        // Add table data
        jsonData.forEach((row, rowIndex) => {
          if (yPosition < margin + 20) return; // Skip if not enough space
          
          let xPosition = margin;
          const cellWidth = (page.getWidth() - 2 * margin) / Math.max(row.length, 1);
          
          row.forEach((cell, cellIndex) => {
            const cellText = String(cell || '');
            const truncatedText = cellText.length > 15 ? cellText.substring(0, 15) + '...' : cellText;
            
            page.drawText(truncatedText, {
              x: xPosition,
              y: yPosition,
              size: fontSize,
              font,
              color: rgb(0, 0, 0),
            });
            
            xPosition += cellWidth;
          });
          
          yPosition -= fontSize + 4;
        });
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting Excel to PDF:', error);
      throw new Error('Failed to convert Excel file to PDF.');
    }
  };

  const convertImagesToPdf = async (imageFiles: File[]): Promise<Uint8Array> => {
    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const file of imageFiles) {
        const arrayBuffer = await file.arrayBuffer();
        let image;
        
        if (file.type.includes('png')) {
          image = await pdfDoc.embedPng(arrayBuffer);
        } else if (file.type.includes('jpeg') || file.type.includes('jpg')) {
          image = await pdfDoc.embedJpg(arrayBuffer);
        } else {
          // Convert other formats to JPEG first
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          const img = new Image();
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
          });
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const jpegBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(resolve as BlobCallback, 'image/jpeg', 0.95);
          });
          
          const jpegArrayBuffer = await jpegBlob!.arrayBuffer();
          image = await pdfDoc.embedJpg(jpegArrayBuffer);
        }
        
        const page = pdfDoc.addPage();
        const { width, height } = image.scale(1);
        
        // Scale image to fit page while maintaining aspect ratio
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();
        const scale = Math.min(pageWidth / width, pageHeight / height);
        
        const scaledWidth = width * scale;
        const scaledHeight = height * scale;
        
        page.drawImage(image, {
          x: (pageWidth - scaledWidth) / 2,
          y: (pageHeight - scaledHeight) / 2,
          width: scaledWidth,
          height: scaledHeight,
        });
      }
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      throw new Error('Failed to convert images to PDF.');
    }
  };

  const convertPowerpointToPdf = async (file: File): Promise<Uint8Array> => {
    try {
      // For PowerPoint files, we'll create a PDF with slide information
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      // Since we can't directly parse PowerPoint files without a library,
      // we'll create a placeholder PDF with file information
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      page.drawText(`PowerPoint Document: ${file.name}`, {
        x: 50,
        y: height - 100,
        size: 16,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText(`File Size: ${formatFileSize(file.size)}`, {
        x: 50,
        y: height - 130,
        size: 12,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
      
      page.drawText('This is a converted PDF from your PowerPoint presentation.', {
        x: 50,
        y: height - 160,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('For full PowerPoint conversion functionality, additional', {
        x: 50,
        y: height - 190,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText('libraries would be needed to parse presentation content.', {
        x: 50,
        y: height - 210,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error converting PowerPoint to PDF:', error);
      throw new Error('Failed to convert PowerPoint to PDF.');
    }
  };

  // Helper function to wrap text
  const wrapText = (text: string, font: any, fontSize: number, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  };

  return {
    loadPdf,
    convertPdfToWord,
    convertPdfToImages,
    convertWordToPdf,
    convertExcelToPdf,
    convertImagesToPdf,
    convertPowerpointToPdf,
  };
};
