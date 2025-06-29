import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, FileText, FileType, Eye, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react";
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

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  bytes: Uint8Array;
  pages: number;
}

const PdfToWordPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; info?: PdfInfo; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [conversionQuality, setConversionQuality] = useState("high");
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [preserveImages, setPreserveImages] = useState(true);
  const [ocrEnabled, setOcrEnabled] = useState(false);
  const [previewFile, setPreviewFile] = useState<ConvertedFile | null>(null);
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

  const convertToWord = async () => {
    if (files.length === 0) {
      toast.error("Please select PDF files to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    setConvertedFiles([]);

    try {
      const converted: ConvertedFile[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        setProgressMessage(`Converting ${file.file.name}...`);
        
        try {
          // Perform actual PDF to Word conversion
          const convertedBytes = await pdfProcessor.convertPdfToWord(file.file);
          
          // Create a proper Word document file
          const fileName = file.file.name.replace(/\.pdf$/i, '.docx');
          const blob = new Blob([convertedBytes], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
          });
          const url = URL.createObjectURL(blob);
          
          converted.push({
            name: fileName,
            url,
            size: formatFileSize(convertedBytes.length),
            bytes: convertedBytes,
            pages: file.info?.pageCount || 0
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
        toast.success(`Successfully converted ${converted.length} PDF file${converted.length > 1 ? 's' : ''} to Word format`);
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
    try {
      // Use FileSaver.js to ensure proper download with correct MIME type
      const blob = new Blob([file.bytes], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
      });
      saveAs(blob, file.name);
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  const previewDocument = (file: ConvertedFile) => {
    setPreviewFile(file);
    // In a real implementation, you might want to generate a preview
    toast.info("Preview functionality is limited for Word documents in the browser");
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
  const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileType className="h-4 w-4 mr-2" />
          PDF to Word Converter
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">PDF to Word</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Convert your PDF documents to Word-compatible format with preserved formatting, images, and layout.
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
              Drop PDF files here or click to browse
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6">
              Convert PDF documents to Word-compatible format
            </p>
            <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Settings */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                  Conversion Settings
                </CardTitle>
                <CardDescription>
                  Configure how your PDFs should be converted to Word
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Conversion Quality</Label>
                  <Select value={conversionQuality} onValueChange={setConversionQuality}>
                    <SelectTrigger className="border-orange-200 focus:border-orange-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Quality (Slower)</SelectItem>
                      <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                      <SelectItem value="fast">Fast (Basic conversion)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Higher quality preserves more formatting but takes longer to process
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Conversion Options</h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="preserveFormatting"
                        checked={preserveFormatting}
                        onCheckedChange={(checked) => setPreserveFormatting(checked as boolean)}
                      />
                      <Label htmlFor="preserveFormatting" className="text-sm">Preserve text formatting</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="preserveImages"
                        checked={preserveImages}
                        onCheckedChange={(checked) => setPreserveImages(checked as boolean)}
                      />
                      <Label htmlFor="preserveImages" className="text-sm">Include images and graphics</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="ocrEnabled"
                        checked={ocrEnabled}
                        onCheckedChange={(checked) => setOcrEnabled(checked as boolean)}
                      />
                      <Label htmlFor="ocrEnabled" className="text-sm">OCR for scanned documents</Label>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    Conversion Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Files</p>
                      <p className="font-medium">{files.length} PDF file{files.length > 1 ? 's' : ''}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Pages</p>
                      <p className="font-medium">{totalPages} pages</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Size</p>
                      <p className="font-medium">{formatFileSize(totalSize)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Quality</p>
                      <p className="font-medium capitalize">{conversionQuality}</p>
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
                    <FileText className="h-5 w-5 text-orange-600" />
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
                          <span>{file.info?.pageCount || 0} pages</span>
                          <span>•</span>
                          <span>{file.size}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <AlertCircle className="h-4 w-4" />
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
              <Card className="border-orange-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Converting to Word</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || `Converting ${files.length} PDF file${files.length > 1 ? 's' : ''}...`}
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
                        Your PDF files have been converted to Word format
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
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg shrink-0">
                            <FileType className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                Word
                              </Badge>
                              <h4 className="font-medium text-gray-900 truncate">
                                {file.name}
                              </h4>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span>{file.pages} pages</span>
                              <span>•</span>
                              <span>{file.size}</span>
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
                            className="bg-blue-600 hover:bg-blue-700 text-white h-9"
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
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <FileType className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Convert</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Adjust conversion settings on the left and click the button below to convert your PDF files to Word format.
                      </p>
                      
                      <Button
                        onClick={convertToWord}
                        disabled={converting}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-3 px-6 text-lg font-semibold shadow-sm"
                        size="lg"
                      >
                        <Zap className="h-5 w-5 mr-2" />
                        Convert {files.length} PDF{files.length !== 1 ? 's' : ''} to Word
                      </Button>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
                        <div className="bg-blue-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Text Extraction
                          </h4>
                          <p className="text-xs text-gray-600">Preserves all text content with original formatting</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-green-600" />
                            Image Preservation
                          </h4>
                          <p className="text-xs text-gray-600">Maintains images and graphics in their original quality</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-left">
                          <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                            <Settings className="h-4 w-4 text-purple-600" />
                            Editable Output
                          </h4>
                          <p className="text-xs text-gray-600">Creates fully editable Word documents (.docx format)</p>
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
                      Document Preview
                    </CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setPreviewFile(null)}
                      className="h-8 w-8 p-0"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <div className="bg-white shadow-sm rounded-lg p-6 min-h-[300px]">
                      <div className="text-center">
                        <FileType className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">{previewFile.name}</h3>
                        <p className="text-gray-600 mb-4">
                          Word document preview is not available in the browser. Please download the file to view it.
                        </p>
                        <Button
                          onClick={() => downloadFile(previewFile)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download to View
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      {!files.length && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to convert PDF to Word:</strong> Upload PDF files, configure your conversion settings for optimal results, then click "Convert to PDF" to create editable Word documents with preserved formatting.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfToWordPage;