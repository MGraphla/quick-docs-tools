
import { useState } from "react";
import { Upload, Image, FileText, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const JpgToPdfPage = () => {
  const [images, setImages] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFile, setConvertedFile] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const imageFiles = selectedFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only image files are supported.");
    }
    
    setImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      toast.error("Please select at least one image");
      return;
    }

    setConverting(true);
    setProgress(0);

    // Simulate conversion process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }

    setConvertedFile(`images-to-pdf-${Date.now()}.pdf`);
    setConverting(false);
    toast.success("Images converted to PDF successfully!");
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = convertedFile || 'images-to-pdf.pdf';
    link.click();
    toast.success("PDF downloaded!");
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setImages(newImages);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">JPG to PDF</h1>
        <p className="text-gray-600 mt-2">Convert images to a single PDF document</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Select JPG, PNG, or other image files to convert to PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = Array.from(e.dataTransfer.files);
              const imageFiles = droppedFiles.filter(file => file.type.startsWith('image/'));
              setImages(prev => [...prev, ...imageFiles]);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop image files here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <Button asChild>
              <label htmlFor="image-upload" className="cursor-pointer">
                Select Images
              </label>
            </Button>
          </div>

          {images.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Images ({images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-64 overflow-y-auto">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square border rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-center mt-1 truncate">{image.name}</p>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Drag images to reorder them in the PDF
              </p>
            </div>
          )}

          {converting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Converting images to PDF...</span>
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
                    <p className="font-medium text-green-800">PDF Created!</p>
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
            disabled={images.length === 0 || converting}
            className="w-full"
          >
            {converting ? 'Converting...' : `Convert ${images.length} Image${images.length !== 1 ? 's' : ''} to PDF`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default JpgToPdfPage;
