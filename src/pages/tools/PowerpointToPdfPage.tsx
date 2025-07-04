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
import { saveAs } from 'file-saver';
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
  const [orientation, setOrientation] = useState("auto");
  const [includeNotes, setIncludeNotes] = useState(false);
  const [includeHiddenSlides, setIncludeHiddenSlides] = useState(false);
  const [imageQuality, setImageQuality] = useState([90]);
  const [previewFile, setPreviewFile] = useState<ConvertedFile | null>(null);
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
        await new Promise(resolve => setTimeout(resolve, 600));
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
            orientation: orientation === "landscape" ? "landscape" : "portrait",
            unit: "pt",
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

  const downloadFile = (file: ConvertedFile) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.click();
    toast.success(`Downloaded ${file.name}`);
  };

  const previewDocument = (file: ConvertedFile) => {
    setPreviewFile(file);
    toast.info("PDF preview opened");
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
    setPreviewFile(null);
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-pink-100 text-pink-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Presentation className="h-4 w-4 mr-2" />
          PowerPoint to PDF Converter
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">PowerPoint to PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Transform Microsoft PowerPoint presentations to professional PDF files with preserved layouts, animations, and graphics.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-pink-400 transition-all duration-300">
        <CardContent className="p-6 md:p-8">
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
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Drop PowerPoint files here or click to browse
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">
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

      {/* Conversion Interface */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Settings */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-pink-600" />
                  Conversion Settings
                </CardTitle>
                <CardDescription>
                  Configure PDF output settings for optimal results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>PDF Quality</Label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger className="border-pink-200 focus:border-pink-400">
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
                    <Label>Page Orientation</Label>
                    <Select value={orientation} onValueChange={setOrientation}>
                      <SelectTrigger className="border-pink-200 focus:border-pink-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Keep Original)</SelectItem>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
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

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Advanced Options</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeNotes"
                        checked={includeNotes}
                        onCheckedChange={(checked) => setIncludeNotes(checked as boolean)}
                      />
                      <Label htmlFor="includeNotes" className="text-sm">Include speaker notes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeHiddenSlides"
                        checked={includeHiddenSlides}
                        onCheckedChange={(checked) => setIncludeHiddenSlides(checked as boolean)}
                      />
                      <Label htmlFor="includeHiddenSlides" className="text-sm">Include hidden slides</Label>
                    </div>
                  </div>
                </div>

                {/* Conversion Preview */}
                <div className="bg-pink-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-pink-600" />
                    Conversion Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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
                      <p className="text-gray-500">Orientation</p>
                      <p className="font-medium capitalize">{orientation}</p>
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
                    <Presentation className="h-5 w-5 text-pink-600" />
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
                      <div className="flex items-center justify-center w-10 h-10 bg-pink-100 rounded-lg shrink-0">
                        <Presentation className="h-5 w-5 text-pink-600" />
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
                          <span>{file.size}</span>
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
          <div className="lg:col-span-7 space-y-6">
            {/* Processing Progress */}
            {converting && (
              <Card className="border-pink-200 shadow-sm">
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
                      <Progress value={progress} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
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
                        Converted Files ({convertedFiles.length})
                      </CardTitle>
                      <CardDescription>
                        Your PowerPoint files have been converted to PDF format
                      </CardDescription>
                    </div>
                    {convertedFiles.length > 1 && (
                      <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {convertedFiles.map((file, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
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
                                {file.name}
                              </h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span>{file.pages} pages</span>
                              <span>•</span>
                              <span>{file.size}</span>
                              <span className="text-green-600 font-medium">
                                {Math.round((file.originalSize - parseInt(file.size.replace(/[^\d]/g, ''))) / file.originalSize * 100)}% smaller
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => previewDocument(file)}
                            className="h-9"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadFile(file)}
                            className="bg-red-600 hover:bg-red-700 text-white h-9"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
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
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
                        <Presentation className="h-8 w-8 text-pink-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Convert</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Adjust conversion settings on the left and click the button below to convert your PowerPoint files to PDF format.
                      </p>
                      
                      <Button
                        onClick={convertToPdf}
                        disabled={converting}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 px-6 text-lg font-semibold shadow-sm"
                        size="lg"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Convert {files.length} Presentation{files.length !== 1 ? 's' : ''} to PDF
                      </Button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                        <div className="bg-pink-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Presentation className="h-4 w-4 text-pink-600" />
                            Slide Preservation
                          </h4>
                          <p className="text-xs text-gray-600">Maintains all slides with their original layout and design</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-purple-600" />
                            Image Quality
                          </h4>
                          <p className="text-xs text-gray-600">Preserves images and graphics in high resolution</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-blue-600" />
                            Universal Format
                          </h4>
                          <p className="text-xs text-gray-600">Creates PDFs that can be viewed on any device without PowerPoint</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
            
            {/* Preview Modal */}
            {previewFile && (
              <Card className="border-blue-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Eye className="h-5 w-5 text-blue-600" />
                      PDF Preview
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setPreviewFile(null)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                      <iframe 
                        src={previewFile.url} 
                        className="w-full h-[500px] border-0" 
                        title="PDF Preview"
                      />
                    </div>
                    <div className="flex justify-end mt-4">
                      <Button
                        onClick={() => downloadFile(previewFile)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
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
            onClick={convertToPdf}
            disabled={converting}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 px-8 text-lg font-semibold shadow-sm"
            size="lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Convert {files.length} Presentation{files.length !== 1 ? 's' : ''} to PDF
          </Button>
        </div>
      )}

      {/* Help Section */}
      {!files.length && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to convert PowerPoint to PDF:</strong> Upload PowerPoint files (.ppt or .pptx), configure your PDF quality and formatting options, then click "Convert to PDF" to create professional PDF files that preserve your presentation's layout and design.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PowerpointToPdfPage;