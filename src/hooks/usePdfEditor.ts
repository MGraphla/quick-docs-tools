
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";
import { EditedFile, PdfEdit } from "@/types/pdfEdit";

export const usePdfEditor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageImage, setPageImage] = useState<string | null>(null);
  const [edits, setEdits] = useState<PdfEdit[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [editedFile, setEditedFile] = useState<EditedFile | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  const changePage = async (newPage: number) => {
    if (!fileInfo || !file) return;
    if (newPage < 1 || newPage > fileInfo.pages) return;
    
    setCurrentPage(newPage);
    await renderCurrentPage(file, newPage);
  };

  const addEdit = (editTool: string, x: number, y: number, textInput: string, fontSize: number[], textColor: string, selectedImage: string | null) => {
    if (!file || !fileInfo) return;
    
    const newEdit: PdfEdit = {
      type: editTool as 'text' | 'highlight' | 'shape' | 'image',
      page: currentPage,
      x,
      y,
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

  const clearEdits = () => {
    setEdits([]);
    toast.success("All edits cleared");
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

      const editedPdfBytes = await pdfProcessor.editPdf(file, edits);
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

  return {
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
  };
};
