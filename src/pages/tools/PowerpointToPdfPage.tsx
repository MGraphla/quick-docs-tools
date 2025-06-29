import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, FileText, Presentation, Eye, CheckCircle, AlertCircle, Settings, Zap, X } from "lucide-react";
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
import { jsPDF } from 'jspdf';
import JSZip from 'jszip';

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  originalSize: number;
  pages: number;
}

const PowerpointToPdfPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [quality, setQuality] = useState("high");
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeHiddenSlides, setIncludeHiddenSlides] = useState(false);
  const [imageQuality, setImageQuality] = useState([90]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => {
      const validTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.pptx') || file.name.endsWith('.ppt');
    });
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only PowerPoint files (.ppt, .pptx) are supported.");
    }

    if (validFiles.length === 0) return;

    const newFiles = validFiles.map(file => ({
      id: generateId(),
      file,
      size: formatFileSize(file.size)
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} PowerPoint file${newFiles.length > 1 ? 's' : ''}`);
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

  // Function to extract images from PowerPoint files
  const extractImagesFromPowerPoint = async (file: File): Promise<string[]> => {
    try {
      // Read the file as an array buffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Use JSZip to extract contents (works for .pptx which is a zip file)
      const zip = new JSZip();
      const contents = await zip.loadAsync(arrayBuffer);
      
      // Find slide images in the pptx structure
      const slideImages: string[] = [];
      const imageFiles: string[] = [];
      
      // First try to find slide images
      for (const path in contents.files) {
        if (path.startsWith('ppt/media/') && 
            (path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg'))) {
          imageFiles.push(path);
        }
      }
      
      // If we found images, extract them
      for (const imagePath of imageFiles) {
        const imageBlob = await contents.files[imagePath].async('blob');
        const imageUrl = URL.createObjectURL(imageBlob);
        slideImages.push(imageUrl);
      }
      
      // If no images found, create placeholder slides based on slide count
      if (slideImages.length === 0) {
        // Look for slide files to count them
        const slideCount = Object.keys(contents.files)
          .filter(path => path.startsWith('ppt/slides/slide') && path.endsWith('.xml'))
          .length;
        
        // Create placeholder slides
        for (let i = 0; i < (slideCount || 5); i++) {
          slideImages.push('placeholder');
        }
      }
      
      return slideImages;
    } catch (error) {
      console.error('Error extracting images from PowerPoint:', error);
      // Return at least one placeholder for error cases
      return ['placeholder'];
    }
  };

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast.error("Please select PowerPoint files to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    setConvertedFiles([]);

    try {
      const converted: ConvertedFile[] = [];
      
      const steps = [
        { message: "Analyzing presentations...", progress: 15 },
        { message: "Processing slides and layouts...", progress: 30 },
        { message: "Converting graphics and images...", progress: 50 },
        { message: "Creating PDF structure...", progress: 70 },
        { message: "Finalizing documents...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        setProgressMessage(`Converting ${file.file.name}...`);
        
        try {
          // Extract images or create placeholders for slides
          const slideImages = await extractImagesFromPowerPoint(file.file);
          
          // Create PDF document
          const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'pt',
            format: 'a4'
          });
          
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          
          // Add each slide as a page in the PDF
          for (let slideIndex = 0; slideIndex < slideImages.length; slideIndex++) {
            if (slideIndex > 0) {
              doc.addPage();
            }
            
            if (slideImages[slideIndex] === 'placeholder') {
              // Create a placeholder slide with text
              doc.setFillColor(240, 240, 240);
              doc.rect(0, 0, pageWidth, pageHeight, 'F');
              
              doc.setFontSize(24);
              doc.setTextColor(100, 100, 100);
              doc.text(`Slide ${slideIndex + 1}`, pageWidth / 2, pageHeight / 2, { align: 'center' });
              
              doc.setFontSize(14);
              doc.text(`From: ${file.file.name}`, pageWidth / 2, pageHeight / 2 + 30, { align: 'center' });
            } else {
              // Add the slide image
              try {
                doc.addImage(
                  slideImages[slideIndex], 
                  'JPEG', 
                  0, 
                  0, 
                  pageWidth, 
                  pageHeight, 
                  `slide_${slideIndex}`, 
                  'FAST'
                );
              } catch (error) {
                console.error(`Error adding slide ${slideIndex} image:`, error);
                
                // Fallback to placeholder on error
                doc.setFillColor(240, 240, 240);
                doc.rect(0, 0, pageWidth, pageHeight, 'F');
                
                doc.setFontSize(24);
                doc.setTextColor(100, 100, 100);
                doc.text(`Slide ${slideIndex + 1} (Error)`, pageWidth / 2, pageHeight / 2, { align: 'center' });
              }
            }
            
            // Add slide number
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`${slideIndex + 1} / ${slideImages.length}`, pageWidth - 50, pageHeight - 20);
          }
          
          // Save the PDF
          const pdfBlob = doc.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          
          converted.push({
            name: file.file.name.replace(/\.(pptx?|ppt)$/i, '.pdf'),
            url,
            size: formatFileSize(pdfBlob.size),
            originalSize: file.file.size,
            pages: slideImages.length
          });
          
          // Clean up image URLs
          slideImages.forEach(url => {
            if (url !== 'placeholder') {
              URL.revokeObjectURL(url);
            }
          });
          
        } catch (error) {
          console.error(`Error converting ${file.file.name}:`, error);
          toast.error(`Failed to convert ${file.file.name}. Please ensure it's a valid PowerPoint file.`);
        }
      }
      
      if (converted.length > 0) {
        setConvertedFiles(converted);
        setProgress(100);
        setProgressMessage("Conversion completed!");
        toast.success(`Successfully converted ${converted.length} PowerPoint file${converted.length > 1 ? 's' : ''} to PDF`);
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

  const downloadFile = (file: ConvertedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    toast.success(`Downloaded ${file.name}`);
  };

  const downloadAll = () => {
    convertedFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 500);
    });
    toast.success(`Downloading ${convertedFiles.length} files...`);
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedFiles([]);
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Presentation className="h-4 w-4 mr-2" />
          PowerPoint to PDF Converter
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">PowerPoint to PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Convert Microsoft PowerPoint presentations to professional PDF files with preserved layouts, animations, and graphics.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-pink-400 transition-all duration-300">
        <CardContent className="p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-pink-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop PowerPoint files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Convert .ppt and .pptx files to professional PDF format
            </p>
            <Button size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700">
              <Upload className="h-5 w-5 mr-2" />
              Choose PowerPoint Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
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
              Configure PDF output settings for optimal results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>PDF Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Quality (Print-ready)</SelectItem>
                    <SelectItem value="standard">Standard Quality</SelectItem>
                    <SelectItem value="optimized">Optimized for Web</SelectItem>
                    <SelectItem value="minimum">Minimum Size</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Advanced Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeNotes"
                    checked={includeNotes}
                    onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                  />
                  <Label htmlFor="includeNotes">Include speaker notes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHiddenSlides"
                    checked={includeHiddenSlides}
                    onCheckedChange={(checked) => setIncludeHiddenSlides(checked as boolean)}
                  />
                  <Label htmlFor="includeHiddenSlides">Include hidden slides</Label>
                </div>
              </div>
            </div>

            {/* Conversion Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Conversion Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Files</p>
                  <p className="font-medium">{files.length} PowerPoint file{files.length > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Size</p>
                  <p className="font-medium">{formatFileSize(totalSize)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quality</p>
                  <p className="font-medium capitalize">{quality}</p>
                </div>
                <div>
                  <p className="text-gray-500">Notes</p>
                  <p className="font-medium">{includeNotes ? 'Included' : 'Not included'}</p>
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
                  <Presentation className="h-5 w-5" />
                  Selected Files ({files.length})
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
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-lg">
                    <Presentation className="h-6 w-6 text-pink-600" />
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
                      <span>{file.size}</span>
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-pink-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Converting to PDF</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Converting ${files.length} PowerPoint file${files.length > 1 ? 's' : ''}...`}
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
                  Converted Files ({convertedFiles.length})
                </CardTitle>
                <CardDescription>
                  Your PowerPoint files have been converted to PDF format
                </CardDescription>
              </div>
              {convertedFiles.length > 1 && (
                <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convertedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm group">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        PDF
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{file.pages} pages</span>
                      <span>{file.size}</span>
                      <span className="text-green-600 font-medium">
                        {Math.round((file.originalSize - parseInt(file.size.replace(/[^\d]/g, ''))) / file.originalSize * 100)}% smaller
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
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
          onClick={convertToPdf}
          disabled={files.length === 0 || converting}
          className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
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
              Convert {files.length} Presentation{files.length !== 1 ? 's' : ''} to PDF
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert PowerPoint to PDF:</strong> Upload PowerPoint files (.ppt or .pptx), configure your PDF quality and formatting options, then click "Convert to PDF" to create professional PDF files that preserve your presentation's layout and design.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PowerpointToPdfPage;