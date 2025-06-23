
import { useState } from "react";
import { RotateCw, RotateCcw, Upload, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const RotatePdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [rotating, setRotating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rotatedFile, setRotatedFile] = useState<string | null>(null);
  const [selectedPages, setSelectedPages] = useState<string>("all");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setRotatedFile(null);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const rotatePdf = async (direction: 'clockwise' | 'counterclockwise') => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    setRotating(true);
    setProgress(0);

    // Simulate rotation process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setProgress(i);
    }

    const rotationText = direction === 'clockwise' ? 'CW' : 'CCW';
    setRotatedFile(`rotated-${rotationText}-${file.name}`);
    setRotating(false);
    toast.success(`PDF rotated ${direction} successfully!`);
  };

  const downloadRotated = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = rotatedFile || 'rotated-document.pdf';
    link.click();
    toast.success("Rotated PDF downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rotate PDF</h1>
        <p className="text-gray-600 mt-2">Rotate PDF pages clockwise or counterclockwise</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select the PDF file you want to rotate
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
                setRotatedFile(null);
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
            <CardTitle>Rotation Options</CardTitle>
            <CardDescription>
              Choose how to rotate your PDF pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => rotatePdf('counterclockwise')}
                disabled={rotating}
                variant="outline"
                size="lg"
                className="flex flex-col gap-2 h-20 w-32"
              >
                <RotateCcw className="h-6 w-6" />
                <span className="text-sm">90° Left</span>
              </Button>
              
              <Button
                onClick={() => rotatePdf('clockwise')}
                disabled={rotating}
                variant="outline"
                size="lg"
                className="flex flex-col gap-2 h-20 w-32"
              >
                <RotateCw className="h-6 w-6" />
                <span className="text-sm">90° Right</span>
              </Button>
            </div>

            {rotating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rotating PDF...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {rotatedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RotateCw className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">PDF Rotated!</p>
                      <p className="text-sm text-green-600">{rotatedFile}</p>
                    </div>
                  </div>
                  <Button onClick={downloadRotated} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RotatePdfPage;
