
import { useState } from "react";
import { Upload, FileText, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const WordToPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [quality, setQuality] = useState("standard");
  const [orientation, setOrientation] = useState("auto");
  const [preserveLinks, setPreserveLinks] = useState(true);
  const [preserveBookmarks, setPreserveBookmarks] = useState(true);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (selectedFile && validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
      setConvertedFile(null);
    } else {
      toast.error("Please select a valid Word document (.doc or .docx)");
    }
  };

  const convertToPdf = async () => {
    if (!file) {
      toast.error("Please select a Word document");
      return;
    }

    setConverting(true);
    setProgress(0);

    // Simulate conversion process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    setConvertedFile(`${file.name.replace(/\.(docx?|doc)$/i, '')}.pdf`);
    setConverting(false);
    toast.success("Word document converted to PDF successfully!");
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = convertedFile || 'word-converted.pdf';
    link.click();
    toast.success("PDF downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Word to PDF</h1>
        <p className="text-gray-600 mt-2">Convert Word documents to professional PDF files</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload Word Document
          </CardTitle>
          <CardDescription>
            Select a Word document (.doc or .docx) to convert to PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              const validTypes = [
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/msword'
              ];
              
              if (droppedFile && validTypes.includes(droppedFile.type)) {
                setFile(droppedFile);
                setConvertedFile(null);
              } else {
                toast.error("Please drop a valid Word document");
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop Word document here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="word-upload"
            />
            <Button asChild>
              <label htmlFor="word-upload" className="cursor-pointer">
                Select Word Document
              </label>
            </Button>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-blue-600" />
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
              Configure PDF output settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PDF Quality</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High Quality</SelectItem>
                    <SelectItem value="standard">Standard Quality</SelectItem>
                    <SelectItem value="optimized">Optimized for Web</SelectItem>
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
                    <SelectItem value="auto">Auto (Keep Original)</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserveLinks"
                  checked={preserveLinks}
                  onCheckedChange={(checked) => setPreserveLinks(checked as boolean)}
                />
                <Label htmlFor="preserveLinks">Preserve hyperlinks</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserveBookmarks"
                  checked={preserveBookmarks}
                  onCheckedChange={(checked) => setPreserveBookmarks(checked as boolean)}
                />
                <Label htmlFor="preserveBookmarks">Create PDF bookmarks from headings</Label>
              </div>
            </div>

            {converting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Converting Word to PDF...</span>
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

export default WordToPdfPage;
