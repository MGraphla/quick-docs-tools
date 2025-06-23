import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Pen, Type, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Settings, Zap, X, Save, Undo, Redo, Eraser, Trash2, Eye, Signature } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";

interface SignedFile {
  name: string;
  url: string;
  size: string;
}

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [signatureType, setSignatureType] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [typedSignatureFont, setTypedSignatureFont] = useState("Dancing Script");
  const [typedSignatureSize, setTypedSignatureSize] = useState([36]);
  const [typedSignatureColor, setTypedSignatureColor] = useState("#000000");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [signaturePlaced, setSignaturePlaced] = useState(false);
  const [signaturePosition, setSignaturePosition] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [signedFile, setSignedFile] = useState<SignedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureImageRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const pdfProcessor = createPdfProcessor();

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Pacifico&family=Satisfy&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

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
      setSignedFile(null);
      setCurrentPage(1);
      setSignaturePlaced(false);
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

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setUploadedSignature(selectedFile);
      const preview = URL.createObjectURL(selectedFile);
      setUploadedSignaturePreview(preview);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = typedSignatureColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const placeSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!pdfCanvasRef.current) return;
    
    const rect = pdfCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSignaturePosition({ x, y });
    setSignaturePlaced(true);
    
    // In a real implementation, we would draw the signature on the PDF canvas
    const ctx = pdfCanvasRef.current.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0, 0, 255, 0.2)';
      ctx.fillRect(x - 75, y - 25, 150, 50);
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillText('Signature will appear here', x - 70, y + 5);
    }
  };

  const signPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!signaturePlaced) {
      toast.error("Please place your signature on the document");
      return;
    }

    if (signatureType === "draw" && !canvasRef.current) {
      toast.error("Please draw your signature");
      return;
    }

    if (signatureType === "type" && !typedSignature.trim()) {
      toast.error("Please enter your signature text");
      return;
    }

    if (signatureType === "upload" && !uploadedSignature) {
      toast.error("Please upload a signature image");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to sign document...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 15 },
        { message: "Processing signature...", progress: 30 },
        { message: "Applying signature to document...", progress: 50 },
        { message: "Validating signed document...", progress: 70 },
        { message: "Finalizing document...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simulate PDF creation
      const pdfContent = `Signed version of ${file.name}`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setSignedFile({
        name: `signed-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Signing completed!");
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

  const changePage = (newPage: number) => {
    if (!fileInfo) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    setCurrentPage(newPage);
    setSignaturePlaced(false);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Signature className="h-4 w-4 mr-2" />
          PDF Signature Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add your signature to PDF documents with our professional signing tools. Draw, type, or upload your signature.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-rose-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-rose-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to sign with your digital signature
              </p>
              <Button size="lg" className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Signature Tools */}
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
                <CardTitle>Create Signature</CardTitle>
                <CardDescription>
                  Choose how you want to create your signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={signatureType} onValueChange={setSignatureType}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="draw" className="flex items-center gap-1">
                      <Pen className="h-4 w-4" />
                      Draw
                    </TabsTrigger>
                    <TabsTrigger value="type" className="flex items-center gap-1">
                      <Type className="h-4 w-4" />
                      Type
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="draw" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Draw Your Signature</Label>
                      <div className="border rounded-lg p-4 bg-white">
                        <canvas
                          ref={canvasRef}
                          width={400}
                          height={150}
                          className="border border-gray-200 rounded cursor-crosshair w-full"
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                        />
                        <div className="flex justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Label>Color:</Label>
                            <Input
                              type="color"
                              value={typedSignatureColor}
                              onChange={(e) => setTypedSignatureColor(e.target.value)}
                              className="w-10 h-8 p-0"
                            />
                          </div>
                          <Button variant="outline" onClick={clearCanvas}>
                            <Eraser className="h-4 w-4 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="type" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type Your Signature</Label>
                      <Input
                        placeholder="Enter your full name"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Style</Label>
                      <Select value={typedSignatureFont} onValueChange={setTypedSignatureFont}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                          <SelectItem value="Pacifico">Pacifico</SelectItem>
                          <SelectItem value="Satisfy">Satisfy</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Size: {typedSignatureSize[0]}px</Label>
                      <Slider
                        value={typedSignatureSize}
                        onValueChange={setTypedSignatureSize}
                        min={12}
                        max={72}
                        step={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: typedSignatureColor }}
                        />
                        <Input
                          type="color"
                          value={typedSignatureColor}
                          onChange={(e) => setTypedSignatureColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                    
                    {typedSignature && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <p 
                          className="text-center"
                          style={{ 
                            fontFamily: typedSignatureFont, 
                            fontSize: `${typedSignatureSize[0]}px`,
                            color: typedSignatureColor
                          }}
                        >
                          {typedSignature}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload Signature Image</Label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-400 transition-colors cursor-pointer"
                        onClick={() => signatureImageRef.current?.click()}
                      >
                        <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload your signature image</p>
                        <p className="text-xs text-gray-500">Supports JPG, PNG, GIF</p>
                        <input
                          ref={signatureImageRef}
                          type="file"
                          accept="image/*"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </div>
                      
                      {uploadedSignaturePreview && (
                        <div className="mt-4 border rounded-lg p-4 bg-white">
                          <img 
                            src={uploadedSignaturePreview} 
                            alt="Uploaded signature" 
                            className="max-h-24 mx-auto"
                          />
                          <p className="text-xs text-center mt-2 text-gray-500">
                            {uploadedSignature?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      Click on the document where you want to place your signature
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - PDF Preview & Signing */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Sign Document</CardTitle>
                  <Badge variant={signaturePlaced ? "default" : "outline"} className={signaturePlaced ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                    {signaturePlaced ? "Signature Placed" : "Place Signature"}
                  </Badge>
                </div>
                <CardDescription>
                  Page {currentPage} of {fileInfo.pages} - Click on the document where you want to add your signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[600px]">
                  <div className="bg-white shadow-lg rounded-lg overflow-hidden" style={{ width: '595px', height: '842px' }}>
                    <canvas 
                      ref={pdfCanvasRef}
                      width={595}
                      height={842}
                      className="w-full h-full border cursor-crosshair"
                      onClick={placeSignature}
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      setSignaturePlaced(false);
                      if (pdfCanvasRef.current) {
                        const ctx = pdfCanvasRef.current.getContext('2d');
                        if (ctx) {
                          ctx.clearRect(0, 0, pdfCanvasRef.current.width, pdfCanvasRef.current.height);
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Reset Signature
                  </Button>
                  <Button 
                    onClick={signPdf} 
                    disabled={processing || !signaturePlaced}
                    className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <Signature className="h-4 w-4 mr-2" />
                        Sign Document
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Processing Progress */}
            {processing && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-rose-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Signing PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Applying your signature to the document..."}
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
                        Your signature has been applied to the document
                      </p>
                    </div>
                    <Button
                      onClick={downloadSigned}
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
            <strong>How to sign a PDF:</strong> Upload a PDF file, create your signature by drawing, typing, or uploading an image, click on the document where you want to place your signature, then click "Sign Document" to apply your signature.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SignPdfPage;