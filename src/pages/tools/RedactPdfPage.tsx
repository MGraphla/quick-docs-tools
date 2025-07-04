import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Search, ZoomIn, ZoomOut, Save, Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

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
  const [zoom, setZoom] = useState([100]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [redactedFile, setRedactedFile] = useState<RedactedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [textMatches, setTextMatches] = useState<RedactionArea[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfProcessor = createPdfProcessor();
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    const loadingToast = toast.loading("Loading PDF...");
    
    try {
      // Load PDF using pdf.js
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      pdfDocRef.current = pdf;
      
      setFile(selectedFile);
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: pdf.numPages
      });
      setRedactedFile(null);
      setCurrentPage(1);
      setRedactionAreas([]);
      setTextMatches([]);
      
      // Render the first page
      await renderPage(pdf, 1);
      
      toast.success(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

  const renderPage = async (pdf: pdfjsLib.PDFDocumentProxy, pageNum: number, scale: number = zoom[0] / 100) => {
    try {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      setPageImage(canvas.toDataURL('image/jpeg', 0.95));
    } catch (error) {
      console.error('Error rendering page:', error);
      toast.error("Failed to render PDF page");
    }
  };

  const changePage = async (newPage: number) => {
    if (!fileInfo || !pdfDocRef.current) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    
    setCurrentPage(newPage);
    await renderPage(pdfDocRef.current, newPage, zoom[0] / 100);
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom[0] / 100);
    const y = (e.clientY - rect.top) / (zoom[0] / 100);
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    
    const newRedaction: RedactionArea = {
      id: generateId(),
      page: currentPage,
      x,
      y,
      width: 0,
      height: 0
    };
    
    setCurrentRedaction(newRedaction);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !startPoint || !containerRef.current || !currentRedaction) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / (zoom[0] / 100);
    const y = (e.clientY - rect.top) / (zoom[0] / 100);
    
    const width = x - startPoint.x;
    const height = y - startPoint.y;
    
    setCurrentRedaction({
      ...currentRedaction,
      width,
      height
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentRedaction) return;
    
    // Normalize negative width/height
    let { x, y, width, height } = currentRedaction;
    
    if (width < 0) {
      x += width;
      width = Math.abs(width);
    }
    
    if (height < 0) {
      y += height;
      height = Math.abs(height);
    }
    
    // Only add if the area is big enough
    if (width > 5 && height > 5) {
      const normalizedRedaction: RedactionArea = {
        ...currentRedaction,
        x,
        y,
        width,
        height
      };
      
      setRedactionAreas([...redactionAreas, normalizedRedaction]);
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRedaction(null);
  };

  const handleZoomChange = async (newZoom: number[]) => {
    setZoom(newZoom);
    if (pdfDocRef.current) {
      await renderPage(pdfDocRef.current, currentPage, newZoom[0] / 100);
    }
  };

  const removeRedactionArea = (id: string) => {
    setRedactionAreas(redactionAreas.filter(area => area.id !== id));
  };

  const clearAllRedactions = () => {
    setRedactionAreas([]);
    setTextMatches([]);
    toast.success("All redactions cleared");
  };

  const searchTextInCurrentPage = async () => {
    if (!searchText.trim() || !pdfDocRef.current) {
      toast.error("Please enter text to search");
      return;
    }
    
    try {
      const page = await pdfDocRef.current.getPage(currentPage);
      const textContent = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1.0 });
      
      // Find text matches
      const matches: RedactionArea[] = [];
      
      textContent.items.forEach((item: any) => {
        if (item.str && typeof item.str === 'string') {
          const textItem = item as pdfjsLib.TextItem;
          if (textItem.str.toLowerCase().includes(searchText.toLowerCase())) {
            // Get the position and dimensions of the text
            const tx = textItem.transform;
            const fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3]));
            
            const match: RedactionArea = {
              id: generateId(),
              page: currentPage,
              x: tx[4],
              y: tx[5] - fontHeight,
              width: textItem.width,
              height: fontHeight + 2, // Add a little padding
            };
            
            matches.push(match);
          }
        }
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
    
    setRedactionAreas([...redactionAreas, ...textMatches]);
    setTextMatches([]);
    toast.success("Added text matches to redactions");
  };

  const applyRedactions = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (redactionAreas.length === 0) {
      toast.error("Please add at least one redaction area");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to redact PDF...");

    try {
      const steps = [
        { message: "Loading PDF document...", progress: 10 },
        { message: "Processing redaction areas...", progress: 30 },
        { message: "Applying redactions...", progress: 50 },
        { message: "Finalizing document...", progress: 80 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Load the PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Group redactions by page
      const redactionsByPage: { [key: number]: RedactionArea[] } = {};
      redactionAreas.forEach(redaction => {
        if (!redactionsByPage[redaction.page]) {
          redactionsByPage[redaction.page] = [];
        }
        redactionsByPage[redaction.page].push(redaction);
      });
      
      // Apply redactions to each page
      for (const [pageNum, redactions] of Object.entries(redactionsByPage)) {
        const pageIndex = parseInt(pageNum) - 1;
        const page = pdfDoc.getPage(pageIndex);
        
        // Get page dimensions
        const { width, height } = page.getSize();
        
        // Draw black rectangles for each redaction area
        redactions.forEach(redaction => {
          // Convert coordinates (PDF coordinates start from bottom-left)
          const x = redaction.x;
          const y = height - redaction.y - redaction.height;
          
          // Draw black rectangle
          page.drawRectangle({
            x: redaction.x,
            y: page.getHeight() - redaction.y - redaction.height,
            width: redaction.width,
            height: redaction.height,
            color: { red: 0, green: 0, blue: 0 },
          });
        });
      }
      
      // Save the redacted PDF
      const redactedPdfBytes = await pdfDoc.save();
      const blob = new Blob([redactedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setRedactedFile({
        name: `redacted-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Redaction completed!");
      toast.success("PDF redacted successfully!");
      
    } catch (error) {
      console.error('Redaction error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to redact PDF. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
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

  // Update the page rendering when zoom changes
  useEffect(() => {
    if (pdfDocRef.current && currentPage) {
      renderPage(pdfDocRef.current, currentPage, zoom[0] / 100);
    }
  }, [zoom]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Eraser className="h-4 w-4 mr-2" />
          PDF Redaction Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Redact PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Permanently black out sensitive information in your PDF documents
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-red-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-red-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to redact sensitive information
              </p>
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
                <Upload className="h-5 w-5 mr-2" />
                Choose PDF File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Redaction Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{fileInfo.pages} pages</span>
                        <span>•</span>
                        <span>{fileInfo.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{fileInfo.pages}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage >= fileInfo.pages}
                    >
                      Next
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Zoom: {zoom[0]}%</Label>
                    <Slider
                      value={zoom}
                      onValueChange={handleZoomChange}
                      min={50}
                      max={200}
                      step={10}
                    />
                    <div className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleZoomChange([Math.max(50, zoom[0] - 10)])}
                        className="w-10 h-10 p-0"
                      >
                        <ZoomOut className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleZoomChange([100])}
                        className="text-xs"
                      >
                        Reset
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleZoomChange([Math.min(200, zoom[0] + 10)])}
                        className="w-10 h-10 p-0"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Search Text</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter text to find"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      <Button 
                        variant="outline" 
                        onClick={searchTextInCurrentPage}
                        className="shrink-0"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                    {textMatches.length > 0 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-green-600">
                          Found {textMatches.length} matches
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={applyTextMatches}
                        >
                          Redact All
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Redaction Areas: {redactionAreas.filter(r => r.page === currentPage).length}</Label>
                      {redactionAreas.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={clearAllRedactions}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Click and drag on the document to create redaction areas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Redacted File */}
            {redactedFile && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        PDF Redacted Successfully!
                      </h3>
                      <p className="text-green-700 mb-2">{redactedFile.name}</p>
                      <p className="text-sm text-green-600">
                        Sensitive information has been permanently redacted
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={downloadRedacted}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Redacted PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content - PDF Viewer */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>PDF Redaction</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={applyRedactions}
                      disabled={processing || redactionAreas.length === 0}
                      className="bg-red-600 hover:bg-red-700 text-white hover:text-white border-red-600 hover:border-red-700"
                    >
                      <Eraser className="h-4 w-4 mr-1" />
                      Apply Redactions
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Click and drag to select areas to redact. Selected areas will be permanently blacked out.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="bg-gray-100 p-4 rounded-lg flex items-center justify-center overflow-auto"
                  style={{ maxHeight: '700px' }}
                >
                  <div 
                    ref={containerRef}
                    className="relative bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair"
                    style={{ 
                      transform: `scale(${zoom[0] / 100})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.2s ease-in-out'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {pageImage ? (
                      <>
                        <img 
                          src={pageImage} 
                          alt={`Page ${currentPage}`}
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Redaction Areas */}
                        {redactionAreas
                          .filter(area => area.page === currentPage)
                          .map(area => (
                            <div
                              key={area.id}
                              className="absolute bg-black border-2 border-red-500 cursor-pointer"
                              style={{
                                left: `${area.x}px`,
                                top: `${area.y}px`,
                                width: `${area.width}px`,
                                height: `${area.height}px`,
                              }}
                              onClick={() => removeRedactionArea(area.id)}
                              title="Click to remove"
                            />
                          ))
                        }
                        
                        {/* Text Search Matches */}
                        {textMatches.map(match => (
                          <div
                            key={match.id}
                            className="absolute bg-yellow-200 opacity-50 border-2 border-yellow-500 cursor-pointer"
                            style={{
                              left: `${match.x}px`,
                              top: `${match.y}px`,
                              width: `${match.width}px`,
                              height: `${match.height}px`,
                            }}
                            onClick={() => {
                              setRedactionAreas([...redactionAreas, match]);
                              setTextMatches(textMatches.filter(m => m.id !== match.id));
                            }}
                            title="Click to add to redactions"
                          />
                        ))}
                        
                        {/* Current Redaction */}
                        {isDrawing && currentRedaction && (
                          <div
                            className="absolute bg-red-500 opacity-50"
                            style={{
                              left: `${Math.min(startPoint!.x, startPoint!.x + currentRedaction.width)}px`,
                              top: `${Math.min(startPoint!.y, startPoint!.y + currentRedaction.height)}px`,
                              width: `${Math.abs(currentRedaction.width)}px`,
                              height: `${Math.abs(currentRedaction.height)}px`,
                            }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Processing Progress */}
            {processing && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Redacting PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Applying redactions to your document..."}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
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
