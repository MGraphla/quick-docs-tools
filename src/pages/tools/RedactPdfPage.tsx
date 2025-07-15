import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, Search, ZoomIn, ZoomOut, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/pdfUtils";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, ColorType } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.mjs`;

interface RedactedFile {
  name: string;
  url: string;
  size: string;
}

interface RedactionArea {
  id: string;
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const RedactPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [redactionAreas, setRedactionAreas] = useState<RedactionArea[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [currentRedaction, setCurrentRedaction] = useState<RedactionArea | null>(null);
  const [zoom, setZoom] = useState(100);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [redactedFile, setRedactedFile] = useState<RedactedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [textMatches, setTextMatches] = useState<RedactionArea[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const resetState = () => {
    setFile(null);
    setFileInfo(null);
    setCurrentPage(1);
    setPageImage(null);
    setRedactionAreas([]);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRedaction(null);
    setZoom(100);
    setProcessing(false);
    setProgress(0);
    setProgressMessage("");
    setRedactedFile(null);
    setSearchText("");
    setTextMatches([]);
    pdfDocRef.current = null;
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    resetState();
    const loadingToast = toast.loading("Loading PDF...");
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pdfDocRef.current = pdf;
      
      setFile(selectedFile);
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: pdf.numPages
      });
      
      await renderPage(pdf, 1, 1);
      toast.success(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
      resetState();
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, scale: number) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      setPageImage(canvas.toDataURL('image/png'));
    } catch (error) {
      console.error('Error rendering page:', error);
      toast.error("Failed to render PDF page");
    }
  };

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage, zoom / 100);
    }
  }, [zoom, currentPage]);

  const changePage = (newPage: number) => {
    if (!fileInfo || newPage < 1 || newPage > fileInfo.pages) return;
    setCurrentPage(newPage);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const getMousePos = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return { x: 0, y: 0 };
    const rect = imageContainerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = getMousePos(e);
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentRedaction({ id: generateId(), page: currentPage, x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !currentRedaction) return;
    const { x, y } = getMousePos(e);
    setCurrentRedaction({ ...currentRedaction, width: x - startPoint.x, height: y - startPoint.y });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRedaction) return;
    
    let { x, y, width, height } = currentRedaction;
    if (width < 0) { x += width; width = Math.abs(width); }
    if (height < 0) { y += height; height = Math.abs(height); }
    
    if (width > 5 && height > 5) {
      setRedactionAreas(prev => [...prev, { ...currentRedaction, x, y, width, height }]);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRedaction(null);
  };

  const removeRedactionArea = (id: string) => setRedactionAreas(areas => areas.filter(area => area.id !== id));
  const clearAllRedactions = () => { setRedactionAreas([]); setTextMatches([]); toast.success("All redactions cleared"); };

  const searchTextInCurrentPage = async () => {
    if (!searchText.trim() || !pdfDocRef.current) return toast.error("Please enter text to search");
    
    try {
      const page = await pdfDocRef.current.getPage(currentPage);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: zoom / 100 });
      
      const matches = textContent.items
        .map(item => item as any)
        .filter(item => item.str.toLowerCase().includes(searchText.toLowerCase()))
        .map(item => {
          const transform = pdfjsLib.Util.transform(viewport.transform, item.transform);
          return {
            id: generateId(),
            page: currentPage,
            x: transform[4],
            y: transform[5] - item.height,
            width: item.width,
            height: item.height,
          };
        });

      if (matches.length > 0) {
        setTextMatches(matches);
        toast.success(`Found ${matches.length} matches on page ${currentPage}`);
      } else {
        toast.info(`No matches found for "${searchText}" on page ${currentPage}`);
      }
    } catch (error) {
      console.error('Error searching text:', error);
      toast.error("Failed to search text in PDF");
    }
  };

  const applyTextMatches = () => {
    if (textMatches.length === 0) return;
    setRedactionAreas(prev => [...prev, ...textMatches]);
    setTextMatches([]);
    toast.success("Added text matches to redactions");
  };

  const applyRedactions = async () => {
    if (!file || !pdfDocRef.current) return toast.error("Please select a PDF file");
    if (redactionAreas.length === 0) return toast.error("Please add at least one redaction area");

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Applying redactions...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      const redactionsByPage = redactionAreas.reduce((acc, area) => {
        (acc[area.page] = acc[area.page] || []).push(area);
        return acc;
      }, {} as Record<number, RedactionArea[]>);

      for (const [pageNumStr, areas] of Object.entries(redactionsByPage)) {
        const pageNum = parseInt(pageNumStr);
        const page = pdfDoc.getPage(pageNum - 1);
        const pdfJsPage = await pdfDocRef.current.getPage(pageNum);
        const viewport = pdfJsPage.getViewport({ scale: 1.0 });
        const scale = page.getWidth() / viewport.width;

        areas.forEach(area => {
          page.drawRectangle({
            x: area.x * scale,
            y: page.getHeight() - (area.y + area.height) * scale,
            width: area.width * scale,
            height: area.height * scale,
            color: rgb(0, 0, 0),
          });
        });
      }
      
      const redactedPdfBytes = await pdfDoc.save();
      const blob = new Blob([redactedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setRedactedFile({ name: `redacted-${file.name}`, url, size: formatFileSize(blob.size) });
      setProgress(100);
      setProgressMessage("Redaction complete!");
      toast.success("PDF redacted successfully!");
    } catch (error) {
      console.error('Redaction error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to redact PDF");
    } finally {
      setProcessing(false);
    }
  };

  const downloadRedacted = () => {
    if (!redactedFile) return;
    const link = document.createElement('a');
    link.href = redactedFile.url;
    link.download = redactedFile.name;
    link.click();
    toast.success(`Downloaded ${redactedFile.name}`);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto p-2 sm:p-4">
      <div className="text-center">
        <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Eraser className="h-4 w-4 mr-2" />
          PDF Redaction Tool
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Redact PDF</h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          Permanently black out sensitive information in your PDF documents.
        </p>
      </div>

      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-red-400 transition-all duration-300">
          <CardContent className="p-6 sm:p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer rounded-lg p-4 ${dragOver ? 'scale-105 bg-red-50' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Drop PDF file here or click to browse</h3>
              <p className="text-gray-600 mb-6 sm:text-lg">Select a PDF file to begin redacting.</p>
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                <Upload className="h-5 w-5 mr-2" />
                Choose PDF File
              </Button>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
            </div>
          </CardContent>
        </Card>
      )}

      {file && fileInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Document Info</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg"><FileText className="h-5 w-5 text-red-600" /></div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500"><span>{fileInfo.pages} pages</span><span>•</span><span>{fileInfo.size}</span></div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Button variant="outline" size="sm" onClick={() => changePage(currentPage - 1)} disabled={currentPage <= 1}>Previous</Button>
                  <div className="text-sm">Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{fileInfo.pages}</span></div>
                  <Button variant="outline" size="sm" onClick={() => changePage(currentPage + 1)} disabled={currentPage >= fileInfo.pages}>Next</Button>
                </div>
                <div className="space-y-2">
                  <Label>Zoom: {zoom}%</Label>
                  <Slider value={[zoom]} onValueChange={([val]) => setZoom(val)} min={50} max={200} step={10} />
                </div>
                <div className="space-y-2">
                  <Label>Search Text</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Enter text to find" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
                    <Button variant="outline" onClick={searchTextInCurrentPage} className="shrink-0"><Search className="h-4 w-4" /></Button>
                  </div>
                  {textMatches.length > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <p className="text-green-600">Found {textMatches.length} matches</p>
                      <Button variant="link" size="sm" onClick={applyTextMatches}>Redact All</Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Redactions: {redactionAreas.length}</Label>
                    {redactionAreas.length > 0 && <Button variant="link" size="sm" onClick={clearAllRedactions} className="text-red-600">Clear All</Button>}
                  </div>
                  <p className="text-xs text-gray-500">Click and drag on the document to create redaction areas.</p>
                </div>
              </CardContent>
            </Card>
            {redactedFile && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader><CardTitle className="flex items-center gap-2 text-green-700"><CheckCircle className="h-5 w-5"/>Redaction Complete</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-green-600">Sensitive information has been permanently redacted.</p>
                  <Button onClick={downloadRedacted} className="w-full bg-green-600 hover:bg-green-700"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle>PDF Viewer</CardTitle>
                    <CardDescription className="mt-1">Redact sensitive information by drawing boxes over it.</CardDescription>
                  </div>
                  <Button onClick={applyRedactions} disabled={processing || redactionAreas.length === 0} className="bg-red-600 hover:bg-red-700 text-white self-end sm:self-center">
                    {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eraser className="h-4 w-4 mr-2" />}Apply Redactions
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-2 sm:p-4 rounded-lg flex items-center justify-center overflow-auto" style={{ minHeight: '60vh' }}>
                  <div ref={imageContainerRef} className="relative shadow-lg cursor-crosshair" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    {pageImage ? (
                      <>
                        <img src={pageImage} alt={`Page ${currentPage}`} className="block select-none" />
                        {redactionAreas.filter(a => a.page === currentPage).map(area => (
                          <div key={area.id} onClick={() => removeRedactionArea(area.id)} className="absolute bg-black border-2 border-red-500 cursor-pointer" style={{ left: area.x, top: area.y, width: area.width, height: area.height }} />
                        ))}
                        {textMatches.map(match => (
                          <div key={match.id} className="absolute bg-yellow-400/50 border border-yellow-600" style={{ left: match.x, top: match.y, width: match.width, height: match.height }} />
                        ))}
                        {isDrawing && currentRedaction && (
                          <div className="absolute bg-black/70" style={{ left: Math.min(startPoint!.x, currentRedaction.x + currentRedaction.width), top: Math.min(startPoint!.y, currentRedaction.y + currentRedaction.height), width: Math.abs(currentRedaction.width), height: Math.abs(currentRedaction.height) }} />
                        )}
                      </>
                    ) : (
                      <div className="flex items-center justify-center text-gray-400 p-10 h-60"><Loader2 className="h-8 w-8 animate-spin" /></div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to redact a PDF:</strong> Upload a PDF file, then click and drag to select areas you want to redact. You can also search for specific text to redact. When you're ready, click "Apply Redactions" to permanently black out the selected areas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RedactPdfPage;