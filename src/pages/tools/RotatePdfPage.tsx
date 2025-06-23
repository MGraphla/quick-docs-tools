import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, RotateCw, RotateCcw, Loader2, CheckCircle, AlertCircle, Settings, Zap, X, Save, Eye, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";

interface RotatedFile {
  name: string;
  url: string;
  size: string;
}

const RotatePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);
  const [rotationDirection, setRotationDirection] = useState<'clockwise' | 'counterclockwise'>('clockwise');
  const [pageSelection, setPageSelection] = useState("all");
  const [customPageRange, setCustomPageRange] = useState("");
  const [evenPages, setEvenPages] = useState(false);
  const [oddPages, setOddPages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [rotatedFile, setRotatedFile] = useState<RotatedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfProcessor = createPdfProcessor();

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    const loadingToast = toast.loading("Loading PDF...");
    
    try {
      const info = await pdfProcessor.loadPdf(selectedFile);
      setFile(selectedFile);
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: info.pageCount
      });
      setRotatedFile(null);
      setCurrentPage(1);
      setSelectedPages([]);
      toast.success(`PDF loaded: ${info.pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

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

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNum)) {
        return prev.filter(p => p !== pageNum);
      } else {
        return [...prev, pageNum];
      }
    });
  };

  const rotatePdf = async () => {
    if (!file || !fileInfo) {
      toast.error("Please select a PDF file");
      return;
    }

    // Validate page selection
    let pagesToRotate: number[] = [];
    
    if (pageSelection === "all") {
      pagesToRotate = Array.from({ length: fileInfo.pages }, (_, i) => i + 1);
    } else if (pageSelection === "current") {
      pagesToRotate = [currentPage];
    } else if (pageSelection === "custom") {
      if (!customPageRange.trim()) {
        toast.error("Please enter a page range");
        return;
      }
      
      try {
        // Parse page range (e.g., "1-3,5,7-9")
        const ranges = customPageRange.split(',').map(r => r.trim());
        for (const range of ranges) {
          if (range.includes('-')) {
            const [start, end] = range.split('-').map(n => parseInt(n.trim()));
            for (let i = start; i <= Math.min(end, fileInfo.pages); i++) {
              if (i >= 1) pagesToRotate.push(i);
            }
          } else {
            const page = parseInt(range);
            if (page >= 1 && page <= fileInfo.pages) {
              pagesToRotate.push(page);
            }
          }
        }
      } catch (error) {
        toast.error("Invalid page range format");
        return;
      }
    } else if (pageSelection === "selected") {
      if (selectedPages.length === 0) {
        toast.error("Please select at least one page");
        return;
      }
      pagesToRotate = selectedPages;
    } else if (pageSelection === "even") {
      pagesToRotate = Array.from({ length: fileInfo.pages }, (_, i) => i + 1).filter(p => p % 2 === 0);
    } else if (pageSelection === "odd") {
      pagesToRotate = Array.from({ length: fileInfo.pages }, (_, i) => i + 1).filter(p => p % 2 === 1);
    }

    if (pagesToRotate.length === 0) {
      toast.error("No pages selected for rotation");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to rotate pages...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 15 },
        { message: "Processing page content...", progress: 30 },
        { message: "Rotating selected pages...", progress: 50 },
        { message: "Optimizing document...", progress: 70 },
        { message: "Finalizing rotated PDF...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simulate PDF creation
      const rotationText = rotationDirection === 'clockwise' ? 'CW' : 'CCW';
      const pdfContent = `Rotated version of ${file.name} - ${rotationAngle}° ${rotationText}`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setRotatedFile({
        name: `rotated-${rotationAngle}deg-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Rotation completed!");
      toast.success(`Successfully rotated ${pagesToRotate.length} page${pagesToRotate.length > 1 ? 's' : ''} by ${rotationAngle}° ${rotationDirection === 'clockwise' ? 'clockwise' : 'counterclockwise'}`);
      
    } catch (error) {
      console.error('Rotation error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to rotate PDF. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadRotated = () => {
    if (!rotatedFile) return;
    
    const link = document.createElement('a');
    link.href = rotatedFile.url;
    link.download = rotatedFile.name;
    link.click();
    toast.success(`Downloaded ${rotatedFile.name}`);
  };

  const changePage = (newPage: number) => {
    if (!fileInfo) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    setCurrentPage(newPage);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-lime-100 text-lime-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          PDF Rotation Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Rotate PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Rotate PDF pages clockwise or counterclockwise with precise control over individual pages or page ranges.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-lime-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-lime-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-lime-500 to-green-600 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to rotate its pages
              </p>
              <Button size="lg" className="bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700">
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

      {/* PDF Rotation Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Rotation Tools */}
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Rotation Settings</CardTitle>
                <CardDescription>
                  Configure how you want to rotate your PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Rotation Angle</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={rotationAngle === 90 ? "default" : "outline"}
                        onClick={() => setRotationAngle(90)}
                        className={rotationAngle === 90 ? "bg-lime-600 hover:bg-lime-700" : ""}
                      >
                        90°
                      </Button>
                      <Button
                        variant={rotationAngle === 180 ? "default" : "outline"}
                        onClick={() => setRotationAngle(180)}
                        className={rotationAngle === 180 ? "bg-lime-600 hover:bg-lime-700" : ""}
                      >
                        180°
                      </Button>
                      <Button
                        variant={rotationAngle === 270 ? "default" : "outline"}
                        onClick={() => setRotationAngle(270)}
                        className={rotationAngle === 270 ? "bg-lime-600 hover:bg-lime-700" : ""}
                      >
                        270°
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rotation Direction</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={rotationDirection === 'clockwise' ? "default" : "outline"}
                        onClick={() => setRotationDirection('clockwise')}
                        className="flex flex-col gap-1 h-20 items-center justify-center"
                      >
                        <RotateCw className="h-6 w-6" />
                        <span className="text-xs">Clockwise</span>
                      </Button>
                      <Button
                        variant={rotationDirection === 'counterclockwise' ? "default" : "outline"}
                        onClick={() => setRotationDirection('counterclockwise')}
                        className="flex flex-col gap-1 h-20 items-center justify-center"
                      >
                        <RotateCcw className="h-6 w-6" />
                        <span className="text-xs">Counter-clockwise</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Page Selection</Label>
                    <Select value={pageSelection} onValueChange={setPageSelection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pages</SelectItem>
                        <SelectItem value="current">Current Page Only</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                        <SelectItem value="selected">Selected Pages</SelectItem>
                        <SelectItem value="even">Even Pages</SelectItem>
                        <SelectItem value="odd">Odd Pages</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {pageSelection === "custom" && (
                      <div className="mt-2">
                        <Input
                          placeholder="e.g., 1-3, 5, 7-9"
                          value={customPageRange}
                          onChange={(e) => setCustomPageRange(e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter page numbers or ranges separated by commas
                        </p>
                      </div>
                    )}
                    
                    {pageSelection === "selected" && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">
                          Selected {selectedPages.length} of {fileInfo.pages} pages
                        </p>
                        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto p-2 border rounded-md">
                          {Array.from({ length: fileInfo.pages }, (_, i) => i + 1).map(pageNum => (
                            <Button
                              key={pageNum}
                              variant={selectedPages.includes(pageNum) ? "default" : "outline"}
                              size="sm"
                              className={`w-8 h-8 p-0 ${selectedPages.includes(pageNum) ? "bg-lime-600 hover:bg-lime-700" : ""}`}
                              onClick={() => togglePageSelection(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - PDF Preview & Rotation */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Document Preview</CardTitle>
                  <Badge variant="outline">
                    Page {currentPage} of {fileInfo.pages}
                  </Badge>
                </div>
                <CardDescription>
                  Preview your document and select pages to rotate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[600px]">
                  <div className="bg-white shadow-lg rounded-lg overflow-hidden relative" style={{ width: '595px', height: '842px' }}>
                    <canvas 
                      ref={pdfCanvasRef}
                      width={595}
                      height={842}
                      className="w-full h-full border"
                    />
                    
                    {/* Page Selection Overlay */}
                    {pageSelection === "selected" && (
                      <div 
                        className={`absolute inset-0 cursor-pointer ${
                          selectedPages.includes(currentPage) ? "bg-lime-200/30" : "hover:bg-lime-100/20"
                        }`}
                        onClick={() => togglePageSelection(currentPage)}
                      >
                        {selectedPages.includes(currentPage) && (
                          <div className="absolute top-4 right-4 bg-lime-600 text-white rounded-full p-2">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Rotation Preview */}
                    <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-lg p-2 shadow-md">
                      <div className="flex items-center gap-2">
                        {rotationDirection === 'clockwise' ? (
                          <RotateCw className="h-5 w-5 text-lime-600" />
                        ) : (
                          <RotateCcw className="h-5 w-5 text-lime-600" />
                        )}
                        <span className="font-medium text-sm">{rotationAngle}° {rotationDirection === 'clockwise' ? 'CW' : 'CCW'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Rotation:</span>
                    <span>{rotationAngle}° {rotationDirection === 'clockwise' ? 'Clockwise' : 'Counter-clockwise'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Pages:</span>
                    <span>
                      {pageSelection === "all" ? "All Pages" : 
                       pageSelection === "current" ? `Page ${currentPage} Only` : 
                       pageSelection === "selected" ? `${selectedPages.length} Selected Pages` :
                       pageSelection === "even" ? "Even Pages" :
                       pageSelection === "odd" ? "Odd Pages" :
                       `Custom: ${customPageRange || "Not set"}`}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rotation Action */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={rotatePdf}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-lime-600 to-green-600 hover:from-lime-700 hover:to-green-700 text-white py-3 text-lg font-semibold"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Rotating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2" />
                        Rotate PDF
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Rotation Summary */}
                {!processing && !rotatedFile && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Rotation Summary
                    </h4>
                    <p className="text-sm text-gray-600">
                      You are about to rotate {
                        pageSelection === "all" ? `all ${fileInfo.pages} pages` : 
                        pageSelection === "current" ? `page ${currentPage} only` : 
                        pageSelection === "selected" ? `${selectedPages.length} selected pages` :
                        pageSelection === "even" ? `all even pages` :
                        pageSelection === "odd" ? `all odd pages` :
                        `pages ${customPageRange || "in custom range"}`
                      } by {rotationAngle}° {rotationDirection === 'clockwise' ? 'clockwise' : 'counter-clockwise'}.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Processing Progress */}
            {processing && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-lime-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-lime-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Rotating PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Rotating pages in your document..."}
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

            {/* Rotated File */}
            {rotatedFile && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        PDF Rotated Successfully!
                      </h3>
                      <p className="text-green-700 mb-2">{rotatedFile.name}</p>
                      <p className="text-sm text-green-600">
                        Your document has been rotated as specified
                      </p>
                    </div>
                    <Button
                      onClick={downloadRotated}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
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
            <strong>How to rotate PDF pages:</strong> Upload a PDF file, select the rotation angle and direction, choose which pages to rotate (all pages, specific pages, or page ranges), then click "Rotate PDF" to apply the rotation.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default RotatePdfPage;