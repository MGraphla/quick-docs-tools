import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, Settings, Zap, X, Save, ListOrdered, ListChecks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize, parsePageRanges } from "@/lib/pdfUtils";
import { suggestSplitFileNames } from "@/lib/aiUtils";

interface SplitFile {
  name: string;
  url: string;
  size: string;
  suggestedName?: string;
}

const SplitPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [splitType, setSplitType] = useState("range");
  const [pageRanges, setPageRanges] = useState("");
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [useAiNames, setUseAiNames] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customFileNames, setCustomFileNames] = useState<{[key: number]: string}>({});
  
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
      setSplitFiles([]);
      setSelectedPages([]);
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

  const handlePageSelect = (pageNumber: number) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(page => page !== pageNumber);
      } else {
        return [...prev, pageNumber];
      }
    });
  };

  const updateCustomFileName = (index: number, name: string) => {
    setCustomFileNames(prev => ({
      ...prev,
      [index]: name
    }));
  };

  const splitPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (splitType === "range" && !pageRanges.trim()) {
      toast.error("Please enter page ranges");
      return;
    }

    if (splitType === "pages" && selectedPages.length === 0) {
      toast.error("Please select pages to extract");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to split PDF...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 20 },
        { message: "Processing page ranges...", progress: 40 },
        { message: "Creating split documents...", progress: 60 },
        { message: "Finalizing files...", progress: 80 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      let ranges: { start: number; end: number; }[] = [];
      
      if (splitType === "range") {
        ranges = parsePageRanges(pageRanges, fileInfo.pages);
      } else if (splitType === "pages") {
        ranges = selectedPages.map(page => ({ start: page, end: page }));
      } else if (splitType === "every") {
        for (let i = 1; i <= fileInfo.pages; i++) {
          ranges.push({ start: i, end: i });
        }
      }

      if (ranges.length === 0) {
        throw new Error("No valid page ranges specified");
      }

      // Get AI-suggested file names if enabled
      let suggestedNames: string[] = [];
      if (useAiNames) {
        setIsAnalyzing(true);
        setProgressMessage("Analyzing content for intelligent naming...");
        try {
          suggestedNames = await suggestSplitFileNames(file.name, fileInfo.pages, ranges);
        } catch (error) {
          console.error('Error getting AI file names:', error);
          suggestedNames = ranges.map((_, index) => `split-${index + 1}-${file.name}`);
        }
        setIsAnalyzing(false);
      } else {
        suggestedNames = ranges.map((_, index) => `split-${index + 1}-${file.name}`);
      }

      const results = await pdfProcessor.splitPdf(file, ranges);
      
      const splitFiles = results.map((data, index) => {
        // Use custom filename if provided, otherwise use AI suggestion
        const fileName = customFileNames[index] || suggestedNames[index] || `split-${index + 1}-${file.name}`;
        
        return {
          name: fileName,
          url: pdfProcessor.createDownloadLink(data, fileName),
          size: formatFileSize(data.length),
          suggestedName: suggestedNames[index]
        };
      });
      
      setSplitFiles(splitFiles);
      setProgress(100);
      setProgressMessage("Split completed!");
      toast.success(`PDF split into ${splitFiles.length} files!`);
      
    } catch (error) {
      console.error('Split error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to split PDF. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadSplitFile = (splitFile: SplitFile) => {
    const link = document.createElement('a');
    link.href = splitFile.url;
    link.download = splitFile.name;
    link.click();
    toast.success(`Downloaded ${splitFile.name}`);
  };

  const downloadAllFiles = () => {
    splitFiles.forEach((file, index) => {
      setTimeout(() => downloadSplitFile(file), index * 500);
    });
    toast.success(`Downloading ${splitFiles.length} files...`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <ListOrdered className="h-4 w-4 mr-2" />
          PDF Split Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Split PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Extract specific pages or create individual files from each page of your PDF document.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-orange-400 transition-all duration-300">
          <CardContent className="p-8">
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
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to split into multiple documents
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

      {/* PDF Split Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Split Settings */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{fileInfo.pages} pages</span>
                        <span>•</span>
                        <span>{fileInfo.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Split Settings</CardTitle>
                <CardDescription>
                  Configure how you want to split your PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={splitType} onValueChange={setSplitType}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="range" className="flex items-center gap-1">
                      <ListOrdered className="h-4 w-4" />
                      Range
                    </TabsTrigger>
                    <TabsTrigger value="pages" className="flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      Pages
                    </TabsTrigger>
                    <TabsTrigger value="every" className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      Every
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="range" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Page Ranges</Label>
                      <Input
                        placeholder="e.g., 1-3, 5, 7-9"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        Enter page numbers or ranges separated by commas
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pages" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Pages</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                        {Array.from({ length: fileInfo.pages }, (_, i) => i + 1).map(pageNumber => (
                          <div key={pageNumber} className="flex items-center space-x-2">
                            <Checkbox
                              id={`page-${pageNumber}`}
                              checked={selectedPages.includes(pageNumber)}
                              onCheckedChange={() => handlePageSelect(pageNumber)}
                            />
                            <Label htmlFor={`page-${pageNumber}`}>{pageNumber}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="every" className="space-y-4">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        This option will split the PDF into individual pages, creating a separate file for each page.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                <div className="mt-4 space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-ai-names"
                      checked={useAiNames}
                      onCheckedChange={(checked) => setUseAiNames(checked as boolean)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="use-ai-names" className="flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        Use AI to name split files
                      </Label>
                      <p className="text-xs text-gray-500">
                        AI will analyze content and suggest meaningful names for each file
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={splitPdf}
                  disabled={processing || isAnalyzing}
                  className="w-full mt-4 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
                >
                  {processing || isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {isAnalyzing ? "Analyzing..." : "Splitting..."}
                    </>
                  ) : (
                    <>
                      <ListOrdered className="h-5 w-5 mr-2" />
                      Split PDF
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Split Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Processing Progress */}
            {processing && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-orange-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Splitting PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Splitting your document into multiple files..."}
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

            {/* Split Files */}
            {splitFiles.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Split Results</CardTitle>
                    {splitFiles.length > 1 && (
                      <Button 
                        onClick={downloadAllFiles}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download All
                      </Button>
                    )}
                  </div>
                  <CardDescription>
                    Download your split PDF files with intelligent naming
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {splitFiles.map((splitFile, index) => (
                      <Card key={index} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                              <FileText className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="flex-1">
                              <div className="space-y-2">
                                <Input
                                  value={customFileNames[index] || splitFile.name}
                                  onChange={(e) => updateCustomFileName(index, e.target.value)}
                                  className="font-medium text-gray-900"
                                />
                                {splitFile.suggestedName && splitFile.suggestedName !== splitFile.name && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Sparkles className="h-3 w-3 text-orange-500" />
                                    <span>AI suggested: {splitFile.suggestedName}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {splitFile.size}
                              </div>
                            </div>
                            <Button
                              onClick={() => downloadSplitFile(splitFile)}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Naming Information */}
            {!splitFiles.length && (
              <Card className="border-orange-200 bg-orange-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-orange-600" />
                    Intelligent File Naming
                  </CardTitle>
                  <CardDescription>
                    Our AI can analyze your PDF content to generate meaningful names for split files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-white rounded-lg border border-orange-200">
                    <h3 className="text-lg font-medium text-orange-800 mb-4">Named Split Files</h3>
                    <p className="text-gray-700 mb-4">
                      When a PDF is split into multiple files, our AI can generate relevant names for each file based on content:
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500" />
                        <p className="text-gray-600">Instead of generic names like "part1.pdf", "part2.pdf"...</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <p className="text-gray-600">Get meaningful names like "Chapter 1 - Introduction.pdf", "Financial Statements.pdf"</p>
                      </div>
                    </div>
                    <div className="bg-orange-100 p-4 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <strong>How it works:</strong> Our AI analyzes the content of each section to determine what it contains, then generates appropriate file names based on that analysis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to split a PDF:</strong> Upload a PDF file, choose a split method (by range, specific pages, or every page), then click "Split PDF" to create your split documents.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SplitPdfPage;