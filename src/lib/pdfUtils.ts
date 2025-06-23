import { PDFDocument, PDFPage, rgb } from 'pdf-lib';

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

export class PdfProcessor {
  private pdfDoc: PDFDocument | null = null;
  private originalBytes: Uint8Array | null = null;

  async loadPdf(file: File): Promise<PdfInfo> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.originalBytes = new Uint8Array(arrayBuffer);
      this.pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pageCount = this.pdfDoc.getPageCount();
      const title = this.pdfDoc.getTitle();
      const author = this.pdfDoc.getAuthor();
      const subject = this.pdfDoc.getSubject();
      const creator = this.pdfDoc.getCreator();
      const producer = this.pdfDoc.getProducer();
      const creationDate = this.pdfDoc.getCreationDate();
      const modificationDate = this.pdfDoc.getModificationDate();

      return {
        pageCount,
        title: title || undefined,
        author: author || undefined,
        subject: subject || undefined,
        creator: creator || undefined,
        producer: producer || undefined,
        creationDate: creationDate || undefined,
        modificationDate: modificationDate || undefined,
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF. Please ensure the file is a valid PDF document.');
    }
  }

  async mergePdfs(files: File[]): Promise<Uint8Array> {
    if (files.length < 2) {
      throw new Error('At least 2 PDF files are required for merging');
    }

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pageIndices = pdf.getPageIndices();
        
        const pages = await mergedPdf.copyPages(pdf, pageIndices);
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      // Set metadata
      mergedPdf.setTitle('Merged PDF Document');
      mergedPdf.setAuthor('QuickDocs');
      mergedPdf.setSubject('Merged PDF created by QuickDocs');
      mergedPdf.setCreator('QuickDocs PDF Merger');
      mergedPdf.setProducer('QuickDocs');
      mergedPdf.setCreationDate(new Date());
      mergedPdf.setModificationDate(new Date());

      return await mergedPdf.save();
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDF files. Please ensure all files are valid PDF documents.');
    }
  }

  async splitPdf(file: File, ranges: Array<{ start: number; end: number }>): Promise<Uint8Array[]> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const totalPages = sourcePdf.getPageCount();
      
      const splitPdfs: Uint8Array[] = [];

      for (const range of ranges) {
        const { start, end } = range;
        
        // Validate range
        if (start < 1 || end > totalPages || start > end) {
          throw new Error(`Invalid page range: ${start}-${end}. PDF has ${totalPages} pages.`);
        }

        const newPdf = await PDFDocument.create();
        
        // Copy pages (convert to 0-based indexing)
        const pageIndices = Array.from(
          { length: end - start + 1 }, 
          (_, i) => start - 1 + i
        );
        
        const pages = await newPdf.copyPages(sourcePdf, pageIndices);
        pages.forEach((page) => newPdf.addPage(page));

        // Set metadata
        const originalTitle = sourcePdf.getTitle() || 'Document';
        newPdf.setTitle(`${originalTitle} (Pages ${start}-${end})`);
        newPdf.setAuthor('QuickDocs');
        newPdf.setSubject(`Split from original PDF - Pages ${start}-${end}`);
        newPdf.setCreator('QuickDocs PDF Splitter');
        newPdf.setProducer('QuickDocs');
        newPdf.setCreationDate(new Date());
        newPdf.setModificationDate(new Date());

        const pdfBytes = await newPdf.save();
        splitPdfs.push(pdfBytes);
      }

      return splitPdfs;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      throw new Error('Failed to split PDF. Please ensure the file is a valid PDF document.');
    }
  }

  async extractPages(file: File, pageNumbers: number[]): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const totalPages = sourcePdf.getPageCount();
      
      // Validate page numbers
      const invalidPages = pageNumbers.filter(page => page < 1 || page > totalPages);
      if (invalidPages.length > 0) {
        throw new Error(`Invalid page numbers: ${invalidPages.join(', ')}. PDF has ${totalPages} pages.`);
      }

      const newPdf = await PDFDocument.create();
      
      // Convert to 0-based indexing and copy pages
      const pageIndices = pageNumbers.map(page => page - 1);
      const pages = await newPdf.copyPages(sourcePdf, pageIndices);
      pages.forEach((page) => newPdf.addPage(page));

      // Set metadata
      const originalTitle = sourcePdf.getTitle() || 'Document';
      newPdf.setTitle(`${originalTitle} (Extracted Pages)`);
      newPdf.setAuthor('QuickDocs');
      newPdf.setSubject(`Extracted pages: ${pageNumbers.join(', ')}`);
      newPdf.setCreator('QuickDocs PDF Extractor');
      newPdf.setProducer('QuickDocs');
      newPdf.setCreationDate(new Date());
      newPdf.setModificationDate(new Date());

      return await newPdf.save();
    } catch (error) {
      console.error('Error extracting pages:', error);
      throw new Error('Failed to extract pages. Please ensure the file is a valid PDF document.');
    }
  }

  async rotatePdf(file: File, rotation: 90 | 180 | 270): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        page.setRotation({ angle: rotation, type: 'degrees' });
      });

      // Update metadata
      pdfDoc.setModificationDate(new Date());
      pdfDoc.setSubject(`Rotated ${rotation} degrees`);

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error rotating PDF:', error);
      throw new Error('Failed to rotate PDF. Please ensure the file is a valid PDF document.');
    }
  }

  async addWatermark(file: File, watermarkText: string, options: {
    opacity?: number;
    fontSize?: number;
    color?: { r: number; g: number; b: number };
    position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  } = {}): Promise<Uint8Array> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const {
        opacity = 0.5,
        fontSize = 50,
        color = { r: 0.5, g: 0.5, b: 0.5 },
        position = 'center'
      } = options;

      const pages = pdfDoc.getPages();
      
      pages.forEach(page => {
        const { width, height } = page.getSize();
        
        let x: number, y: number;
        
        switch (position) {
          case 'top-left':
            x = 50;
            y = height - 50;
            break;
          case 'top-right':
            x = width - 200;
            y = height - 50;
            break;
          case 'bottom-left':
            x = 50;
            y = 50;
            break;
          case 'bottom-right':
            x = width - 200;
            y = 50;
            break;
          default: // center
            x = width / 2 - 100;
            y = height / 2;
        }

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize,
          color: rgb(color.r, color.g, color.b),
          opacity,
        });
      });

      // Update metadata
      pdfDoc.setModificationDate(new Date());
      pdfDoc.setSubject(`Watermarked: ${watermarkText}`);

      return await pdfDoc.save();
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw new Error('Failed to add watermark. Please ensure the file is a valid PDF document.');
    }
  }

  createDownloadLink(pdfBytes: Uint8Array, filename: string): string {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }

  downloadPdf(pdfBytes: Uint8Array, filename: string): void {
    const url = this.createDownloadLink(pdfBytes, filename);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

// Utility functions
export const createPdfProcessor = () => new PdfProcessor();

export const parsePageRanges = (rangeString: string): Array<{ start: number; end: number }> => {
  const ranges: Array<{ start: number; end: number }> = [];
  const parts = rangeString.split(',').map(part => part.trim()).filter(Boolean);
  
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(num => parseInt(num.trim()));
      if (isNaN(start) || isNaN(end) || start > end) {
        throw new Error(`Invalid range: ${part}`);
      }
      ranges.push({ start, end });
    } else {
      const page = parseInt(part);
      if (isNaN(page)) {
        throw new Error(`Invalid page number: ${part}`);
      }
      ranges.push({ start: page, end: page });
    }
  }
  
  return ranges;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};