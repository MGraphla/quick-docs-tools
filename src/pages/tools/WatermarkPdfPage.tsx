import { useState, useRef, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { Upload, FileText, Download, Droplets, Type, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Settings, RotateCw, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";

interface WatermarkedFile {
  name: string;
  url: string;
  size: string;
}

const WatermarkPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [watermarkType, setWatermarkType] = useState("text");
  const [textWatermark, setTextWatermark] = useState("CONFIDENTIAL");
  const [imageWatermark, setImageWatermark] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [opacity, setOpacity] = useState([50]);
  const [rotation, setRotation] = useState([0]);
  const [fontSize, setFontSize] = useState([48]);
  const [textColor, setTextColor] = useState("#000000");
  const [watermarkDimensions, setWatermarkDimensions] = useState({ x: 150, y: 200, width: 300, height: 60 });

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [watermarkedFile, setWatermarkedFile] = useState<WatermarkedFile | null>(null);
  
  const [dragOver, setDragOver] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [isMobileView, setIsMobileView] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const pdfProcessor = createPdfProcessor();

  useEffect(() => {
    const checkScreenSize = () => setIsMobileView(window.innerWidth < 1024);
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    const loadingToast = toast.loading("Loading PDF...");
    try {
      const info = await pdfProcessor.loadPdf(selectedFile);
      setFile(selectedFile);
      setFileInfo({ size: formatFileSize(selectedFile.size), pages: info.pageCount });
      setWatermarkedFile(null);
      setCurrentPage(1);
      await renderCurrentPage(selectedFile, 1);
      toast.success(`PDF loaded: ${info.pageCount} pages`);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

  const renderCurrentPage = async (pdfFile: File, pageNum: number) => {
    try {
      const imageData = await pdfProcessor.renderPdfPage(pdfFile, pageNum, 1.5);
      setPageImage(imageData);
    } catch (error) {
      console.error('Error rendering page:', error);
      toast.error("Failed to render PDF page");
    }
  };

  const changePage = async (newPage: number) => {
    if (!fileInfo || !file || newPage < 1 || newPage > fileInfo.pages) return;
    setCurrentPage(newPage);
    await renderCurrentPage(file, newPage);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setImageWatermark(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      toast.error("Please select a valid image file");
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const applyWatermark = async () => {
    if (!file) return toast.error("Please select a PDF file");
    if (watermarkType === "text" && !textWatermark.trim()) return toast.error("Please enter watermark text");
    if (watermarkType === "image" && !imageWatermark) return toast.error("Please select an image for watermark");

    setProcessing(true);
    const loadingToast = toast.loading("Applying watermark...");

    try {
      const previewEl = previewRef.current;
      if (!previewEl) throw new Error("Preview element not found");

      const pageAspectRatio = 8.5 / 11;
      const previewRect = previewEl.getBoundingClientRect();
      
      // Calculate the actual size of the rendered PDF page within the preview container
      let renderedPageWidth = previewRect.width;
      let renderedPageHeight = previewRect.height;

      if (previewRect.width / previewRect.height > pageAspectRatio) {
        renderedPageWidth = renderedPageHeight * pageAspectRatio;
      } else {
        renderedPageHeight = renderedPageWidth / pageAspectRatio;
      }

      const scaleX = renderedPageWidth / 595; // A4 width in points
      const scaleY = renderedPageHeight / 842; // A4 height in points

      const watermarkOptions = {
        type: watermarkType as 'text' | 'image',
        text: textWatermark,
        image: imageWatermark,
        opacity: opacity[0],
        rotation: rotation[0],
        fontSize: fontSize[0],
        color: textColor,
        x: watermarkDimensions.x / scaleX,
        y: watermarkDimensions.y / scaleY,
        width: watermarkDimensions.width / scaleX,
        height: watermarkDimensions.height / scaleY,
      };

      const watermarkedData = await pdfProcessor.addWatermark(file, watermarkOptions);
      const blob = new Blob([watermarkedData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setWatermarkedFile({ name: `watermarked-${file.name}`, url, size: formatFileSize(blob.size) });
      toast.success("Watermark applied successfully!", { id: loadingToast });
      if (isMobileView) setSheetOpen(false);

    } catch (error) {
      console.error('Watermark error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to apply watermark.", { id: loadingToast });
    } finally {
      setProcessing(false);
    }
  };

  const downloadWatermarked = () => {
    if (!watermarkedFile) return;
    const link = document.createElement('a');
    link.href = watermarkedFile.url;
    link.download = watermarkedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(watermarkedFile.url);
    toast.success(`Downloaded ${watermarkedFile.name}`);
  };

  const WatermarkSettings = () => (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Droplets className="h-5 w-5 text-blue-600" />
          Watermark Settings
        </CardTitle>
        <CardDescription>Configure your watermark appearance and position</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={watermarkType} onValueChange={setWatermarkType}>
          <TabsList className="grid grid-cols-2 mb-6 w-full">
            <TabsTrigger value="text" className="flex items-center gap-2"><Type className="h-4 w-4" />Text</TabsTrigger>
            <TabsTrigger value="image" className="flex items-center gap-2"><ImageIcon className="h-4 w-4" />Image</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="watermark-text">Watermark Text</Label>
              <Input id="watermark-text" value={textWatermark} onChange={(e) => setTextWatermark(e.target.value)} placeholder="e.g., CONFIDENTIAL" />
            </div>
            <div className="space-y-2">
              <Label>Font Size: <span className="font-bold text-blue-600">{fontSize[0]}px</span></Label>
              <Slider value={fontSize} onValueChange={setFontSize} min={8} max={144} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Text Color</Label>
              <div className="flex items-center gap-3">
                <Input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-12 h-12 p-1 border-2 rounded-md cursor-pointer" />
                <div className="w-full px-3 py-2 border rounded-md bg-gray-50">
                  <span className="font-mono text-gray-700">{textColor.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="image" className="space-y-4">
            <Button variant="outline" onClick={() => imageInputRef.current?.click()} className="w-full py-6">
              <ImageIcon className="h-5 w-5 mr-3" />
              {imageWatermark ? 'Change Watermark Image' : 'Select Watermark Image'}
            </Button>
            <input ref={imageInputRef} type="file" accept="image/png, image/jpeg, image/gif" onChange={handleImageSelect} className="hidden" />
            {imagePreview && (
              <div className="mt-3 p-2 border rounded-lg bg-gray-50 flex flex-col items-center gap-2">
                <img src={imagePreview} alt="Image Preview" className="max-h-32 rounded-md shadow-sm" />
                <p className="text-xs text-gray-500 truncate max-w-full px-2">{imageWatermark?.name}</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="space-y-6 pt-6 border-t mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <Label>Opacity: <span className="font-bold text-blue-600">{opacity[0]}%</span></Label>
              <Slider value={opacity} onValueChange={setOpacity} max={100} step={1} />
            </div>
            <div className="space-y-2">
              <Label>Rotation: <span className="font-bold text-blue-600">{rotation[0]}°</span></Label>
              <Slider value={rotation} onValueChange={setRotation} min={-180} max={180} step={1} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Droplets className="h-4 w-4 mr-2" />PDF Watermark Tool
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Add Watermark to PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">Easily add text or image watermarks. Drag and resize your watermark directly on the preview for perfect placement.</p>
      </div>

      {!file ? (
        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300">
          <CardContent className="p-6 md:p-12">
            <div className={`text-center transition-all duration-300 cursor-pointer ${dragOver ? 'scale-105 bg-blue-50' : ''}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full mb-4 shadow-lg"><Upload className="h-8 w-8 md:h-10 md:w-10 text-white" /></div>
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">Drop PDF file here or click to browse</h3>
              <p className="text-base md:text-lg text-gray-600 mb-6">Select a PDF file to begin watermarking</p>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"><Upload className="h-5 w-5 mr-2" />Choose PDF File</Button>
              <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {isMobileView && (
            <div className="fixed bottom-4 right-4 z-50">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild><Button className="rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700"><Settings className="h-6 w-6" /></Button></SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-xl flex flex-col">
                  <SheetHeader className="mb-4"><SheetTitle className="flex items-center gap-2"><Settings className="h-5 w-5 text-blue-600" />Watermark Options</SheetTitle></SheetHeader>
                  <div className="overflow-y-auto flex-grow pr-2"><WatermarkSettings /></div>
                  <div className="p-4 border-t bg-white"><Button onClick={applyWatermark} disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700">{processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying...</> : 'Apply Watermark'}</Button></div>
                </SheetContent>
              </Sheet>
            </div>
          )}
          <div className="grid lg:grid-cols-12 gap-6">
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              <WatermarkSettings />
              <Card className="shadow-sm hover:shadow-md transition-shadow">
                <CardHeader><CardTitle>Finalize</CardTitle></CardHeader>
                <CardContent>
                  <Button onClick={applyWatermark} disabled={processing} className="w-full bg-blue-600 hover:bg-blue-700">
                    {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Applying Watermark...</> : 'Apply Watermark'}
                  </Button>
                  {processing && <Progress value={progress} className="w-full mt-4" />}
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-blue-600" />Document Preview</CardTitle>
                  <CardDescription>Drag and resize the watermark on page {currentPage} of {fileInfo.pages}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[500px] lg:min-h-[700px]">
                    <div ref={previewRef} className="bg-white shadow-lg rounded-lg overflow-hidden relative w-full max-w-full" style={{ aspectRatio: '8.5 / 11' }}>
                      {pageImage ? (
                        <div className="relative w-full h-full">
                          <img src={pageImage} alt={`Page ${currentPage}`} className="w-full h-full object-contain" />
                          <Rnd
                            size={{ width: watermarkDimensions.width, height: watermarkDimensions.height }}
                            position={{ x: watermarkDimensions.x, y: watermarkDimensions.y }}
                            onDragStop={(e, d) => setWatermarkDimensions(prev => ({ ...prev, x: d.x, y: d.y }))}
                            onResizeStop={(e, dir, ref, delta, pos) => setWatermarkDimensions({ width: ref.offsetWidth, height: ref.offsetHeight, ...pos })}
                            className="border-2 border-dashed border-blue-500 flex items-center justify-center bg-white/10"
                            bounds="parent"
                          >
                            {watermarkType === 'text' && textWatermark && (
                              <div className="w-full h-full flex items-center justify-center text-center p-1 box-border overflow-hidden" style={{ fontSize: `${fontSize[0]}px`, color: textColor, opacity: opacity[0] / 100, transform: `rotate(${rotation[0]}deg)`, whiteSpace: 'nowrap', lineHeight: 1 }}>
                                {textWatermark}
                              </div>
                            )}
                            {watermarkType === 'image' && imagePreview && (
                               <img src={imagePreview} alt="Watermark preview" className="w-full h-full object-contain" style={{ opacity: opacity[0] / 100, transform: `rotate(${rotation[0]}deg)` }}/>
                            )}
                          </Rnd>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><Loader2 className="h-8 w-8 animate-spin" /></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {fileInfo.pages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <Button onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} variant="outline">Previous</Button>
                  <span>Page {currentPage} of {fileInfo.pages}</span>
                  <Button onClick={() => changePage(currentPage + 1)} disabled={currentPage === fileInfo.pages} variant="outline">Next</Button>
                </div>
              )}
              {watermarkedFile && (
                <Card className="bg-green-50 border-green-200 shadow-lg animate-in fade-in-50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full"><CheckCircle className="h-8 w-8 text-green-600" /></div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800 mb-1">Watermark Applied!</h3>
                        <p className="text-sm text-green-600">Your document is ready for download.</p>
                      </div>
                      <Button onClick={downloadWatermarked} className="bg-green-600 hover:bg-green-700 text-white w-full max-w-xs"><Download className="h-4 w-4 mr-2" />Download PDF</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
      {!file && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700"><strong>How to add a watermark:</strong> Upload a PDF, customize your text or image watermark, drag and resize it on the preview, then click "Apply Watermark" to generate your file.</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WatermarkPdfPage;