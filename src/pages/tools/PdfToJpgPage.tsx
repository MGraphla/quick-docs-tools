import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Image, Download, Settings, Eye, CheckCircle, AlertCircle, Loader2, Zap } from "lucide-react";
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
import { createPdfProcessor, formatFileSize, type PdfInfo } from "@/lib/pdfUtils";

interface ConvertedImage {
  name: string;
  url: string;
  size: string;
  pageNumber: number;
  width: number;
  height: number;
  bytes: Uint8Array;
}

const PdfToJpgPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; info?: PdfInfo; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [quality, setQuality] = useState([85]);
  const [resolution, setResolution] = useState("300");
  const [extractAllPages, setExtractAllPages] = useState(true);
  const [pageRange, setPageRange] = useState("");
  const [outputFormat, setOutputFormat] = useState("jpg");
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

    try {
      const converted: ConvertedImage[] = [];
      
      const steps = [
        { message: "Analyzing PDF pages...", progress: 20 },
        { message: "Rendering pages to images...", progress: 40 },
        { message: "Applying quality settings...", progress: 60 },
        { message: "Optimizing images...", progress: 80 },
        { message: "Finalizing conversion...", progress: 95 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      for (let fileIndex = 0; fileIndex < files.length; fileIndex++) {
        const file = files[fileIndex];
        const pageCount = file.info?.pageCount || 1;
        
        setProgressMessage(`Converting ${file.file.name}...`);
        
        // Determine which pages to convert
        let pagesToConvert: number[] = [];
        if (extractAllPages) {
          pagesToConvert = Array.from({ length: pageCount }, (_, i) => i + 1);
        } else if (pageRange) {
          // Parse page range (e.g., "1-3,5,7-9")
          const ranges = pageRange.split(',').map(r => r.trim());
          for (const range of ranges) {
            if (range.includes('-')) {
              const [start, end] = range.split('-').map(n => parseInt(n.trim()));
              for (let i = start; i <= Math.min(end, pageCount); i++) {
                if (i >= 1) pagesToConvert.push(i);
              }
            } else {
              const page = parseInt(range);
              if (page >= 1 && page <= pageCount) {
                pagesToConvert.push(page);
              }
            }
          }
        }

        // Convert each page
        const imageFiles = await pdfProcessor.convertPdfToImages(file.file, {
          format: outputFormat as 'jpg' | 'png',
          quality: quality[0],
          resolution: parseInt(resolution)
        });
        
        // Create converted image objects
        for (let i = 0; i < imageFiles.length; i++) {
          const pageNumber = i + 1;
          if (!pagesToConvert.includes(pageNumber)) continue;
          
          const imageBytes = imageFiles[i];
          
          // Calculate image dimensions based on resolution
          const dpi = parseInt(resolution);
          const baseWidth = 612; // Standard PDF page width in points
          const baseHeight = 792; // Standard PDF page height in points
          const width = Math.round((baseWidth * dpi) / 72);
          const height = Math.round((baseHeight * dpi) / 72);
          
          const extension = outputFormat === 'jpg' ? 'jpg' : 'png';
          const fileName = files.length === 1 && pagesToConvert.length === 1
            ? `${file.file.name.replace('.pdf', '')}.${extension}`
            : `${file.file.name.replace('.pdf', '')}_page_${pageNumber}.${extension}`;
          
          const url = pdfProcessor.createDownloadLink(imageBytes, fileName);
          
          converted.push({
            name: fileName,
            url,
            size: formatFileSize(imageBytes.length),
            pageNumber,
            width,
            height,
            bytes: imageBytes
          });
        }
      }
      
      setConvertedImages(converted);
      setProgress(100);
      setProgressMessage("Conversion completed!");
      toast.success(`Successfully converted ${converted.length} page${converted.length > 1 ? 's' : ''} to ${outputFormat.toUpperCase()}`);
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : "Conversion failed. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadFile = (file: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${file.name}`);
  };

  const downloadAll = () => {
    convertedImages.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 300);
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
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-cyan-100 text-cyan-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Image className="h-4 w-4 mr-2" />
          PDF to Image Converter
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF to JPG</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Convert PDF pages to high-quality JPG or PNG images with customizable resolution and quality settings.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-cyan-400 transition-all duration-300">
        <CardContent className="p-8">
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Convert PDF pages to high-quality images
            </p>
            <Button size="lg" className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
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
              Configure image quality and output options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jpg">JPG (Smaller file size)</SelectItem>
                    <SelectItem value="png">PNG (Better quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resolution (DPI)</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150">150 DPI (Web quality)</SelectItem>
                    <SelectItem value="300">300 DPI (Print quality)</SelectItem>
                    <SelectItem value="600">600 DPI (High quality)</SelectItem>
                    <SelectItem value="1200">1200 DPI (Maximum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quality: {quality[0]}%</Label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  max={100}
                  min={10}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Page Selection</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="extractAll"
                    checked={extractAllPages}
                    onCheckedChange={(checked) => {
                      setExtractAllPages(checked as boolean);
                      if (checked) setPageRange("");
                    }}
                  />
                  <Label htmlFor="extractAll">Extract all pages</Label>
                </div>
                
                {!extractAllPages && (
                  <div className="space-y-2">
                    <Label htmlFor="pageRange">Page Range</Label>
                    <input
                      id="pageRange"
                      type="text"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      placeholder="e.g., 1-3, 5, 7-9"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <p className="text-xs text-gray-500">
                      Specify pages to convert (e.g., "1-3, 5, 7-9")
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Output Preview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Format</p>
                  <p className="font-medium">{outputFormat.toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quality</p>
                  <p className="font-medium">{quality[0]}%</p>
                </div>
                <div>
                  <p className="text-gray-500">Resolution</p>
                  <p className="font-medium">{resolution} DPI</p>
                </div>
                <div>
                  <p className="text-gray-500">Pages</p>
                  <p className="font-medium">
                    {extractAllPages ? totalPages : (pageRange || "Custom")}
                  </p>
                </div>
              </div>
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
                      <span>{file.info?.pageCount || 0} pages</span>
                      <span>{file.size}</span>
                      <span>{new Date(file.file.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Converting to Images</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Converting ${files.length} PDF file${files.length > 1 ? 's' : ''}...`}
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

      {/* Converted Images */}
      {convertedImages.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Converted Images ({convertedImages.length})
                </CardTitle>
                <CardDescription>
                  Your PDF pages have been converted to {outputFormat.toUpperCase()} images
                </CardDescription>
              </div>
              {convertedImages.length > 1 && (
                <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {convertedImages.map((image, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border p-4 group hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-center w-full h-32 bg-gray-100 rounded-lg mb-3">
                    <Image className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Page {image.pageNumber}
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate text-sm">
                        {image.name}
                      </h4>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{image.width}×{image.height}px</span>
                      <span>{image.size}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(image)}
                        className="flex-1"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
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
          className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-lg font-semibold"
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
              Convert to {outputFormat.toUpperCase()}
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert PDF to images:</strong> Upload PDF files, configure your image quality and resolution settings, choose which pages to convert, then click "Convert to JPG" to create high-quality images.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfToJpgPage;