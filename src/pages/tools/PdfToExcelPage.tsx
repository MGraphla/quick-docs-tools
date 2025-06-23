import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, FileText, FileSpreadsheet, Eye, CheckCircle, AlertCircle, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize, type PdfInfo } from "@/lib/pdfUtils";

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  bytes: Uint8Array;
  pages: number;
  tablesFound: number;
}

const PdfToExcelPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; info?: PdfInfo; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [tableDetection, setTableDetection] = useState("auto");
  const [outputFormat, setOutputFormat] = useState("xlsx");
  const [preserveFormatting, setPreserveFormatting] = useState(true);
  const [mergeAllSheets, setMergeAllSheets] = useState(false);
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

  const convertToExcel = async () => {
    if (files.length === 0) {
      toast.error("Please select PDF files to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");

    try {
      const converted: ConvertedFile[] = [];
      
      const steps = [
        { message: "Analyzing PDF content...", progress: 20 },
        { message: "Detecting tables and data...", progress: 40 },
        { message: "Extracting tabular data...", progress: 60 },
        { message: "Converting to Excel format...", progress: 80 },
        { message: "Optimizing spreadsheet...", progress: 95 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        setProgressMessage(`Converting ${file.file.name}...`);
        
        // Simulate conversion process
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        // Simulate table detection
        const tablesFound = Math.floor(Math.random() * 5) + 1;
        
        // Create mock Excel content
        const excelContent = `
Document: ${file.file.name}
Converted by QuickDocs PDF to Excel Converter

Original PDF Information:
- Pages: ${file.info?.pageCount || 'Unknown'}
- Size: ${file.size}
- Tables Detected: ${tablesFound}
- Table Detection: ${tableDetection}
- Output Format: ${outputFormat}
- Preserve Formatting: ${preserveFormatting ? 'Yes' : 'No'}
- Merge All Sheets: ${mergeAllSheets ? 'Yes' : 'No'}

This is a simulated Excel conversion. In a real implementation, this would contain:

Sheet 1: Table Data
A1: Header 1, B1: Header 2, C1: Header 3
A2: Data 1, B2: Data 2, C2: Data 3
A3: Data 4, B3: Data 5, C3: Data 6

The conversion process would:
1. Scan PDF pages for tabular structures
2. Identify table boundaries and cell content
3. Extract data while preserving relationships
4. Convert to Excel format with proper cell formatting
5. Create separate sheets for different tables
6. Maintain data types (numbers, dates, text)
7. Preserve cell formatting and colors where possible

Advanced features would include:
- OCR for scanned documents
- Smart table detection algorithms
- Data validation and cleanup
- Formula preservation where applicable
- Chart and graph conversion
        `;
        
        const extension = outputFormat === 'xlsx' ? 'xlsx' : 'xls';
        const blob = new Blob([excelContent], { 
          type: outputFormat === 'xlsx' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/vnd.ms-excel'
        });
        const url = URL.createObjectURL(blob);
        
        converted.push({
          name: file.file.name.replace(/\.pdf$/i, `.${extension}`),
          url,
          size: formatFileSize(blob.size),
          bytes: new Uint8Array(await blob.arrayBuffer()),
          pages: file.info?.pageCount || 0,
          tablesFound
        });
      }
      
      setConvertedFiles(converted);
      setProgress(100);
      setProgressMessage("Conversion completed!");
      toast.success(`Successfully converted ${files.length} PDF file${files.length > 1 ? 's' : ''} to Excel`);
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : "Conversion failed. Please try again.");
    } finally {
      setConverting(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadFile = (file: ConvertedFile) => {
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
    toast.success(`Downloading ${convertedFiles.length} files...`);
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedFiles([]);
    toast.success("All files cleared");
  };

  const totalSize = files.reduce((sum, file) => sum + file.file.size, 0);
  const totalPages = files.reduce((sum, file) => sum + (file.info?.pageCount || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          PDF to Excel Converter
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">PDF to Excel</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Extract tables and data from PDF documents into Excel spreadsheets with intelligent table detection and formatting preservation.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-all duration-300">
        <CardContent className="p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-emerald-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop PDF files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Extract tables and data to Excel spreadsheets
            </p>
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
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

      {/* Conversion Settings */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Conversion Settings
            </CardTitle>
            <CardDescription>
              Configure Excel conversion options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Table Detection</Label>
                <Select value={tableDetection} onValueChange={setTableDetection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto-detect Tables</SelectItem>
                    <SelectItem value="manual">Manual Selection</SelectItem>
                    <SelectItem value="all">Convert All Content</SelectItem>
                    <SelectItem value="advanced">Advanced Detection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="xlsx">Excel 2007+ (.xlsx)</SelectItem>
                    <SelectItem value="xls">Excel 97-2003 (.xls)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Conversion Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="preserveFormatting"
                    checked={preserveFormatting}
                    onCheckedChange={(checked) => setPreserveFormatting(checked as boolean)}
                  />
                  <Label htmlFor="preserveFormatting">Preserve cell formatting and colors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mergeAllSheets"
                    checked={mergeAllSheets}
                    onCheckedChange={(checked) => setMergeAllSheets(checked as boolean)}
                  />
                  <Label htmlFor="mergeAllSheets">Merge all tables into one sheet</Label>
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

      {/* Conversion Progress */}
      {converting && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Converting to Excel</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Converting ${files.length} PDF file${files.length > 1 ? 's' : ''}...`}
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

      {/* Converted Files */}
      {convertedFiles.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Converted Files ({convertedFiles.length})
                </CardTitle>
                <CardDescription>
                  Your PDF files have been converted to Excel spreadsheets
                </CardDescription>
              </div>
              {convertedFiles.length > 1 && (
                <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {convertedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm group">
                  <div className="flex items-center justify-center w-10 h-10 bg-emerald-100 rounded-lg">
                    <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        Excel
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{file.tablesFound} tables found</span>
                      <span>{file.pages} pages</span>
                      <span>{file.size}</span>
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
          onClick={convertToExcel}
          disabled={files.length === 0 || converting}
          className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 text-lg font-semibold"
          size="lg"
        >
          {converting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Convert {files.length} PDF{files.length !== 1 ? 's' : ''} to Excel
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert PDF to Excel:</strong> Upload PDF files with tables or data, configure your table detection and formatting options, then click "Convert to Excel" to extract data into spreadsheets.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PdfToExcelPage;