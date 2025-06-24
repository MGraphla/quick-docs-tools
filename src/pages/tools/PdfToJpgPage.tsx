import { useState, useRef, useCallback } from "react";
import { Upload, Image, FileText, Download, X, ArrowUp, ArrowDown, Eye, Loader2, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react";
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
      
      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        setProgressMessage(`Converting ${file.file.name}...`);
        setProgress((fileIndex / files.length) * 100);
        
        try {
          // Convert PDF to images using real conversion
          const images = await pdfProcessor.convertPdfToImages(file.file, imageQuality[0] / 50);
          
          const fileImages = images.map((imageData, pageIndex) => ({
            id: generateId(),
            name: `${file.file.name.replace('.pdf', '')}_page_${pageIndex + 1}.jpg`,
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
        toast.success(`Successfully converted ${files.length} PDF file${files.length > 1 ? 's' : ''} to ${allConvertedImages.length} JPG image${allConvertedImages.length > 1 ? 's' : ''}`);
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
    
    const zip = new (await import('jszip')).default();
    
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

  const clearAll = () => {
    setFiles([]);
    setConvertedFiles([]);
    toast.success("All files cleared");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Image className="h-4 w-4 mr-2" />
          PDF to JPG Converter
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF to JPG</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Convert PDF pages to high-quality JPG images with customizable quality settings.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-amber-400 transition-all duration-300">
        <CardContent className="p-8">
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
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

      {/* Conversion Settings */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Conversion Settings
            </CardTitle>
            <CardDescription>
              Configure JPG output settings for optimal results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Selected Files ({files.length})
                </CardTitle>
                <CardDescription>
                  Choose PDF files to convert to JPG
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
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.file.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatFileSize(file.file.size)}</span>
                      <span>{new Date(file.file.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Converting to JPG</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Converting ${files.length} PDF file${files.length > 1 ? 's' : ''} to JPG...`}
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

      {/* Converted Files */}
      {convertedFiles.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Converted Images ({convertedFiles.length})
                </CardTitle>
                <CardDescription>
                  Each page of your PDF has been converted to a JPG image
                </CardDescription>
              </div>
              <Button onClick={downloadAllAsZip} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Download All as ZIP
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {convertedFiles.map((image) => (
                <div
                  key={image.id}
                  className="relative group bg-white rounded-lg shadow-sm border overflow-hidden"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => downloadImage(image)}
                        className="bg-white/80 hover:bg-white text-green-600 hover:text-green-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Page #{image.pageNumber}
                      </Badge>
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {image.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{image.size}</span>
                      <span>{image.originalFileName}</span>
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
          className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-3 text-lg font-semibold"
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
              Convert {files.length} PDF{files.length !== 1 ? 's' : ''} to JPG
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert PDF to JPG:</strong> Upload PDF files, adjust the image quality settings, then click "Convert to JPG" to convert each page of your PDF into a JPG image.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfToJpgPage;
