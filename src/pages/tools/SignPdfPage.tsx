import { useState, useRef, useCallback } from "react";
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
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import SignatureCanvas from 'react-signature-canvas';

interface SignedFile {
  name: string;
  url: string;
  size: string;
}

interface SignaturePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
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
  const [currentPosition, setCurrentPosition] = useState<SignaturePosition | null>(null);
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const signaturePadRef = useRef<SignatureCanvas>(null);
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
    if (!file) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert coordinates to PDF scale
    const pdfX = (x / rect.width) * 595; // Standard PDF width
    const pdfY = (y / rect.height) * 842; // Standard PDF height
    
    const newPosition: SignaturePosition = {
      x: pdfX,
      y: pdfY,
      width: signatureWidth[0],
      height: signatureHeight[0],
      pageNumber: currentPage
    };
    
    setSignaturePositions(prev => [...prev, newPosition]);
    toast.success(`Signature added to page ${currentPage}`);
  };

  const removeSignature = (index: number) => {
    setSignaturePositions(prev => prev.filter((_, i) => i !== index));
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
        { message: "Analyzing PDF structure...", progress: 15 },
        { message: "Processing signature data...", progress: 30 },
        { message: "Adding signatures to pages...", progress: 50 },
        { message: "Updating PDF content...", progress: 70 },
        { message: "Finalizing document...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Process each signature
      let currentPdfBytes = await file.arrayBuffer();
      
      for (const position of signaturePositions) {
        let signatureData = null;
        
        // Get signature data based on type
        if (signatureType === 'draw' && signaturePadRef.current) {
          signatureData = signaturePadRef.current.toDataURL('image/png');
        } else if (signatureType === 'image' && signatureImage) {
          signatureData = signatureImage;
        }
        
        const signatureOptions = {
          type: signatureType,
          x: position.x,
          y: position.y,
          width: position.width,
          height: position.height,
          pageNumber: position.pageNumber,
          text: signatureType === 'text' ? textSignature : undefined,
          fontSize: fontSize[0],
          color: textColor,
          fontFamily,
          signatureData: signatureType !== 'text' ? signatureData : undefined,
          canvas: signatureType === 'draw' ? signaturePadRef.current?.getCanvas() : undefined
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Signature className="h-4 w-4 mr-2" />
          PDF Signature
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sign PDF Documents</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add your signature to PDF documents with our professional signing tools. Draw, type, or upload your signature.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300">
          <CardContent className="p-8">
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Signature Tools Sidebar */}
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

                  <div className="text-sm text-gray-600">
                    Signatures on this page: {signaturePositions.filter(pos => pos.pageNumber === currentPage).length}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Signature Tools</CardTitle>
                <CardDescription>
                  Choose how you want to add your signature
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={signatureType} onValueChange={(value) => setSignatureType(value as 'draw' | 'text' | 'image')}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="draw">Draw</TabsTrigger>
                    <TabsTrigger value="text">Type</TabsTrigger>
                    <TabsTrigger value="image">Upload</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="draw" className="space-y-4">
                    <div className="border rounded-lg p-2 bg-white">
                      <SignatureCanvas
                        ref={signaturePadRef}
                        canvasProps={{
                          width: 200,
                          height: 100,
                          className: 'signature-canvas border-gray-200'
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
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
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
                        <div className="text-sm text-gray-600 mb-1">Preview:</div>
                        <div 
                          style={{ 
                            fontFamily, 
                            fontSize: `${fontSize[0]}px`,
                            color: textColor,
                            fontWeight: fontFamily.includes('Script') || fontFamily.includes('Pacifico') || fontFamily.includes('Satisfy') ? 'normal' : 'bold'
                          }}
                        >
                          {textSignature}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-4">
                    <Button
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full"
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
                        <img src={signatureImage} alt="Signature" className="max-w-full h-20 object-contain" />
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

          {/* PDF Viewer and Editor */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>PDF Document</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={clearSignatures}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Click on the document to place your signature ({signaturePositions.length} signatures added)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[600px]">
                  <div 
                    className="bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair relative"
                    style={{ width: '595px', height: '842px' }}
                    onClick={addSignature}
                  >
                    {pageImage ? (
                      <img 
                        src={pageImage} 
                        alt={`Page ${currentPage}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    )}
                    
                    {/* Signature Position Indicators */}
                    {signaturePositions
                      .filter(pos => pos.pageNumber === currentPage)
                      .map((position, index) => (
                        <div
                          key={index}
                          className="absolute border-2 border-blue-500 bg-blue-100 bg-opacity-30 flex items-center justify-center cursor-pointer hover:bg-opacity-50 transition-all"
                          style={{
                            left: `${(position.x / 595) * 100}%`,
                            top: `${(position.y / 842) * 100}%`,
                            width: `${(position.width / 595) * 100}%`,
                            height: `${(position.height / 842) * 100}%`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSignature(signaturePositions.indexOf(position));
                          }}
                        >
                          <Signature className="h-4 w-4 text-blue-600" />
                        </div>
                      ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                  </div>
                  <Button 
                    onClick={savePdf}
                    disabled={processing || signaturePositions.length === 0}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Signing...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Sign PDF
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
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to sign a PDF:</strong> Upload a PDF document, choose your signature method (draw, type, or upload), then click on the document where you want to place your signature. You can add multiple signatures across different pages.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SignPdfPage;