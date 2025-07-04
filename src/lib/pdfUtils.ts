
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

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

export const createPdfProcessor = () => {
  const loadPdf = async (file: File): Promise<PdfInfo> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        // Remove password property as it's not supported in this version
      });
      const pdf = await loadingTask.promise;
      
      const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
      
      return {
        pageCount: pdf.numPages,
        title: metadata.info?.Title || file.name,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        keywords: metadata.info?.Keywords,
        creator: metadata.info?.Creator,
        producer: metadata.info?.Producer,
        creationDate: metadata.info?.CreationDate,
        modificationDate: metadata.info?.ModDate,
        encrypted: false
      };
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF. Please ensure it\'s a valid PDF file.');
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
      // In a real implementation, you'd use a library like officegen or similar
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

  return {
    loadPdf,
    convertPdfToImages,
    convertPdfToPowerpoint
  };
};
