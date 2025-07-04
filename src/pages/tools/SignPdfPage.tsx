import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, Eye, PenLine, X } from "lucide-react";
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

interface SignedFile {
  name: string;
  url: string;
  size: string;
}

interface Signature {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [zoom, setZoom] = useState([100]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [signedFile, setSignedFile] = useState<SignedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [signature, setSignature] = useState<Signature | null>(null);
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [signatureX, setSignatureX] = useState([50]);
  const [signatureY, setSignatureY] = useState([50]);
  const [signatureWidth, setSignatureWidth] = useState([150]);
  const [signatureHeight, setSignatureHeight] = useState([50]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
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
      setSignedFile(null);
      setCurrentPage(1);
      
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

  const handleZoomChange = async (newZoom: number[]) => {
    setZoom(newZoom);
    if (pdfDocRef.current) {
      await renderPage(pdfDocRef.current, currentPage, newZoom[0] / 100);
    }
  };

  const handleSignatureChange = (newValues: number[], setter: (value: number[]) => void) => {
    setter(newValues);
    updateSignature();
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureUrl(null);
    setSignature(null);
  };

  const createSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get the data URL of the signature
    const url = canvas.toDataURL();
    setSignatureUrl(url);

    // Create a signature object
    const newSignature: Signature = {
      id: generateId(),
      url: url,
      x: signatureX[0],
      y: signatureY[0],
      width: signatureWidth[0],
      height: signatureHeight[0]
    };
    setSignature(newSignature);
    toast.success("Signature created!");
  };

  const updateSignature = () => {
    if (!signature) return;

    const updatedSignature: Signature = {
      ...signature,
      x: signatureX[0],
      y: signatureY[0],
      width: signatureWidth[0],
      height: signatureHeight[0]
    };
    setSignature(updatedSignature);
  };

  const applySignature = async () => {
    if (!file || !signature) {
      toast.error("Please select a PDF file and create a signature");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to add signature...");

    try {
      const steps = [
        { message: "Loading PDF document...", progress: 20 },
        { message: "Processing signature...", progress: 40 },
        { message: "Adding signature to PDF...", progress: 60 },
        { message: "Finalizing document...", progress: 80 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Use the addSignature function with correct parameters
      const signedPdfBytes = await pdfProcessor.addSignature(
        file,
        signature.url,
        signature.x,
        signature.y,
        signature.width,
        signature.height,
        currentPage
      );
      
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setSignedFile({
        name: `signed-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Signature added successfully!");
      toast.success("Signature added to PDF successfully!");
      
    } catch (error) {
      console.error('Signing error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add signature. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadSigned = () => {
    if (!signedFile) return;
    
    const link = document.createElement('a');
    link.href = signedFile.url;
    link.download = signedFile.name;
    link.click();
    toast.success(`Downloaded ${signedFile.name}`);
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
        <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <PenLine className="h-4 w-4 mr-2" />
          PDF Signature Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add your digital signature to PDF documents
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-indigo-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to add your signature
              </p>
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
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

      {/* PDF Signature Interface */}
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
                    <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                      <FileText className="h-5 w-5 text-indigo-600" />
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M8.25 9a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6A.75.75 0 018.25 9z" /></svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a3 3 0 10-4.5 0m4.5 0c7 0 7 7.5 0 7.5a7 7 0 11-14 0c0-7.5 7-7.5 14-7.5M10 8.25a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5H10.75v2.25a.75.75 0 01-1.5 0V12.5H7a.75.75 0 010-1.5h2.25V9a.75.75 0 01.75-.75z" /></svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenLine className="h-5 w-5" />
                  Create Signature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <canvas 
                    ref={signatureCanvasRef}
                    width={300}
                    height={100}
                    className="border border-gray-300 rounded-md"
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={clearSignature}>
                      Clear
                    </Button>
                    <Button onClick={createSignature}>Create Signature</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Signature Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>X Position: {signatureX[0]}px</Label>
                    <Slider
                      value={signatureX}
                      onValueChange={(values) => handleSignatureChange(values, setSignatureX)}
                      min={0}
                      max={500}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Position: {signatureY[0]}px</Label>
                    <Slider
                      value={signatureY}
                      onValueChange={(values) => handleSignatureChange(values, setSignatureY)}
                      min={0}
                      max={500}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Width: {signatureWidth[0]}px</Label>
                    <Slider
                      value={signatureWidth}
                      onValueChange={(values) => handleSignatureChange(values, setSignatureWidth)}
                      min={50}
                      max={300}
                      step={1}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Height: {signatureHeight[0]}px</Label>
                    <Slider
                      value={signatureHeight}
                      onValueChange={(values) => handleSignatureChange(values, setSignatureHeight)}
                      min={20}
                      max={150}
                      step={1}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signed File */}
            {signedFile && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        PDF Signed Successfully!
                      </h3>
                      <p className="text-green-700 mb-2">{signedFile.name}</p>
                      <p className="text-sm text-green-600">
                        Your signature has been added to the PDF
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={downloadSigned}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Signed PDF
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
                  <CardTitle>PDF Signature</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={applySignature}
                      disabled={processing || !signature}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white hover:text-white border-indigo-600 hover:border-indigo-700"
                    >
                      <PenLine className="h-4 w-4 mr-1" />
                      Apply Signature
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Add your signature to the PDF document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="bg-gray-100 p-4 rounded-lg flex items-center justify-center overflow-auto"
                  style={{ maxHeight: '700px' }}
                >
                  <div 
                    className="relative bg-white shadow-lg rounded-lg overflow-hidden"
                    style={{ 
                      transform: `scale(${zoom[0] / 100})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.2s ease-in-out'
                    }}
                  >
                    {pageImage ? (
                      <>
                        <img 
                          src={pageImage} 
                          alt={`Page ${currentPage}`}
                          className="w-full h-full object-contain"
                        />
                        
                        {/* Signature Preview */}
                        {signature && signatureUrl && (
                          <div
                            className="absolute"
                            style={{
                              left: `${signature.x}px`,
                              top: `${signature.y}px`,
                              width: `${signature.width}px`,
                              height: `${signature.height}px`,
                            }}
                          >
                            <img
                              src={signatureUrl}
                              alt="Signature"
                              className="w-full h-full object-contain"
                            />
                          </div>
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
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Adding Signature</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Adding your signature to the document..."}
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
            <strong>How to sign a PDF:</strong> Upload a PDF file, create your signature, adjust the signature settings, then click "Apply Signature" to add your signature to the PDF.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SignPdfPage;
