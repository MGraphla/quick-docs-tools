import { useState, useRef, useCallback } from "react";
import { Upload, Download, Loader2, FileText, Minimize2, Eye, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react";
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
import { saveAs } from 'file-saver';

interface CompressedFile {
  name: string;
  url: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  bytes: Uint8Array;
}

const CompressPdfPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; info?: PdfInfo; size: string }>>([]);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressedFiles, setCompressedFiles] = useState<CompressedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [compressionLevel, setCompressionLevel] = useState("balanced");
  const [imageQuality, setImageQuality] = useState([75]);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const compressionOptions = {
    low: { label: "Low Compression", reduction: 0.15, description: "Minimal compression, highest quality" },
    balanced: { label: "Balanced", reduction: 0.35, description: "Good balance of size and quality" },
    high: { label: "High Compression", reduction: 0.55, description: "Significant size reduction" },
    maximum: { label: "Maximum Compression", reduction: 0.75, description: "Smallest file size" }
  };

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

  const compressPdfs = async () => {
    if (files.length === 0) {
      toast.error("Please select PDF files to compress");
      return;
    }

    setCompressing(true);
    setProgress(0);
    setProgressMessage("Preparing compression...");
    setCompressedFiles([]);

    try {
      const compressed: CompressedFile[] = [];
      
      const steps = [
        { message: "Analyzing PDF structure...", progress: 15 },
        { message: "Optimizing images...", progress: 35 },
        { message: "Compressing content streams...", progress: 55 },
        { message: "Removing unnecessary data...", progress: 75 },
        { message: "Finalizing compression...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        setProgressMessage(`Compressing ${file.file.name}...`);
        
        // Perform actual PDF compression
        const compressedBytes = await pdfProcessor.compressPdf(file.file, {
          compressionLevel: compressionLevel as 'low' | 'balanced' | 'high' | 'maximum',
          imageQuality: imageQuality[0],
          removeMetadata
        });
        
        const originalSize = file.file.size;
        const compressedSize = compressedBytes.length;
        const compressionRatio = Math.round(((originalSize - compressedSize) / originalSize) * 100);
        
        // Create a blob URL for the compressed PDF
        const blob = new Blob([compressedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        compressed.push({
          name: file.file.name.replace('.pdf', '_compressed.pdf'),
          url,
          originalSize,
          compressedSize,
          compressionRatio,
          bytes: compressedBytes
        });
      }
      
      setCompressedFiles(compressed);
      setProgress(100);
      setProgressMessage("Compression completed!");
      
      const totalReduction = compressed.reduce((acc, file) => acc + (file.originalSize - file.compressedSize), 0);
      const avgReduction = Math.round((totalReduction / compressed.reduce((acc, file) => acc + file.originalSize, 0)) * 100);
      
      toast.success(`Successfully compressed ${files.length} PDF file${files.length > 1 ? 's' : ''}! Average ${avgReduction}% size reduction achieved.`);
      
    } catch (error) {
      console.error('Compression error:', error);
      toast.error(error instanceof Error ? error.message : "Compression failed. Please try again.");
    } finally {
      setCompressing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadFile = (file: CompressedFile) => {
    try {
      // Use FileSaver.js to ensure proper download with correct MIME type
      const blob = new Blob([file.bytes], { type: 'application/pdf' });
      saveAs(blob, file.name);
      toast.success(`Downloaded ${file.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download file. Please try again.");
    }
  };

  const downloadAll = () => {
    compressedFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 500);
    });
    toast.success(`Downloading ${compressedFiles.length} files...`);
  };

  const clearAll = () => {
    setFiles([]);
    setCompressedFiles([]);
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
  const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Minimize2 className="h-4 w-4 mr-2" />
          PDF Compression Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Compress PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Reduce PDF file sizes while maintaining quality. Advanced compression algorithms optimize images, remove metadata, and streamline content.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-purple-400 transition-all duration-300">
        <CardContent className="p-8">
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
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Reduce file size while maintaining quality
            </p>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
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

      {/* Compression Settings */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Compression Settings
            </CardTitle>
            <CardDescription>
              Configure compression options to balance file size and quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Compression Level</Label>
                <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compression level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(compressionOptions).map(([key, option]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-gray-500">{option.description}</span>
                        </div>
                      </SelectItem>
                    ))}
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
                  Lower values = smaller files, higher values = better quality
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Advanced Options</h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="removeMetadata"
                  checked={removeMetadata}
                  onChange={(e) => setRemoveMetadata(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="removeMetadata">Remove metadata and unused objects</Label>
              </div>
            </div>

            {/* Compression Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Estimated Compression</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Original Size</p>
                  <p className="font-medium">{formatFileSize(totalSize)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estimated Size</p>
                  <p className="font-medium text-green-600">
                    {formatFileSize(totalSize * (1 - compressionOptions[compressionLevel as keyof typeof compressionOptions].reduction))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Size Reduction</p>
                  <p className="font-medium text-purple-600">
                    ~{Math.round(compressionOptions[compressionLevel as keyof typeof compressionOptions].reduction * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Files</p>
                  <p className="font-medium">{files.length} PDF{files.length > 1 ? 's' : ''}</p>
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

      {/* Compression Progress */}
      {compressing && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Compressing PDFs</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Compressing ${files.length} PDF file${files.length > 1 ? 's' : ''}...`}
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

      {/* Compressed Files */}
      {compressedFiles.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Compressed Files ({compressedFiles.length})
                </CardTitle>
                <CardDescription>
                  Your PDF files have been compressed successfully
                </CardDescription>
              </div>
              {compressedFiles.length > 1 && (
                <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compressedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm group">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                    <Minimize2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        -{file.compressionRatio}%
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatFileSize(file.originalSize)} → {formatFileSize(file.compressedSize)}</span>
                      <span className="text-green-600 font-medium">
                        Saved {formatFileSize(file.originalSize - file.compressedSize)}
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
          onClick={compressPdfs}
          disabled={files.length === 0 || compressing}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold"
          size="lg"
        >
          {compressing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Compressing...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Compress {files.length} PDF{files.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to compress PDFs:</strong> Upload PDF files, choose your compression level and quality settings, then click "Compress PDFs" to reduce file sizes while maintaining document quality.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CompressPdfPage;