import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Pen, Type, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Settings, Zap, X, Save, Undo, Redo, Eraser, Trash2, Eye, Signature, Move } from "lucide-react";
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
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import SignatureCanvas from "react-signature-canvas";
import Draggable from "react-draggable";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

interface SignedFile {
  name: string;
  url: string;
  size: string;
}

interface SignatureState {
  type: 'draw' | 'text' | 'image' | null;
  data: string | null;
  position: { x: number; y: number } | null;
  size: { width: number; height: number };
  isDragging: boolean;
}

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [signatureType, setSignatureType] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [typedSignatureFont, setTypedSignatureFont] = useState("Helvetica");
  const [typedSignatureSize, setTypedSignatureSize] = useState([36]);
  const [typedSignatureColor, setTypedSignatureColor] = useState("#000000");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [uploadedSignaturePreview, setUploadedSignaturePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfPageImage, setPdfPageImage] = useState<string | null>(null);
  const [pdfScale, setPdfScale] = useState(1.5);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });
  const [signatureState, setSignatureState] = useState<SignatureState>({
    type: null,
    data: null,
    position: null,
    size: { width: 200, height: 100 },
    isDragging: false
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [signedFile, setSignedFile] = useState<SignedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [penSize, setPenSize] = useState([2]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureImageRef = useRef<HTMLInputElement>(null);
  const signatureCanvasRef = useRef<SignatureCanvas>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Pacifico&family=Satisfy&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    const loadingToast = toast.loading("Loading PDF...");
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      setFile(selectedFile);
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: pdf.numPages
      });
      setSignedFile(null);
      setCurrentPage(1);
      setSignatureState({
        type: null,
        data: null,
        position: null,
        size: { width: 200, height: 100 },
        isDragging: false
      });
      
      // Render first page
      await renderPdfPage(selectedFile, 1, pdfScale);
      
      toast.success(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, [pdfScale]);

  const renderPdfPage = async (pdfFile: File, pageNumber: number, scale: number) => {
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      
      setPdfDimensions({ width: viewport.width, height: viewport.height });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;

      const pageImage = canvas.toDataURL('image/jpeg', 0.95);
      setPdfPageImage(pageImage);
      
      // Update canvas with the rendered page
      if (pdfCanvasRef.current) {
        const canvas = pdfCanvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        const img = new Image();
        img.onload = () => {
          ctx?.drawImage(img, 0, 0);
        };
        img.src = pageImage;
      }
    } catch (error) {
      console.error('Error rendering page:', error);
      toast.error("Failed to render PDF page");
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

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setUploadedSignature(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedSignaturePreview(result);
        setSignatureState(prev => ({
          ...prev,
          type: 'image',
          data: result
        }));
      };
      reader.readAsDataURL(selectedFile);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      signatureCanvasRef.current.clear();
      setSignatureState(prev => ({
        ...prev,
        type: null,
        data: null
      }));
    }
  };

  const saveSignature = () => {
    if (signatureType === "draw") {
      if (signatureCanvasRef.current && !signatureCanvasRef.current.isEmpty()) {
        const signatureData = signatureCanvasRef.current.toDataURL('image/png');
        setSignatureState(prev => ({
          ...prev,
          type: 'draw',
          data: signatureData
        }));
        toast.success("Signature saved! Now place it on the document.");
      } else {
        toast.error("Please draw your signature first");
      }
    } else if (signatureType === "type") {
      if (typedSignature.trim()) {
        setSignatureState(prev => ({
          ...prev,
          type: 'text',
          data: typedSignature
        }));
        toast.success("Signature saved! Now place it on the document.");
      } else {
        toast.error("Please enter your signature text");
      }
    } else if (signatureType === "upload") {
      if (uploadedSignaturePreview) {
        setSignatureState(prev => ({
          ...prev,
          type: 'image',
          data: uploadedSignaturePreview
        }));
        toast.success("Signature saved! Now place it on the document.");
      } else {
        toast.error("Please upload a signature image");
      }
    }
  };

  const updateTypedSignature = () => {
    if (typedSignature.trim()) {
      setSignatureState(prev => ({
        ...prev,
        type: 'text',
        data: typedSignature
      }));
    }
  };

  useEffect(() => {
    if (signatureType === "type") {
      updateTypedSignature();
    }
  }, [typedSignature, typedSignatureFont, typedSignatureSize, typedSignatureColor]);

  const handleDragStart = () => {
    setSignatureState(prev => ({ ...prev, isDragging: true }));
  };

  const handleDragStop = (e: any, data: { x: number; y: number }) => {
    setSignatureState(prev => ({
      ...prev,
      position: { x: data.x, y: data.y },
      isDragging: false
    }));
  };

  const handleResizeSignature = (newSize: { width: number; height: number }) => {
    setSignatureState(prev => ({
      ...prev,
      size: newSize
    }));
  };

  const changePage = async (newPage: number) => {
    if (!fileInfo || !file) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    
    setCurrentPage(newPage);
    await renderPdfPage(file, newPage, pdfScale);
  };

  const signPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!signatureState.type || !signatureState.data) {
      toast.error("Please create a signature first");
      return;
    }

    if (!signatureState.position) {
      toast.error("Please place your signature on the document");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to sign document...");

    try {
      const steps = [
        { message: "Loading PDF document...", progress: 15 },
        { message: "Processing signature...", progress: 30 },
        { message: "Applying signature to document...", progress: 50 },
        { message: "Finalizing signed document...", progress: 80 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Load the PDF document
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Get the page to add the signature to
      const pages = pdfDoc.getPages();
      const page = pages[currentPage - 1];
      
      // Calculate the position based on the PDF dimensions and the signature position
      const { width, height } = page.getSize();
      
      // Calculate the position relative to the PDF page
      const containerRect = containerRef.current?.getBoundingClientRect();
      const canvasRect = pdfCanvasRef.current?.getBoundingClientRect();
      
      if (!containerRect || !canvasRect) {
        throw new Error("Could not determine container dimensions");
      }
      
      // Calculate the scale factor between the displayed PDF and the actual PDF
      const scaleX = width / pdfDimensions.width;
      const scaleY = height / pdfDimensions.height;
      
      // Calculate the position in PDF coordinates
      const pdfX = signatureState.position.x * scaleX;
      const pdfY = height - (signatureState.position.y * scaleY) - (signatureState.size.height * scaleY / 2);
      
      // Apply the signature based on its type
      if (signatureState.type === 'image' || signatureState.type === 'draw') {
        // For image or drawn signature, embed the image
        const signatureImage = signatureState.data;
        if (!signatureImage) throw new Error("Signature data is missing");
        
        // Convert data URL to Uint8Array
        const base64Data = signatureImage.split(',')[1];
        const signatureBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
        
        // Embed the image
        const signatureImageEmbed = await pdfDoc.embedPng(signatureBytes);
        
        // Calculate dimensions
        const signatureWidth = signatureState.size.width * scaleX;
        const signatureHeight = signatureState.size.height * scaleY;
        
        // Draw the image on the page
        page.drawImage(signatureImageEmbed, {
          x: pdfX,
          y: pdfY,
          width: signatureWidth,
          height: signatureHeight
        });
      } else if (signatureState.type === 'text') {
        // For text signature, add text
        // Select font based on the chosen font family
        let font;
        try {
          if (typedSignatureFont === 'Helvetica') {
            font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          } else {
            // For custom fonts, fall back to Helvetica in this implementation
            font = await pdfDoc.embedFont(StandardFonts.Helvetica);
          }
        } catch (error) {
          console.error("Error embedding font:", error);
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
        
        // Parse the color
        const r = parseInt(typedSignatureColor.slice(1, 3), 16) / 255;
        const g = parseInt(typedSignatureColor.slice(3, 5), 16) / 255;
        const b = parseInt(typedSignatureColor.slice(5, 7), 16) / 255;
        
        // Draw the text
        page.drawText(typedSignature, {
          x: pdfX,
          y: pdfY,
          size: typedSignatureSize[0] * scaleY,
          font,
          color: rgb(r, g, b)
        });
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      
      // Create a blob and URL for download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
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
    
    saveAs(signedFile.url, signedFile.name);
    toast.success(`Downloaded ${signedFile.name}`);
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

            <Card className="border border-rose-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50">
                <CardTitle className="text-rose-800">Create Signature</CardTitle>
                <CardDescription>
                  Choose how you want to create your signature
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <Tabs value={signatureType} onValueChange={setSignatureType} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4 w-full bg-rose-100">
                    <TabsTrigger value="draw" className="flex items-center gap-1 data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                      <Pen className="h-4 w-4" />
                      Draw
                    </TabsTrigger>
                    <TabsTrigger value="type" className="flex items-center gap-1 data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                      <Type className="h-4 w-4" />
                      Type
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex items-center gap-1 data-[state=active]:bg-rose-600 data-[state=active]:text-white">
                      <ImageIcon className="h-4 w-4" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="draw" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Draw Your Signature</Label>
                      <div className="border-2 rounded-lg p-4 bg-white shadow-inner">
                        <SignatureCanvas
                          ref={signatureCanvasRef}
                          penColor={typedSignatureColor}
                          canvasProps={{
                            width: 280,
                            height: 120,
                            className: "border border-gray-200 rounded cursor-crosshair w-full bg-white shadow-sm"
                          }}
                          dotSize={penSize[0]}
                          minWidth={penSize[0] * 0.5}
                          maxWidth={penSize[0] * 2}
                        />
                        <div className="flex justify-between mt-3">
                          <div className="space-y-1 w-full mr-2">
                            <div className="flex justify-between">
                              <Label className="text-xs">Pen Size: {penSize[0]}px</Label>
                              <Label className="text-xs">Color:</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Slider
                                value={penSize}
                                onValueChange={setPenSize}
                                min={1}
                                max={5}
                                step={0.5}
                                className="w-full"
                              />
                              <Input
                                type="color"
                                value={typedSignatureColor}
                                onChange={(e) => setTypedSignatureColor(e.target.value)}
                                className="w-10 h-8 p-0"
                              />
                            </div>
                          </div>
                          <Button variant="outline" onClick={clearSignature} className="h-full">
                            <Eraser className="h-4 w-4 mr-1" />
                            Clear
                          </Button>
                        </div>
                      </div>
                      <Button onClick={saveSignature} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Save Signature
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="type" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type Your Signature</Label>
                      <Input
                        placeholder="Enter your full name"
                        value={typedSignature}
                        onChange={(e) => setTypedSignature(e.target.value)}
                        className="border-2 focus:border-rose-300"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Style</Label>
                      <Select value={typedSignatureFont} onValueChange={setTypedSignatureFont}>
                        <SelectTrigger className="border-2 focus:border-rose-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                          <SelectItem value="Pacifico">Pacifico</SelectItem>
                          <SelectItem value="Satisfy">Satisfy</SelectItem>
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
                        className="w-full"
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
                      <div className="border-2 rounded-lg p-4 bg-gray-50 shadow-inner">
                        <p 
                          className="text-center"
                          style={{ 
                            fontFamily: typedSignatureFont === 'Helvetica' ? 'Arial, sans-serif' : typedSignatureFont, 
                            fontSize: `${typedSignatureSize[0]}px`,
                            color: typedSignatureColor
                          }}
                        >
                          {typedSignature}
                        </p>
                      </div>
                    )}
                    
                    <Button onClick={saveSignature} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                      <Save className="h-4 w-4 mr-2" />
                      Save Signature
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload Signature Image</Label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-rose-400 transition-colors cursor-pointer bg-gray-50"
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
                        <div className="mt-4 border-2 rounded-lg p-4 bg-white shadow-inner">
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
                      
                      {uploadedSignaturePreview && (
                        <Button onClick={saveSignature} className="w-full bg-rose-600 hover:bg-rose-700 text-white">
                          <Save className="h-4 w-4 mr-2" />
                          Use This Signature
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="mt-6">
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      {signatureState.data 
                        ? "Signature created! Now drag and position it on the document." 
                        : "Create your signature, then drag it to position on the document"}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - PDF Preview & Signing */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="border border-gray-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-800">Sign Document</CardTitle>
                  <Badge variant={signatureState.position ? "default" : "outline"} className={signatureState.position ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                    {signatureState.position ? "Signature Placed" : "Place Signature"}
                  </Badge>
                </div>
                <CardDescription>
                  Page {currentPage} of {fileInfo.pages} - Drag your signature to position it on the document
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center">
                  <div 
                    ref={containerRef} 
                    className="bg-white shadow-lg rounded-lg overflow-hidden max-w-full relative"
                    style={{ width: pdfDimensions.width, height: pdfDimensions.height }}
                  >
                    {pdfPageImage ? (
                      <>
                        <canvas 
                          ref={pdfCanvasRef}
                          className="max-w-full h-auto border"
                        />
                        
                        {/* Draggable Signature */}
                        {signatureState.data && (
                          <Draggable
                            defaultPosition={signatureState.position || { x: pdfDimensions.width / 2 - signatureState.size.width / 2, y: pdfDimensions.height / 2 - signatureState.size.height / 2 }}
                            bounds="parent"
                            onStart={handleDragStart}
                            onStop={handleDragStop}
                          >
                            <div 
                              className={`absolute cursor-move border-2 ${signatureState.isDragging ? 'border-blue-500 bg-blue-50/20' : 'border-transparent hover:border-blue-300 hover:bg-blue-50/10'} rounded-md transition-colors duration-200`}
                              style={{ 
                                width: signatureState.size.width, 
                                height: signatureState.size.height,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {signatureState.type === 'draw' || signatureState.type === 'image' ? (
                                <img 
                                  src={signatureState.data || ''} 
                                  alt="Signature" 
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100%',
                                    pointerEvents: 'none'
                                  }} 
                                />
                              ) : signatureState.type === 'text' ? (
                                <div 
                                  style={{ 
                                    fontFamily: typedSignatureFont === 'Helvetica' ? 'Arial, sans-serif' : typedSignatureFont, 
                                    fontSize: `${typedSignatureSize[0]}px`,
                                    color: typedSignatureColor,
                                    pointerEvents: 'none',
                                    textAlign: 'center',
                                    width: '100%'
                                  }}
                                >
                                  {typedSignature}
                                </div>
                              ) : null}
                              
                              {/* Resize handles */}
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize shadow-md"></div>
                              <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500/80 rounded-full cursor-move shadow-md flex items-center justify-center">
                                <Move className="h-2 w-2 text-white" />
                              </div>
                            </div>
                          </Draggable>
                        )}
                      </>
                    ) : (
                      <div className="w-96 h-96 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-rose-500" />
                          <p>Loading PDF page...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button 
                    variant="outline" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => {
                      setSignatureState(prev => ({ ...prev, position: null }));
                      if (file) renderPdfPage(file, currentPage, pdfScale);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Reset Position
                  </Button>
                  <Button 
                    onClick={signPdf} 
                    disabled={processing || !signatureState.data || !signatureState.position}
                    className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-md"
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
              <Card className="border-green-200 bg-green-50 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full shadow-inner">
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
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md"
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
            <strong>How to sign a PDF:</strong> Upload a PDF file, create your signature by drawing, typing, or uploading an image, drag to position your signature on the document, then click "Sign Document" to apply your signature.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SignPdfPage;