
import { useState } from "react";
import { Upload, FileText, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const MergePdfPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedFile, setMergedFile] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    setFiles(prev => [...prev, ...pdfFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergePdfs = async () => {
    if (files.length < 2) return;
    
    setMerging(true);
    setProgress(0);
    
    // Simulate merging process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }
    
    // Create a dummy merged file URL
    setMergedFile(`merged-document-${Date.now()}.pdf`);
    setMerging(false);
  };

  const downloadMerged = () => {
    // In a real implementation, this would download the actual merged PDF
    const link = document.createElement('a');
    link.href = '#';
    link.download = mergedFile || 'merged-document.pdf';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Merge PDF</h1>
        <p className="text-gray-600 mt-2">Combine multiple PDF files into one document</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF Files
          </CardTitle>
          <CardDescription>
            Select multiple PDF files to merge into one document
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = Array.from(e.dataTransfer.files);
              const pdfFiles = droppedFiles.filter(file => file.type === 'application/pdf');
              setFiles(prev => [...prev, ...pdfFiles]);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop PDF files here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <Button asChild>
              <label htmlFor="pdf-upload" className="cursor-pointer">
                Select PDF Files
              </label>
            </Button>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files ({files.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {merging && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Merging PDFs...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {mergedFile && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Merge Completed!</p>
                    <p className="text-sm text-green-600">{mergedFile}</p>
                  </div>
                </div>
                <Button onClick={downloadMerged} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={mergePdfs} 
              disabled={files.length < 2 || merging}
              className="w-full"
            >
              {merging ? 'Merging...' : `Merge ${files.length} PDF${files.length !== 1 ? 's' : ''}`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MergePdfPage;
