
import { useState } from "react";
import { Upload, FileText, Presentation, Download, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const PdfToPowerpointPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);
  const [layout, setLayout] = useState("auto");
  const [preserveImages, setPreserveImages] = useState(true);
  const [preserveFormatting, setPreserveFormatting] = useState(true);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setConvertedFile(null);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const convertToPowerpoint = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setConverting(true);
    setProgress(0);

    // Simulate conversion process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 250));
      setProgress(i);
    }

    setConvertedFile(`${file.name.replace('.pdf', '')}.pptx`);
    setConverting(false);
    toast.success("PDF converted to PowerPoint successfully!");
  };

  const downloadPowerpoint = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = convertedFile || 'converted-presentation.pptx';
    link.click();
    toast.success("PowerPoint file downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">PDF to PowerPoint</h1>
        <p className="text-gray-600 mt-2">Convert PDF documents to editable PowerPoint presentations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select a PDF file to convert to PowerPoint presentation
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
                setConvertedFile(null);
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
              Configure PowerPoint conversion options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Slide Layout</Label>
              <Select value={layout} onValueChange={setLayout}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect Layout</SelectItem>
                  <SelectItem value="standard">Standard (4:3)</SelectItem>
                  <SelectItem value="widescreen">Widescreen (16:9)</SelectItem>
                  <SelectItem value="custom">Custom Layout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserveImages"
                  checked={preserveImages}
                  onCheckedChange={(checked) => setPreserveImages(checked as boolean)}
                />
                <Label htmlFor="preserveImages">Preserve images and graphics</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="preserveFormatting"
                  checked={preserveFormatting}
                  onCheckedChange={(checked) => setPreserveFormatting(checked as boolean)}
                />
                <Label htmlFor="preserveFormatting">Preserve text formatting</Label>
              </div>
            </div>

            {converting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Converting PDF to PowerPoint...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {convertedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Presentation className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Conversion Complete!</p>
                      <p className="text-sm text-green-600">{convertedFile}</p>
                    </div>
                  </div>
                  <Button onClick={downloadPowerpoint} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={convertToPowerpoint} 
              disabled={converting}
              className="w-full"
            >
              {converting ? 'Converting...' : 'Convert to PowerPoint'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PdfToPowerpointPage;
