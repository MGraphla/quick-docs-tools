import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, FileText, Presentation, Eye, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize, type PdfInfo } from "@/lib/pdfUtils";
import { saveAs } from 'file-saver';
import JSZip from 'jszip';

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  bytes: Uint8Array;
  pages: number;
}

const PdfToPowerpointPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; info?: PdfInfo; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [conversionQuality, setConversionQuality] = useState("high");
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [preserveImages, setPreserveImages] = useState(true);
  const [oneSlidePerPage, setOneSlidePerPage] = useState(true);
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

  const convertToPowerpoint = async () => {
    if (files.length === 0) {
      toast.error("Please select PDF files to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    const newConvertedFiles: ConvertedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressFn = (p: number, m: string) => {
        setProgress(p);
        setProgressMessage(m);
      }

      try {
        const result = await pdfProcessor.convertPdfToPowerpoint(file.file, progressFn);
        const convertedBytes = result.pptxBytes;

        if (result.imageExtractionErrors > 0) {
          toast.warning(`${result.imageExtractionErrors} image(s) in ${file.file.name} could not be processed and were skipped.`);
        }

        const fileName = file.file.name.replace(/\.pdf$/i, '.pptx');
        const blob = new Blob([convertedBytes], { 
          type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
        });
        const url = URL.createObjectURL(blob);
        
        newConvertedFiles.push({
          name: fileName,
          url,
          size: formatFileSize(convertedBytes.length),
          bytes: convertedBytes,
          pages: file.info?.pageCount || 0
        });

      } catch (error) {
        console.error(`Error converting ${file.file.name}:`, error);
        if (error instanceof Error) {
            toast.error(`Failed to convert ${file.file.name}: ${error.message}`);
        } else {
            toast.error(`An unknown error occurred while converting ${file.file.name}.`);
        }
      }
    }
    
    if (newConvertedFiles.length > 0) {
      setConvertedFiles(prev => [...prev, ...newConvertedFiles]);
      toast.success(`Successfully converted ${newConvertedFiles.length} of ${files.length} file(s) to PowerPoint.`);
    }

    setConverting(false);
    setProgress(0);
    setProgressMessage("");
  };

  const downloadFile = (file: ConvertedFile) => {
    try {
      // Use FileSaver.js to ensure proper download with correct MIME type
      const blob = new Blob([file.bytes], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      });
      saveAs(blob, file.name);
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download file. Please try again.");
    }
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
  const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);

  return (
    <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Presentation className="h-4 w-4 mr-2" />
          PDF to PowerPoint Converter
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">PDF to PowerPoint</h1>
        <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
          Transform your PDF documents into PowerPoint presentations with preserved layouts and professional slide formatting.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-red-400 transition-all duration-300">
        <CardContent className="p-6 sm:p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-red-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-base sm:text-lg text-gray-600 mb-6">
              Convert PDF documents to PowerPoint presentations
            </p>
            <Button size="lg" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700">
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
              Configure PowerPoint conversion options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Conversion Quality</Label>
                <Select value={conversionQuality} onValueChange={setConversionQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Quality (Slower)</SelectItem>
                    <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                    <SelectItem value="fast">Fast (Basic conversion)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value="pptx" disabled>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pptx">Microsoft PowerPoint (.pptx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Conversion Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="oneSlidePerPage"
                    checked={oneSlidePerPage}
                    onCheckedChange={(checked) => setOneSlidePerPage(checked as boolean)}
                  />
                  <Label htmlFor="oneSlidePerPage" className="cursor-pointer">One slide per PDF page</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserveImages"
                    checked={preserveImages}
                    onCheckedChange={(checked) => setPreserveImages(checked as boolean)}
                  />
                  <Label htmlFor="preserveImages" className="cursor-pointer">Preserve images and graphics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserveFormatting"
                    checked={preserveFormatting}
                    onCheckedChange={(checked) => setPreserveFormatting(checked as boolean)}
                  />
                  <Label htmlFor="preserveFormatting" className="cursor-pointer">Preserve text formatting</Label>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                  <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                    <FileText className="h-6 w-6 text-red-600" />
                  </div>
                  
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h4 className="font-medium text-gray-900 break-all sm:break-words sm:truncate">
                        {file.file.name}
                      </h4>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span>{file.info?.pageCount || 0} pages</span>
                      <span>{file.size}</span>
                      <span>{new Date(file.file.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
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
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Converting to PowerPoint</h3>
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
                  Your PDF files have been converted to PowerPoint format
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
                <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                    <Presentation className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        PowerPoint
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{file.pages} slides</span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(file)}
                      className="w-full sm:w-auto"
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
          onClick={convertToPowerpoint}
          disabled={files.length === 0 || converting}
          className="flex-1 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
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
              Convert {files.length} PDF{files.length !== 1 ? 's' : ''} to PowerPoint
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert PDF to PowerPoint:</strong> Upload PDF files, configure your slide layout and conversion settings, then click "Convert to PowerPoint" to create presentation-ready files.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfToPowerpointPage;