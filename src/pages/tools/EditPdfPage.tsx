import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Type, Square, Circle, Highlighter, Pencil, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Save, Undo, Redo, Eraser, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";

interface EditedFile {
  name: string;
  url: string;
  size: string;
}

interface PdfEdit {
  type: 'text' | 'highlight' | 'shape' | 'image';
  page: number;
  x: number;
  y: number;
  content?: string;
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  shapeType?: 'rectangle' | 'circle';
  imageData?: string;
}

const EditPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [editTool, setEditTool] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState([16]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [opacity, setOpacity] = useState([100]);
  const [currentPage, setCurrentPage] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [editedFile, setEditedFile] = useState<EditedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [edits, setEdits] = useState<PdfEdit[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfProcessor = createPdfProcessor();

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
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: info.pageCount
      });
      setEditedFile(null);
      setCurrentPage(1);
      setEdits([]);
      
      // Render the first page
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
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!file || !fileInfo) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert coordinates to PDF scale
    const pdfX = (x / rect.width) * 595; // Standard PDF width
    const pdfY = (y / rect.height) * 842; // Standard PDF height
    
    const newEdit: PdfEdit = {
      type: editTool as 'text' | 'highlight' | 'shape' | 'image',
      page: currentPage,
      x: pdfX,
      y: pdfY,
      content: editTool === 'text' ? textInput || 'Sample Text' : undefined,
      fontSize: fontSize[0],
      color: textColor,
      width: editTool === 'highlight' ? 100 : editTool === 'shape' ? 80 : undefined,
      height: editTool === 'highlight' ? 20 : editTool === 'shape' ? 80 : undefined,
      shapeType: editTool === 'shape' ? (editTool === 'rectangle' ? 'rectangle' : 'circle') : undefined,
      imageData: editTool === 'image' ? selectedImage : undefined
    };
    
    setEdits(prev => [...prev, newEdit]);
    toast.success(`Added ${editTool} to page ${currentPage}`);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        toast.success("Image loaded. Click on the PDF to place it.");
      };
      reader.readAsDataURL(file);
    }
  };

  const savePdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (edits.length === 0) {
      toast.error("No edits to save. Please add some content to the PDF.");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Preparing to save changes...");

    try {
      const steps = [
        { message: "Analyzing PDF structure...", progress: 15 },
        { message: "Applying text edits...", progress: 30 },
        { message: "Processing annotations...", progress: 50 },
        { message: "Updating PDF content...", progress: 70 },
        { message: "Finalizing document...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Apply edits to PDF using the actual editing function
      const editedPdfBytes = await pdfProcessor.editPdf(file, edits);
      
      // Create a blob and URL for download
      const blob = new Blob([editedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setEditedFile({
        name: `edited-${file.name}`,
        url,
        size: formatFileSize(blob.size)
      });
      
      setProgress(100);
      setProgressMessage("Save completed!");
      toast.success("PDF saved successfully with all edits applied!");
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to save PDF. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadEdited = () => {
    if (!editedFile) return;
    
    const link = document.createElement('a');
    link.href = editedFile.url;
    link.download = editedFile.name;
    link.click();
    toast.success(`Downloaded ${editedFile.name}`);
  };

  const clearEdits = () => {
    setEdits([]);
    toast.success("All edits cleared");
  };

  const changePage = async (newPage: number) => {
    if (!fileInfo || !file) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    
    setCurrentPage(newPage);
    await renderCurrentPage(file, newPage);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Pencil className="h-4 w-4 mr-2" />
          PDF Editor
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Edit PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add text, shapes, images, and annotations to your PDF documents with our professional editing tools.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-violet-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-violet-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to edit with our professional tools
              </p>
              <Button size="lg" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                <Upload className="h-5 w-5 mr-2" />
                Choose PDF File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Editor Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Tools */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Document Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{fileInfo.pages} pages</span>
                        <span>•</span>
                        <span>{fileInfo.size}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => changePage(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{fileInfo.pages}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => changePage(currentPage + 1)}
                      disabled={currentPage >= fileInfo.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Editing Tools</CardTitle>
                <CardDescription>
                  Choose a tool to edit your PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={editTool} onValueChange={setEditTool}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="text">Text</TabsTrigger>
                    <TabsTrigger value="shapes">Shapes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Text Content</Label>
                      <Input
                        placeholder="Enter text to add"
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arial">Arial</SelectItem>
                          <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                          <SelectItem value="Courier New">Courier New</SelectItem>
                          <SelectItem value="Georgia">Georgia</SelectItem>
                          <SelectItem value="Verdana">Verdana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Font Size: {fontSize[0]}px</Label>
                      <Slider
                        value={fontSize}
                        onValueChange={setFontSize}
                        min={8}
                        max={72}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: textColor }}
                        />
                        <Input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="shapes" className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={editTool === "rectangle" ? "default" : "outline"}
                        onClick={() => setEditTool("rectangle")}
                        className="flex flex-col gap-2 h-16"
                      >
                        <Square className="h-5 w-5" />
                        <span className="text-xs">Rectangle</span>
                      </Button>
                      
                      <Button
                        variant={editTool === "circle" ? "default" : "outline"}
                        onClick={() => setEditTool("circle")}
                        className="flex flex-col gap-2 h-16"
                      >
                        <Circle className="h-5 w-5" />
                        <span className="text-xs">Circle</span>
                      </Button>
                      
                      <Button
                        variant={editTool === "highlight" ? "default" : "outline"}
                        onClick={() => setEditTool("highlight")}
                        className="flex flex-col gap-2 h-16"
                      >
                        <Highlighter className="h-5 w-5" />
                        <span className="text-xs">Highlight</span>
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Stroke Width: {strokeWidth[0]}px</Label>
                      <Slider
                        value={strokeWidth}
                        onValueChange={setStrokeWidth}
                        min={1}
                        max={10}
                        step={1}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Fill Color</Label>
                      <div className="flex gap-2">
                        <div 
                          className="w-10 h-10 rounded-md border"
                          style={{ backgroundColor: fillColor }}
                        />
                        <Input
                          type="color"
                          value={fillColor}
                          onChange={(e) => setFillColor(e.target.value)}
                          className="w-full h-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Opacity: {opacity[0]}%</Label>
                      <Slider
                        value={opacity}
                        onValueChange={setOpacity}
                        min={10}
                        max={100}
                        step={5}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditTool("image")}
                    className={`w-full ${editTool === "image" ? "bg-blue-50 border-blue-300" : ""}`}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  {editTool === "image" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                  )}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - PDF Preview & Editor */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>PDF Editor</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={clearEdits}>
                      <Eraser className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                    <Button variant="outline" size="sm">
                      <Undo className="h-4 w-4 mr-1" />
                      Undo
                    </Button>
                    <Button variant="outline" size="sm">
                      <Redo className="h-4 w-4 mr-1" />
                      Redo
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Page {currentPage} of {fileInfo.pages} - Click on the document to add content ({edits.length} edits)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[600px]">
                  <div 
                    className="bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair relative"
                    style={{ width: '595px', height: '842px' }}
                    onClick={handleCanvasClick}
                  >
                    {pageImage ? (
                      <img 
                        src={pageImage} 
                        alt={`Page ${currentPage}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Discard Changes
                    </Button>
                  </div>
                  <Button 
                    onClick={savePdf} 
                    disabled={processing || edits.length === 0}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Processing Progress */}
            {processing && (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
                      <Loader2 className="h-8 w-8 text-violet-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Processing PDF</h3>
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Applying your edits to the PDF..."}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Edited File */}
            {editedFile && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        PDF Edited Successfully!
                      </h3>
                      <p className="text-green-700 mb-2">{editedFile.name}</p>
                      <p className="text-sm text-green-600">
                        All your changes have been applied to the document
                      </p>
                    </div>
                    <Button
                      onClick={downloadEdited}
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
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to edit a PDF:</strong> Upload a PDF file, use the editing tools to add text, shapes, or annotations, then save your changes to create a new edited PDF document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EditPdfPage;
