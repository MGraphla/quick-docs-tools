
import { useState, useRef } from "react";
import { Upload, Download, Loader2, FileText, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const SplitPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [splitting, setSplitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [splitMethod, setSplitMethod] = useState("pages");
  const [pageRanges, setPageRanges] = useState("");
  const [pagesPerFile, setPagesPerFile] = useState("1");
  const [splitFiles, setSplitFiles] = useState<Array<{ name: string; url: string; pages: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      return;
    }
    
    setFile(selectedFile);
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

  const removeFile = () => {
    setFile(null);
    setSplitFiles([]);
  };

  const splitPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file to split");
      return;
    }

    if (splitMethod === "ranges" && !pageRanges.trim()) {
      toast.error("Please specify page ranges");
      return;
    }

    if (splitMethod === "pages" && (!pagesPerFile || parseInt(pagesPerFile) < 1)) {
      toast.error("Please specify a valid number of pages per file");
      return;
    }

    setSplitting(true);
    setProgress(0);

    try {
      let splits = [];
      
      // Simulate PDF analysis and splitting
      const totalPages = Math.floor(Math.random() * 20) + 5; // Mock page count
      
      if (splitMethod === "pages") {
        const pagesPerSplit = parseInt(pagesPerFile);
        const numberOfSplits = Math.ceil(totalPages / pagesPerSplit);
        
        for (let i = 0; i < numberOfSplits; i++) {
          const startPage = i * pagesPerSplit + 1;
          const endPage = Math.min((i + 1) * pagesPerSplit, totalPages);
          
          setProgress(((i + 1) / numberOfSplits) * 100);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const splitContent = `Split PDF ${i + 1}: Pages ${startPage}-${endPage}`;
          const blob = new Blob([splitContent], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          splits.push({
            name: `${file.name.replace('.pdf', '')}_part_${i + 1}.pdf`,
            url,
            pages: `${startPage}-${endPage}`
          });
        }
      } else if (splitMethod === "ranges") {
        const ranges = pageRanges.split(',').map(range => range.trim()).filter(Boolean);
        
        for (let i = 0; i < ranges.length; i++) {
          const range = ranges[i];
          setProgress(((i + 1) / ranges.length) * 100);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const splitContent = `Split PDF: Pages ${range}`;
          const blob = new Blob([splitContent], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          splits.push({
            name: `${file.name.replace('.pdf', '')}_pages_${range.replace('-', '_to_')}.pdf`,
            url,
            pages: range
          });
        }
      } else if (splitMethod === "individual") {
        for (let i = 1; i <= totalPages; i++) {
          setProgress((i / totalPages) * 100);
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const splitContent = `Split PDF: Page ${i}`;
          const blob = new Blob([splitContent], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          
          splits.push({
            name: `${file.name.replace('.pdf', '')}_page_${i}.pdf`,
            url,
            pages: i.toString()
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
    splitFiles.forEach((file, index) => {
      setTimeout(() => downloadFile(file), index * 500);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Split PDF</h1>
        <p className="text-gray-600 mt-2">Split your PDF document into multiple files</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select a PDF file to split into multiple documents
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
            <p className="text-lg mb-2">Drop PDF file here or click to browse</p>
            <p className="text-gray-500">Select one PDF file to split</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {file && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Selected File</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  Remove
                </Button>
              </div>
            </div>
          )}

          {file && (
            <div className="mt-6">
              <Label className="text-sm font-medium mb-4 block">Split Method</Label>
              <Tabs value={splitMethod} onValueChange={setSplitMethod}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pages">By Pages</TabsTrigger>
                  <TabsTrigger value="ranges">Page Ranges</TabsTrigger>
                  <TabsTrigger value="individual">Individual Pages</TabsTrigger>
                </TabsList>
                
                <TabsContent value="pages" className="space-y-4">
                  <div>
                    <Label htmlFor="pagesPerFile">Pages per file</Label>
                    <Input
                      id="pagesPerFile"
                      type="number"
                      value={pagesPerFile}
                      onChange={(e) => setPagesPerFile(e.target.value)}
                      placeholder="e.g., 1, 2, 5"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Number of pages to include in each split file
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="ranges" className="space-y-4">
                  <div>
                    <Label htmlFor="pageRanges">Page ranges</Label>
                    <Input
                      id="pageRanges"
                      value={pageRanges}
                      onChange={(e) => setPageRanges(e.target.value)}
                      placeholder="e.g., 1-3, 5-7, 9-12"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Comma-separated page ranges (e.g., 1-3, 5-7, 9-12)
                    </p>
                  </div>
                </TabsContent>
                
                <TabsContent value="individual" className="space-y-4">
                  <p className="text-sm text-gray-600">
                    This will create a separate PDF file for each page in the document.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {splitting && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Splitting PDF...</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          <div className="mt-6">
            <Button 
              onClick={splitPdf} 
              disabled={!file || splitting}
              className="w-full"
            >
              {splitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Splitting...
                </>
              ) : (
                <>
                  <Scissors className="h-4 w-4 mr-2" />
                  Split PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {splitFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Split Files</CardTitle>
            <CardDescription>
              Your PDF has been split into {splitFiles.length} files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {splitFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-red-600" />
                    <div>
                      <span className="font-medium block">{file.name}</span>
                      <span className="text-xs text-gray-500">Pages: {file.pages}</span>
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
            {splitFiles.length > 1 && (
              <Button onClick={downloadAll} className="w-full mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download All ({splitFiles.length} files)
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SplitPdfPage;
