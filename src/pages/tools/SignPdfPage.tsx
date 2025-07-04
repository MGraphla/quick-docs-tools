import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Pen, Loader2, CheckCircle, AlertCircle, Trash2, Move, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import SignatureCanvas from "react-signature-canvas";

interface SignedFile {
  name: string;
  url: string;
  size: string;
}

interface Signature {
  id: string;
  x: number;
  y: number;
  page: number;
  dataUrl: string;
  width: number;
  height: number;
}

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [signatureType, setSignatureType] = useState("draw");
  const [signatureText, setSignatureText] = useState("");
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [selectedSignature, setSelectedSignature] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [signedFile, setSignedFile] = useState<SignedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pdfPageImage, setPdfPageImage] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<SignatureCanvas>(null);
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
      setCurrentPage(1);
      setSignatures([]);
      setSignedFile(null);
      
      // Load first page
      await loadPdfPage(selectedFile, 1);
      
      toast.success(`PDF loaded: ${info.pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

  const loadPdfPage = async (pdfFile: File, pageNumber: number) => {
    setIsLoadingPage(true);
    try {
      const pageImage = await pdfProcessor.renderPdfPage(pdfFile, pageNumber, 1.5);
      setPdfPageImage(pageImage);
    } catch (error) {
      console.error('Error loading PDF page:', error);
      toast.error("Failed to load PDF page");
    } finally {
      setIsLoadingPage(false);
    }
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

  const addDrawnSignature = async () => {
    if (!signatureCanvasRef.current || signatureCanvasRef.current.isEmpty()) {
      toast.error("Please draw a signature first");
      return;
    }

    const dataUrl = signatureCanvasRef.current.toDataURL();
    const newSignature: Signature = {
      id: Date.now().toString(),
      x: 100,
      y: 200,
      page: currentPage,
      dataUrl,
      width: 150,
      height: 75
    };

    setSignatures(prev => [...prev, newSignature]);
    signatureCanvasRef.current.clear();
    toast.success("Signature added to document");
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
    }
  };

  const removeSignature = (signatureId: string) => {
    setSignatures(prev => prev.filter(sig => sig.id !== signatureId));
    setSelectedSignature(null);
    toast.success("Signature removed");
  };

  const handlePageChange = async (newPage: number) => {
    if (!file || !fileInfo || newPage < 1 || newPage > fileInfo.pages) return;
    setCurrentPage(newPage);
    await loadPdfPage(file, newPage);
  };

  const signPdf = async () => {
    if (!file || signatures.length === 0) {
      toast.error("Please add at least one signature");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to sign document...");

    try {
      const steps = [
        { message: "Loading PDF document...", progress: 20 },
        { message: "Processing signatures...", progress: 40 },
        { message: "Embedding signatures...", progress: 60 },
        { message: "Generating signed PDF...", progress: 80 },
        { message: "Finalizing document...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Process each signature - Fix: provide all required parameters (file, signature, x, y, page)
      let signedPdfBytes = await file.arrayBuffer();
      
      for (const signature of signatures) {
        signedPdfBytes = await pdfProcessor.addSignature(
          new File([signedPdfBytes], file.name, { type: 'application/pdf' }),
          signature.dataUrl,
          signature.x,
          signature.y,
          signature.page
        );
      }
      
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setSignedFile({
        name: `signed-${file.name}`,
        url: url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Document signed successfully!");
      toast.success("PDF signed successfully!");
      
    } catch (error) {
      console.error('Signing error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to sign PDF. Please try again.");
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

  const resetForm = () => {
    setFile(null);
    setFileInfo(null);
    setCurrentPage(1);
    setSignatures([]);
    setSignedFile(null);
    setPdfPageImage(null);
    setSignatureText("");
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Pen className="h-4 w-4 mr-2" />
          PDF Signature Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sign PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Add your signature to PDF documents with professional digital signing capabilities.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300">
          <CardContent className="p-6 md:p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-blue-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                Select a PDF document to add your signature
              </p>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
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

      {/* PDF Signing Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Document Info & Signature Tools */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                          {fileInfo.pages} pages
                        </Badge>
                        <span>•</span>
                        <span>{fileInfo.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Current Page</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage <= 1 || isLoadingPage}
                      >
                        ←
                      </Button>
                      <span className="text-sm font-medium px-2">
                        {currentPage} of {fileInfo.pages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= fileInfo.pages || isLoadingPage}
                      >
                        →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Signature Creation */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Pen className="h-5 w-5 text-blue-600" />
                  Create Signature
                </CardTitle>
                <CardDescription>
                  Draw or type your signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={signatureType} onValueChange={setSignatureType} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 w-full">
                    <TabsTrigger value="draw">Draw</TabsTrigger>
                    <TabsTrigger value="type">Type</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="draw" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Draw Your Signature</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
                        <SignatureCanvas
                          ref={signatureCanvasRef}
                          canvasProps={{
                            width: 280,
                            height: 120,
                            className: 'signature-canvas bg-white rounded'
                          }}
                          backgroundColor="white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearSignature}
                          className="flex-1"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Clear
                        </Button>
                        <Button
                          onClick={addDrawnSignature}
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Pen className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="type" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type Your Signature</Label>
                      <Input
                        placeholder="Enter your name"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      />
                      <Button
                        onClick={() => {
                          if (signatureText.trim()) {
                            const canvas = document.createElement('canvas');
                            canvas.width = 300;
                            canvas.height = 100;
                            const ctx = canvas.getContext('2d');
                            if (ctx) {
                              ctx.font = '24px cursive';
                              ctx.fillStyle = '#000';
                              ctx.textAlign = 'center';
                              ctx.fillText(signatureText, 150, 60);
                              
                              const newSignature: Signature = {
                                id: Date.now().toString(),
                                x: 100,
                                y: 200,
                                page: currentPage,
                                dataUrl: canvas.toDataURL(),
                                width: 150,
                                height: 50
                              };
                              
                              setSignatures(prev => [...prev, newSignature]);
                              setSignatureText("");
                              toast.success("Text signature added to document");
                            }
                          } else {
                            toast.error("Please enter your name");
                          }
                        }}
                        disabled={!signatureText.trim()}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        <Pen className="h-4 w-4 mr-2" />
                        Add Text Signature
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Signatures List */}
            {signatures.length > 0 && (
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      Added Signatures
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {signatures.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {signatures.map((signature) => (
                      <div key={signature.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <img 
                            src={signature.dataUrl} 
                            alt="signature" 
                            className="h-6 w-12 object-contain border rounded"
                          />
                          <span className="text-sm">Page {signature.page}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSignature(signature.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sign Button */}
            <Button
              onClick={signPdf}
              disabled={processing || signatures.length === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm py-3"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Pen className="h-5 w-5 mr-2" />
                  Sign PDF ({signatures.length})
                </>
              )}
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Processing Progress */}
            {processing && (
              <Card className="border-blue-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Signing PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Processing your document signature..."}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Signed Result */}
            {signedFile && (
              <Card className="border-green-200 bg-green-50 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Document Signed Successfully
                      </CardTitle>
                      <CardDescription>
                        Your PDF has been signed and is ready for download
                      </CardDescription>
                    </div>
                    <Button onClick={downloadSigned} className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Signed PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{signedFile.name}</h4>
                      <p className="text-sm text-gray-500">{signedFile.size}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Signed
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PDF Preview */}
            {!processing && !signedFile && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      PDF Preview - Page {currentPage}
                    </span>
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      size="sm"
                    >
                      Reset
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Click on the document to position your signature
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    {isLoadingPage ? (
                      <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-2">Loading page...</span>
                      </div>
                    ) : pdfPageImage ? (
                      <div className="relative">
                        <img 
                          src={pdfPageImage} 
                          alt={`PDF Page ${currentPage}`}
                          className="w-full h-auto"
                        />
                        {/* Render signatures on current page */}
                        {signatures
                          .filter(sig => sig.page === currentPage)
                          .map((signature) => (
                            <div
                              key={signature.id}
                              className={`absolute cursor-move border-2 ${
                                selectedSignature === signature.id 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-transparent hover:border-blue-300'
                              }`}
                              style={{
                                left: signature.x,
                                top: signature.y,
                                width: signature.width,
                                height: signature.height,
                              }}
                              onClick={() => setSelectedSignature(signature.id)}
                            >
                              <img 
                                src={signature.dataUrl} 
                                alt="signature" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-96 text-gray-500">
                        <p>Unable to load PDF preview</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to sign a PDF:</strong> Upload a PDF file, create your signature by drawing or typing, position it on the document, then click "Sign PDF" to create your digitally signed document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SignPdfPage;
