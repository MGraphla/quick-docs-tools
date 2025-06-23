
import { useState } from "react";
import { Upload, FileText, Image, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const PdfToJpgPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<string[]>([]);
  const [quality, setQuality] = useState("high");
  const [resolution, setResolution] = useState("300");
  const [extractAllPages, setExtractAllPages] = useState(true);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setConvertedFiles([]);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const convertToJpg = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setConverting(true);
    setProgress(0);

    // Simulate conversion process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    // Simulate multiple pages converted to JPG
    const pageCount = Math.floor(Math.random() * 5) + 1;
    const files = Array.from({ length: pageCount }, (_, i) => 
      `${file.name.replace('.pdf', '')}_page_${i + 1}.jpg`
    );
    
    setConvertedFiles(files);
    setConverting(false);
    toast.success(`PDF converted to ${files.length} JPG image${files.length > 1 ? 's' : ''} successfully!`);
  };

  const downloadAll = () => {
    convertedFiles.forEach(fileName => {
      const link = document.createElement('a');
      link.href = '#';
      link.download = fileName;
      link.click();
    });
    toast.success("All JPG files downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PDF to JPG</h1>
        <p className="text-gray-600 mt-2">Convert PDF pages to high-quality JPG images</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select a PDF file to convert to JPG images
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setConvertedFiles([]);
              } else {
                toast.error("Please drop a valid PDF file");
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop PDF file here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <Button asChild>
              <label htmlFor="pdf-upload" className="cursor-pointer">
                Select PDF File
              </label>
            </Button>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-red-600" />
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Conversion Settings
            </CardTitle>
            <CardDescription>
              Configure JPG output settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Image Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Smaller file)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Best quality)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Resolution (DPI)</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="150">150 DPI</SelectItem>
                    <SelectItem value="300">300 DPI</SelectItem>
                    <SelectItem value="600">600 DPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="extractAll"
                checked={extractAllPages}
                onCheckedChange={(checked) => setExtractAllPages(checked as boolean)}
              />
              <Label htmlFor="extractAll">Extract all pages</Label>
            </div>

            {converting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Converting PDF to JPG...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {convertedFiles.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Image className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Conversion Complete!</p>
                      <p className="text-sm text-green-600">{convertedFiles.length} JPG files created</p>
                    </div>
                  </div>
                  <Button onClick={downloadAll} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
                <div className="space-y-1">
                  {convertedFiles.map((fileName, index) => (
                    <div key={index} className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      {fileName}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={convertToJpg} 
              disabled={converting}
              className="w-full"
            >
              {converting ? 'Converting...' : 'Convert to JPG'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PdfToJpgPage;
