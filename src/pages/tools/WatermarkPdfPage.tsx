import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Droplets, Loader2, CheckCircle, AlertCircle, Type, ImageIcon, Palette, RotateCcw } from "lucide-react";
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

interface WatermarkedFile {
  name: string;
  url: string;
  size: string;
}

const WatermarkPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState([30]);
  const [fontSize, setFontSize] = useState([24]);
  const [rotation, setRotation] = useState([45]);
  const [position, setPosition] = useState("center");
  const [color, setColor] = useState("#FF0000");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [watermarkedFile, setWatermarkedFile] = useState<WatermarkedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pdfPageImage, setPdfPageImage] = useState<string | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
      setWatermarkedFile(null);
      
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

  const handleImageSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setWatermarkImage(selectedFile);
    toast.success("Watermark image selected");
  };

  const handlePageChange = async (newPage: number) => {
    if (!file || !fileInfo || newPage < 1 || newPage > fileInfo.pages) return;
    setCurrentPage(newPage);
    await loadPdfPage(file, newPage);
  };

  const addWatermark = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (watermarkType === "text" && !watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      toast.error("Please select a watermark image");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to add watermark...");

    try {
      const steps = [
        { message: "Loading PDF document...", progress: 20 },
        { message: "Processing watermark settings...", progress: 40 },
        { message: "Applying watermark to pages...", progress: 60 },
        { message: "Generating watermarked PDF...", progress: 80 },
        { message: "Finalizing document...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const watermarkOptions = {
        type: watermarkType,
        text: watermarkText,
        opacity: opacity[0] / 100,
        fontSize: fontSize[0],
        rotation: rotation[0],
        position,
        color,
        image: watermarkImage
      };

      const watermarkedPdfBytes = await pdfProcessor.addWatermark(
        file, 
        watermarkType === "text" ? watermarkText : "Image Watermark",
        watermarkOptions
      );
      
      const blob = new Blob([watermarkedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setWatermarkedFile({
        name: `watermarked-${file.name}`,
        url: url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Watermark applied successfully!");
      toast.success("PDF watermarked successfully!");
      
    } catch (error) {
      console.error('Watermarking error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add watermark. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadWatermarked = () => {
    if (!watermarkedFile) return;
    
    const link = document.createElement('a');
    link.href = watermarkedFile.url;
    link.download = watermarkedFile.name;
    link.click();
    toast.success(`Downloaded ${watermarkedFile.name}`);
  };

  const resetForm = () => {
    setFile(null);
    setFileInfo(null);
    setCurrentPage(1);
    setWatermarkedFile(null);
    setPdfPageImage(null);
    setWatermarkText("CONFIDENTIAL");
    setWatermarkImage(null);
    setOpacity([30]);
    setFontSize([24]);
    setRotation([45]);
    setPosition("center");
    setColor("#FF0000");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Droplets className="h-4 w-4 mr-2" />
          PDF Watermark Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Add Watermark to PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Protect and brand your PDF documents with customizable text or image watermarks.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-cyan-400 transition-all duration-300">
          <CardContent className="p-6 md:p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-cyan-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-cyan-500 to-cyan-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                Select a PDF document to add watermark
              </p>
              <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800">
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

      {/* PDF Watermarking Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar - Document Info & Watermark Settings */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-cyan-600" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-cyan-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-cyan-100 rounded-lg">
                      <FileText className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="secondary" className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200">
                          {fileInfo.pages} pages
                        </Badge>
                        <span>•</span>
                        <span>{fileInfo.size}</span>
                      </div>
                    </div>
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Preview Page</Label>
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

            {/* Watermark Settings */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Droplets className="h-5 w-5 text-cyan-600" />
                  Watermark Settings
                </CardTitle>
                <CardDescription>
                  Customize your watermark appearance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={watermarkType} onValueChange={setWatermarkType} className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 w-full">
                    <TabsTrigger value="text" className="flex items-center gap-1">
                      <Type className="h-4 w-4" />
                      Text
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Watermark Text</Label>
                      <Input
                        placeholder="Enter watermark text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Size: {fontSize[0]}px</Label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        max={72}
                        min={12}
                        step={2}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-12 h-8 rounded border border-gray-300"
                        />
                        <Input
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="flex-1 text-sm"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Watermark Image</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        {watermarkImage ? (
                          <div className="space-y-2">
                            <div className="text-sm font-medium text-green-600">
                              ✓ {watermarkImage.name}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => imageInputRef.current?.click()}
                            >
                              Change Image
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <Button
                              variant="outline"
                              onClick={() => imageInputRef.current?.click()}
                              className="mb-2"
                            >
                              <ImageIcon className="h-4 w-4 mr-2" />
                              Select Image
                            </Button>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, or GIF files
                            </p>
                          </div>
                        )}
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Common Settings */}
                <div className="space-y-4 mt-6 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Opacity: {opacity[0]}%</Label>
                    <Slider
                      value={opacity}
                      onValueChange={setOpacity}
                      max={100}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rotation: {rotation[0]}°</Label>
                    <Slider
                      value={rotation}
                      onValueChange={setRotation}
                      max={360}
                      min={0}
                      step={15}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Apply Watermark Button */}
            <Button
              onClick={addWatermark}
              disabled={processing}
              className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white shadow-sm py-3"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Adding Watermark...
                </>
              ) : (
                <>
                  <Droplets className="h-5 w-5 mr-2" />
                  Apply Watermark
                </>
              )}
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Processing Progress */}
            {processing && (
              <Card className="border-cyan-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Adding Watermark</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Processing your watermark request..."}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-cyan-100" indicatorClassName="bg-cyan-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Watermarked Result */}
            {watermarkedFile && (
              <Card className="border-green-200 bg-green-50 shadow-sm">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Watermark Applied Successfully
                      </CardTitle>
                      <CardDescription>
                        Your PDF has been watermarked and is ready for download
                      </CardDescription>
                    </div>
                    <Button onClick={downloadWatermarked} className="bg-green-600 hover:bg-green-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Watermarked PDF
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                      <FileText className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{watermarkedFile.name}</h4>
                      <p className="text-sm text-gray-500">{watermarkedFile.size}</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Watermarked
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PDF Preview */}
            {!processing && !watermarkedFile && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-cyan-600" />
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
                    Preview how your watermark will appear on the document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                    {isLoadingPage ? (
                      <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                        <span className="ml-2">Loading page...</span>
                      </div>
                    ) : pdfPageImage ? (
                      <div className="relative">
                        <img 
                          src={pdfPageImage} 
                          alt={`PDF Page ${currentPage}`}
                          className="w-full h-auto"
                        />
                        {/* Watermark Preview Overlay */}
                        {watermarkText && watermarkType === "text" && (
                          <div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            style={{
                              opacity: opacity[0] / 100,
                              transform: `rotate(${rotation[0]}deg)`
                            }}
                          >
                            <div
                              className="text-center font-bold select-none"
                              style={{
                                fontSize: `${fontSize[0]}px`,
                                color: color
                              }}
                            >
                              {watermarkText}
                            </div>
                          </div>
                        )}
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
        <Alert className="bg-cyan-50 border-cyan-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-cyan-600" />
          <AlertDescription className="text-cyan-700">
            <strong>How to add watermark:</strong> Upload a PDF file, choose text or image watermark, customize the appearance settings, then click "Apply Watermark" to create your branded document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WatermarkPdfPage;
