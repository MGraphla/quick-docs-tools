
import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, Image as ImageIcon, FileText, Eye, CheckCircle, AlertCircle, Settings, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import { saveAs } from 'file-saver';

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  pages: number;
}

interface ImageFile {
  id: string;
  file: File;
  size: string;
  preview: string;
}

const JpgToPdfPage = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [pageLayout, setPageLayout] = useState("fit");
  const [imageQuality, setImageQuality] = useState([90]);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [combineAllImages, setCombineAllImages] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only image files are supported.");
    }

    if (validFiles.length === 0) return;

    const newFiles: ImageFile[] = [];
    
    for (const file of validFiles) {
      const preview = URL.createObjectURL(file);
      newFiles.push({
        id: generateId(),
        file,
        size: formatFileSize(file.size),
        preview
      });
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} image${newFiles.length > 1 ? 's' : ''}`);
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

  const removeFile = (id: string) => {
    setFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(file => file.id !== id);
    });
    toast.success("Image removed");
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast.error("Please select images to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    setConvertedFile(null);

    try {
      const steps = [
        { message: "Processing images...", progress: 20 },
        { message: "Optimizing image quality...", progress: 40 },
        { message: "Creating PDF layout...", progress: 60 },
        { message: "Generating PDF document...", progress: 80 },
        { message: "Finalizing PDF...", progress: 95 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const imageFiles = files.map(f => f.file);
      const pdfBytes = await pdfProcessor.convertImagesToPdf(imageFiles);
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const fileName = files.length === 1 ? 
        files[0].file.name.replace(/\.(jpg|jpeg|png|gif|bmp|webp)$/i, '.pdf') :
        `converted-images-${new Date().getTime()}.pdf`;
      
      setConvertedFile({
        name: fileName,
        url,
        size: formatFileSize(pdfBytes.length),
        pages: files.length
      });
      
      setProgress(100);
      setProgressMessage("Conversion completed!");
      toast.success(`Successfully converted ${files.length} image${files.length > 1 ? 's' : ''} to PDF`);
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : "Conversion failed. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadFile = (file: ConvertedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    toast.success(`Downloaded ${file.name}`);
  };

  const clearAll = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setConvertedFile(null);
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <ImageIcon className="h-4 w-4 mr-2" />
          Image to PDF Converter
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">JPG to PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Convert your images (JPG, PNG, GIF, etc.) to professional PDF documents with customizable layout options.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 transition-all duration-300">
        <CardContent className="p-6 md:p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-orange-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Drop images here or click to browse
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Support for JPG, PNG, GIF, BMP, WebP and other image formats
            </p>
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
              <Upload className="h-5 w-5 mr-2" />
              Choose Image Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings and Files Interface */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                  PDF Settings
                </CardTitle>
                <CardDescription>
                  Configure how your images will be converted to PDF
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Page Layout</Label>
                  <Select value={pageLayout} onValueChange={setPageLayout}>
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fit">Fit to Page</SelectItem>
                      <SelectItem value="actual">Actual Size</SelectItem>
                      <SelectItem value="stretch">Stretch to Fill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Image Quality: {imageQuality[0]}%</Label>
                  <Slider
                    value={imageQuality}
                    onValueChange={setImageQuality}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Higher quality produces larger PDF files
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Options</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="maintainAspectRatio"
                        checked={maintainAspectRatio}
                        onCheckedChange={(checked) => setMaintainAspectRatio(checked as boolean)}
                      />
                      <Label htmlFor="maintainAspectRatio" className="text-sm">Maintain aspect ratio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="combineAllImages"
                        checked={combineAllImages}
                        onCheckedChange={(checked) => setCombineAllImages(checked as boolean)}
                      />
                      <Label htmlFor="combineAllImages" className="text-sm">Combine all images in one PDF</Label>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    Conversion Summary
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Images</span>
                      <span className="font-medium">{files.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Size</span>
                      <span className="font-medium">{formatFileSize(totalSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Layout</span>
                      <span className="font-medium capitalize">{pageLayout.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Files and Conversion Panel */}
          <div className="lg:col-span-8 space-y-6">
            {/* File List */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ImageIcon className="h-5 w-5 text-orange-600" />
                    Selected Images ({files.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={clearAll} className="h-8">
                    Clear All
                  </Button>
                </div>
                <CardDescription>
                  Total: {formatFileSize(totalSize)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[400px] overflow-y-auto pr-1">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className="relative group bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                    >
                      <div className="aspect-square rounded-lg overflow-hidden mb-2">
                        <img 
                          src={file.preview} 
                          alt={file.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="text-center">
                        <Badge variant="secondary" className="text-xs mb-1">
                          #{index + 1}
                        </Badge>
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {file.file.name}
                        </p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="absolute top-1 right-1 text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Processing Progress */}
            {converting && (
              <Card className="border-orange-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Converting to PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || `Converting ${files.length} image${files.length > 1 ? 's' : ''}...`}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-orange-100" indicatorClassName="bg-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Converted File */}
            {convertedFile && (
              <Card className="border-green-200 bg-green-50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    PDF Created Successfully!
                  </CardTitle>
                  <CardDescription>
                    Your images have been converted to PDF format
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg shrink-0">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
                            PDF
                          </Badge>
                          <h4 className="font-medium text-gray-900 truncate">
                            {convertedFile.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{convertedFile.pages} page{convertedFile.pages !== 1 ? 's' : ''}</span>
                          <span>•</span>
                          <span>{convertedFile.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => downloadFile(convertedFile)}
                        className="bg-green-600 hover:bg-green-700 text-white h-9"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Convert Button */}
            {!converting && !convertedFile && (
              <div className="flex justify-center">
                <Button
                  onClick={convertToPdf}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-8 text-lg font-semibold shadow-sm"
                  size="lg"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  Convert {files.length} Image{files.length !== 1 ? 's' : ''} to PDF
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      {!files.length && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to convert images to PDF:</strong> Upload multiple image files (JPG, PNG, GIF, etc.), configure your PDF layout settings, then click "Convert to PDF" to create a single PDF document containing all your images.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default JpgToPdfPage;
