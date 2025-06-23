
import { useState } from "react";
import { Upload, FileText, Download, Type, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const WatermarkPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkType, setWatermarkType] = useState("text");
  const [watermarkText, setWatermarkText] = useState("");
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [opacity, setOpacity] = useState("50");
  const [position, setPosition] = useState("center");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [watermarkedFile, setWatermarkedFile] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setWatermarkedFile(null);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setWatermarkImage(selectedFile);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const addWatermark = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (watermarkType === "text" && !watermarkText.trim()) {
      toast.error("Please enter watermark text");
      return;
    }

    if (watermarkType === "image" && !watermarkImage) {
      toast.error("Please select a watermark image");
      return;
    }

    setProcessing(true);
    setProgress(0);

    // Simulate watermarking process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }

    setWatermarkedFile(`watermarked-${file.name}`);
    setProcessing(false);
    toast.success("Watermark added successfully!");
  };

  const downloadWatermarked = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = watermarkedFile || 'watermarked-document.pdf';
    link.click();
    toast.success("Watermarked PDF downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Watermark PDF</h1>
        <p className="text-gray-600 mt-2">Add text or image watermarks to your PDF files</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select the PDF file you want to add a watermark to
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
                setWatermarkedFile(null);
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
            <CardTitle>Watermark Settings</CardTitle>
            <CardDescription>
              Configure your watermark options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={watermarkType} onValueChange={setWatermarkType}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input
                    placeholder="Enter watermark text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4">
                <div className="space-y-2">
                  <Label>Watermark Image</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {watermarkImage && (
                    <p className="text-sm text-gray-600">Selected: {watermarkImage.name}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Opacity ({opacity}%)</Label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={opacity}
                  onChange={(e) => setOpacity(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Adding watermark...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {watermarkedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">Watermark Added!</p>
                      <p className="text-sm text-green-600">{watermarkedFile}</p>
                    </div>
                  </div>
                  <Button onClick={downloadWatermarked} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={addWatermark} 
              disabled={processing}
              className="w-full"
            >
              {processing ? 'Adding Watermark...' : 'Add Watermark'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WatermarkPdfPage;
