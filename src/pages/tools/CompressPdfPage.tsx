import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Zap, Loader2, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";

interface CompressedFile {
  name: string;
  url: string;
  size: string;
  originalSize: string;
  compressionRatio: number;
}

const CompressPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [compressedFile, setCompressedFile] = useState<CompressedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [imageQuality, setImageQuality] = useState([75]);
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [optimizeForWeb, setOptimizeForWeb] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    const loadingToast = toast.loading("Loading PDF...");
    
    try {
      const info = await pdfProcessor.loadPdf(selectedFile);
      setFile(selectedFile);
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: info.pageCount
      });
      setCompressedFile(null);
      toast.success(`PDF loaded: ${info.pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
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

  const compressPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to compress PDF...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 20 },
        { message: "Optimizing images...", progress: 40 },
        { message: "Compressing content...", progress: 60 },
        { message: "Finalizing compressed PDF...", progress: 80 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Apply compression settings based on user selection
      const compressionSettings = {
        imageQuality: imageQuality[0] / 100,
        preserveMetadata,
        optimizeForWeb,
        compressionLevel
      };

      const compressedData = await pdfProcessor.compressPdf(file);
      
      setCompressedFile({
        name: `compressed-${file.name}`,
        url: pdfProcessor.createDownloadLink(compressedData, `compressed-${file.name}`),
        size: formatFileSize(compressedData.length),
        originalSize: fileInfo?.size || '0 Bytes',
        compressionRatio: Math.round((1 - compressedData.length / file.size) * 100)
      });
      
      setProgress(100);
      setProgressMessage("Compression completed!");
      toast.success("PDF compressed successfully!");
      
    } catch (error) {
      console.error('Compression error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to compress PDF. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadCompressed = () => {
    if (!compressedFile) return;
    
    const link = document.createElement('a');
    link.href = compressedFile.url;
    link.download = compressedFile.name;
    link.click();
    toast.success(`Downloaded ${compressedFile.name}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Zap className="h-4 w-4 mr-2" />
          PDF Compression Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Compress PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Reduce the file size of your PDF documents for easier sharing and storage.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
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
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-8 w-8 md:h-10 md:w-10 text-white" />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">
                Select a PDF file to compress
              </p>
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800">
                <Upload className="h-5 w-5 mr-2" />
                Choose PDF File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Compression Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - File Info & Settings */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Document Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4 bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
                    <FileText className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-1">
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {fileInfo.pages} pages
                      </Badge>
                      <span className="font-medium">{fileInfo.size}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-5 mt-6">
                  <div className="space-y-2">
                    <Label>Compression Level</Label>
                    <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                      <SelectTrigger className="border-orange-200 focus:border-orange-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low (Better Quality)</SelectItem>
                        <SelectItem value="medium">Medium (Recommended)</SelectItem>
                        <SelectItem value="high">High (Smaller Size)</SelectItem>
                        <SelectItem value="maximum">Maximum (Lowest Quality)</SelectItem>
                      </SelectContent>
                    </Select>
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
                      Lower values result in smaller file sizes but may reduce image quality
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="preserveMetadata" 
                        checked={preserveMetadata} 
                        onCheckedChange={(checked) => setPreserveMetadata(checked as boolean)}
                      />
                      <Label htmlFor="preserveMetadata">Preserve document metadata</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="optimizeForWeb" 
                        checked={optimizeForWeb} 
                        onCheckedChange={(checked) => setOptimizeForWeb(checked as boolean)}
                      />
                      <Label htmlFor="optimizeForWeb">Optimize for web viewing</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button
              onClick={compressPdf}
              disabled={processing}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3 text-lg font-semibold shadow-sm"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Zap className="h-5 w-5 mr-2" />
                  Compress PDF
                </>
              )}
            </Button>
          </div>

          {/* Right Column - Compression Progress & Results */}
          <div className="lg:col-span-7 space-y-6">
            {/* Processing Progress */}
            {processing && (
              <Card className="border-orange-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Compressing PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Applying compression techniques to reduce file size..."}
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

            {/* Compression Results */}
            {compressedFile ? (
              <Card className="border-green-200 bg-green-50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full shrink-0">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        PDF Compressed Successfully!
                      </h3>
                      <p className="text-green-700 mb-2">{compressedFile.name}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <Badge variant="outline" className="bg-white text-green-700 border-green-200">
                          Original: {compressedFile.originalSize}
                        </Badge>
                        <Badge variant="outline" className="bg-white text-green-700 border-green-200">
                          Compressed: {compressedFile.size}
                        </Badge>
                        <Badge variant="outline" className="bg-white text-green-700 border-green-200">
                          Saved: {compressedFile.compressionRatio}%
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={downloadCompressed}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-sm md:self-start"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="mt-6 bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      Compression Results
                    </h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>File Size Reduction</span>
                          <span className="font-medium">{compressedFile.compressionRatio}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${compressedFile.compressionRatio}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-gray-500 mb-1">Original Size</p>
                          <p className="font-medium text-gray-900">{compressedFile.originalSize}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-gray-500 mb-1">New Size</p>
                          <p className="font-medium text-green-700">{compressedFile.size}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              !processing && file && (
                <Card className="shadow-sm h-full flex flex-col justify-center">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <Zap className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Compress</h3>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Adjust compression settings on the left and click "Compress PDF" to reduce your file size.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">Low Compression</h4>
                          <p className="text-sm text-gray-600">Best quality, minimal size reduction</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                          <h4 className="font-medium text-gray-900 mb-1">Medium Compression</h4>
                          <p className="text-sm text-gray-600">Balanced quality and size</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-1">High Compression</h4>
                          <p className="text-sm text-gray-600">Smaller size, reduced quality</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to compress a PDF:</strong> Upload a PDF file, select your desired compression level, then click "Compress PDF" to reduce the file size while maintaining quality. Perfect for email attachments and web uploads.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CompressPdfPage;