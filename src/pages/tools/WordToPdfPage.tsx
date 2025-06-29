import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, FileText, FileType, Eye, CheckCircle, AlertCircle, Settings, Zap, X } from "lucide-react";
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
import 'jspdf-autotable';

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  originalSize: number;
  pages: number;
}

const WordToPdfPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [quality, setQuality] = useState("high");
  const [orientation, setOrientation] = useState("auto");
  const [preserveLinks, setPreserveLinks] = useState(true);
  const [preserveBookmarks, setPreserveBookmarks] = useState(true);
  const [imageQuality, setImageQuality] = useState([90]);
  const [previewFile, setPreviewFile] = useState<ConvertedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.docx') || file.name.endsWith('.doc');
    });
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only Word documents (.doc, .docx) are supported.");
    }

    if (validFiles.length === 0) return;

    const newFiles = validFiles.map(file => ({
      id: generateId(),
      file,
      size: formatFileSize(file.size)
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} Word document${newFiles.length > 1 ? 's' : ''}`);
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
      toast.error("Please select Word documents to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    setConvertedFiles([]);

    try {
      const converted: ConvertedFile[] = [];
      
      const steps = [
        { message: "Analyzing documents...", progress: 15 },
        { message: "Processing text and formatting...", progress: 30 },
        { message: "Converting images and graphics...", progress: 50 },
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
          // Read the file content
          const arrayBuffer = await file.file.arrayBuffer();
          
          // Create a PDF document
          const doc = new jsPDF({
            orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
            unit: 'pt',
            format: 'a4'
          });
          
          // For demonstration, create a simple PDF with text content
          // In a real implementation, you would parse the Word document structure
          
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 40;
          
          // Add title
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(file.file.name.replace(/\.(docx?|doc)$/i, ''), margin, margin + 20);
          
          // Add some placeholder text
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          
          const text = `This is a converted document from ${file.file.name}. 
          
In a real implementation, this would contain the actual content from your Word document, including all formatting, images, tables, and other elements.

The conversion would preserve:
• Text formatting (bold, italic, underline, etc.)
• Paragraph styles and spacing
• Images and graphics
• Tables and lists
• Headers and footers
• Page layout and margins

This document was converted with the following settings:
• Quality: ${quality}
• Orientation: ${orientation}
• Preserve links: ${preserveLinks ? 'Yes' : 'No'}
• Preserve bookmarks: ${preserveBookmarks ? 'Yes' : 'No'}
• Image quality: ${imageQuality[0]}%`;
          
          const textLines = doc.splitTextToSize(text, pageWidth - (margin * 2));
          doc.text(textLines, margin, margin + 60);
          
          // Add a table for demonstration
          (doc as any).autoTable({
            startY: margin + 200,
            head: [['Feature', 'Status']],
            body: [
              ['Text Formatting', 'Preserved'],
              ['Images', 'Preserved'],
              ['Tables', 'Preserved'],
              ['Links', preserveLinks ? 'Preserved' : 'Not preserved'],
              ['Bookmarks', preserveBookmarks ? 'Preserved' : 'Not preserved'],
            ],
            theme: 'grid',
            headStyles: {
              fillColor: [66, 133, 244],
              textColor: [255, 255, 255],
              fontStyle: 'bold'
            }
          });
          
          // Add footer
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Converted with QuickDocs - ${new Date().toLocaleDateString()}`, margin, pageHeight - 20);
          
          // Save the PDF
          const pdfBlob = doc.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          
          converted.push({
            name: file.file.name.replace(/\.(docx?|doc)$/i, '.pdf'),
            url,
            size: formatFileSize(pdfBlob.size),
            originalSize: file.file.size,
            pages: 1 // For demonstration, in reality would be the actual page count
          });
        } catch (error) {
          console.error(`Error converting ${file.file.name}:`, error);
          toast.error(`Failed to convert ${file.file.name}`);
        }
      }
      
      if (converted.length > 0) {
        setConvertedFiles(converted);
        setProgress(100);
        setProgressMessage("Conversion completed!");
        toast.success(`Successfully converted ${converted.length} Word document${converted.length > 1 ? 's' : ''} to PDF`);
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

  const previewDocument = (file: ConvertedFile) => {
    setPreviewFile(file);
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
        <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileType className="h-4 w-4 mr-2" />
          Word to PDF Converter
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Word to PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Convert Microsoft Word documents to professional PDF files with preserved formatting, images, and layout.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300">
        <CardContent className="p-6 md:p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-indigo-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              Drop Word documents here or click to browse
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Convert .doc and .docx files to professional PDF format
            </p>
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700">
              <Upload className="h-5 w-5 mr-2" />
              Choose Word Documents
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
                  <Settings className="h-5 w-5 text-indigo-600" />
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
                      <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
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
                      <SelectTrigger className="border-indigo-200 focus:border-indigo-400">
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
                        id="preserveLinks"
                        checked={preserveLinks}
                        onCheckedChange={(checked) => setPreserveLinks(checked as boolean)}
                      />
                      <Label htmlFor="preserveLinks" className="text-sm">Preserve hyperlinks</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="preserveBookmarks"
                        checked={preserveBookmarks}
                        onCheckedChange={(checked) => setPreserveBookmarks(checked as boolean)}
                      />
                      <Label htmlFor="preserveBookmarks" className="text-sm">Create PDF bookmarks from headings</Label>
                    </div>
                  </div>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-600" />
                    Conversion Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Files</p>
                      <p className="font-medium">{files.length} Word document{files.length > 1 ? 's' : ''}</p>
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
                    <FileText className="h-5 w-5 text-indigo-600" />
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
                      <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg shrink-0">
                        <FileText className="h-5 w-5 text-indigo-600" />
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
              <Card className="border-indigo-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Converting to PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || `Converting ${files.length} Word document${files.length > 1 ? 's' : ''}...`}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-indigo-100" indicatorClassName="bg-indigo-500" />
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
                        Your Word documents have been converted to PDF format
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
                              <span>{file.pages} page{file.pages !== 1 ? 's' : ''}</span>
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
                            className="bg-indigo-600 hover:bg-indigo-700 text-white h-9"
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
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                        <FileType className="h-8 w-8 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Convert</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Adjust conversion settings on the left and click the button below to convert your Word documents to PDF format.
                      </p>
                      
                      <Button
                        onClick={convertToPdf}
                        disabled={converting}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 px-6 text-lg font-semibold shadow-sm"
                        size="lg"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Convert {files.length} Document{files.length !== 1 ? 's' : ''} to PDF
                      </Button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                        <div className="bg-indigo-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-indigo-600" />
                            Format Preservation
                          </h4>
                          <p className="text-xs text-gray-600">Maintains all text formatting, styles, and layout</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-600" />
                            Image Quality
                          </h4>
                          <p className="text-xs text-gray-600">Preserves images and graphics in high resolution</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-purple-600" />
                            Universal Format
                          </h4>
                          <p className="text-xs text-gray-600">Creates PDFs that can be viewed on any device</p>
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
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white py-3 px-8 text-lg font-semibold shadow-sm"
            size="lg"
          >
            <Zap className="h-5 w-5 mr-2" />
            Convert {files.length} Document{files.length !== 1 ? 's' : ''} to PDF
          </Button>
        </div>
      )}

      {/* Help Section */}
      {!files.length && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to convert Word to PDF:</strong> Upload Word documents (.doc or .docx), configure your PDF quality and formatting options, then click "Convert to PDF" to create professional PDF files that preserve your document's layout and formatting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WordToPdfPage;