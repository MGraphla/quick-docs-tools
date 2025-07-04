import { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, FileText, Download, X, ArrowUp, ArrowDown, Eye, Loader2, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface FileWithId {
  id: string;
  file: File;
}

interface ConvertedImage {
  id: string;
  name: string;
  url: string;
  size: string;
  pageNumber: number;
  originalFileName: string;
}

const PdfToJpgPage = () => {
  const [files, setFiles] = useState<Array<FileWithId>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [imageQuality, setImageQuality] = useState([85]);
  const [imageFormat, setImageFormat] = useState("jpg");
  const [resolution, setResolution] = useState("medium");
  const [selectedImage, setSelectedImage] = useState<ConvertedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => 
      file.type === 'application/pdf'
    );
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only PDF files are supported.");
    }

    if (validFiles.length === 0) return;

    const newFiles = validFiles.map(file => ({
      id: generateId(),
      file
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} PDF file${newFiles.length > 1 ? 's' : ''}`);
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
    setFiles(prev => prev.filter(file => file.id !== id));
    toast.success("File removed");
  };

  const convertToJpg = async () => {
    if (files.length === 0) {
      toast.error("Please select PDF files to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    setConvertedFiles([]);

    try {
      const allConvertedImages: ConvertedImage[] = [];
      
      const steps = [
        { message: "Analyzing PDF files...", progress: 15 },
        { message: "Preparing image conversion...", progress: 30 },
        { message: "Rendering PDF pages...", progress: 50 },
        { message: "Optimizing image quality...", progress: 70 },
        { message: "Finalizing conversion...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        setProgressMessage(`Converting ${file.file.name}...`);
        setProgress((fileIndex / files.length) * 100);
        
        try {
          // Convert PDF to images using single argument
          const images = await pdfProcessor.convertPdfToImages(file.file);
          
          const fileImages = images.map((imageData, pageIndex) => ({
            id: generateId(),
            name: `${file.file.name.replace('.pdf', '')}_page_${pageIndex + 1}.${imageFormat}`,
            url: imageData,
            size: formatFileSize(Math.round(imageData.length * 0.75)), // Estimate size
            pageNumber: pageIndex + 1,
            originalFileName: file.file.name
          }));
          
          allConvertedImages.push(...fileImages);
        } catch (error) {
          console.error(`Error converting ${file.file.name}:`, error);
          toast.error(`Failed to convert ${file.file.name}`);
        }
      }
      
      if (allConvertedImages.length > 0) {
        setConvertedFiles(allConvertedImages);
        setProgress(100);
        setProgressMessage("Conversion completed!");
        toast.success(`Successfully converted ${files.length} PDF file${files.length > 1 ? 's' : ''} to ${allConvertedImages.length} ${imageFormat.toUpperCase()} image${allConvertedImages.length > 1 ? 's' : ''}`);
      }
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : "Conversion failed. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadAllAsZip = async () => {
    if (convertedFiles.length === 0) return;
    
    const zip = new JSZip();
    
    for (const image of convertedFiles) {
      // Convert data URL to blob
      const response = await fetch(image.url);
      const blob = await response.blob();
      zip.file(image.name, blob);
    }
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, `converted_images_${Date.now()}.zip`);
    toast.success("Downloaded all images as ZIP file");
  };

  const downloadImage = (image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    link.click();
    toast.success(`Downloaded ${image.name}`);
  };

  const viewImage = (image: ConvertedImage) => {
    setSelectedImage(image);
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedFiles([]);
    setSelectedImage(null);
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <ImageIcon className="h-4 w-4 mr-2" />
          PDF to JPG Converter
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">PDF to JPG</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Convert PDF pages to high-quality JPG images with customizable quality settings.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-amber-400 transition-all duration-300">
        <CardContent className="p-6 md:p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-amber-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Convert each page of your PDF into a JPG image
            </p>
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Upload className="h-5 w-5 mr-2" />
              Choose PDF Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Conversion Interface */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Settings */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-amber-600" />
                  Conversion Settings
                </CardTitle>
                <CardDescription>
                  Configure image output settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Image Format</Label>
                  <Select value={imageFormat} onValueChange={setImageFormat}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpg">JPG (Smaller Size)</SelectItem>
                      <SelectItem value="png">PNG (Better Quality)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Image Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger className="border-amber-200 focus:border-amber-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (72 DPI)</SelectItem>
                      <SelectItem value="medium">Medium (150 DPI)</SelectItem>
                      <SelectItem value="high">High (300 DPI)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Higher resolution produces better quality but larger file sizes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Image Quality: {imageQuality[0]}%</Label>
                  <Slider
                    value={imageQuality}
                    onValueChange={setImageQuality}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Higher values produce better quality but larger file sizes
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-600" />
                    Conversion Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Files</p>
                      <p className="font-medium">{files.length} PDF file{files.length > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Size</p>
                      <p className="font-medium">{formatFileSize(totalSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Format</p>
                      <p className="font-medium uppercase">{imageFormat}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resolution</p>
                      <p className="font-medium capitalize">{resolution}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-amber-600" />
                    Selected Files ({files.length})
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={clearAll} className="h-8">
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {files.map((file, index) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg shrink-0">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className="text-xs bg-gray-100">
                            #{index + 1}
                          </Badge>
                          <h4 className="font-medium text-gray-900 truncate text-sm">
                            {file.file.name}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{formatFileSize(file.file.size)}</span>
                          <span>•</span>
                          <span>{new Date(file.file.lastModified).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Conversion Progress & Results */}
          <div className="lg:col-span-8 space-y-6">
            {/* Processing Progress */}
            {converting && (
              <Card className="border-amber-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Converting to {imageFormat.toUpperCase()}</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || `Converting ${files.length} PDF file${files.length > 1 ? 's' : ''}...`}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-amber-100" indicatorClassName="bg-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Converted Files */}
            {convertedFiles.length > 0 ? (
              <Card className="border-green-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Converted Images ({convertedFiles.length})
                      </CardTitle>
                      <CardDescription>
                        Each page of your PDF has been converted to a {imageFormat.toUpperCase()} image
                      </CardDescription>
                    </div>
                    <Button onClick={downloadAllAsZip} className="bg-green-600 hover:bg-green-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download All as ZIP
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {convertedFiles.map((image) => (
                      <div
                        key={image.id}
                        className="relative group bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                      >
                        <div className="aspect-square relative overflow-hidden">
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                            onClick={() => viewImage(image)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => downloadImage(image)}
                              className="bg-white/80 hover:bg-white text-green-600 hover:text-green-700"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              <span className="text-xs">Download</span>
                            </Button>
                          </div>
                        </div>
                        <div className="p-2">
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary" className="text-xs">
                              Page #{image.pageNumber}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {image.size}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              !converting && files.length > 0 && (
                <Card className="shadow-sm h-full flex flex-col justify-center">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                        <ImageIcon className="h-8 w-8 text-amber-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Convert</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Adjust conversion settings on the left and click the button below to convert your PDF pages to {imageFormat.toUpperCase()} images.
                      </p>
                      
                      <Button
                        onClick={convertToJpg}
                        disabled={converting}
                        className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-6 text-lg font-semibold shadow-sm"
                        size="lg"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Convert {files.length} PDF{files.length !== 1 ? 's' : ''} to {imageFormat.toUpperCase()}
                      </Button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                        <div className="bg-amber-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4 text-amber-600" />
                            High Quality
                          </h4>
                          <p className="text-xs text-gray-600">Creates crisp, clear images from your PDF pages</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-orange-600" />
                            Page by Page
                          </h4>
                          <p className="text-xs text-gray-600">Converts each PDF page to a separate image</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-red-600" />
                            Customizable
                          </h4>
                          <p className="text-xs text-gray-600">Adjust quality and resolution to suit your needs</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
            
            {/* Image Viewer Modal */}
            {selectedImage && (
              <Card className="border-blue-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Eye className="h-5 w-5 text-blue-600" />
                      Image Preview
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedImage(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                      <img 
                        src={selectedImage.url} 
                        alt={selectedImage.name}
                        className="max-w-full h-auto mx-auto"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedImage.name}</h4>
                        <p className="text-sm text-gray-500">
                          Page {selectedImage.pageNumber} • {selectedImage.size}
                        </p>
                      </div>
                      <Button
                        onClick={() => downloadImage(selectedImage)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {files.length > 0 && !convertedFiles.length && !converting && (
        <div className="flex justify-center">
          <Button
            onClick={convertToJpg}
            disabled={converting}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 px-8 text-lg font-semibold shadow-sm"
            size="lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Convert {files.length} PDF{files.length !== 1 ? 's' : ''} to {imageFormat.toUpperCase()}
          </Button>
        </div>
      )}

      {/* Help Section */}
      {!files.length && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to convert PDF to JPG:</strong> Upload PDF files, adjust image quality and resolution settings, then click "Convert to JPG" to transform each page into a high-quality image.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfToJpgPage;
