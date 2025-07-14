import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts, degrees, rgb, PDFImage, PDFFont, RGB } from 'pdf-lib';
import mammoth from 'mammoth';
import html2pdf from 'html2pdf.js';
import PptxGenJS from 'pptxgenjs';
import axios from 'axios';
import { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, HeadingLevel } from 'docx';
import ExcelJS from 'exceljs';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.mjs', import.meta.url).toString();

const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16) / 255,
        green: parseInt(result[2], 16) / 255,
        blue: parseInt(result[3], 16) / 255,
      }
    : { red: 0, green: 0, blue: 0 }; // Default to black
};

export const formatFileSize = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export function parsePageRanges(rangeStr: string): number[] {
  const pages: number[] = [];
  if (!rangeStr) return pages;

  const parts = rangeStr.split(',');
  for (const part of parts) {
    const trimmedPart = part.trim();
    if (trimmedPart.includes('-')) {
      const [start, end] = trimmedPart.split('-').map(num => parseInt(num, 10));
      if (!isNaN(start) && !isNaN(end) && start <= end) {
        for (let i = start; i <= end; i++) {
          pages.push(i);
        }
      }
    } else {
      const page = parseInt(trimmedPart, 10);
      if (!isNaN(page)) {
        pages.push(page);
      }
    }
  }
  return [...new Set(pages)].sort((a, b) => a - b);
}

interface PdfInfo {
  pageCount: number;
}

export class PdfProcessor {
  async loadPdf(file: File): Promise<PdfInfo> {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
          return reject(new Error('Failed to read file.'));
        }
        try {
          const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          resolve({ pageCount: pdf.numPages });
        } catch (error) {
          console.error('Error loading PDF:', error);
          reject(error);
        }
      };
      fileReader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      fileReader.readAsArrayBuffer(file);
    });
  }

  async renderPdfPage(file: File, pageNum: number, scale: number): Promise<string> {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
          return reject(new Error('Failed to read file.'));
        }
        try {
          const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          if (pageNum < 1 || pageNum > pdf.numPages) {
            return reject(new Error('Invalid page number.'));
          }

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) {
            return reject(new Error('Failed to get canvas context.'));
          }

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          await page.render(renderContext).promise;
          resolve(canvas.toDataURL('image/jpeg'));
        } catch (error) {
          console.error(`Error rendering page ${pageNum}:`, error);
          reject(error);
        }
      };
      fileReader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      fileReader.readAsArrayBuffer(file);
    });
  }

  async convertPdfToImages(file: File, qualityMultiplier: number): Promise<string[]> {
    const images: string[] = [];
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
      fileReader.onload = async (event) => {
        if (!event.target?.result) {
          return reject(new Error('Failed to read file.'));
        }

        try {
          const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 * qualityMultiplier });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            if (!context) {
              return reject(new Error('Failed to get canvas context.'));
            }

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: context,
              viewport: viewport,
            };

            await page.render(renderContext).promise;
            images.push(canvas.toDataURL('image/jpeg', 0.85));
          }
          resolve(images);
        } catch (error) {
          console.error('Error converting PDF to images:', error);
          reject(error);
        }
      };

      fileReader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };

      fileReader.readAsArrayBuffer(file);
    });
  }

  async convertWordToPdf(file: File, onProgress: (progress: number, message: string) => void): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        onProgress(10, 'Reading Word document...');
        const arrayBuffer = await file.arrayBuffer();

        // A memory-efficient way to convert ArrayBuffer to base64 to avoid stack-size errors.
        const bufferToBase64 = (buffer: ArrayBuffer): string => {
          let binary = '';
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          return btoa(binary);
        }

        onProgress(30, 'Converting .docx to HTML with embedded images...');
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer }, {
          convertImage: mammoth.images.imgElement(async (image) => {
            const imageBuffer = await image.read();
            const base64 = bufferToBase64(imageBuffer);
            return { src: `data:${image.contentType};base64,${base64}` };
          })
        });

        if (!html || html.trim() === '') {
          return reject(new Error('The Word document appears to be empty.'));
        }

        onProgress(60, 'Styling HTML for PDF output...');
        const styledHtml = `
          <style>
            body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; }
            p { margin-bottom: 1em; word-wrap: break-word; }
            h1, h2, h3, h4, h5, h6 { margin-bottom: 0.5em; font-weight: bold; page-break-after: avoid; }
            ul, ol { padding-left: 2em; page-break-inside: avoid; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
            th, td { border: 1px solid #ddd; padding: 8px; }
            th { background-color: #f2f2f2; }
            img { max-width: 100%; height: auto; display: block; }
            /* CSS rules for page-breaking */
            .page-break { page-break-after: always; }
          </style>
          ${html}
        `;

        onProgress(80, 'Rendering PDF...');
        html2pdf()
          .from(styledHtml)
          .set({
            margin: [0.75, 0.75, 0.75, 0.75],
            filename: `${file.name.replace(/\.docx$/, '')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            // Use the library's robust page-breaking, guided by CSS rules.
            pagebreak: { mode: ['css', 'legacy'] }
          })
          .output('blob')
          .then((pdfBlob) => {
            onProgress(100, 'Conversion complete!');
            resolve(pdfBlob);
          })
          .catch(reject);

      } catch (error) {
        console.error("Error during Word to PDF conversion:", error);
        reject(error);
      }
    });
  }

  async mergePdfs(files: File[]): Promise<Uint8Array> {
    if (files.length === 0) {
      throw new Error('No files provided for merging');
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    return mergedPdfBytes;
  }

  async addSignatures(file: File, signatures: any[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();

    for (const options of signatures) {
      const { type, x, y, width, height, pageNumber, text, fontSize, color, fontFamily, signatureData } = options;
      const page = pages[pageNumber - 1];

      if (!page) {
        console.warn(`Skipping signature on non-existent page ${pageNumber}`);
        continue;
      }

      const { height: pageHeight } = page.getSize();
      // pdf-lib's y-coordinate starts from the bottom of the page.
      // The incoming 'y' is from the top. We also need to account for the signature's height.
      const finalY = pageHeight - y - height;

      if (type === 'text' && text) {
        let finalFont = StandardFonts.Helvetica;
        if (fontFamily && Object.values(StandardFonts).includes(fontFamily as StandardFonts)) {
          finalFont = fontFamily as StandardFonts;
        }
        const embeddedFont = await pdfDoc.embedFont(finalFont);
        page.drawText(text, {
          x,
          y: finalY,
          font: embeddedFont,
          size: fontSize,
          color: rgb(hexToRgb(color).red, hexToRgb(color).green, hexToRgb(color).blue),
        });
      } else if ((type === 'draw' || type === 'image') && signatureData) {
        try {
          const pngImage = await pdfDoc.embedPng(signatureData);
          page.drawImage(pngImage, {
            x,
            y: finalY,
            width,
            height,
          });
        } catch (e) {
          console.error("Error embedding signature image. It might be a non-PNG data URL.", e);
        }
      }
    }

    return pdfDoc.save();
  }

  async addWatermark(file: File, options: any): Promise<Blob> {
    const { type, text, image, opacity, rotation, fontSize, color, x, y, width: watermarkWidth, height: watermarkHeight } = options;
    const pdfDoc = await PDFDocument.load(await file.arrayBuffer());
    const pages = pdfDoc.getPages();

    let watermarkImage: PDFImage | undefined;
    let watermarkFont: PDFFont | undefined;

    if (type === 'image' && image) {
      const imageBytes = await image.arrayBuffer();
      if (image.type === 'image/jpeg') {
        watermarkImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        watermarkImage = await pdfDoc.embedPng(imageBytes);
      }
    } else if (type === 'text' && text) {
        watermarkFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    if (!watermarkImage && !watermarkFont) {
      throw new Error('Watermark asset not provided');
    }

    for (const page of pages) {
      const pageDimensions = page.getSize();

      const { width: pageWidth, height: pageHeight } = page.getSize();

      if (type === 'text' && text && watermarkFont) {
        const textWidth = watermarkFont.widthOfTextAtSize(text, fontSize);
        const textHeight = watermarkFont.heightAtSize(fontSize);
        page.drawText(text, {
          x: (pageWidth - textWidth) / 2,
          y: (pageHeight - textHeight) / 2,
          font: watermarkFont,
          size: fontSize,
          color: rgb(hexToRgb(color).red, hexToRgb(color).green, hexToRgb(color).blue),
          opacity: opacity / 100,
          rotate: degrees(rotation),
        });
      } else if (type === 'image' && watermarkImage) {
        page.drawImage(watermarkImage, {
          x: (pageWidth - watermarkWidth) / 2,
          y: (pageHeight - watermarkHeight) / 2,
          width: watermarkWidth,
          height: watermarkHeight,
          opacity: opacity / 100,
          rotate: degrees(rotation),
        });
      }
    }

    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: 'application/pdf' });
  }

  async splitPdf(file: File, pages: number[]): Promise<Uint8Array[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();

    const splitPdfs: Uint8Array[] = [];
    const validPages = pages.filter(p => p > 0 && p <= totalPages);

    if (validPages.length === 0 && pages.length > 0) {
      throw new Error("Invalid page ranges provided. No pages were split.");
    }

    for (const pageNum of validPages) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNum - 1]);
      newPdf.addPage(copiedPage);
      const pdfBytes = await newPdf.save();
      splitPdfs.push(pdfBytes);
    }

    return splitPdfs;
  }

  async protectPdf(file: File, password: string): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    const pdfBytes = await pdfDoc.save({
      encrypt: {
        userPassword: password,
        ownerPassword: password, // Or a different owner password
        permissions: {
          printing: 'high',
          modifying: false,
          copying: false,
          annotating: false,
          fillingForms: false,
          contentAccessibility: false,
          documentAssembly: false,
        },
      },
    });

    return pdfBytes;
  }

  async compressPdf(file: File, options?: { imageQuality: number, compressionLevel: string, preserveMetadata: boolean, optimizeForWeb: boolean }): Promise<Uint8Array> {
    const { 
        imageQuality = 0.92, // Prioritize quality over size
        compressionLevel = 'medium',
        preserveMetadata = true,
    } = options || {};
    
    // Higher scale values for better rendering resolution
    let scale = 1.5; // Default for 'medium'
    if (compressionLevel === 'low') {
        scale = 1.0;
    } else if (compressionLevel === 'high') {
        scale = 2.0;
    }

    const arrayBuffer = await file.arrayBuffer();
    const pdfjsDoc = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer.slice(0))).promise;
    const oldPdfDoc = await PDFDocument.load(arrayBuffer);
    const newPdfDoc = await PDFDocument.create();

    if (preserveMetadata) {
        const title = oldPdfDoc.getTitle();
        if (title) newPdfDoc.setTitle(title);
        const author = oldPdfDoc.getAuthor();
        if (author) newPdfDoc.setAuthor(author);
        const subject = oldPdfDoc.getSubject();
        if (subject) newPdfDoc.setSubject(subject);
        const keywords = oldPdfDoc.getKeywords();
        if (keywords) newPdfDoc.setKeywords(keywords.split(/\s*,\s*/));
        const producer = oldPdfDoc.getProducer();
        if (producer) newPdfDoc.setProducer(producer);
        const creator = oldPdfDoc.getCreator();
        if (creator) newPdfDoc.setCreator(creator);
        const creationDate = oldPdfDoc.getCreationDate();
        if (creationDate) newPdfDoc.setCreationDate(creationDate);
        const modificationDate = oldPdfDoc.getModificationDate();
        if (modificationDate) newPdfDoc.setModificationDate(modificationDate);
    }

    // New logic: Selectively compress pages.
    // Pages with text are copied directly to preserve quality.
    // Pages without text (likely images) are compressed.
    for (let i = 1; i <= pdfjsDoc.numPages; i++) {
        const page = await pdfjsDoc.getPage(i);
        const operatorList = await page.getOperatorList();

        // Check for text-drawing operators to determine if the page contains text.
        const hasText = operatorList.fnArray.some(op => {
            const opName = (pdfjsLib as any).OPS[op];
            return opName === 'Tj' || opName === 'TJ' || opName === "'" || opName === '"';
        });

        if (hasText) {
            // This page contains text. Copy it directly to preserve vector quality and text selectability.
            const [copiedPage] = await newPdfDoc.copyPages(oldPdfDoc, [i - 1]);
            newPdfDoc.addPage(copiedPage);
        } else {
            // This page does not contain text. Assume it's an image or vector graphic and apply compression.
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const jpgDataUrl = canvas.toDataURL('image/jpeg', imageQuality);
                const jpgBytes = await fetch(jpgDataUrl).then(res => res.arrayBuffer());
                const jpgImage = await newPdfDoc.embedJpg(jpgBytes);
                const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                newPage.drawImage(jpgImage, {
                    x: 0,
                    y: 0,
                    width: viewport.width,
                    height: viewport.height,
                });
            } else {
                // Fallback in case canvas context cannot be created.
                const [copiedPage] = await newPdfDoc.copyPages(oldPdfDoc, [i - 1]);
                newPdfDoc.addPage(copiedPage);
            }
        }
    }

    return newPdfDoc.save({ useObjectStreams: true });
  }

  private _processImage(img: any): { data: Uint8Array; width: number; height: number; type: 'png' | 'jpeg' | 'gif'; } | null {
    const { width, height, data, kind } = img;
    try {
        if (data.length > 8) {
            if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) return { data, width, height, type: 'png' };
            let jpegStartIndex = -1;
            for (let i = 0; i < Math.min(10, data.length - 1); i++) {
                if (data[i] === 0xFF && data[i+1] === 0xD8) { jpegStartIndex = i; break; }
            }
            if (jpegStartIndex !== -1 && data[data.length - 2] === 0xFF && data[data.length - 1] === 0xD9) return { data: data.slice(jpegStartIndex), width, height, type: 'jpeg' };
            if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38) return { data, width, height, type: 'gif' };
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        canvas.width = width;
        canvas.height = height;
        const imgData = ctx.createImageData(width, height);
        const dst = imgData.data;
        switch (kind) {
            case 1: // GRAYSCALE_1BPP
                let k = 0; const lineSize = (width + 7) >> 3;
                for (let i = 0; i < height; i++) {
                    for (let j = 0; j < width; j++) {
                        const byte = data[i * lineSize + (j >> 3)]; const bit = 128 >> (j & 7);
                        const C = byte & bit ? 0 : 255;
                        dst[k++] = C; dst[k++] = C; dst[k++] = C; dst[k++] = 255;
                    }
                }
                break;
            case 2: // RGB_24BPP
                let m = 0, i = 0;
                while (i < data.length) { dst[m++] = data[i++]; dst[m++] = data[i++]; dst[m++] = data[i++]; dst[m++] = 255; }
                break;
            case 3: // RGBA_32BPP
                dst.set(data); break;
            case 4: // CMYK_32BPP
                let n = 0, j = 0;
                while (j < data.length) {
                    const c = data[j++]; const m = data[j++]; const y = data[j++]; const k_ = data[j++];
                    dst[n++] = 255 * (1 - c / 255) * (1 - k_ / 255);
                    dst[n++] = 255 * (1 - m / 255) * (1 - k_ / 255);
                    dst[n++] = 255 * (1 - y / 255) * (1 - k_ / 255);
                    dst[n++] = 255;
                }
                break;
            default:
                console.error(`Unsupported image kind: ${kind}. Cannot process image.`); return null;
        }

        ctx.putImageData(imgData, 0, 0);
        const pngDataUrl = canvas.toDataURL('image/png');
        const base64Data = pngDataUrl.substring(pngDataUrl.indexOf(',') + 1);
        const pngBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        return { data: pngBytes, width, height, type: 'png' };
    } catch (e) {
        console.error(`Error processing image data (kind: ${kind}):`, e);
        return null;
    }
  }

  async convertPdfToWord(file: File, onProgress?: (progress: number, message: string) => void): Promise<{ docxBytes: Uint8Array, imageExtractionErrors: number }> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API key not found.");

    onProgress?.(5, "Loading PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let combinedContent = '';
    const imageData: { [key: string]: { data: Uint8Array, width: number, height: number } } = {};
    let imageCounter = 0;
    let imageExtractionErrors = 0;

    onProgress?.(15, "Extracting content...");
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        combinedContent += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n\n';
        
        const operatorList = await page.getOperatorList();
        for (let j = 0; j < operatorList.fnArray.length; j++) {
            if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                const imgKey = operatorList.argsArray[j][0];
                try {
                    const img = await page.objs.get(imgKey);
                    if (!img || !img.data) continue;
                    const processedImage = this._processImage(img);
                    if (processedImage) {
                        const imageId = `[IMAGE_${imageCounter++}]`;
                        imageData[imageId] = processedImage;
                        combinedContent += `\n${imageId}\n`;
                    } else {
                        imageExtractionErrors++;
                    }
                } catch (e) {
                    console.error(`Could not extract image ${imgKey}:`, e);
                    imageExtractionErrors++;
                }
            }
        }
        combinedContent += `--- End of Page ${i} ---\n`;
    }

    onProgress?.(50, "AI is formatting the document...");
    const systemPrompt = `You are a document analysis engine. Convert raw text into a structured JSON format. The JSON object must have a single key "document" which is an array of content blocks. Supported block types are 'heading1', 'heading2', 'paragraph', 'table', and 'image'. For 'table', the content must be a 2D array of strings. For 'image', the content is the image placeholder (e.g., '[IMAGE_0]'). Preserve the order of text and images as they appear. Your response must be only the valid JSON object.`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model: "google/gemini-flash-1.5", response_format: { type: "json_object" }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: combinedContent }] },
      { headers: { "Authorization": `Bearer ${apiKey}` } }
    );

    onProgress?.(75, "Generating Word document...");
    const structuredContent = JSON.parse(response.data.choices[0].message.content);
    const docChildren: (Paragraph | Table)[] = [];

    for (const block of structuredContent.document) {
        try {
            switch (block.type) {
                case 'heading1':
                    docChildren.push(new Paragraph({ text: block.content, heading: HeadingLevel.HEADING_1 }));
                    break;
                case 'heading2':
                    docChildren.push(new Paragraph({ text: block.content, heading: HeadingLevel.HEADING_2 }));
                    break;
                case 'paragraph':
                    docChildren.push(new Paragraph({ children: [new TextRun(block.content)] }));
                    break;
                case 'table':
                    const tableRows = (block.content as string[][]).map(row => 
                        new TableRow({ children: row.map(cellText => new TableCell({ children: [new Paragraph(cellText)] })) })
                    );
                    docChildren.push(new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } }));
                    break;
                case 'image':
                    const imageId = block.content;
                    const imgDetails = imageData[imageId];
                    if (imgDetails) {
                        const maxWidth = 600;
                        const newWidth = imgDetails.width > maxWidth ? maxWidth : imgDetails.width;
                        const newHeight = (imgDetails.height * newWidth) / imgDetails.width;
                        docChildren.push(new Paragraph({ children: [ new ImageRun({ data: imgDetails.data, transformation: { width: newWidth, height: newHeight } }) ] }));
                    }
                    break;
            }
        } catch(e) {
            console.error('Error processing block:', block, e);
        }
    }

    const doc = new Document({ sections: [{ children: docChildren }] });
    const blob = await Packer.toBlob(doc);
    const docxBytes = new Uint8Array(await blob.arrayBuffer());
    onProgress?.(100, "Conversion complete!");
    return { docxBytes, imageExtractionErrors };
  }

  async convertPdfToPowerpoint(file: File, onProgress?: (progress: number, message: string) => void): Promise<{ pptxBytes: Uint8Array, imageExtractionErrors: number }> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OpenRouter API key not found. Please add VITE_OPENROUTER_API_KEY to your .env file.");
    }

    onProgress?.(5, "Loading PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    
    let combinedContent = '';
    const imageData: { [key: string]: { data: Uint8Array, width: number, height: number, type: 'png' | 'jpeg' | 'gif' } } = {};
    let imageCounter = 0;
    let imageExtractionErrors = 0;

    onProgress?.(15, "Extracting content from PDF...");
    for (let j = 1; j <= pdf.numPages; j++) {
        const page = await pdf.getPage(j);
        const textContent = await page.getTextContent();
        combinedContent += textContent.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n\n';

        const operatorList = await page.getOperatorList();
        for (let k = 0; k < operatorList.fnArray.length; k++) {
            if (operatorList.fnArray[k] === pdfjsLib.OPS.paintImageXObject) {
                const imgKey = operatorList.argsArray[k][0];
                try {
                    const img = await page.objs.get(imgKey);
                    if (!img || !img.data) continue;

                    const processedImage = this._processImage(img);
                    if (processedImage) {
                        const imageId = `[IMAGE_${imageCounter++}]`;
                        imageData[imageId] = processedImage;
                        combinedContent += `\n${imageId}\n`;
                    }
                } catch (e) {
                    console.error(`Could not extract image ${imgKey} from PDF structure:`, e);
                    imageExtractionErrors++;
                }
            }
        }
        combinedContent += `--- End of Page ${j} ---\n`;
    }

    if (imageExtractionErrors > 0) {
        console.warn(`${imageExtractionErrors} image(s) could not be extracted. They will be missing from the presentation.`);
    }
    
    onProgress?.(50, "AI is designing the presentation...");
    const systemPrompt = `You are an expert presentation designer. Your task is to transform raw text and image placeholders from a PDF into a visually compelling and well-structured PowerPoint presentation, formatted as a JSON object.

The JSON object must have a single root key "presentation", containing two keys: "title" (a string for the main title of the entire presentation) and "slides" (an array of slide objects).

Each slide object must contain:
1.  "title": A concise, impactful title for the slide.
2.  "layout": A string specifying the slide layout. Choose from: 'title_only', 'text_only', 'text_and_image', 'image_only'.
3.  "content": An object containing the slide's content, which varies by layout:
    - For 'title_only': An empty object {}.
    - For 'text_only': An object with a "bullets" key, which is an array of short, clear strings.
    - For 'text_and_image': An object with "bullets" (array of strings) and "image" (an object with "id" and "position" ('left' or 'right')).
    - For 'image_only': An object with an "image" key (containing "id").

Design Principles:
-   Clarity and Brevity: Convert dense paragraphs into succinct bullet points. Each slide should convey a single, clear idea.
-   Visual Hierarchy: Use layouts strategically. A slide with a key graphic might use 'text_and_image', while a summary slide might be 'text_only'.
-   Logical Flow: Group related information. Use page breaks ('--- End of Page X ---') as a strong hint to start a new slide.
-   Professionalism: Start with a 'title_only' slide for the main presentation title.

Your response must be ONLY the valid JSON object.
Example:
{
  "presentation": {
    "title": "The Future of Artificial Intelligence",
    "slides": [
      {
        "title": "The Future of Artificial Intelligence",
        "layout": "title_only",
        "content": {}
      },
      {
        "title": "Key Concepts",
        "layout": "text_and_image",
        "content": {
          "bullets": ["Machine Learning", "Deep Learning", "Neural Networks"],
          "image": { "id": "[IMAGE_0]", "position": "right" }
        }
      }
    ]
  }
}`;

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      { model: "google/gemini-flash-1.5", response_format: { type: "json_object" }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: combinedContent }] },
      { headers: { "Authorization": `Bearer ${apiKey}` } }
    );

    onProgress?.(75, "Generating PowerPoint slides...");
    const structuredContent = JSON.parse(response.data.choices[0].message.content);
    const presentationData = structuredContent.presentation;

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'QuickDocs Tools';
    pptx.company = 'Generated Presentation';
    pptx.title = presentationData.title;

    const bufferToBase64 = (buffer: Uint8Array): string => {
        let binary = '';
        const len = buffer.byteLength;
        for (let i = 0; i < len; i++) { binary += String.fromCharCode(buffer[i]); }
        return btoa(binary);
    }

    for (const slideData of presentationData.slides) {
        const slide = pptx.addSlide();
        switch (slideData.layout) {
            case 'title_only':
                slide.addText(slideData.title, { x: 0.5, y: 2.5, w: '90%', h: 1.5, align: 'center', fontSize: 44, bold: true });
                break;
            case 'text_only':
                slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 0.75, align: 'center', fontSize: 32, bold: true });
                if (slideData.content.bullets && slideData.content.bullets.length > 0) {
                    slide.addText(slideData.content.bullets.join('\n'), { x: 1.0, y: 1.5, w: '80%', h: '75%', fontSize: 20, bullet: true });
                }
                break;
            case 'image_only':
                const imgDetails = imageData[slideData.content.image.id];
                if (imgDetails) {
                    const dataUrl = `data:image/${imgDetails.type};base64,${bufferToBase64(imgDetails.data)}`;
                    slide.addImage({ data: dataUrl, x: 0, y: 0, w: '100%', h: '100%' });
                    slide.addText(slideData.title, { x: 0.5, y: '90%', w: '90%', h: 0.5, align: 'center', fontSize: 24, bold: true, color: 'FFFFFF', outline: { size: 1, color: '000000' } });
                }
                break;
            case 'text_and_image':
                slide.addText(slideData.title, { x: 0.5, y: 0.25, w: '90%', h: 0.75, align: 'center', fontSize: 32, bold: true });
                const { bullets, image } = slideData.content;
                const imageDetails = imageData[image.id];
                const textProps = { x: 0.5, y: 1.5, w: '45%', h: '75%', fontSize: 18, bullet: true };
                const imgProps = { y: 1.5, w: 4.5 };

                if (image.position === 'right') {
                    if (bullets && bullets.length > 0) slide.addText(bullets.join('\n'), textProps);
                    if (imageDetails) {
                        const dataUrl = `data:image/${imageDetails.type};base64,${bufferToBase64(imageDetails.data)}`;
                        slide.addImage({ data: dataUrl, x: 5.25, ...imgProps, h: imgProps.w * (imageDetails.height / imageDetails.width) });
                    }
                } else { // position 'left'
                    if (bullets && bullets.length > 0) slide.addText(bullets.join('\n'), { ...textProps, x: 5.25 });
                    if (imageDetails) {
                        const dataUrl = `data:image/${imageDetails.type};base64,${bufferToBase64(imageDetails.data)}`;
                        slide.addImage({ data: dataUrl, x: 0.5, ...imgProps, h: imgProps.w * (imageDetails.height / imageDetails.width) });
                    }
                }
                break;
        }
    }

    onProgress?.(95, "Finalizing presentation...");
    const pptxBlob = await pptx.write('blob');
    const pptxBuffer = await pptxBlob.arrayBuffer();
    
    onProgress?.(100, "Conversion complete!");
    return { pptxBytes: new Uint8Array(pptxBuffer), imageExtractionErrors };
  }

  async convertPdfToExcel(file: File, onProgress?: (progress: number, message: string) => void): Promise<Uint8Array> {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) throw new Error("OpenRouter API key not found.");

    onProgress?.(5, "Loading PDF...");
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const numPages = pdf.numPages;
    
    const allTables: { name: string, data: string[][] }[] = [];
    const systemPrompt = `You are a data extraction expert. Your task is to find all tables in the text and convert them into a structured JSON format.
Follow these rules strictly:
1.  Your entire response MUST be a single, valid JSON object. Do not add any text before or after the JSON.
2.  The root of the JSON object must be a key named "tables".
3.  The "tables" key must be an array of table objects.
4.  Each table object must have a "name" (string, for the sheet name) and "data" (an array of arrays, for the rows).
5.  All data in the rows must be strings.
6.  Crucially, you must correctly escape all special characters within the strings. A double quote (") inside a string must be escaped as \\". A backslash (\\) must be escaped as \\\\.

If you find no tables, return exactly: {"tables": []}`;

    for (let i = 1; i <= numPages; i++) {
        const progress = 10 + 60 * (i / numPages);
        onProgress?.(progress, `AI is processing page ${i} of ${numPages}...`);
        
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');

        if (pageText.trim().length === 0) continue; // Skip empty pages

        try {
            const response = await axios.post(
                "https://openrouter.ai/api/v1/chat/completions",
                { model: "google/gemini-flash-1.5", response_format: { type: "json_object" }, messages: [{ role: "system", content: systemPrompt }, { role: "user", content: pageText }] },
                { headers: { "Authorization": `Bearer ${apiKey}` }, timeout: 30000 } // 30s timeout
            );

            const rawResponse = response.data.choices[0].message.content;
            const jsonStart = rawResponse.indexOf('{');
            const jsonEnd = rawResponse.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const jsonString = rawResponse.substring(jsonStart, jsonEnd + 1);
                const structuredData = JSON.parse(jsonString);
                if (structuredData.tables && structuredData.tables.length > 0) {
                    const pageTables = structuredData.tables.map((table: any, index: number) => ({
                        ...table,
                        name: `Page ${i} - ${table.name || `Table ${index + 1}`}`
                    }));
                    allTables.push(...pageTables);
                }
            }
        } catch (e) {
            console.warn(`Could not process tables on page ${i}.`, e);
        }
    }

    if (allTables.length === 0) {
        throw new Error("No tables were found in the PDF after processing all pages.");
    }

    onProgress?.(80, "Generating Excel file...");
    const workbook = new ExcelJS.Workbook();
    const sheetNames = new Set<string>();

    for (const table of allTables) {
        let originalSheetName = table.name.replace(/[:\\/?*\[\]]/g, '').substring(0, 31);
        let finalSheetName = originalSheetName;
        let counter = 1;
        while (sheetNames.has(finalSheetName)) {
            const suffix = ` (${counter++})`;
            finalSheetName = originalSheetName.substring(0, 31 - suffix.length) + suffix;
        }
        sheetNames.add(finalSheetName);

        const worksheet = workbook.addWorksheet(finalSheetName);
        worksheet.addRows(table.data);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    onProgress?.(100, "Conversion complete!");
    return new Uint8Array(buffer);
  }

  async protectPdf(file: File, password: string, permissions: any): Promise<Uint8Array> {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // Set user password (password required to open the document)
    if (password) {
      // Create permission flags based on the permissions object
      const permissionFlags: any = {};
      
      if (!permissions.printing) {
        permissionFlags.printing = false;
      }
      if (!permissions.copying) {
        permissionFlags.copying = false;
      }
      if (!permissions.editing) {
        permissionFlags.modifying = false;
      }
      if (!permissions.commenting) {
        permissionFlags.annotating = false;
      }
      if (!permissions.formFilling) {
        permissionFlags.fillingForms = false;
      }
      if (!permissions.contentExtraction) {
        permissionFlags.contentAccessibility = false;
      }
      if (!permissions.documentAssembly) {
        permissionFlags.documentAssembly = false;
      }

      // Apply encryption with password and permissions
      pdfDoc.encrypt({
        userPassword: password,
        ownerPassword: password + '_owner_key', // Different owner password for administrative access
        permissions: permissionFlags
      });
    }

    return pdfDoc.save();
  }

  createDownloadLink(pdfBytes: Uint8Array, fileName: string): string {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  }
}

export const createPdfProcessor = () => {
  return new PdfProcessor();
};