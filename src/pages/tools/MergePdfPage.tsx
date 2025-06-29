import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, X, ArrowUp, ArrowDown, Eye, Loader2, CheckCircle, AlertCircle, Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize, type PdfInfo } from "@/lib/pdfUtils";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { analyzePdfContent } from "@/lib/aiUtils";

interface PdfFile {
  id: string;
  file: File;
  info?: PdfInfo;
  size: string;
}

interface AiAnalysis {
  suggestedFilename: string;
  summary: string;
  duplicatePages: string;
  isLoading: boolean;
}

const MergePdfPage = () => {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedFileUrl, setMergedFileUrl] = useState<string | null>(null);
  const [mergedFileName, setMergedFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysis>({
    suggestedFilename: "",
    summary: "",
    duplicatePages: "",
    isLoading: false
  });
  const [customFileName, setCustomFileName] = useState("");
  
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
      const newFiles: PdfFile[] = [];
      
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

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setFiles(prev => {
      const index = prev.findIndex(file => file.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newFiles = [...prev];
      [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
      return newFiles;
    });
  };

  const shuffleFiles = () => {
    setFiles(prev => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    toast.success("Files shuffled");
  };

  const analyzeWithAI = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to analyze");
      return;
    }
    
    setAiAnalysis(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Extract file names for context
      const fileNames = files.map(f => f.file.name);
      const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);
      
      // Call the AI analysis function
      const analysis = await analyzePdfContent(fileNames, totalPages);
      
      setAiAnalysis({
        ...analysis,
        isLoading: false
      });
      
      // Set the suggested filename as the custom filename
      setCustomFileName(analysis.suggestedFilename);
      
      toast.success("AI analysis completed successfully");
    } catch (error) {
      console.error('AI analysis error:', error);
      toast.error("Failed to analyze PDFs with AI. Using default options.");
      setAiAnalysis({
        suggestedFilename: "merged-document.pdf",
        summary: "Unable to generate summary.",
        duplicatePages: "Unable to detect duplicates.",
        isLoading: false
      });
    }
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge");
      return;
    }
    
    setMerging(true);
    setProgress(0);
    setProgressMessage("Preparing to merge PDFs...");
    
    try {
      // Progress simulation with real processing
      const steps = [
        { message: "Analyzing PDF files...", progress: 20 },
        { message: "Loading PDF documents...", progress: 40 },
        { message: "Merging pages...", progress: 60 },
        { message: "Optimizing merged PDF...", progress: 80 },
        { message: "Finalizing document...", progress: 95 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setProgressMessage("Creating merged PDF...");
      setProgress(98);

      // Perform actual PDF merge
      const mergedPdfBytes = await pdfProcessor.mergePdfs(files.map(f => f.file));
      
      setProgress(100);
      setProgressMessage("Merge completed!");

      // Create download URL
      const url = pdfProcessor.createDownloadLink(mergedPdfBytes, 'merged-document.pdf');
      const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);
      
      // Use custom filename if provided, otherwise use AI suggestion or default
      const fileName = customFileName || aiAnalysis.suggestedFilename || `merged-document-${files.length}-files-${totalPages}-pages.pdf`;
      
      setMergedFileUrl(url);
      setMergedFileName(fileName);
      
      toast.success(`Successfully merged ${files.length} PDF files into one document!`);
      
    } catch (error) {
      console.error('Merge error:', error);
      toast.error(error instanceof Error ? error.message : "Merge failed. Please try again.");
    } finally {
      setMerging(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadMerged = () => {
    if (mergedFileUrl && mergedFileName) {
      const link = document.createElement('a');
      link.href = mergedFileUrl;
      link.download = mergedFileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Merged PDF downloaded successfully!");
    }
  };

  const clearAll = () => {
    setFiles([]);
    setMergedFileUrl(null);
    setMergedFileName(null);
    setAiAnalysis({
      suggestedFilename: "",
      summary: "",
      duplicatePages: "",
      isLoading: false
    });
    setCustomFileName("");
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
  const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileText className="h-4 w-4 mr-2" />
          PDF Merge Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Merge PDF Files</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Combine multiple PDF documents into one seamless file. Drag to reorder, preview pages, and create professional merged documents.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300">
        <CardContent className="p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-blue-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Select multiple PDF files to merge into one document
            </p>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={shuffleFiles}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Shuffle
                </Button>
                <Button variant="outline" size="sm" onClick={clearAll}>
                  Clear All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, index) => (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(file.id, 'up')}
                        disabled={index === 0}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveFile(file.id, 'down')}
                        disabled={index === files.length - 1}
                        className="h-6 w-6 p-0"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                    
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
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Analysis */}
      {files.length >= 2 && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                AI-Powered Document Analysis
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={analyzeWithAI}
                disabled={aiAnalysis.isLoading}
                className="bg-purple-100 border-purple-200 text-purple-700 hover:bg-purple-200"
              >
                {aiAnalysis.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze with AI
                  </>
                )}
              </Button>
            </div>
            <CardDescription>
              Let AI analyze your PDFs to suggest a filename, summarize content, and detect duplicates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {aiAnalysis.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
              </div>
            ) : (
              <>
                {(aiAnalysis.suggestedFilename || aiAnalysis.summary || aiAnalysis.duplicatePages) ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-purple-800">Suggested Filename</Label>
                      <div className="flex gap-2">
                        <Input 
                          value={customFileName || aiAnalysis.suggestedFilename} 
                          onChange={(e) => setCustomFileName(e.target.value)}
                          className="border-purple-200 bg-white"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-purple-800">Document Summary</Label>
                      <div className="p-3 bg-white rounded-md border border-purple-200">
                        <p className="text-gray-700">{aiAnalysis.summary}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-purple-800">Potential Duplicate Pages</Label>
                      <div className="p-3 bg-white rounded-md border border-purple-200">
                        <p className="text-gray-700">{aiAnalysis.duplicatePages}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-white rounded-lg border border-purple-200">
                    <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-purple-800 mb-2">Enhance Your PDF Merge</h3>
                    <p className="text-gray-600 mb-4">
                      Click "Analyze with AI" to get intelligent suggestions for your merged document.
                    </p>
                    <Button 
                      onClick={analyzeWithAI}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Analyze with AI
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Merge Progress */}
      {merging && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Merging PDF Files</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Combining ${files.length} files into one document...`}
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

      {/* Success Result */}
      {mergedFileUrl && mergedFileName && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Merge Completed Successfully!
                </h3>
                <p className="text-green-700 mb-2">{mergedFileName}</p>
                <p className="text-sm text-green-600">
                  Combined {files.length} PDF files • {totalPages} total pages • {formatFileSize(totalSize)}
                </p>
              </div>
              <Button
                onClick={downloadMerged}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Merged PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={mergePdfs}
          disabled={files.length < 2 || merging}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
          size="lg"
        >
          {merging ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Merging PDFs...
            </>
          ) : (
            <>
              <FileText className="h-5 w-5 mr-2" />
              Merge {files.length} PDF{files.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to merge PDFs:</strong> Upload multiple PDF files, arrange them in your desired order by using the arrow buttons, then click "Merge PDFs" to combine them into a single document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MergePdfPage;