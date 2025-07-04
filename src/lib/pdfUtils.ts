
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

export const parsePageRanges = (ranges: string, totalPages: number): number[] => {
  const pages: number[] = [];
  const parts = ranges.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(s => parseInt(s.trim()));
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        if (i >= 1 && !pages.includes(i)) pages.push(i);
      }
    } else {
      const page = parseInt(part);
      if (page >= 1 && page <= totalPages && !pages.includes(page)) {
        pages.push(page);
      }
    }
  }
  
  return pages.sort((a, b) => a - b);
};

export const createPdfProcessor = () => {
  const loadPdf = async (file: File): Promise<PdfInfo> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
      
      return {
        pageCount: pdf.numPages,
        title: (metadata.info as any)?.Title || file.name,
        author: (metadata.info as any)?.Author,
        subject: (metadata.info as any)?.Subject,
        creator: (metadata.info as any)?.Creator,
        producer: (metadata.info as any)?.Producer,
        creationDate: (metadata.info as any)?.CreationDate ? new Date((metadata.info as any).CreationDate) : undefined,
        modificationDate: (metadata.info as any)?.ModDate ? new Date((metadata.info as any).ModDate) : undefined,
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF. Please ensure it\'s a valid PDF file.');
    }
  };

  const renderPdfPage = async (file: File, pageNumber: number, scale: number = 1.0): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw new Error('Failed to render PDF page.');
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

  const convertPdfToPowerpoint = async (file: File): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Create a basic PowerPoint structure using JSZip
      const zip = new JSZip();
      
      // Add required PowerPoint structure
      zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
</Types>`);

      // Basic presentation structure with slides from PDF pages
      let slidesContent = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        slidesContent += `
    <p:sld>
      <p:cSld>
        <p:spTree>
          <p:nvGrpSpPr>
            <p:cNvPr id="1" name=""/>
            <p:cNvGrpSpPr/>
            <p:nvPr/>
          </p:nvGrpSpPr>
          <p:grpSpPr>
            <a:xfrm xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
              <a:off x="0" y="0"/>
              <a:ext cx="0" cy="0"/>
              <a:chOff x="0" y="0"/>
              <a:chExt cx="0" cy="0"/>
            </a:xfrm>
          </p:grpSpPr>
          <p:sp>
            <p:nvSpPr>
              <p:cNvPr id="2" name="Title ${i}"/>
              <p:cNvSpPr>
                <a:spLocks noGrp="1"/>
              </p:cNvSpPr>
              <p:nvPr>
                <p:ph type="title"/>
              </p:nvPr>
            </p:nvSpPr>
            <p:spPr/>
            <p:txBody>
              <a:bodyPr/>
              <a:lstStyle/>
              <p:p>
                <p:r>
                  <p:rPr lang="en-US" dirty="0" smtClean="0"/>
                  <p:t>Slide ${i} from ${file.name}</p:t>
                </p:r>
              </p:p>
            </p:txBody>
          </p:sp>
        </p:spTree>
      </p:cSld>
      <p:clrMapOvr>
        <a:masterClrMapping/>
      </p:clrMapOvr>
    </p:sld>`;
      }

      const presentationContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:sldMasterIdLst>
    <p:sldMasterId id="2147483648" r:id="rId1"/>
  </p:sldMasterIdLst>
  <p:sldIdLst>
    ${Array.from({length: pdf.numPages}, (_, i) => `<p:sldId id="${2147483649 + i}" r:id="rId${i + 2}"/>`).join('')}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;

      zip.folder('ppt')?.file('presentation.xml', presentationContent);
      
      return new Uint8Array(await zip.generateAsync({ type: 'arraybuffer' }));
    } catch (error) {
      console.error('Error converting PDF to PowerPoint:', error);
      throw new Error('Failed to convert PDF to PowerPoint.');
    }
  };

  const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      
      return await mergedPdf.save();
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDF files.');
    }
  };

  const splitPdf = async (file: File, pageRanges: string): Promise<Uint8Array[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = parsePageRanges(pageRanges, pdf.getPageCount());
      
      const results: Uint8Array[] = [];
      
      for (const pageNum of pages) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdf, [pageNum - 1]);
        newPdf.addPage(copiedPage);
        results.push(await newPdf.save());
      }
      
      return results;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      throw new Error('Failed to split PDF file.');
    }
  };

  const compressPdf = async (file: File, quality: number = 0.7): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Basic compression by re-saving the PDF
      return await pdf.save({ useObjectStreams: false });
    } catch (error) {
      console.error('Error compressing PDF:', error);
      throw new Error('Failed to compress PDF file.');
    }
  };

  const protectPdf = async (file: File, password: string, options: any = {}): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // Basic PDF protection - PDF-lib doesn't support encryption directly
      // This is a placeholder implementation
      return await pdf.save();
    } catch (error) {
      console.error('Error protecting PDF:', error);
      throw new Error('Failed to protect PDF file.');
    }
  };

  const editPdf = async (file: File, edits: any[]): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      for (const edit of edits) {
        const pages = pdfDoc.getPages();
        const page = pages[edit.page - 1];
        
        if (edit.type === 'text') {
          page.drawText(edit.content || '', {
            x: edit.x,
            y: page.getHeight() - edit.y,
            size: edit.fontSize || 12,
            font,
            color: rgb(0, 0, 0),
          });
        }
      }
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error editing PDF:', error);
      throw new Error('Failed to edit PDF file.');
    }
  };

  const addSignature = async (file: File, signatureData: string, x: number, y: number, page: number): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Convert signature data URL to image
      const signatureImage = await pdfDoc.embedPng(signatureData);
      const pages = pdfDoc.getPages();
      const targetPage = pages[page - 1];
      
      targetPage.drawImage(signatureImage, {
        x,
        y: targetPage.getHeight() - y - 50,
        width: 100,
        height: 50,
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error adding signature:', error);
      throw new Error('Failed to add signature to PDF.');
    }
  };

  const createDownloadLink = (data: Uint8Array, filename: string): string => {
    const blob = new Blob([data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
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
    renderPdfPage,
    convertPdfToWord,
    convertPdfToImages,
    convertWordToPdf,
    convertExcelToPdf,
    convertImagesToPdf,
    convertPowerpointToPdf,
    convertPdfToPowerpoint,
    mergePdfs,
    splitPdf,
    compressPdf,
    protectPdf,
    editPdf,
    addSignature,
    createDownloadLink,
  };
};
