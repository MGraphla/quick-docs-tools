
import { useState, useRef } from "react";
import { Upload, Download, Loader2, FileText, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const CompressPdfPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [compressionLevel, setCompressionLevel] = useState("medium");
  const [compressedFiles, setCompressedFiles] = useState<Array<{ 
    name: string; 
    url: string; 
    originalSize: number;
    compressedSize: number;
  }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressionOptions = {
    low: { label: "Low Compression", reduction: 0.2 },
    medium: { label: "Medium Compression", reduction: 0.5 },
    high: { label: "High Compression", reduction: 0.7 },
    maximum: { label: "Maximum Compression", reduction: 0.85 }
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => 
      file.type === "application/pdf"
    );
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Please select only PDF files");
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const compressPdfs = async () => {
    if (files.length === 0) {
      toast.error("Please select PDF files to compress");
      return;
    }

    setCompressing(true);
    setProgress(0);

    try {
      const compressed = [];
      const reduction = compressionOptions[compressionLevel as keyof typeof compressionOptions].reduction;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        
        // Simulate compression process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a mock compressed PDF
        const originalSize = file.size;
        const compressedSize = Math.floor(originalSize * (1 - reduction));
        
        // Create a smaller blob to simulate compression
        const compressedContent = `Compressed PDF: ${file.name}`;
        const blob = new Blob([compressedContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        compressed.push({
          name: file.name.replace('.pdf', '_compressed.pdf'),
          url,
          originalSize,
          compressedSize
        });
      }
      
      setCompressedFiles(compressed);
      const totalReduction = compressed.reduce((acc, file) => acc + (file.originalSize - file.compressedSize), 0);
      const reductionPercent = Math.round((totalReduction / compressed.reduce((acc, file) => acc + file.originalSize, 0)) * 100);
      
      toast.success(`Successfully compressed ${files.length} PDF file(s). ${reductionPercent}% size reduction achieved!`);
      
    } catch (error) {
      toast.error("Compression failed. Please try again.");
    } finally {
      setCompressing(false);
      setProgress(0);
    }
  };

  const downloadFile = (file: { name: string; url: string }) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compress PDF</h1>
        <p className="text-gray-600 mt-2">Reduce the file size of your PDF documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Minimize2 className="h-5 w-5" />
            Upload PDF Files
          </CardTitle>
          <CardDescription>
            Select PDF files to compress and reduce their file size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Compression Level</label>
              <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select compression level" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(compressionOptions).map(([key, option]) => (
                    <SelectItem key={key} value={key}>
                      {option.label} ({Math.round(option.reduction * 100)}% reduction)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg mb-2">Drop PDF files here or click to browse</p>
              <p className="text-gray-500">Reduce file size while maintaining quality</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {compressing && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Compressing...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="mt-6">
            <Button 
              onClick={compressPdfs} 
              disabled={files.length === 0 || compressing}
              className="w-full"
            >
              {compressing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Compressing...
                </>
              ) : (
                <>
                  <Minimize2 className="h-4 w-4 mr-2" />
                  Compress PDFs
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {compressedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compressed Files</CardTitle>
            <CardDescription>
              Your PDF files have been compressed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {compressedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-5 w-5 text-red-600" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-8">
                      Original: {formatFileSize(file.originalSize)} → 
                      Compressed: {formatFileSize(file.compressedSize)} 
                      ({Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100)}% reduction)
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(file)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompressPdfPage;
