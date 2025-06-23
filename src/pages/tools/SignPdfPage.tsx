
import { useState, useRef } from "react";
import { Upload, FileText, Download, Pen, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const SignPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [signatureType, setSignatureType] = useState("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [signedFile, setSignedFile] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setSignedFile(null);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setUploadedSignature(selectedFile);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const signPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (signatureType === "type" && !typedSignature.trim()) {
      toast.error("Please enter your signature");
      return;
    }

    if (signatureType === "upload" && !uploadedSignature) {
      toast.error("Please upload a signature image");
      return;
    }

    // Simulate signing process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setSignedFile(`signed-${file.name}`);
    toast.success("PDF signed successfully!");
  };

  const downloadSigned = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = signedFile || 'signed-document.pdf';
    link.click();
    toast.success("Signed PDF downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sign PDF</h1>
        <p className="text-gray-600 mt-2">Add your signature to PDF documents</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select the PDF file you want to sign
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
                setSignedFile(null);
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
            <CardTitle>Create Signature</CardTitle>
            <CardDescription>
              Choose how you want to create your signature
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={signatureType} onValueChange={setSignatureType}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="draw" className="flex items-center gap-1">
                  <Pen className="h-4 w-4" />
                  Draw
                </TabsTrigger>
                <TabsTrigger value="type" className="flex items-center gap-1">
                  <Type className="h-4 w-4" />
                  Type
                </TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>

              <TabsContent value="draw" className="space-y-4">
                <div className="space-y-2">
                  <Label>Draw Your Signature</Label>
                  <div className="border rounded-lg p-4 bg-white">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="border border-gray-200 rounded cursor-crosshair w-full"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <Button variant="outline" onClick={clearCanvas} className="mt-2">
                      Clear
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="type" className="space-y-4">
                <div className="space-y-2">
                  <Label>Type Your Signature</Label>
                  <Input
                    placeholder="Enter your full name"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    className="text-2xl font-cursive"
                  />
                  {typedSignature && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-3xl font-cursive text-blue-600">{typedSignature}</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload Signature Image</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSignatureUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadedSignature && (
                    <p className="text-sm text-gray-600">Selected: {uploadedSignature.name}</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {signedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pen className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">PDF Signed!</p>
                      <p className="text-sm text-green-600">{signedFile}</p>
                    </div>
                  </div>
                  <Button onClick={downloadSigned} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <Button onClick={signPdf} className="w-full">
              Sign PDF
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SignPdfPage;
