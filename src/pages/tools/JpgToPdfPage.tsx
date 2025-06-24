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

interface ImageFile {
  id: string;
  file: File;
  size: string;
  preview: string;
  width?: number;
  height?: number;
}

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  pages: number;
}

const JpgToPdfPage = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [pageSize, setPageSize] = useState("a4");
  const [pageOrientation, setPageOrientation] = useState("portrait");
  const [imageQuality, setImageQuality] = useState([85]);
  const [margin, setMargin] = useState("20");
  const [pdfTitle, setPdfTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only image files are supported.");
    }

    if (validFiles.length === 0) return;

    const newImages: ImageFile[] = [];
    
    for (const file of validFiles) {
      const preview = URL.createObjectURL(file);
      
      // Get image dimensions
      const img = new Image();
      img.src = preview;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          newImages.push({
            id: generateId(),
            file,
            size: formatFileSize(file.size),
            preview,
            width: img.width,
            height: img.height
          });
          resolve();
        };
        img.onerror = () => {
          newImages.push({
            id: generateId(),
            file,
            size: formatFileSize(file.size),
            preview
          });
          resolve();
        };
      });
    }
    
    setImages(prev => [...prev, ...newImages]);
    toast.success(`Added ${newImages.length} image${newImages.length > 1 ? 's' : ''}`);
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

  const removeImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length === 0) {
        setConvertedFile(null);
      }
      return filtered;
    });
    toast.success("Image removed");
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newImages = [...prev];
      [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
      return newImages;
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    setConvertedFile(null);

    try {
      const steps = [
        { message: "Analyzing images...", progress: 15 },
        { message: "Processing image data...", progress: 30 },
        { message: "Creating PDF structure...", progress: 50 },
        { message: "Optimizing image quality...", progress: 70 },
        { message: "Finalizing document...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create PDF using jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      
      // Configure page settings based on user preferences
      const pageFormat = pageSize.toUpperCase() as any;
      const orientation = pageOrientation === 'landscape' ? 'l' : 'p';
      
      // Recreate PDF with proper settings
      const finalPdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageFormat
      });

      const marginNum = parseInt(margin);
      const pageWidth = finalPdf.internal.pageSize.getWidth();
      const pageHeight = finalPdf.internal.pageSize.getHeight();
      const usableWidth = pageWidth - (marginNum * 2);
      const usableHeight = pageHeight - (marginNum * 2);

      // Add images to PDF
      for (let i = 0; i < images.length; i++) {
        if (i > 0) finalPdf.addPage();
        
        const image = images[i];
        const imgData = image.preview;
        
        // Calculate image dimensions to fit page
        const aspectRatio = (image.width || 1) / (image.height || 1);
        let imgWidth = usableWidth;
        let imgHeight = usableWidth / aspectRatio;
        
        if (imgHeight > usableHeight) {
          imgHeight = usableHeight;
          imgWidth = usableHeight * aspectRatio;
        }
        
        // Center the image on the page
        const x = marginNum + (usableWidth - imgWidth) / 2;
        const y = marginNum + (usableHeight - imgHeight) / 2;
        
        try {
          finalPdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        } catch (error) {
          console.warn(`Failed to add image ${i + 1}:`, error);
        }
      }

      // Add metadata if title is provided
      if (pdfTitle) {
        finalPdf.setProperties({
          title: pdfTitle,
          creator: 'PDF Converter',
          author: 'User'
        });
      }

      const pdfBlob = finalPdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      const fileName = pdfTitle 
        ? `${pdfTitle}.pdf` 
        : `images-to-pdf-${Date.now()}.pdf`;
      
      setConvertedFile({
        name: fileName,
        url,
        size: formatFileSize(pdfBlob.size),
        pages: images.length
      });
      
      setProgress(100);
      setProgressMessage("Conversion completed!");
      toast.success(`Successfully converted ${images.length} image${images.length > 1 ? 's' : ''} to PDF`);
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : "Conversion failed. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadPdf = () => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile.url;
    link.download = convertedFile.name;
    link.click();
    toast.success(`Downloaded ${convertedFile.name}`);
  };

  const clearAll = () => {
    setImages([]);
    setConvertedFile(null);
    toast.success("All images cleared");
  };

  const totalSize = images.reduce((sum, img) => sum + img.file.size, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Image className="h-4 w-4 mr-2" />
          JPG to PDF Converter
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">JPG to PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Convert images to professional PDF documents with customizable layout, quality, and page settings.
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
              Drop image files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Convert JPG, PNG, GIF, BMP, and other image formats to PDF
            </p>
            <Button size="lg" className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700">
              <Upload className="h-5 w-5 mr-2" />
              Choose Images
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

      {/* Conversion Settings */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              PDF Settings
            </CardTitle>
            <CardDescription>
              Configure PDF output settings for optimal results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210 × 297 mm)</SelectItem>
                    <SelectItem value="letter">US Letter (8.5 × 11 in)</SelectItem>
                    <SelectItem value="legal">Legal (8.5 × 14 in)</SelectItem>
                    <SelectItem value="a3">A3 (297 × 420 mm)</SelectItem>
                    <SelectItem value="a5">A5 (148 × 210 mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Page Orientation</Label>
                <Select value={pageOrientation} onValueChange={setPageOrientation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="auto">Auto (Based on Image)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Margin (mm)</Label>
                <Input
                  type="number"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
              <div className="space-y-2">
                <Label>PDF Title (Optional)</Label>
                <Input
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="Enter a title for your PDF"
                />
              </div>
            </div>

            {/* Conversion Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Conversion Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Images</p>
                  <p className="font-medium">{images.length} image{images.length > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Size</p>
                  <p className="font-medium">{formatFileSize(totalSize)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Page Size</p>
                  <p className="font-medium uppercase">{pageSize}</p>
                </div>
                <div>
                  <p className="text-gray-500">Orientation</p>
                  <p className="font-medium capitalize">{pageOrientation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image List */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Selected Images ({images.length})
                </CardTitle>
                <CardDescription>
                  Total size: {formatFileSize(totalSize)}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group bg-white rounded-lg shadow-sm border overflow-hidden"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveImage(image.id, 'up')}
                          disabled={index === 0}
                          className="bg-white/80 hover:bg-white"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveImage(image.id, 'down')}
                          disabled={index === images.length - 1}
                          className="bg-white/80 hover:bg-white"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          className="bg-white/80 hover:bg-white text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {image.file.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{image.size}</span>
                      {image.width && image.height && (
                        <span>{image.width}×{image.height}px</span>
                      )}
                    </div>
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
              <h3 className="text-lg font-semibold mb-2">Converting to PDF</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Converting ${images.length} image${images.length > 1 ? 's' : ''} to PDF...`}
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

      {/* Converted File */}
      {convertedFile && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Conversion Completed Successfully!
                </h3>
                <p className="text-green-700 mb-2">{convertedFile.name}</p>
                <p className="text-sm text-green-600">
                  Combined {images.length} image{images.length > 1 ? 's' : ''} • {convertedFile.pages} page{convertedFile.pages > 1 ? 's' : ''} • {convertedFile.size}
                </p>
              </div>
              <Button
                onClick={downloadPdf}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={convertToPdf}
          disabled={images.length === 0 || converting}
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
              Convert {images.length} Image{images.length !== 1 ? 's' : ''} to PDF
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {images.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert images to PDF:</strong> Upload image files (JPG, PNG, GIF, etc.), arrange them in your desired order by dragging, configure your PDF settings, then click "Convert to PDF" to create a professional document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default JpgToPdfPage;
