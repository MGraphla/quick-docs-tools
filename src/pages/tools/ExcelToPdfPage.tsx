
import { useState } from "react";
import { Upload, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const ExcelToPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [selectedSheet, setSelectedSheet] = useState("all");
  const [orientation, setOrientation] = useState("portrait");
  const [fitToPage, setFitToPage] = useState(true);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (selectedFile && validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setConvertedFile(null);
    } else {
      toast.error("Please select a valid Excel file (.xls or .xlsx)");
    }
  };

  const convertToPdf = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    setConverting(true);
    setProgress(0);

    // Simulate conversion process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setConvertedFile(`${file.name.replace(/\.(xlsx?|xls)$/i, '')}.pdf`);
    setConverting(false);
    toast.success("Excel file converted to PDF successfully!");
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = convertedFile || 'excel-converted.pdf';
    link.click();
    toast.success("PDF downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Excel to PDF</h1>
        <p className="text-gray-600 mt-2">Convert Excel spreadsheets to PDF documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Upload Excel File
          </CardTitle>
          <CardDescription>
            Select an Excel file (.xls or .xlsx) to convert to PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              const validTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
              ];
              
              if (droppedFile && validTypes.includes(droppedFile.type)) {
                setFile(droppedFile);
                setConvertedFile(null);
              } else {
                toast.error("Please drop a valid Excel file");
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop Excel file here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileSelect}
              className="hidden"
              id="excel-upload"
            />
            <Button asChild>
              <label htmlFor="excel-upload" className="cursor-pointer">
                Select Excel File
              </label>
            </Button>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Settings</CardTitle>
            <CardDescription>
              Configure how your Excel file should be converted to PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sheets to Convert</Label>
                <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sheets</SelectItem>
                    <SelectItem value="active">Active Sheet Only</SelectItem>
                    <SelectItem value="sheet1">Sheet 1</SelectItem>
                    <SelectItem value="sheet2">Sheet 2</SelectItem>
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
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="fitToPage"
                checked={fitToPage}
                onCheckedChange={(checked) => setFitToPage(checked as boolean)}
              />
              <Label htmlFor="fitToPage">Fit content to page width</Label>
            </div>

            {converting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Converting Excel to PDF...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {convertedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Conversion Complete!</p>
                      <p className="text-sm text-green-600">{convertedFile}</p>
                    </div>
                  </div>
                  <Button onClick={downloadPdf} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={convertToPdf} 
              disabled={converting}
              className="w-full"
            >
              {converting ? 'Converting...' : 'Convert to PDF'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelToPdfPage;
