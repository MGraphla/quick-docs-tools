import { useState, useCallback, useRef, useEffect } from "react";
import { Pencil, AlertCircle, Loader2, Save, Download, Eraser, Undo, Redo, Eye, Trash2, CheckCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePdfEditor } from "@/hooks/usePdfEditor";
import { PdfUpload } from "@/components/pdf/PdfUpload";
import { EditToolsSidebar } from "@/components/pdf/EditToolsSidebar";
import { PdfEditor } from "@/components/pdf/PdfEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";

const EditPdfPage = () => {
  const [editTool, setEditTool] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState([16]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [strokeWidth, setStrokeWidth] = useState([2]);
  const [fillColor, setFillColor] = useState("#3b82f6");
  const [opacity, setOpacity] = useState([100]);
  const [dragOver, setDragOver] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showMobileTools, setShowMobileTools] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const {
    file,
    fileInfo,
    currentPage,
    pageImage,
    edits,
    processing,
    progress,
    progressMessage,
    editedFile,
    selectedImage,
    handleFileSelect,
    changePage,
    addEdit,
    clearEdits,
    savePdf,
    downloadEdited,
    handleImageUpload
  } = usePdfEditor();

  const editorContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    // Initial check
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
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
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!editorContainerRef.current) return;
    
    const rect = editorContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const pdfX = (x / rect.width) * 595;
    const pdfY = (y / rect.height) * 842;
    
    addEdit(editTool, pdfX, pdfY, textInput, fontSize, textColor, selectedImage);
    
    if (isMobileView) {
      setSheetOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Pencil className="h-4 w-4 mr-2" />
          PDF Editor
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Edit PDF</h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          Add text, shapes, images, and annotations to your PDF documents with our professional editing tools.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <PdfUpload
          onFileSelect={handleFileSelect}
          dragOver={dragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />
      )}

      {/* PDF Editor Interface */}
      {file && fileInfo && (
        <>
          {/* Mobile Tools Toggle Button */}
          {isMobileView && (
            <div className="fixed bottom-4 right-4 z-50">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    className="rounded-full w-14 h-14 shadow-lg bg-violet-600 hover:bg-violet-700"
                  >
                    <Pencil className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] rounded-t-xl">
                  <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                      <Pencil className="h-5 w-5 text-violet-600" />
                      Editing Tools
                    </SheetTitle>
                  </SheetHeader>
                  <div className="overflow-y-auto pr-1 pb-16">
                    <EditToolsSidebar
                      file={file}
                      fileInfo={fileInfo}
                      currentPage={currentPage}
                      editTool={editTool}
                      textInput={textInput}
                      textColor={textColor}
                      fontSize={fontSize}
                      fontFamily={fontFamily}
                      strokeWidth={strokeWidth}
                      fillColor={fillColor}
                      opacity={opacity}
                      onEditToolChange={setEditTool}
                      onTextInputChange={setTextInput}
                      onTextColorChange={setTextColor}
                      onFontSizeChange={setFontSize}
                      onFontFamilyChange={setFontFamily}
                      onStrokeWidthChange={setStrokeWidth}
                      onFillColorChange={setFillColor}
                      onOpacityChange={setOpacity}
                      onPageChange={changePage}
                      onImageUpload={handleImageUpload}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tools Sidebar - Shown on desktop */}
            <div className="lg:col-span-1 space-y-6 hidden lg:block">
              <EditToolsSidebar
                file={file}
                fileInfo={fileInfo}
                currentPage={currentPage}
                editTool={editTool}
                textInput={textInput}
                textColor={textColor}
                fontSize={fontSize}
                fontFamily={fontFamily}
                strokeWidth={strokeWidth}
                fillColor={fillColor}
                opacity={opacity}
                onEditToolChange={setEditTool}
                onTextInputChange={setTextInput}
                onTextColorChange={setTextColor}
                onFontSizeChange={setFontSize}
                onFontFamilyChange={setFontFamily}
                onStrokeWidthChange={setStrokeWidth}
                onFillColorChange={setFillColor}
                onOpacityChange={setOpacity}
                onPageChange={changePage}
                onImageUpload={handleImageUpload}
              />
            </div>

            {/* PDF Editor */}
            <div className="lg:col-span-3 space-y-6">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Pencil className="h-5 w-5 text-violet-600" />
                      PDF Editor
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={clearEdits} className="h-8">
                        <Eraser className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Clear</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-8">
                        <Undo className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Undo</span>
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {fileInfo && (
                      <>Page {currentPage} of {fileInfo.pages} - Click on the document to add content ({edits.length} edits)</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[500px]">
                    <div 
                      ref={editorContainerRef}
                      className="bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair relative"
                      style={{ width: '100%', maxWidth: '595px', height: 'auto', aspectRatio: '1/1.414' }}
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

                      {/* Render edits */}
                      {edits.filter(edit => edit.page === currentPage).map((edit, index) => {
                        if (edit.type === 'text') {
                          return (
                            <div
                              key={index}
                              className="absolute pointer-events-none"
                              style={{
                                left: `${(edit.x / 595) * 100}%`,
                                top: `${(edit.y / 842) * 100}%`,
                                color: edit.color,
                                fontSize: `${edit.fontSize}px`,
                                fontFamily: fontFamily,
                              }}
                            >
                              {edit.content}
                            </div>
                          );
                        } else if (edit.type === 'shape' && editTool === 'rectangle') {
                          return (
                            <div
                              key={index}
                              className="absolute pointer-events-none"
                              style={{
                                left: `${(edit.x / 595) * 100}%`,
                                top: `${(edit.y / 842) * 100}%`,
                                width: `${(edit.width / 595) * 100}%`,
                                height: `${(edit.height / 842) * 100}%`,
                                border: `${edit.fontSize}px solid ${edit.color}`,
                                opacity: opacity[0] / 100,
                              }}
                            ></div>
                          );
                        } else if (edit.type === 'shape' && editTool === 'circle') {
                          return (
                            <div
                              key={index}
                              className="absolute rounded-full pointer-events-none"
                              style={{
                                left: `${(edit.x / 595) * 100}%`,
                                top: `${(edit.y / 842) * 100}%`,
                                width: `${(edit.width / 595) * 100}%`,
                                height: `${(edit.height / 842) * 100}%`,
                                border: `${edit.fontSize}px solid ${edit.color}`,
                                opacity: opacity[0] / 100,
                              }}
                            ></div>
                          );
                        } else if (edit.type === 'highlight') {
                          return (
                            <div
                              key={index}
                              className="absolute pointer-events-none"
                              style={{
                                left: `${(edit.x / 595) * 100}%`,
                                top: `${(edit.y / 842) * 100}%`,
                                width: `${(edit.width || 100) / 595 * 100}%`,
                                height: `${(edit.height || 20) / 842 * 100}%`,
                                backgroundColor: edit.color,
                                opacity: 0.3,
                              }}
                            ></div>
                          );
                        } else if (edit.type === 'image' && edit.imageData) {
                          return (
                            <img
                              key={index}
                              src={edit.imageData}
                              alt="Added image"
                              className="absolute pointer-events-none"
                              style={{
                                left: `${(edit.x / 595) * 100}%`,
                                top: `${(edit.y / 842) * 100}%`,
                                width: `${(edit.width || 100) / 595 * 100}%`,
                                height: 'auto',
                              }}
                            />
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between mt-4 gap-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-9">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-9"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Discard</span>
                      </Button>
                    </div>
                    <Button 
                      onClick={savePdf}
                      disabled={processing || edits.length === 0}
                      className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 h-9"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          <span className="hidden sm:inline">Saving...</span>
                          <span className="sm:hidden">Saving</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          <span className="hidden sm:inline">Save Changes</span>
                          <span className="sm:hidden">Save</span>
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Progress */}
              {processing && (
                <Card className="border-violet-200 shadow-sm">
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
                        <Progress value={progress} className="h-2 bg-violet-100" indicatorClassName="bg-violet-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edited File */}
              {editedFile && (
                <Card className="border-green-200 bg-green-50 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
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
        </>
      )}

      {/* Help Section */}
      {!file && (
        <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>How to edit a PDF:</strong> Upload a PDF file, then use the editing tools to add text, shapes, or annotations. Click on the document where you want to place your content, then save your changes to create a new edited PDF document.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default EditPdfPage;
