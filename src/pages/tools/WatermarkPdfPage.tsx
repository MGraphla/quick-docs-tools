import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Droplets, Type, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Settings, RotateCw, Palette, Move, Layers } from "lucide-react";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const [watermarkType, setWatermarkType] = useState("text");
  const [textWatermark, setTextWatermark] = useState("");
  const [fontSize, setFontSize] = useState([24]);
  const [textColor, setTextColor] = useState("#000000");
  const [position, setPosition] = useState("center");
  const [opacity, setOpacity] = useState([50]);
  const [rotation, setRotation] = useState([0]);
  const [imageWatermark, setImageWatermark] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [watermarkedFile, setWatermarkedFile] = useState<WatermarkedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
      setWatermarkedFile(null);
      setCurrentPage(1);
      
      // Render the first page for preview
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setImageWatermark(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      toast.error("Please select a valid image file");
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

  const applyWatermark = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (watermarkType === "text" && !textWatermark.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    if (watermarkType === "image" && !imageWatermark) {
      toast.error("Please select an image for watermark");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing watermark...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 20 },
        { message: "Processing watermark settings...", progress: 40 },
        { message: "Applying watermark to pages...", progress: 60 },
        { message: "Optimizing watermarked document...", progress: 80 },
        { message: "Finalizing watermarked PDF...", progress: 95 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      let imageData = null;
      if (watermarkType === "image" && imageWatermark) {
        imageData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(imageWatermark);
        });
      }

      const watermarkOptions = {
        type: watermarkType as 'text' | 'image',
        text: watermarkType === 'text' ? textWatermark : undefined,
        imageData: watermarkType === 'image' ? imageData : undefined,
        position,
        opacity: opacity[0],
        rotation: rotation[0],
        fontSize: fontSize[0],
        color: textColor,
        pages: 'all'
      };

      const watermarkedData = await pdfProcessor.addWatermark(file, watermarkOptions);
      
      const blob = new Blob([watermarkedData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setWatermarkedFile({
        name: `watermarked-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Watermark applied successfully!");
      toast.success("Watermark applied successfully!");
      
    } catch (error) {
      console.error('Watermark error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to apply watermark. Please try again.");
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Droplets className="h-4 w-4 mr-2" />
          PDF Watermark Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Add Watermark to PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Add text or image watermarks to your PDF documents with customizable position, opacity, and rotation settings.
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
                Select a PDF file to add watermark
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

      {/* Watermark Interface */}
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
                    <Droplets className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <Droplets className="h-5 w-5 text-blue-600" />
                      Watermark Settings
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

                    {/* Watermark Settings */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Droplets className="h-5 w-5 text-blue-600" />
                          Watermark Settings
                        </CardTitle>
                        <CardDescription>
                          Configure your watermark appearance and position
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Tabs value={watermarkType} onValueChange={setWatermarkType}>
                          <TabsList className="grid grid-cols-2 mb-6 w-full">
                            <TabsTrigger value="text" className="flex items-center gap-1">
                              <Type className="h-4 w-4" />
                              <span className="hidden sm:inline">Text Watermark</span>
                              <span className="sm:hidden">Text</span>
                            </TabsTrigger>
                            <TabsTrigger value="image" className="flex items-center gap-1">
                              <ImageIcon className="h-4 w-4" />
                              <span className="hidden sm:inline">Image Watermark</span>
                              <span className="sm:hidden">Image</span>
                            </TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="text" className="space-y-6">
                            <div className="space-y-2">
                              <Label>Watermark Text</Label>
                              <Input
                                placeholder="Enter watermark text"
                                value={textWatermark}
                                onChange={(e) => setTextWatermark(e.target.value)}
                                className="border-blue-200 focus:border-blue-400"
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Font Size: {fontSize[0]}px</Label>
                                <Slider
                                  value={fontSize}
                                  onValueChange={setFontSize}
                                  min={8}
                                  max={72}
                                  step={2}
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
                            </div>
                            
                            {textWatermark && (
                              <div className="border rounded-lg p-4 bg-gray-50">
                                <p className="text-center font-medium mb-2">Preview:</p>
                                <p 
                                  className="text-center"
                                  style={{ 
                                    fontSize: `${fontSize[0]}px`,
                                    color: textColor,
                                    opacity: opacity[0] / 100,
                                    transform: `rotate(${rotation[0]}deg)`
                                  }}
                                >
                                  {textWatermark}
                                </p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="image" className="space-y-6">
                            <div className="space-y-2">
                              <Label>Upload Watermark Image</Label>
                              <div 
                                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                                onClick={() => imageInputRef.current?.click()}
                              >
                                <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                <p className="text-sm text-gray-600 mb-2">Click to upload watermark image</p>
                                <p className="text-xs text-gray-500">Supports JPG, PNG, GIF</p>
                                <input
                                  ref={imageInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageSelect}
                                  className="hidden"
                                />
                              </div>
                              
                              {imagePreview && (
                                <div className="mt-4 border rounded-lg p-4 bg-white">
                                  <p className="text-center font-medium mb-2">Preview:</p>
                                  <div className="flex justify-center">
                                    <img 
                                      src={imagePreview} 
                                      alt="Watermark preview" 
                                      className="max-h-32 rounded"
                                      style={{
                                        opacity: opacity[0] / 100,
                                        transform: `rotate(${rotation[0]}deg)`
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-center mt-2 text-gray-500">
                                    {imageWatermark?.name}
                                  </p>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Common Settings */}
                        <div className="mt-6 space-y-6 border-t pt-6">
                          <h4 className="font-medium text-gray-900">Position & Appearance</h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Position</Label>
                              <Select value={position} onValueChange={setPosition}>
                                <SelectTrigger className="border-blue-200 focus:border-blue-400">
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
                            
                            <div className="space-y-2">
                              <Label>Opacity: {opacity[0]}%</Label>
                              <Slider
                                value={opacity}
                                onValueChange={setOpacity}
                                min={10}
                                max={100}
                                step={5}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Rotation: {rotation[0]}°</Label>
                            <Slider
                              value={rotation}
                              onValueChange={setRotation}
                              min={-45}
                              max={45}
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
            {/* Left Column - File Info & Watermark Settings - Shown on desktop */}
            <div className="lg:col-span-5 space-y-6 hidden lg:block">
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
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Droplets className="h-5 w-5 text-blue-600" />
                    Watermark Settings
                  </CardTitle>
                  <CardDescription>
                    Configure your watermark appearance and position
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={watermarkType} onValueChange={setWatermarkType}>
                    <TabsList className="grid grid-cols-2 mb-6 w-full">
                      <TabsTrigger value="text" className="flex items-center gap-1">
                        <Type className="h-4 w-4" />
                        <span className="hidden sm:inline">Text Watermark</span>
                        <span className="sm:hidden">Text</span>
                      </TabsTrigger>
                      <TabsTrigger value="image" className="flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Image Watermark</span>
                        <span className="sm:hidden">Image</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="text" className="space-y-6">
                      <div className="space-y-2">
                        <Label>Watermark Text</Label>
                        <Input
                          placeholder="Enter watermark text"
                          value={textWatermark}
                          onChange={(e) => setTextWatermark(e.target.value)}
                          className="border-blue-200 focus:border-blue-400"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Font Size: {fontSize[0]}px</Label>
                          <Slider
                            value={fontSize}
                            onValueChange={setFontSize}
                            min={8}
                            max={72}
                            step={2}
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
                      </div>
                      
                      {textWatermark && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <p className="text-center font-medium mb-2">Preview:</p>
                          <p 
                            className="text-center"
                            style={{ 
                              fontSize: `${fontSize[0]}px`,
                              color: textColor,
                              opacity: opacity[0] / 100,
                              transform: `rotate(${rotation[0]}deg)`
                            }}
                          >
                            {textWatermark}
                          </p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="image" className="space-y-6">
                      <div className="space-y-2">
                        <Label>Upload Watermark Image</Label>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                          onClick={() => imageInputRef.current?.click()}
                        >
                          <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 mb-2">Click to upload watermark image</p>
                          <p className="text-xs text-gray-500">Supports JPG, PNG, GIF</p>
                          <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </div>
                        
                        {imagePreview && (
                          <div className="mt-4 border rounded-lg p-4 bg-white">
                            <p className="text-center font-medium mb-2">Preview:</p>
                            <div className="flex justify-center">
                              <img 
                                src={imagePreview} 
                                alt="Watermark preview" 
                                className="max-h-32 rounded"
                                style={{
                                  opacity: opacity[0] / 100,
                                  transform: `rotate(${rotation[0]}deg)`
                                }}
                              />
                            </div>
                            <p className="text-xs text-center mt-2 text-gray-500">
                              {imageWatermark?.name}
                            </p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Common Settings */}
                  <div className="mt-6 space-y-6 border-t pt-6">
                    <h4 className="font-medium text-gray-900">Position & Appearance</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Position</Label>
                        <Select value={position} onValueChange={setPosition}>
                          <SelectTrigger className="border-blue-200 focus:border-blue-400">
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
                      
                      <div className="space-y-2">
                        <Label>Opacity: {opacity[0]}%</Label>
                        <Slider
                          value={opacity}
                          onValueChange={setOpacity}
                          min={10}
                          max={100}
                          step={5}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Rotation: {rotation[0]}°</Label>
                      <Slider
                        value={rotation}
                        onValueChange={setRotation}
                        min={-45}
                        max={45}
                        step={5}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Watermarked File */}
              {watermarkedFile && (
                <Card className="border-green-200 bg-green-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-green-800 mb-1">
                          Watermark Applied!
                        </h3>
                        <p className="text-green-700 mb-2">{watermarkedFile.name}</p>
                        <p className="text-sm text-green-600">
                          Watermark has been applied to all pages
                        </p>
                      </div>
                      <Button
                        onClick={downloadWatermarked}
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

            {/* Right Column - Document Preview */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Document Preview
                  </CardTitle>
                  <CardDescription>
                    Preview your document with watermark (page {currentPage} of {fileInfo.pages})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[500px]">
                    <div className="bg-white shadow-lg rounded-lg overflow-hidden relative" style={{ width: '100%', maxWidth: '595px', height: 'auto', aspectRatio: '1/1.414' }}>
                      {pageImage ? (
                        <div className="relative w-full h-full">
                          <img 
                            src={pageImage} 
                            alt={`Page ${currentPage}`}
                            className="w-full h-full object-contain"
                          />
                          
                          {/* Watermark Preview Overlay */}
                          {watermarkType === 'text' && textWatermark && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{
                                opacity: opacity[0] / 100,
                              }}
                            >
                              <div
                                style={{
                                  color: textColor,
                                  fontSize: `${fontSize[0] * 0.67}px`, // Scale down for preview
                                  transform: `rotate(${rotation[0]}deg)`,
                                  position: 'absolute',
                                  ...(position === 'center' ? { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${rotation[0]}deg)` } :
                                     position === 'top-left' ? { top: '10%', left: '10%' } :
                                     position === 'top-right' ? { top: '10%', right: '10%' } :
                                     position === 'bottom-left' ? { bottom: '10%', left: '10%' } :
                                     { bottom: '10%', right: '10%' })
                                }}
                              >
                                {textWatermark}
                              </div>
                            </div>
                          )}
                          
                          {watermarkType === 'image' && imagePreview && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              style={{
                                opacity: opacity[0] / 100,
                              }}
                            >
                              <img
                                src={imagePreview}
                                alt="Watermark"
                                style={{
                                  maxWidth: '50%',
                                  maxHeight: '50%',
                                  transform: `rotate(${rotation[0]}deg)`,
                                  position: 'absolute',
                                  ...(position === 'center' ? { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${rotation[0]}deg)` } :
                                     position === 'top-left' ? { top: '10%', left: '10%' } :
                                     position === 'top-right' ? { top: '10%', right: '10%' } :
                                     position === 'bottom-left' ? { bottom: '10%', left: '10%' } :
                                     { bottom: '10%', right: '10%' })
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Apply Watermark Button */}
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <Button
                    onClick={applyWatermark}
                    disabled={processing || (watermarkType === 'text' && !textWatermark.trim()) || (watermarkType === 'image' && !imageWatermark)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold shadow-sm"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Applying Watermark...
                      </>
                    ) : (
                      <>
                        <Droplets className="h-5 w-5 mr-2" />
                        Apply Watermark
                      </>
                    )}
                  </Button>
                  
                  {/* Processing Progress */}
                  {processing && (
                    <div className="mt-6">
                      <div className="text-center">
                        <p className="text-gray-600 mb-4">
                          {progressMessage || "Applying watermark to your document..."}
                        </p>
                        <div className="max-w-md mx-auto">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Watermarked File */}
              {watermarkedFile && !isMobileView && (
                <Card className="border-green-200 bg-green-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-lg font-semibold text-green-800 mb-1">
                          Watermark Applied!
                        </h3>
                        <p className="text-green-700 mb-2">{watermarkedFile.name}</p>
                        <p className="text-sm text-green-600">
                          Watermark has been applied to all pages
                        </p>
                      </div>
                      <Button
                        onClick={downloadWatermarked}
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
            <strong>How to add watermark:</strong> Upload a PDF file, choose between text or image watermark, customize the appearance and position, then click "Apply Watermark" to add it to all pages of your document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WatermarkPdfPage;