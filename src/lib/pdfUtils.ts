
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';
import { PdfEdit } from '@/types/pdfEdit';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
  encrypted?: boolean;
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
  const parts = ranges.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        if (i >= 1 && !pages.includes(i)) {
          pages.push(i);
        }
      }
    } else {
      const pageNum = parseInt(trimmed);
      if (pageNum >= 1 && pageNum <= totalPages && !pages.includes(pageNum)) {
        pages.push(pageNum);
      }
    }
  }
  
  return pages.sort((a, b) => a - b);
};

export const createPdfProcessor = () => {
  const loadPdf = async (file: File): Promise<PdfInfo> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
      });
      const pdf = await loadingTask.promise;
      
      const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
      const info = metadata.info as any;
      
      return {
        pageCount: pdf.numPages,
        title: info?.Title || file.name,
        author: info?.Author,
        subject: info?.Subject,
        keywords: info?.Keywords,
        creator: info?.Creator,
        producer: info?.Producer,
        creationDate: info?.CreationDate,
        modificationDate: info?.ModDate,
        encrypted: false
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF. Please ensure it\'s a valid PDF file.');
    }
  };

  const renderPdfPage = async (file: File, pageNum: number, scale: number = 1.5): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(pageNum);
      
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        return canvas.toDataURL();
      }
      
      throw new Error('Failed to get canvas context');
    } catch (error) {
      console.error('Error rendering PDF page:', error);
      throw new Error('Failed to render PDF page');
    }
  };

  const convertPdfToImages = async (file: File, options = { scale: 2, format: 'jpeg', quality: 0.8 }) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const images = [];
      
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: options.scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          const imageBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((blob) => {
              resolve(blob!);
            }, `image/${options.format}`, options.quality);
          });
          
          images.push({
            page: pageNum,
            blob: imageBlob,
            url: URL.createObjectURL(imageBlob),
            name: `${file.name.replace('.pdf', '')}-page-${pageNum}.${options.format}`
          });
        }
      }
      
      return images;
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      throw new Error('Failed to convert PDF to images');
    }
  };

  const convertPdfToPowerpoint = async (file: File): Promise<Uint8Array> => {
    try {
      // For now, create a basic PPTX structure
      const mockPptxContent = new TextEncoder().encode(`
        Mock PowerPoint content from ${file.name}
        This would be replaced with actual PPTX generation
      `);
      return mockPptxContent;
    } catch (error) {
      console.error('Error converting PDF to PowerPoint:', error);
      throw new Error('Failed to convert PDF to PowerPoint');
    }
  };

  const editPdf = async (file: File, edits: PdfEdit[]): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Apply edits to PDF
      for (const edit of edits) {
        const page = pdfDoc.getPage(edit.page - 1);
        
        if (edit.type === 'text' && edit.content) {
          page.drawText(edit.content, {
            x: edit.x,
            y: page.getHeight() - edit.y,
            size: edit.fontSize,
            // Note: Color handling would need proper implementation
          });
        }
        // Add more edit types as needed
      }
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error editing PDF:', error);
      throw new Error('Failed to edit PDF');
    }
  };

  const compressPdf = async (file: File, quality: number = 0.8): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Basic compression - in reality, this would involve image compression
      const compressedPdf = await pdfDoc.save({
        useObjectStreams: false,
      });
      
      return compressedPdf;
    } catch (error) {
      console.error('Error compressing PDF:', error);
      throw new Error('Failed to compress PDF');
    }
  };

  const mergePdfs = async (files: File[]): Promise<Uint8Array> => {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      
      return await mergedPdf.save();
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('Failed to merge PDFs');
    }
  };

  const splitPdf = async (file: File, pages: number[]): Promise<Uint8Array[]> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const results: Uint8Array[] = [];
      
      for (const pageNum of pages) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
        newPdf.addPage(copiedPage);
        results.push(await newPdf.save());
      }
      
      return results;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      throw new Error('Failed to split PDF');
    }
  };

  const protectPdf = async (file: File, password: string): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Basic protection - real implementation would use proper encryption
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error protecting PDF:', error);
      throw new Error('Failed to protect PDF');
    }
  };

  const unlockPdf = async (file: File, password: string): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error unlocking PDF:', error);
      throw new Error('Invalid password or failed to unlock PDF');
    }
  };

  const addSignature = async (file: File, signature: string, x: number, y: number, page: number): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pdfPage = pdfDoc.getPage(page - 1);
      
      // In reality, this would embed the signature image
      pdfPage.drawText('Signature Applied', {
        x,
        y: pdfPage.getHeight() - y,
        size: 12,
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error adding signature:', error);
      throw new Error('Failed to add signature');
    }
  };

  const addWatermark = async (file: File, watermarkText: string, options: any): Promise<Uint8Array> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const pages = pdfDoc.getPages();
      pages.forEach(page => {
        page.drawText(watermarkText, {
          x: page.getWidth() / 2,
          y: page.getHeight() / 2,
          size: 24,
          opacity: 0.5,
        });
      });
      
      return await pdfDoc.save();
    } catch (error) {
      console.error('Error adding watermark:', error);
      throw new Error('Failed to add watermark');
    }
  };

  const createDownloadLink = (data: Uint8Array, filename: string): string => {
    const blob = new Blob([data], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  };

  return {
    loadPdf,
    renderPdfPage,
    convertPdfToImages,
    convertPdfToPowerpoint,
    editPdf,
    compressPdf,
    mergePdfs,
    splitPdf,
    protectPdf,
    unlockPdf,
    addSignature,
    addWatermark,
    createDownloadLink
  };
};
