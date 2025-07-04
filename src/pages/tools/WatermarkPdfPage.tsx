import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, Eye, Text, Image as ImageIcon, RotateCcw, Font, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface WatermarkedFile {
  name: string;
  url: string;
  size: string;
}

const WatermarkPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState("Sample Watermark");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [position, setPosition] = useState("diagonal");
  const [opacity, setOpacity] = useState([50]);
  const [rotation, setRotation] = useState([0]);
  const [fontSize, setFontSize] = useState([36]);
  const [textColor, setTextColor] = useState("#000000");
  const [applyToPages, setApplyToPages] = useState("all");
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

    setFile(selectedFile);
    setWatermarkedFile(null);
    toast.success(`PDF file selected: ${selectedFile.name}`);
  }, []);

  const handleImageSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedImage = selectedFiles[0];
    if (!selectedImage.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }

    setWatermarkImage(selectedImage);
    toast.success(`Image selected: ${selectedImage.name}`);
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

  const applyWatermark = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (watermarkType === 'text' && !watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    if (watermarkType === 'image' && !watermarkImage) {
      toast.error("Please select a watermark image");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to add watermark...");

    try {
      const steps = [
        { message: "Loading PDF document...", progress: 20 },
        { message: "Processing watermark...", progress: 40 },
        { message: "Adding watermark to pages...", progress: 60 },
        { message: "Finalizing document...", progress: 80 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Use the addWatermark function with correct parameters
      const watermarkedPdfBytes = await pdfProcessor.addWatermark(
        file,
        watermarkType,
        watermarkText,
        watermarkImage,
        position,
        opacity[0] / 100,
        rotation[0],
        fontSize[0],
        textColor,
        applyToPages
      );
      
      const blob = new Blob([watermarkedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setWatermarkedFile({
        name: `watermarked-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Watermark added successfully!");
      toast.success("Watermark added to PDF successfully!");
      
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
          Protect your PDF documents by adding a custom watermark
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
                Select a PDF file to add a watermark
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

      {/* PDF Watermark Interface */}
      {file && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Droplets className="h-5 w-5" />
                  Watermark Options
                </CardTitle>
                <CardDescription>
                  Customize your watermark settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Watermark Type</Label>
                  <RadioGroup defaultValue="text" className="flex flex-col space-y-1" onValueChange={(value) => setWatermarkType(value as 'text' | 'image')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="text" id="text" className="peer h-5 w-5 shrink-0 rounded-full border-2 border-zinc-900 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-50 peer-checked:ring-2 peer-checked:ring-zinc-900" />
                      <Label htmlFor="text">Text</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="image" id="image" className="peer h-5 w-5 shrink-0 rounded-full border-2 border-zinc-900 ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:text-zinc-50 peer-checked:ring-2 peer-checked:ring-zinc-900" />
                      <Label htmlFor="image">Image</Label>
                    </div>
                  </RadioGroup>
                </div>

                {watermarkType === 'text' && (
                  <div className="space-y-2">
                    <Label htmlFor="watermark-text">Watermark Text</Label>
                    <Input
                      id="watermark-text"
                      placeholder="Enter watermark text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                    />
                  </div>
                )}

                {watermarkType === 'image' && (
                  <div className="space-y-2">
                    <Label>Watermark Image</Label>
                    <Button variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
                      {watermarkImage ? watermarkImage.name : "Select Image"}
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e.target.files)}
                      className="hidden"
                    />
                    {watermarkImage && (
                      <p className="text-sm text-gray-500">
                        Selected: {watermarkImage.name}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topLeft">Top Left</SelectItem>
                      <SelectItem value="topCenter">Top Center</SelectItem>
                      <SelectItem value="topRight">Top Right</SelectItem>
                      <SelectItem value="centerLeft">Center Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="centerRight">Center Right</SelectItem>
                      <SelectItem value="bottomLeft">Bottom Left</SelectItem>
                      <SelectItem value="bottomCenter">Bottom Center</SelectItem>
                      <SelectItem value="bottomRight">Bottom Right</SelectItem>
                      <SelectItem value="diagonal">Diagonal</SelectItem>
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

                <div className="space-y-2">
                  <Label>Rotation: {rotation[0]}°</Label>
                  <Slider
                    value={rotation}
                    onValueChange={setRotation}
                    min={-180}
                    max={180}
                    step={10}
                  />
                </div>

                {watermarkType === 'text' && (
                  <>
                    <div className="space-y-2">
                      <Label>Font Size: {fontSize[0]}px</Label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        min={12}
                        max={72}
                        step={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label>Apply To</Label>
                  <Select value={applyToPages} onValueChange={setApplyToPages}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select pages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Pages</SelectItem>
                      <SelectItem value="even">Even Pages</SelectItem>
                      <SelectItem value="odd">Odd Pages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

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
                        Your PDF has been watermarked
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

          {/* Main Content - PDF Viewer */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>PDF Watermark</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={applyWatermark}
                      disabled={processing}
                    >
                      <Droplets className="h-4 w-4 mr-1" />
                      Apply Watermark
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Add a custom watermark to your PDF document
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                  {processing ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  ) : (
                    file ? (
                      <p className="text-gray-500">
                        Preview will be available soon...
                      </p>
                    ) : (
                      <p className="text-gray-500">
                        No PDF file selected
                      </p>
                    )
                  )}
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
          </div>
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to add a watermark:</strong> Upload a PDF file, then customize your watermark settings. You can add either text or an image as a watermark. When you're ready, click "Apply Watermark" to add the watermark to your PDF.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WatermarkPdfPage;
