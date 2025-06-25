
import { useState, useCallback } from "react";
import { Pencil, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePdfEditor } from "@/hooks/usePdfEditor";
import { PdfUpload } from "@/components/pdf/PdfUpload";
import { EditToolsSidebar } from "@/components/pdf/EditToolsSidebar";
import { PdfEditor } from "@/components/pdf/PdfEditor";

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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert coordinates to PDF scale
    const pdfX = (x / rect.width) * 595; // Standard PDF width
    const pdfY = (y / rect.height) * 842; // Standard PDF height
    
    addEdit(editTool, pdfX, pdfY, textInput, fontSize, textColor, selectedImage);
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

          <PdfEditor
            fileInfo={fileInfo}
            currentPage={currentPage}
            pageImage={pageImage}
            edits={edits}
            processing={processing}
            progress={progress}
            progressMessage={progressMessage}
            editedFile={editedFile}
            onCanvasClick={handleCanvasClick}
            onClearEdits={clearEdits}
            onSavePdf={savePdf}
            onDownloadEdited={downloadEdited}
          />
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
