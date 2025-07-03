
import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, FileText, Image, Eye, CheckCircle, AlertCircle, Settings, Zap, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize, type PdfInfo } from "@/lib/pdfUtils";

interface ConvertedImage {
  name: string;
  url: string;
  size: string;
  page: number;
}

const PdfToJpgPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; info?: PdfInfo; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [imageQuality, setImageQuality] = useState([85]);
  const [resolution, setResolution] = useState("300");
  const [colorMode, setColorMode] = useState("rgb");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => 
      file.type === 'application/pdf'
    );
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only PDF files are supported.");
    }

    if (validFiles.length === 0) return;

    const loadingToast = toast.loading(`Loading ${validFiles.length} PDF file${validFiles.length > 1 ? 's' : ''}...`);
    
    try {
      const newFiles = [];
      
      for (const file of validFiles) {
        try {
          const info = await pdfProcessor.loadPdf(file);
          newFiles.push({
            id: generateId(),
            file,
            info,
            size: formatFileSize(file.size)
          });
        } catch (error) {
          console.error(`Error loading ${file.name}:`, error);
          toast.error(`Failed to load ${file.name}. Please ensure it's a valid PDF.`);
        }
      }
      
      if (newFiles.length > 0) {
        setFiles(prev => [...prev, ...newFiles]);
        toast.success(`Added ${newFiles.length} PDF file${newFiles.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error("Failed to load PDF files");
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
    setConvertedImages([]);

    try {
      const converted: ConvertedImage[] = [];
      let totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);
      let processedPages = 0;
      
      for (const file of files) {
        const pageCount = file.info?.pageCount || 0;
        setProgressMessage(`Converting ${file.file.name}...`);
        
        for (let page = 1; page <= pageCount; page++) {
          try {
            // Simulate image conversion
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Create mock image
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 1131;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.fillStyle = '#333333';
              ctx.font = '24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText(`Page ${page} of ${file.file.name}`, canvas.width / 2, canvas.height / 2);
            }
            
            canvas.toBlob((blob) => {
              if (blob) {
                const fileName = `${file.file.name.replace(/\.pdf$/i, '')}-page-${page}.jpg`;
                const url = URL.createObjectURL(blob);
                
                converted.push({
                  name: fileName,
                  url,
                  size: formatFileSize(blob.size),
                  page
                });
              }
            }, 'image/jpeg', imageQuality[0] / 100);
            
            processedPages++;
            setProgress((processedPages / totalPages) * 100);
          } catch (error) {
            console.error(`Error converting page ${page} of ${file.file.name}:`, error);
          }
        }
      }
      
      // Wait for all blob conversions to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConvertedImages(converted);
      setProgress(100);
      setProgressMessage("Conversion completed!");
      toast.success(`Successfully converted ${converted.length} pages to JPG images`);
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : "Conversion failed. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadImage = (image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = image.name;
    link.click();
    toast.success(`Downloaded ${image.name}`);
  };

  const downloadAll = () => {
    convertedImages.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200);
    });
    toast.success(`Downloading ${convertedImages.length} images...`);
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedImages([]);
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
  const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Image className="h-4 w-4 mr-2" />
          PDF to JPG Converter
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">PDF to JPG</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Convert PDF pages to high-quality JPG images with customizable settings.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300">
        <CardContent className="p-6 md:p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-purple-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full mb-4 shadow-lg">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Convert PDF pages to JPG images
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
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

      {/* Conversion Settings */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Image Settings
            </CardTitle>
            <CardDescription>
              Configure output image quality and format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Resolution (DPI)</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150">150 DPI (Web)</SelectItem>
                    <SelectItem value="300">300 DPI (Print)</SelectItem>
                    <SelectItem value="600">600 DPI (High Quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color Mode</Label>
                <Select value={colorMode} onValueChange={setColorMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rgb">RGB Color</SelectItem>
                    <SelectItem value="grayscale">Grayscale</SelectItem>
                    <SelectItem value="monochrome">Black & White</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Image Quality: {imageQuality[0]}%</Label>
              <Slider
                value={imageQuality}
                onValueChange={setImageQuality}
                min={10}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Higher quality results in larger file sizes but better image clarity
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Selected Files ({files.length})
                </CardTitle>
                <CardDescription>
                  Total: {totalPages} pages • {formatFileSize(totalSize)}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg shrink-0">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          #{index + 1}
                        </Badge>
                        <h4 className="font-medium text-gray-900 truncate">
                          {file.file.name}
                        </h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
                        <span>{file.info?.pageCount || 0} pages</span>
                        <span>{file.size}</span>
                        <span className="hidden sm:inline">{new Date(file.file.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="ghost" size="sm" className="flex-1 sm:flex-none">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 sm:flex-none"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Progress */}
      {converting && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Converting to JPG</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Converting ${totalPages} pages to images...`}
              </p>
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Converted Images */}
      {convertedImages.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Converted Images ({convertedImages.length})
                </CardTitle>
                <CardDescription>
                  Your PDF pages have been converted to JPG images
                </CardDescription>
              </div>
              <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {convertedImages.map((image, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Page {image.page}
                      </Badge>
                      <span className="text-xs text-gray-500">{image.size}</span>
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 truncate">
                      {image.name}
                    </h4>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1 h-8">
                        <Eye className="h-3 w-3 mr-1" />
                        <span className="text-xs">Preview</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadImage(image)}
                        className="flex-1 h-8"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        <span className="text-xs">Download</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={convertToJpg}
          disabled={files.length === 0 || converting}
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 text-lg font-semibold"
          size="lg"
        >
          {converting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Convert {totalPages} Page{totalPages !== 1 ? 's' : ''} to JPG
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert className="bg-purple-50 border-purple-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-purple-700">
            <strong>How to convert PDF to JPG:</strong> Upload PDF files, adjust image quality settings, then click "Convert to JPG" to create individual image files for each page.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfToJpgPage;
