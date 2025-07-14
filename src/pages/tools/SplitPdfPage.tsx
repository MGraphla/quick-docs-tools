import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Loader2, CheckCircle, AlertCircle, Settings, Zap, X, Save, ListOrdered, ListChecks } from "lucide-react";
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

interface SplitFile {
  name: string;
  url: string;
  size: string;
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

      let pages: number[] = [];
      
      if (splitType === "range") {
        pages = parsePageRanges(pageRanges);
      } else if (splitType === "pages") {
        pages = selectedPages;
      } else if (splitType === "every") {
        if (fileInfo) {
          pages = Array.from({ length: fileInfo.pages }, (_, i) => i + 1);
        }
      }

      const results = await pdfProcessor.splitPdf(file, pages);
      
      const splitFiles = results.map((data, index) => ({
        name: `split-${index + 1}-${file.name}`,
        url: pdfProcessor.createDownloadLink(data, `split-${index + 1}-${file.name}`),
        size: formatFileSize(data.length)
      }));
      
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

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <ListOrdered className="h-4 w-4 mr-2" />
          PDF Split Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Split PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Extract specific pages or create individual files from each page of your PDF document.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Split Settings */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-orange-50 p-3 rounded-lg">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-lg">
                      <FileText className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                          {fileInfo.pages} pages
                        </Badge>
                        <span>•</span>
                        <span>{fileInfo.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                  Split Settings
                </CardTitle>
                <CardDescription>
                  Configure how you want to split your PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={splitType} onValueChange={setSplitType} className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4 w-full">
                    <TabsTrigger value="range" className="flex items-center gap-1">
                      <ListOrdered className="h-4 w-4" />
                      <span className="hidden sm:inline">Range</span>
                    </TabsTrigger>
                    <TabsTrigger value="pages" className="flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      <span className="hidden sm:inline">Pages</span>
                    </TabsTrigger>
                    <TabsTrigger value="every" className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      <span className="hidden sm:inline">Every</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="range" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Page Ranges</Label>
                      <Input
                        placeholder="e.g., 1-3, 5, 7-9"
                        value={pageRanges}
                        onChange={(e) => setPageRanges(e.target.value)}
                        className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                      />
                      <p className="text-xs text-gray-500">
                        Enter page numbers or ranges separated by commas
                      </p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pages" className="space-y-4">
                    <div className="space-y-2">
                      <Label className="flex items-center justify-between">
                        <span>Select Pages</span>
                        <span className="text-xs text-orange-600 font-medium">
                          {selectedPages.length} selected
                        </span>
                      </Label>
                      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
                        {Array.from({ length: fileInfo.pages }, (_, i) => i + 1).map(pageNumber => (
                          <div 
                            key={pageNumber} 
                            className={`flex items-center justify-center h-8 rounded-md cursor-pointer transition-colors ${
                              selectedPages.includes(pageNumber) 
                                ? 'bg-orange-500 text-white' 
                                : 'bg-gray-100 hover:bg-orange-100 text-gray-700'
                            }`}
                            onClick={() => handlePageSelect(pageNumber)}
                          >
                            {pageNumber}
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
                    <div className="flex items-center justify-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-center">
                        <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">
                          Will create {fileInfo.pages} individual PDF files
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={splitPdf}
                  disabled={processing}
                  className="w-full mt-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Splitting...
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
          <div className="lg:col-span-8 space-y-6">
            {/* Processing Progress */}
            {processing && (
              <Card className="border-orange-200 shadow-sm">
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
                      <Progress value={progress} className="h-2 bg-orange-100" indicatorClassName="bg-orange-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Split Files */}
            {splitFiles.length > 0 ? (
              <Card className="border-green-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Split Results
                  </CardTitle>
                  <CardDescription>
                    Your PDF has been split into {splitFiles.length} files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {splitFiles.map((splitFile, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                            <FileText className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate">{splitFile.name}</h4>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">{splitFile.size}</Badge>
                          </div>
                        </div>
                        <Button
                          onClick={() => downloadSplitFile(splitFile)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              !processing && file && (
                <Card className="border-orange-100 shadow-sm h-full flex flex-col justify-center">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                        <ListOrdered className="h-8 w-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Ready to Split</h3>
                      <p className="text-gray-600 mb-4 max-w-md mx-auto">
                        Configure your split settings on the left and click "Split PDF" to extract pages from your document.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
                          <ListOrdered className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium">Split by range</span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
                          <ListChecks className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium">Select specific pages</span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-50 p-3 rounded-lg">
                          <Zap className="h-5 w-5 text-orange-600" />
                          <span className="text-sm font-medium">Split every page</span>
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
            <strong>How to split a PDF:</strong> Upload a PDF file, choose a split method (by range, specific pages, or every page), then click "Split PDF" to create your split documents.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SplitPdfPage;