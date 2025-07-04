import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Settings, Zap, X, Save, Eye, EyeOff, Lock, Unlock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";

interface ConvertedFile {
  name: string;
  url: string;
  size: string;
}

const JpgToPdfPage = () => {
  const [images, setImages] = useState<File[]>([]);
  const [convertedFile, setConvertedFile] = useState<ConvertedFile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [pageSize, setPageSize] = useState("a4");
  const [pageOrientation, setPageOrientation] = useState("portrait");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfProcessor = createPdfProcessor();

  const handleImageSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    setImages(imageFiles);
    setConvertedFile(null);
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
    handleImageSelect(e.dataTransfer.files);
  }, [handleImageSelect]);

  const convertToPdf = async () => {
    if (images.length === 0) {
      toast.error("Please select at least one image file");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to convert images...");

    try {
      const steps = [
        { message: "Analyzing image files...", progress: 15 },
        { message: "Creating PDF structure...", progress: 30 },
        { message: "Adding images to PDF...", progress: 60 },
        { message: "Finalizing PDF document...", progress: 80 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Create PDF using jsPDF
      const jsPDF = (await import('jspdf')).default;
      const pdf = new jsPDF();
      
      // Configure page settings based on user preferences
      const pageFormat = pageSize.toUpperCase() as any;
      const orientation = pageOrientation === 'landscape' ? 'l' : 'p';
      
      // Recreate PDF with proper settings
      const finalPdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageFormat
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgData = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target && typeof event.target.result === 'string') {
              resolve(event.target.result);
            } else {
              reject(new Error('Failed to read image data'));
            }
          };
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(img);
        });

        const image = new Image();
        image.src = imgData;

        await new Promise<void>((resolve) => {
          image.onload = () => {
            const imgWidth = finalPdf.internal.pageSize.getWidth();
            const imgHeight = finalPdf.internal.pageSize.getHeight();

            if (i > 0) {
              finalPdf.addPage(pageFormat, orientation);
            }
            finalPdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            resolve();
          };
        });
      }

      const pdfBlob = finalPdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      setConvertedFile({
        name: `images-to-pdf.pdf`,
        url,
        size: formatFileSize(pdfBlob.size)
      });
      
      setProgress(100);
      setProgressMessage("Conversion completed!");
      toast.success("Images converted to PDF successfully!");
      
    } catch (error) {
      console.error('Conversion error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to convert images to PDF. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadConverted = () => {
    if (!convertedFile) return;
    
    const link = document.createElement('a');
    link.href = convertedFile.url;
    link.download = convertedFile.name;
    link.click();
    toast.success(`Downloaded ${convertedFile.name}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <ImageIcon className="h-4 w-4 mr-2" />
          JPG to PDF Converter
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">JPG to PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Convert your JPG images to PDF documents online for free.
        </p>
      </div>

      {/* Upload Area */}
      {images.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-blue-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop JPG images here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select one or more JPG images to convert to PDF
              </p>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                <Upload className="h-5 w-5 mr-2" />
                Choose JPG Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg, image/png, image/jpg"
                multiple
                onChange={(e) => handleImageSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversion Interface */}
      {images.length > 0 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Image Files
              </CardTitle>
              <CardDescription>
                Selected images for conversion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm text-gray-700 truncate">{image.name}</span>
                    <Badge variant="outline">{formatFileSize(image.size)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conversion Settings</CardTitle>
              <CardDescription>
                Configure page size and orientation for the PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                    <SelectItem value="letter">Letter (8.5 x 11 inches)</SelectItem>
                    <SelectItem value="legal">Legal (8.5 x 14 inches)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Page Orientation</Label>
                <Select value={pageOrientation} onValueChange={setPageOrientation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={convertToPdf}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 mr-2" />
                      Convert to PDF
                    </>
                  )}
                </Button>
              </div>
              
              {/* Processing Progress */}
              {processing && (
                <div className="mt-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Converting images to PDF..."}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Converted File */}
          {convertedFile && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                      Images Converted to PDF Successfully!
                    </h3>
                    <p className="text-green-700 mb-2">{convertedFile.name}</p>
                    <p className="text-sm text-green-600">
                      Your images have been converted to a single PDF document
                    </p>
                  </div>
                  <Button
                    onClick={downloadConverted}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Help Section */}
      {images.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to convert JPG to PDF:</strong> Upload one or more JPG images, configure page size and orientation, then click "Convert to PDF" to create a single PDF document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default JpgToPdfPage;
