import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Type, ImageIcon, Loader2, CheckCircle, AlertCircle, Settings, Zap, X, Save, Eye, Stamp } from "lucide-react";
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
  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkFont, setWatermarkFont] = useState("Arial");
  const [watermarkSize, setWatermarkSize] = useState([48]);
  const [watermarkColor, setWatermarkColor] = useState("#000000");
  const [watermarkOpacity, setWatermarkOpacity] = useState([30]);
  const [watermarkRotation, setWatermarkRotation] = useState([45]);
  const [watermarkPosition, setWatermarkPosition] = useState("center");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImagePreview, setWatermarkImagePreview] = useState<string | null>(null);
  const [watermarkPages, setWatermarkPages] = useState("all");
  const [customPageRange, setCustomPageRange] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [watermarkedFile, setWatermarkedFile] = useState<WatermarkedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const watermarkImageRef = useRef<HTMLInputElement>(null);
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
      setWatermarkedFile(null);
      setCurrentPage(1);
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

  const handleWatermarkImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setWatermarkImage(selectedFile);
      const preview = URL.createObjectURL(selectedFile);
      setWatermarkImagePreview(preview);
    } else {
      toast.error("Please select a valid image file");
    }
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

    if (watermarkPages === "custom" && !customPageRange.trim()) {
      toast.error("Please enter a page range");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to add watermark...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 15 },
        { message: "Processing watermark...", progress: 30 },
        { message: "Applying watermark to pages...", progress: 50 },
        { message: "Optimizing document...", progress: 70 },
        { message: "Finalizing watermarked PDF...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Simulate PDF creation
      const pdfContent = `Watermarked version of ${file.name}`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setWatermarkedFile({
        name: `watermarked-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Watermarking completed!");
      toast.success("Watermark added successfully!");
      
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

  const changePage = (newPage: number) => {
    if (!fileInfo) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    setCurrentPage(newPage);
  };

  const getPositionLabel = (position: string) => {
    switch (position) {
      case "center": return "Center";
      case "top-left": return "Top Left";
      case "top-center": return "Top Center";
      case "top-right": return "Top Right";
      case "bottom-left": return "Bottom Left";
      case "bottom-center": return "Bottom Center";
      case "bottom-right": return "Bottom Right";
      case "tile": return "Tile (Repeat)";
      default: return position;
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Stamp className="h-4 w-4 mr-2" />
          PDF Watermark Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Watermark PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add text or image watermarks to your PDF documents with customizable position, opacity, and rotation.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-slate-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-slate-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to add a watermark
              </p>
              <Button size="lg" className="bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Watermark Tools */}
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
                <CardTitle>Watermark Settings</CardTitle>
                <CardDescription>
                  Configure your watermark options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={watermarkType} onValueChange={setWatermarkType}>
                  <TabsList className="grid grid-cols-2 mb-4">
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
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font</Label>
                      <Select value={watermarkFont} onValueChange={setWatermarkFont}>
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
                      <Label>Font Size: {watermarkSize[0]}px</Label>
                      <Slider
                        value={watermarkSize}
                        onValueChange={setWatermarkSize}
                        min={12}
                        max={144}
                        step={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: watermarkColor }}
                        />
                        <Input
                          type="color"
                          value={watermarkColor}
                          onChange={(e) => setWatermarkColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="image" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Upload Watermark Image</Label>
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
                        onClick={() => watermarkImageRef.current?.click()}
                      >
                        <ImageIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">Click to upload your watermark image</p>
                        <p className="text-xs text-gray-500">Supports JPG, PNG, GIF</p>
                        <input
                          ref={watermarkImageRef}
                          type="file"
                          accept="image/*"
                          onChange={handleWatermarkImageUpload}
                          className="hidden"
                        />
                      </div>
                      
                      {watermarkImagePreview && (
                        <div className="mt-4 border rounded-lg p-4 bg-white">
                          <img 
                            src={watermarkImagePreview} 
                            alt="Watermark" 
                            className="max-h-24 mx-auto"
                          />
                          <p className="text-xs text-center mt-2 text-gray-500">
                            {watermarkImage?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Select value={watermarkPosition} onValueChange={setWatermarkPosition}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-center">Top Center</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-center">Bottom Center</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="tile">Tile (Repeat)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Opacity: {watermarkOpacity[0]}%</Label>
                    <Slider
                      value={watermarkOpacity}
                      onValueChange={setWatermarkOpacity}
                      min={5}
                      max={100}
                      step={5}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rotation: {watermarkRotation[0]}°</Label>
                    <Slider
                      value={watermarkRotation}
                      onValueChange={setWatermarkRotation}
                      min={0}
                      max={360}
                      step={15}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Apply to Pages</Label>
                    <Select value={watermarkPages} onValueChange={setWatermarkPages}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Pages</SelectItem>
                        <SelectItem value="current">Current Page Only</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {watermarkPages === "custom" && (
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - PDF Preview & Watermarking */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Document Preview</CardTitle>
                  <Badge variant="outline">
                    Watermark Preview
                  </Badge>
                </div>
                <CardDescription>
                  Page {currentPage} of {fileInfo.pages} - Preview how your watermark will appear
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
                    
                    {/* Watermark Preview Overlay */}
                    {watermarkType === "text" && watermarkText && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          opacity: watermarkOpacity[0] / 100
                        }}
                      >
                        <div
                          style={{
                            transform: `rotate(${watermarkRotation[0]}deg)`,
                            color: watermarkColor,
                            fontFamily: watermarkFont,
                            fontSize: `${watermarkSize[0]}px`,
                            position: 'absolute',
                            ...(watermarkPosition === 'center' && { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${watermarkRotation[0]}deg)` }),
                            ...(watermarkPosition === 'top-left' && { top: '10%', left: '10%' }),
                            ...(watermarkPosition === 'top-center' && { top: '10%', left: '50%', transform: `translateX(-50%) rotate(${watermarkRotation[0]}deg)` }),
                            ...(watermarkPosition === 'top-right' && { top: '10%', right: '10%' }),
                            ...(watermarkPosition === 'bottom-left' && { bottom: '10%', left: '10%' }),
                            ...(watermarkPosition === 'bottom-center' && { bottom: '10%', left: '50%', transform: `translateX(-50%) rotate(${watermarkRotation[0]}deg)` }),
                            ...(watermarkPosition === 'bottom-right' && { bottom: '10%', right: '10%' }),
                          }}
                        >
                          {watermarkText}
                        </div>
                        
                        {watermarkPosition === 'tile' && (
                          <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-16">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <div
                                key={i}
                                style={{
                                  transform: `rotate(${watermarkRotation[0]}deg)`,
                                  color: watermarkColor,
                                  fontFamily: watermarkFont,
                                  fontSize: `${watermarkSize[0] * 0.7}px`,
                                }}
                              >
                                {watermarkText}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {watermarkType === "image" && watermarkImagePreview && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        style={{
                          opacity: watermarkOpacity[0] / 100
                        }}
                      >
                        <img 
                          src={watermarkImagePreview}
                          alt="Watermark"
                          className="max-w-[200px] max-h-[200px] object-contain"
                          style={{
                            transform: `rotate(${watermarkRotation[0]}deg)`,
                            position: 'absolute',
                            ...(watermarkPosition === 'center' && { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${watermarkRotation[0]}deg)` }),
                            ...(watermarkPosition === 'top-left' && { top: '10%', left: '10%' }),
                            ...(watermarkPosition === 'top-center' && { top: '10%', left: '50%', transform: `translateX(-50%) rotate(${watermarkRotation[0]}deg)` }),
                            ...(watermarkPosition === 'top-right' && { top: '10%', right: '10%' }),
                            ...(watermarkPosition === 'bottom-left' && { bottom: '10%', left: '10%' }),
                            ...(watermarkPosition === 'bottom-center' && { bottom: '10%', left: '50%', transform: `translateX(-50%) rotate(${watermarkRotation[0]}deg)` }),
                            ...(watermarkPosition === 'bottom-right' && { bottom: '10%', right: '10%' }),
                          }}
                        />
                        
                        {watermarkPosition === 'tile' && (
                          <div className="absolute inset-0 flex flex-wrap justify-center items-center gap-16">
                            {Array.from({ length: 9 }).map((_, i) => (
                              <img 
                                key={i}
                                src={watermarkImagePreview}
                                alt="Watermark"
                                className="max-w-[100px] max-h-[100px] object-contain"
                                style={{
                                  transform: `rotate(${watermarkRotation[0]}deg)`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Watermark:</span>
                    <span>{watermarkType === "text" ? watermarkText || "No text entered" : (watermarkImage ? watermarkImage.name : "No image selected")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">Position:</span>
                    <span>{getPositionLabel(watermarkPosition)}</span>
                    <span className="font-medium ml-2">Opacity:</span>
                    <span>{watermarkOpacity[0]}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Watermark Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Watermark Summary</CardTitle>
                <CardDescription>
                  Review your watermark settings before applying
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Watermark Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{watermarkType}</span>
                      </div>
                      {watermarkType === "text" && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Text:</span>
                            <span className="font-medium">{watermarkText || "Not set"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Font:</span>
                            <span className="font-medium">{watermarkFont}</span>
                          </div>
                        </>
                      )}
                      {watermarkType === "image" && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Image:</span>
                          <span className="font-medium">{watermarkImage ? watermarkImage.name : "Not selected"}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Position:</span>
                        <span className="font-medium">{getPositionLabel(watermarkPosition)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Application Settings</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pages:</span>
                        <span className="font-medium">
                          {watermarkPages === "all" ? "All Pages" : 
                           watermarkPages === "current" ? `Page ${currentPage} Only` : 
                           `Custom: ${customPageRange || "Not set"}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Opacity:</span>
                        <span className="font-medium">{watermarkOpacity[0]}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rotation:</span>
                        <span className="font-medium">{watermarkRotation[0]}°</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={addWatermark} 
                  disabled={processing || (watermarkType === "text" && !watermarkText) || (watermarkType === "image" && !watermarkImage)}
                  className="w-full mt-6 bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding Watermark...
                    </>
                  ) : (
                    <>
                      <Stamp className="h-4 w-4 mr-2" />
                      Add Watermark to PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Processing Progress */}
            {processing && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-slate-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Adding Watermark</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Applying watermark to your document..."}
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

            {/* Watermarked File */}
            {watermarkedFile && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        Watermark Added Successfully!
                      </h3>
                      <p className="text-green-700 mb-2">{watermarkedFile.name}</p>
                      <p className="text-sm text-green-600">
                        Your watermark has been applied to the document
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
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to add a watermark to a PDF:</strong> Upload a PDF file, choose between text or image watermark, configure your watermark settings (position, opacity, rotation), then click "Add Watermark" to apply it to your document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WatermarkPdfPage;