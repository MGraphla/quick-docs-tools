
import { useState, useRef, useCallback } from "react";
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
      setWatermarkedFile(null);
      toast.success(`PDF loaded: ${info.pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

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
      
      setWatermarkedFile({
        name: `watermarked-${file.name}`,
        url: pdfProcessor.createDownloadLink(watermarkedData, `watermarked-${file.name}`),
        size: formatFileSize(watermarkedData.length)
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Droplets className="h-4 w-4 mr-2" />
          PDF Watermark Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Add Watermark to PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add text or image watermarks to your PDF documents with customizable position, opacity, and rotation settings.
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - File Info */}
          <div className="lg:col-span-1">
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
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
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
                </div>
              </CardContent>
            </Card>

            {/* Watermarked File */}
            {watermarkedFile && (
              <Card className="mt-6 border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        Watermark Applied!
                      </h3>
                      <p className="text-green-700 mb-2">{watermarkedFile.name}</p>
                      <p className="text-sm text-green-600">
                        Watermark has been applied to all pages
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={downloadWatermarked}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Watermarked PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Watermark Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Watermark Settings
                </CardTitle>
                <CardDescription>
                  Configure your watermark appearance and position
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={watermarkType} onValueChange={setWatermarkType}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="text" className="flex items-center gap-1">
                      <Type className="h-4 w-4" />
                      Text Watermark
                    </TabsTrigger>
                    <TabsTrigger value="image" className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Image Watermark
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-6">
                    <div className="space-y-2">
                      <Label>Watermark Text</Label>
                      <Input
                        placeholder="Enter watermark text"
                        value={textWatermark}
                        onChange={(e) => setTextWatermark(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
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
                  
                  <div className="grid grid-cols-2 gap-4">
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

            {/* Apply Watermark Button */}
            <Card>
              <CardContent className="p-6">
                <Button
                  onClick={applyWatermark}
                  disabled={processing || (watermarkType === 'text' && !textWatermark.trim()) || (watermarkType === 'image' && !imageWatermark)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold"
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
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to add watermark:</strong> Upload a PDF file, choose between text or image watermark, customize the appearance and position, then click "Apply Watermark" to add it to all pages of your document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WatermarkPdfPage;
