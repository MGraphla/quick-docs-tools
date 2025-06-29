import { useState, useRef, useCallback } from "react";
import { Upload, FileDown, Download, Loader2, FileSpreadsheet, FileText, Eye, CheckCircle, AlertCircle, Settings, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
  originalSize: number;
  pages: number;
}

const ExcelToPdfPage = () => {
  const [files, setFiles] = useState<Array<{ id: string; file: File; size: string }>>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [selectedSheet, setSelectedSheet] = useState("all");
  const [orientation, setOrientation] = useState("auto");
  const [fitToPage, setFitToPage] = useState(true);
  const [showGridlines, setShowGridlines] = useState(true);
  const [imageQuality, setImageQuality] = useState([90]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const validFiles = Array.from(selectedFiles).filter(file => {
      const validTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.xls',
        '.xlsx'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    });
    
    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only Excel files (.xls, .xlsx) are supported.");
    }

    if (validFiles.length === 0) return;

    const newFiles = validFiles.map(file => ({
      id: generateId(),
      file,
      size: formatFileSize(file.size)
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
    toast.success(`Added ${newFiles.length} Excel file${newFiles.length > 1 ? 's' : ''}`);
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

  const convertToPdf = async () => {
    if (files.length === 0) {
      toast.error("Please select Excel files to convert");
      return;
    }

    setConverting(true);
    setProgress(0);
    setProgressMessage("Preparing conversion...");
    setConvertedFiles([]);

    try {
      const converted: ConvertedFile[] = [];
      
      const steps = [
        { message: "Analyzing spreadsheets...", progress: 15 },
        { message: "Processing tables and data...", progress: 30 },
        { message: "Converting formulas and functions...", progress: 50 },
        { message: "Creating PDF structure...", progress: 70 },
        { message: "Finalizing documents...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(((i + 1) / files.length) * 100);
        setProgressMessage(`Converting ${file.file.name}...`);
        
        try {
          // Read the Excel file
          const data = await file.file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Determine which sheets to process
          let sheetsToProcess = [];
          if (selectedSheet === "all") {
            sheetsToProcess = workbook.SheetNames;
          } else if (selectedSheet === "active") {
            sheetsToProcess = [workbook.SheetNames[0]]; // Use first sheet as active
          } else {
            sheetsToProcess = [workbook.SheetNames[0]]; // Default to first sheet
          }
          
          // Create PDF document
          const doc = new jsPDF({
            orientation: orientation === "landscape" ? "landscape" : "portrait",
            unit: "pt"
          });
          
          let pageCount = 0;
          
          // Process each sheet
          for (let sheetIndex = 0; sheetIndex < sheetsToProcess.length; sheetIndex++) {
            const sheetName = sheetsToProcess[sheetIndex];
            const worksheet = workbook.Sheets[sheetName];
            
            // Convert sheet to HTML
            const html = XLSX.utils.sheet_to_html(worksheet, { id: 'table' });
            
            // Add sheet name as header if multiple sheets
            if (sheetsToProcess.length > 1 && sheetIndex > 0) {
              doc.addPage();
            }
            
            if (sheetsToProcess.length > 1) {
              doc.setFontSize(16);
              doc.text(sheetName, 40, 40);
              pageCount++;
            }
            
            // Convert to table format for jsPDF-AutoTable
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (jsonData.length > 0) {
              // Get column headers
              const headers = Object.keys(jsonData[0]);
              
              // Get data rows
              const data = jsonData.map(row => headers.map(header => row[header]));
              
              // Add table to PDF
              (doc as any).autoTable({
                head: [headers],
                body: data,
                startY: sheetsToProcess.length > 1 ? 60 : 40,
                theme: 'grid',
                styles: {
                  fontSize: 10,
                  cellPadding: 5,
                  lineColor: showGridlines ? [0, 0, 0] : [255, 255, 255],
                  lineWidth: showGridlines ? 0.1 : 0
                },
                headStyles: {
                  fillColor: [220, 220, 220],
                  textColor: [0, 0, 0],
                  fontStyle: 'bold'
                },
                margin: { top: 40 },
                didDrawPage: () => {
                  pageCount++;
                }
              });
            } else {
              // Empty sheet
              doc.setFontSize(12);
              doc.text("No data in this sheet", 40, sheetsToProcess.length > 1 ? 80 : 60);
              pageCount++;
            }
          }
          
          // Save the PDF
          const pdfBlob = doc.output('blob');
          const url = URL.createObjectURL(pdfBlob);
          
          converted.push({
            name: file.file.name.replace(/\.(xlsx?|xls)$/i, '.pdf'),
            url,
            size: formatFileSize(pdfBlob.size),
            originalSize: file.file.size,
            pages: pageCount > 0 ? pageCount : 1
          });
          
        } catch (error) {
          console.error(`Error converting ${file.file.name}:`, error);
          toast.error(`Failed to convert ${file.file.name}. Please ensure it's a valid Excel file.`);
        }
      }
      
      if (converted.length > 0) {
        setConvertedFiles(converted);
        setProgress(100);
        setProgressMessage("Conversion completed!");
        toast.success(`Successfully converted ${converted.length} Excel file${converted.length > 1 ? 's' : ''} to PDF`);
      }
      
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
    link.click();
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Excel to PDF Converter
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Excel to PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Convert Microsoft Excel spreadsheets to professional PDF files with preserved formatting, tables, and formulas.
        </p>
      </div>

      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-teal-400 transition-all duration-300">
        <CardContent className="p-8">
          <div
            className={`text-center transition-all duration-300 cursor-pointer ${
              dragOver ? 'scale-105 bg-teal-50' : ''
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-green-600 rounded-full mb-4 shadow-lg">
                <Upload className="h-10 w-10 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Drop Excel files here or click to browse
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Convert .xls and .xlsx files to professional PDF format
            </p>
            <Button size="lg" className="bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700">
              <Upload className="h-5 w-5 mr-2" />
              Choose Excel Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
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
              Configure PDF output settings for optimal results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Sheets to Convert</Label>
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sheets</SelectItem>
                    <SelectItem value="active">Active Sheet Only</SelectItem>
                    <SelectItem value="selected">Selected Sheets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Page Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (Based on Content)</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                Higher values produce better quality but larger file sizes
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Advanced Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fitToPage"
                    checked={fitToPage}
                    onCheckedChange={(checked) => setFitToPage(checked as boolean)}
                  />
                  <Label htmlFor="fitToPage">Fit content to page width</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showGridlines"
                    checked={showGridlines}
                    onCheckedChange={(checked) => setShowGridlines(checked as boolean)}
                  />
                  <Label htmlFor="showGridlines">Show gridlines</Label>
                </div>
              </div>
            </div>

            {/* Conversion Preview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Conversion Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Files</p>
                  <p className="font-medium">{files.length} Excel file{files.length > 1 ? 's' : ''}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total Size</p>
                  <p className="font-medium">{formatFileSize(totalSize)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Sheets</p>
                  <p className="font-medium capitalize">{selectedSheet === 'all' ? 'All sheets' : selectedSheet}</p>
                </div>
                <div>
                  <p className="text-gray-500">Orientation</p>
                  <p className="font-medium capitalize">{orientation}</p>
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
                  <FileSpreadsheet className="h-5 w-5" />
                  Selected Files ({files.length})
                </CardTitle>
                <CardDescription>
                  Total size: {formatFileSize(totalSize)}
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
                  <div className="flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6 text-teal-600" />
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
                      <span>{file.size}</span>
                      <span>{new Date(file.file.lastModified).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

      {/* Conversion Progress */}
      {converting && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Converting to PDF</h3>
              <p className="text-gray-600 mb-4">
                {progressMessage || `Converting ${files.length} Excel file${files.length > 1 ? 's' : ''}...`}
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
                  Your Excel files have been converted to PDF format
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
                  <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">
                        PDF
                      </Badge>
                      <h4 className="font-medium text-gray-900 truncate">
                        {file.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{file.pages} page{file.pages > 1 ? 's' : ''}</span>
                      <span>{file.size}</span>
                      <span className="text-green-600 font-medium">
                        {Math.round((file.originalSize - parseInt(file.size.replace(/[^\d]/g, ''))) / file.originalSize * 100)}% smaller
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
          onClick={convertToPdf}
          disabled={files.length === 0 || converting}
          className="flex-1 bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-700 hover:to-green-700 text-white py-3 text-lg font-semibold"
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
              Convert {files.length} Spreadsheet{files.length !== 1 ? 's' : ''} to PDF
            </>
          )}
        </Button>
      </div>

      {/* Help Section */}
      {files.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert Excel to PDF:</strong> Upload Excel files (.xls or .xlsx), configure your sheet selection and formatting options, then click "Convert to PDF" to create professional PDF files that preserve your spreadsheet's layout and data.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExcelToPdfPage;