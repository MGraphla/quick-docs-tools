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
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [signatureWidth, setSignatureWidth] = useState([150]);
  const [signatureHeight, setSignatureHeight] = useState([50]);
  const [isMobileView, setIsMobileView] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const pdfProcessor = createPdfProcessor();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
    
    // Close mobile tools panel after adding a signature on mobile
    if (isMobileView) {
      setSheetOpen(false);
    }
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
      let currentPdfBytes = await file.arrayBuffer();
      
      for (const position of signaturePositions) {
        const signatureOptions = {
          type: position.type,
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
          pageNumber: position.pageNumber,
          text: position.text,
          fontSize: position.fontSize,
          color: position.color,
          fontFamily: position.fontFamily,
          signatureData: position.data,
          canvas: position.type === 'draw' ? signaturePadRef.current?.getCanvas() : undefined
        };

        const pdfFile = new File([currentPdfBytes], file.name, { type: 'application/pdf' });
        currentPdfBytes = await pdfProcessor.addSignature(pdfFile, signatureOptions);
      }
      
      const blob = new Blob([currentPdfBytes], { type: 'application/pdf' });
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
        <>
          {/* Mobile Tools Toggle Button */}
          {isMobileView && (
            <div className="fixed bottom-4 right-4 z-50">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"
                  >
                    <Signature className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <Signature className="h-5 w-5 text-blue-600" />
                      Signature Tools
                    </SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto pr-1 pb-16">
                    {/* Document Info */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow mb-4">
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
                        </div>
                      </CardContent>
                    </Card>

                    {/* Signature Tools */}
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
                            <div className="border rounded-lg p-2 bg-white">
                              <SignatureCanvas
                                ref={signaturePadRef}
                                canvasProps={{
                                  width: 280,
                                  height: 150,
                                  className: 'signature-canvas w-full h-full border border-gray-200 rounded'
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
                                  <SelectItem value="Arial">Arial</SelectItem>
                                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                  <SelectItem value="Courier New">Courier New</SelectItem>
                                  <SelectItem value="Georgia">Georgia</SelectItem>
                                  <SelectItem value="Verdana">Verdana</SelectItem>
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
                </SheetContent>
              </Sheet>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Signature Tools Sidebar - Shown on desktop */}
            <div className="lg:col-span-4 space-y-6 hidden lg:block">
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
                      <div className="border rounded-lg p-2 bg-white">
                        <SignatureCanvas
                          ref={signaturePadRef}
                          canvasProps={{
                            width: 280,
                            height: 150,
                            className: 'signature-canvas w-full h-full border border-gray-200 rounded'
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
                            <SelectItem value="Arial">Arial</SelectItem>
                            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                            <SelectItem value="Courier New">Courier New</SelectItem>
                            <SelectItem value="Georgia">Georgia</SelectItem>
                            <SelectItem value="Verdana">Verdana</SelectItem>
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

              {/* Signed File */}
              {signedFile && (
                <Card className="border-green-200 bg-green-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-green-800 mb-1">
                          PDF Signed Successfully!
                        </h3>
                        <p className="text-green-700 mb-2">{signedFile.name}</p>
                        <p className="text-sm text-green-600">
                          Your signatures have been added to the document
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

            {/* PDF Viewer and Editor */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                      PDF Document
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={clearSignatures}
                        className="h-8"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Clear All</span>
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Click on the document to place your signature ({signaturePositions.length} signatures added)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[500px]">
                    <div 
                      ref={pdfContainerRef}
                      className="bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair relative"
                      style={{ width: '100%', maxWidth: '595px', height: 'auto', aspectRatio: '1/1.414' }}
                      onClick={addSignature}
                    >
                      {pageImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={pageImage} 
                            alt={`Page ${currentPage}`}
                            className="w-full h-full object-contain"
                          />
                          
                          {/* Signature Position Indicators */}
                          {signaturePositions
                            .filter(pos => pos.pageNumber === currentPage)
                            .map((position) => {
                              return (
                                <div
                                  key={position.id}
                                  className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition-all"
                                  style={{
                                    left: `${(position.x / 595) * 100}%`,
                                    top: `${(position.y / 842) * 100}%`,
                                    width: `${(position.width / 595) * 100}%`,
                                    height: `${(position.height / 842) * 100}%`,
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeSignature(position.id);
                                  }}
                                >
                                  {position.type === 'text' && position.text ? (
                                    <span 
                                      style={{ 
                                        fontFamily: position.fontFamily, 
                                        fontSize: `${position.fontSize}px`,
                                        color: position.color,
                                        opacity: 0.7
                                      }}
                                    >
                                      {position.text}
                                    </span>
                                  ) : position.type === 'image' && position.data ? (
                                    <img 
                                      src={position.data} 
                                      alt="Signature" 
                                      className="w-full h-full object-contain opacity-70"
                                    />
                                  ) : (
                                    <Signature className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-9">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                    </div>
                    <Button 
                      onClick={savePdf}
                      disabled={processing || signaturePositions.length === 0}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-9"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Signing...</span>
                          <span className="sm:hidden">Signing</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Sign PDF</span>
                          <span className="sm:hidden">Sign</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

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
                        {progressMessage || "Adding your signatures to the PDF..."}
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

              {/* Signed File */}
              {signedFile && !isMobileView && (
                <Card className="border-green-200 bg-green-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-green-800 mb-1">
                          PDF Signed Successfully!
                        </h3>
                        <p className="text-green-700 mb-2">{signedFile.name}</p>
                        <p className="text-sm text-green-600">
                          Your signatures have been added to the document
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
        </>
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