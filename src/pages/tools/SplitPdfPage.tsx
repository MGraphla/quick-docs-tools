import { useState, useRef, useCallback } from "react";
import { Upload, Download, Loader2, FileText, Scissors, Eye, CheckCircle, AlertCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface SplitFile {
  name: string;
  url: string;
  pages: string;
  size: string;
  preview?: string;
}

const SplitPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [splitting, setSplitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitMethod, setSplitMethod] = useState("pages");
  const [pageRanges, setPageRanges] = useState("");
  const [pagesPerFile, setPagesPerFile] = useState("1");
  const [customRanges, setCustomRanges] = useState<string[]>([]);
  const [splitFiles, setSplitFiles] = useState<SplitFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }
    
    setFile(selectedFile);
    setSplitFiles([]);
    // Simulate PDF analysis
    const mockPages = Math.floor(Math.random() * 50) + 5;
    setTotalPages(mockPages);
    toast.success(`PDF loaded: ${mockPages} pages detected`);
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

  const removeFile = () => {
    setFile(null);
    setSplitFiles([]);
    setTotalPages(0);
    toast.success("File removed");
  };

  const addCustomRange = () => {
    setCustomRanges(prev => [...prev, "1-1"]);
  };

  const updateCustomRange = (index: number, value: string) => {
    setCustomRanges(prev => prev.map((range, i) => i === index ? value : range));
  };

  const removeCustomRange = (index: number) => {
    setCustomRanges(prev => prev.filter((_, i) => i !== index));
  };

  const validatePageRange = (range: string): boolean => {
    const rangePattern = /^\d+(-\d+)?$/;
    if (!rangePattern.test(range)) return false;
    
    const [start, end] = range.split('-').map(Number);
    if (end && start > end) return false;
    if (start > totalPages || (end && end > totalPages)) return false;
    
    return true;
  };

  const splitPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file to split");
      return;
    }

    // Validation based on split method
    if (splitMethod === "ranges") {
      if (customRanges.length === 0) {
        toast.error("Please add at least one page range");
        return;
      }
      
      const invalidRanges = customRanges.filter(range => !validatePageRange(range));
      if (invalidRanges.length > 0) {
        toast.error("Please check your page ranges. Some ranges are invalid.");
        return;
      }
    }

    if (splitMethod === "pages" && (!pagesPerFile || parseInt(pagesPerFile) < 1)) {
      toast.error("Please specify a valid number of pages per file");
      return;
    }

    setSplitting(true);
    setProgress(0);

    try {
      let splits: SplitFile[] = [];
      
      // Simulate splitting process with realistic progress
      const steps = [
        { message: "Analyzing PDF structure...", progress: 15 },
        { message: "Extracting pages...", progress: 40 },
        { message: "Creating split documents...", progress: 70 },
        { message: "Optimizing files...", progress: 90 },
        { message: "Finalizing split...", progress: 100 }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setProgress(step.progress);
      }
      
      if (splitMethod === "pages") {
        const pagesPerSplit = parseInt(pagesPerFile);
        const numberOfSplits = Math.ceil(totalPages / pagesPerSplit);
        
        for (let i = 0; i < numberOfSplits; i++) {
          const startPage = i * pagesPerSplit + 1;
          const endPage = Math.min((i + 1) * pagesPerSplit, totalPages);
          const pageCount = endPage - startPage + 1;
          const estimatedSize = Math.floor((file.size / totalPages) * pageCount);
          
          splits.push({
            name: `${file.name.replace('.pdf', '')}_part_${i + 1}.pdf`,
            url: '#',
            pages: `${startPage}-${endPage}`,
            size: formatFileSize(estimatedSize)
          });
        }
      } else if (splitMethod === "ranges") {
        customRanges.forEach((range, index) => {
          const [start, end] = range.split('-').map(Number);
          const pageCount = end ? (end - start + 1) : 1;
          const estimatedSize = Math.floor((file.size / totalPages) * pageCount);
          
          splits.push({
            name: `${file.name.replace('.pdf', '')}_pages_${range.replace('-', '_to_')}.pdf`,
            url: '#',
            pages: range,
            size: formatFileSize(estimatedSize)
          });
        });
      } else if (splitMethod === "individual") {
        for (let i = 1; i <= totalPages; i++) {
          const estimatedSize = Math.floor(file.size / totalPages);
          
          splits.push({
            name: `${file.name.replace('.pdf', '')}_page_${i}.pdf`,
            url: '#',
            pages: i.toString(),
            size: formatFileSize(estimatedSize)
          });
        }
      }
      
      setSplitFiles(splits);
      toast.success(`Successfully split PDF into ${splits.length} files`);
      
    } catch (error) {
      toast.error("Split failed. Please try again.");
    } finally {
      setSplitting(false);
      setProgress(0);
    }
  };

  const downloadFile = (file: SplitFile) => {
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
    splitFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 500);
    });
    toast.success(`Downloading ${splitFiles.length} files...`);
  };

  const getMethodDescription = () => {
    switch (splitMethod) {
      case "pages":
        return `Split into files with ${pagesPerFile} page${parseInt(pagesPerFile) > 1 ? 's' : ''} each`;
      case "ranges":
        return `Split into ${customRanges.length} custom range${customRanges.length > 1 ? 's' : ''}`;
      case "individual":
        return `Split into ${totalPages} individual page files`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Scissors className="h-4 w-4 mr-2" />
          PDF Split Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Split PDF Files</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Extract specific pages or split your PDF into multiple documents with precision control and custom page ranges.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-all duration-300">
        <CardContent className="p-8">
          <div
            className={`text-center transition-all duration-300 ${
              dragOver ? 'scale-105 bg-green-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF file here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Select one PDF file to split into multiple documents
            </p>
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
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

      {/* File Info */}
      {file && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selected File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg">
                <FileText className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">{file.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{totalPages} pages</span>
                  <span>{formatFileSize(file.size)}</span>
                  <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Split Configuration */}
      {file && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Split Configuration
            </CardTitle>
            <CardDescription>
              Choose how you want to split your PDF document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={splitMethod} onValueChange={setSplitMethod}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pages">By Pages</TabsTrigger>
                <TabsTrigger value="ranges">Page Ranges</TabsTrigger>
                <TabsTrigger value="individual">Individual Pages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pages" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pagesPerFile">Pages per file</Label>
                    <Input
                      id="pagesPerFile"
                      type="number"
                      value={pagesPerFile}
                      onChange={(e) => setPagesPerFile(e.target.value)}
                      placeholder="e.g., 1, 2, 5"
                      min="1"
                      max={totalPages}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of pages to include in each split file
                    </p>
                  </div>
                  <div className="flex items-end">
                    <div className="bg-blue-50 p-3 rounded-lg w-full">
                      <p className="text-sm font-medium text-blue-800">
                        Will create: {Math.ceil(totalPages / parseInt(pagesPerFile || "1"))} files
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="ranges" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Custom Page Ranges</Label>
                    <Button onClick={addCustomRange} size="sm" variant="outline">
                      Add Range
                    </Button>
                  </div>
                  
                  {customRanges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No ranges defined. Click "Add Range" to start.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {customRanges.map((range, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <Input
                            value={range}
                            onChange={(e) => updateCustomRange(index, e.target.value)}
                            placeholder="e.g., 1-5, 10, 15-20"
                            className={`flex-1 ${
                              !validatePageRange(range) ? 'border-red-300 bg-red-50' : ''
                            }`}
                          />
                          <Button
                            onClick={() => removeCustomRange(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Examples: "1-3" (pages 1 to 3), "5" (page 5 only), "10-15" (pages 10 to 15)
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="individual" className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Individual Page Split</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        This will create {totalPages} separate PDF files, one for each page in the document.
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Split Summary */}
            {getMethodDescription() && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Split Summary</h4>
                <p className="text-gray-600">{getMethodDescription()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Split Progress */}
      {splitting && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Splitting PDF</h3>
              <p className="text-gray-600 mb-4">
                Processing {totalPages} pages...
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

      {/* Split Results */}
      {splitFiles.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Split Files ({splitFiles.length})
                </CardTitle>
                <CardDescription>
                  Your PDF has been split successfully
                </CardDescription>
              </div>
              {splitFiles.length > 1 && (
                <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {splitFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Pages: {file.pages}</span>
                      <span>{file.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
      {file && (
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={splitPdf}
            disabled={splitting}
            className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white py-3 text-lg font-semibold"
            size="lg"
          >
            {splitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Splitting PDF...
              </>
            ) : (
              <>
                <Scissors className="h-5 w-5 mr-2" />
                Split PDF
              </>
            )}
          </Button>
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to split PDFs:</strong> Upload a PDF file, choose your split method (by pages, custom ranges, or individual pages), configure your settings, then click "Split PDF" to create multiple documents.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SplitPdfPage;