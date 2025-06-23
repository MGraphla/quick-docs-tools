
import { useState, useRef } from "react";
import { Upload, FileDown, Download, Loader2, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const PowerpointToPdfPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<Array<{ name: string; url: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => 
      file.type === "application/vnd.ms-powerpoint" || 
      file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Please select only PowerPoint files (.ppt, .pptx)");
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

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast.error("Please select PowerPoint files to convert");
      return;
    }

    setConverting(true);
    setProgress(0);

    try {
      const converted = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        
        // Simulate conversion process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Create a mock PDF blob
        const pdfContent = `PDF converted from ${file.name}`;
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        converted.push({
          name: file.name.replace(/\.(ppt|pptx)$/i, '.pdf'),
          url
        });
      }
      
      setConvertedFiles(converted);
      toast.success(`Successfully converted ${files.length} PowerPoint file(s) to PDF`);
      
    } catch (error) {
      toast.error("Conversion failed. Please try again.");
    } finally {
      setConverting(false);
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

  const downloadAll = () => {
    convertedFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 500);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PowerPoint to PDF</h1>
        <p className="text-gray-600 mt-2">Convert your PowerPoint presentations to PDF format</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PowerPoint Files
          </CardTitle>
          <CardDescription>
            Select PowerPoint files (.ppt, .pptx) to convert to PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg mb-2">Drop PowerPoint files here or click to browse</p>
            <p className="text-gray-500">Supports .ppt and .pptx files</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Selected Files ({files.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
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

          {converting && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Converting...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <Button 
              onClick={convertToPdf} 
              disabled={files.length === 0 || converting}
              className="flex-1"
            >
              {converting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  Convert to PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {convertedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Converted Files</CardTitle>
            <CardDescription>
              Your PowerPoint files have been converted to PDF
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convertedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-600" />
                    <span className="font-medium">{file.name}</span>
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
            {convertedFiles.length > 1 && (
              <Button onClick={downloadAll} className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download All ({convertedFiles.length} files)
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PowerpointToPdfPage;
