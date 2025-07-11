import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle, Signature, Type, ImageIcon, PenTool, AlertCircle, Move, RotateCw, Trash2, Eye, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import SignatureCanvas from 'react-signature-canvas';

interface SignedFile {
  name: string;
  url: string;
  size: string;
}

interface SignaturePosition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
  type: 'draw' | 'text' | 'image';
  data?: string;
  text?: string;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
}

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [signatureType, setSignatureType] = useState<'draw' | 'text' | 'image'>('draw');
  const [textSignature, setTextSignature] = useState('');
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [signaturePositions, setSignaturePositions] = useState<SignaturePosition[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [signedFile, setSignedFile] = useState<SignedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [fontSize, setFontSize] = useState([24]);
  const [fontFamily, setFontFamily] = useState('Dancing Script');
  const [textColor, setTextColor] = useState('#000000');
  const [signatureWidth, setSignatureWidth] = useState([150]);
  const [signatureHeight, setSignatureHeight] = useState([50]);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 280, height: 150 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const pdfProcessor = createPdfProcessor();

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
      const info = await pdfProcessor.loadPdf(selectedFile);
      setFile(selectedFile);
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: info.pageCount
      });
      setSignedFile(null);
      setCurrentPage(1);
      setSignaturePositions([]);
      
      // Render the first page
      await renderCurrentPage(selectedFile, 1);
      
      toast.success(`PDF loaded: ${info.pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

  const renderCurrentPage = async (pdfFile: File, pageNum: number) => {
    try {
      const imageData = await pdfProcessor.renderPdfPage(pdfFile, pageNum, 1.5);
      setPageImage(imageData);
    } catch (error) {
      console.error('Error rendering page:', error);
      toast.error("Failed to render PDF page");
    }
  };

  const changePage = async (newPage: number) => {
    if (!fileInfo || !file) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    
    setCurrentPage(newPage);
    await renderCurrentPage(file, newPage);
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSignatureImage(e.target?.result as string);
        toast.success("Signature image loaded");
      };
      reader.readAsDataURL(file);
    }
  };

  const addSignature = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!file || !pdfContainerRef.current) return;
    
    // Validate signature data
    if (signatureType === 'draw' && signaturePadRef.current?.isEmpty()) {
      toast.error("Please draw your signature before adding it");
      return;
    }
    
    if (signatureType === 'text' && !textSignature.trim()) {
      toast.error("Please enter your signature text");
      return;
    }
    
    if (signatureType === 'image' && !signatureImage) {
      toast.error("Please upload a signature image");
      return;
    }
    
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert coordinates to PDF scale
    const pdfX = (x / rect.width) * 595; // Standard PDF width
    const pdfY = (y / rect.height) * 842; // Standard PDF height
    
    // Get signature data based on type
    let signatureData = null;
    if (signatureType === 'draw' && signaturePadRef.current) {
      signatureData = signaturePadRef.current.toDataURL('image/png');
    } else if (signatureType === 'image') {
      signatureData = signatureImage;
    }
    
    const newPosition: SignaturePosition = {
      id: generateId(),
      x: pdfX,
      y: pdfY,
      width: signatureWidth[0],
      height: signatureHeight[0],
      pageNumber: currentPage,
      type: signatureType,
      data: signatureData || undefined,
      text: signatureType === 'text' ? textSignature : undefined,
      color: textColor,
      fontSize: fontSize[0],
      fontFamily: fontFamily
    };
    
    setSignaturePositions(prev => [...prev, newPosition]);
    toast.success(`Signature added to page ${currentPage}`);
  };

  const removeSignature = (id: string) => {
    setSignaturePositions(prev => prev.filter(pos => pos.id !== id));
    toast.success("Signature removed");
  };

  const clearSignatures = () => {
    setSignaturePositions([]);
    toast.success("All signatures cleared");
  };

  const clearSignaturePad = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      toast.success("Signature pad cleared");
    }
  };

  const savePdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (signaturePositions.length === 0) {
      toast.error("Please add at least one signature to the PDF");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to add signatures...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 20 },
        { message: "Processing signature data...", progress: 40 },
        { message: "Adding signatures to pages...", progress: 60 },
        { message: "Updating PDF content...", progress: 80 },
        { message: "Finalizing document...", progress: 95 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Process each signature
      const signedPdfBytes = await pdfProcessor.addSignatures(file, signaturePositions.map(p => ({
        type: p.type,
        x: p.x,
        y: p.y,
        width: p.width,
        height: p.height,
        pageNumber: p.pageNumber,
        text: p.text,
        fontSize: p.fontSize,
        color: p.color,
        fontFamily: p.fontFamily,
        signatureData: p.data
      })));

      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setSignedFile({
        name: `signed-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Signatures added successfully!");
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

  useEffect(() => {
    const resizeCanvas = () => {
      if (signatureContainerRef.current) {
        const { width } = signatureContainerRef.current.getBoundingClientRect();
        setCanvasDimensions({ width, height: 150 }); // Keep height fixed or make it responsive too
      }
    };

    // Resize on initial mount and when the file is loaded
    resizeCanvas();

    // Resize on window resize
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [file]); // Rerun when the file state changes

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Signature className="h-4 w-4 mr-2" />
          PDF Signature
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Sign PDF Documents</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Add your signature to PDF documents with our professional signing tools. Draw, type, or upload your signature.
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
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Signature Tools Sidebar */}
          <div className="lg:col-span-1 space-y-6">
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
                      className="h-8"
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
                      className="h-8"
                    >
                      Next
                    </Button>
                  </div>

                  <div className="text-sm text-gray-600">
                    Signatures on this page: {signaturePositions.filter(pos => pos.pageNumber === currentPage).length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Signature className="h-5 w-5 text-blue-600" />
                  Signature Tools
                </CardTitle>
                <CardDescription>
                  Choose how you want to add your signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={signatureType} onValueChange={(value) => setSignatureType(value as 'draw' | 'text' | 'image')}>
                  <TabsList className="grid grid-cols-3 mb-4 w-full">
                    <TabsTrigger value="draw" className="text-sm">Draw</TabsTrigger>
                    <TabsTrigger value="text" className="text-sm">Type</TabsTrigger>
                    <TabsTrigger value="image" className="text-sm">Upload</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="draw" className="space-y-4">
                    <div ref={signatureContainerRef} className="border rounded-lg p-2 bg-white w-full h-[150px]">
                      <SignatureCanvas
                        ref={signaturePadRef}
                        canvasProps={{
                          width: canvasDimensions.width,
                          height: canvasDimensions.height,
                          className: 'signature-canvas border border-gray-200 rounded'
                        }}
                        backgroundColor="white"
                      />
                    </div>
                    <Button variant="outline" size="sm" onClick={clearSignaturePad} className="w-full">
                      Clear Signature Pad
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Signature Text</Label>
                      <Input
                        placeholder="Enter your signature"
                        value={textSignature}
                        onChange={(e) => setTextSignature(e.target.value)}
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-400">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                          <SelectItem value="Pacifico">Pacifico</SelectItem>
                          <SelectItem value="Caveat">Caveat</SelectItem>
                          <SelectItem value="Satisfy">Satisfy</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Courier New">Courier New</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Size: {fontSize[0]}px</Label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        min={12}
                        max={48}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: textColor }}
                        />
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                    
                    {textSignature && (
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Preview:</p>
                        <p 
                          className="text-center"
                          style={{ 
                            fontFamily, 
                            fontSize: `${fontSize[0]}px`,
                            color: textColor,
                            fontWeight: fontFamily.includes('Script') || fontFamily.includes('Pacifico') || fontFamily.includes('Satisfy') ? 'normal' : 'bold'
                          }}
                        >
                          {textSignature}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full border-blue-200 hover:border-blue-400"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Upload Signature Image
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {signatureImage && (
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <img src={signatureImage} alt="Signature" className="max-w-full h-20 object-contain mx-auto" />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 space-y-2">
                  <Label>Signature Size</Label>
                  <div className="space-y-2">
                    <Label className="text-sm">Width: {signatureWidth[0]}px</Label>
                    <Slider
                      value={signatureWidth}
                      onValueChange={setSignatureWidth}
                      min={50}
                      max={300}
                      step={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Height: {signatureHeight[0]}px</Label>
                    <Slider
                      value={signatureHeight}
                      onValueChange={setSignatureHeight}
                      min={30}
                      max={150}
                      step={5}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content: PDF Viewer and Results */}
          <div className="lg:col-span-2 space-y-6">
            {signedFile ? (
              <Card className="bg-green-50 border-green-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-6 w-6" />
                    PDF Signed Successfully!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-green-100">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-green-900 truncate">{signedFile.name}</p>
                      <p className="text-sm text-gray-600">Your signatures have been added to the document</p>
                    </div>
                  </div>
                  <Button onClick={downloadSigned} className="w-full bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600" />
                    <CardTitle>Preview</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={savePdf} disabled={processing || signaturePositions.length === 0} className="bg-blue-600 hover:bg-blue-700">
                      {processing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Sign PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {processing && (
                    <div className="space-y-2 mb-4">
                      <Progress value={progress} className="w-full" />
                      <p className="text-sm text-center text-gray-600">{progressMessage}</p>
                    </div>
                  )}
                  {pageImage ? (
                    <div 
                      ref={pdfContainerRef} 
                      className="relative border rounded-lg overflow-hidden cursor-crosshair bg-gray-50"
                      onClick={addSignature}
                    >
                      <img src={pageImage} alt={`PDF Page ${currentPage}`} className="w-full h-auto" />
                      {signaturePositions
                        .filter(pos => pos.pageNumber === currentPage)
                        .map(pos => (
                          <div
                            key={pos.id}
                            className="absolute border-2 border-dashed border-blue-500 bg-blue-500 bg-opacity-20"
                            style={{
                              left: `${(pos.x / 595) * 100}%`,
                              top: `${(pos.y / 842) * 100}%`,
                              width: `${(pos.width / 595) * 100}%`,
                              height: `${(pos.height / 842) * 100}%`,
                            }}
                          >
                            <button 
                              onClick={(e) => { e.stopPropagation(); removeSignature(pos.id); }}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 w-5 h-5 flex items-center justify-center shadow-md"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  )}
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
            <strong>How to sign a PDF:</strong> Upload a PDF document, choose your signature method (draw, type, or upload), then click on the document where you want to place your signature. You can add multiple signatures across different pages.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SignPdfPage;