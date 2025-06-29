import { useState, useRef, useEffect } from "react";
import { Type, Download, Bold, Italic, Underline, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, AlignLeft, AlignCenter, AlignRight, AlignJustify, Heading1, Heading2, Heading3, FileText, CheckCircle, AlertCircle, Printer, SpellCheck, ZoomIn, ZoomOut, Undo, Redo, Palette, Highlighter, Strikethrough, Indent, Outdent, Weight as LineHeight, Eraser, Save, ChevronDown, Code, Quote, Paperclip, MessageSquare, X, Minus, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.vfs;

const TextEditorPage = () => {
  const [content, setContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [paperSize, setPaperSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Arial');
  const [margins, setMargins] = useState('normal');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [showCommentPanel, setShowCommentPanel] = useState(false);
  const [comments, setComments] = useState<{id: string; text: string; date: Date}[]>([]);
  
  const quillRef = useRef<ReactQuill>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Custom toolbar options
  const modules = {
    toolbar: {
      container: '#toolbar',
      handlers: {
        'undo': () => {
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            quill.history.undo();
          }
        },
        'redo': () => {
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            quill.history.redo();
          }
        },
      }
    },
    history: {
      delay: 500,
      maxStack: 100,
      userOnly: true
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'align', 'direction',
    'color', 'background',
    'font', 'size',
    'script'
  ];

  // Handle zoom changes
  useEffect(() => {
    if (editorContainerRef.current) {
      editorContainerRef.current.style.transform = `scale(${zoom / 100})`;
      editorContainerRef.current.style.transformOrigin = 'top center';
    }
  }, [zoom]);

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const getMarginValues = () => {
    switch (margins) {
      case 'narrow': return [10, 10, 10, 10]; // [top, right, bottom, left] in mm
      case 'wide': return [25, 25, 25, 25];
      case 'normal':
      default: return [15, 15, 15, 15];
    }
  };

  const generatePdf = async () => {
    if (!content.trim()) {
      toast.error("Please add some content before exporting");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a temporary div to render the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      document.body.appendChild(tempDiv);
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      
      // Convert HTML to pdfmake compatible format
      const html = htmlToPdfmake(content, {
        tableAutoSize: true,
        imagesByReference: true
      });
      
      // Get page dimensions based on selected paper size and orientation
      let pageWidth, pageHeight;
      if (paperSize === 'a4') {
        pageWidth = orientation === 'portrait' ? 595.28 : 841.89;
        pageHeight = orientation === 'portrait' ? 841.89 : 595.28;
      } else if (paperSize === 'letter') {
        pageWidth = orientation === 'portrait' ? 612 : 792;
        pageHeight = orientation === 'portrait' ? 792 : 612;
      } else { // legal
        pageWidth = orientation === 'portrait' ? 612 : 1008;
        pageHeight = orientation === 'portrait' ? 1008 : 612;
      }
      
      // Get margins
      const [top, right, bottom, left] = getMarginValues();
      
      // Create document definition
      const docDefinition = {
        content: [html],
        pageSize: paperSize,
        pageOrientation: orientation,
        defaultStyle: {
          font: fontFamily,
          fontSize: parseInt(fontSize)
        },
        pageMargins: [left, top, right, bottom]
      };
      
      // Generate PDF
      const pdfDocGenerator = pdfMake.createPdf(docDefinition);
      
      // Get PDF as base64
      pdfDocGenerator.getBase64((data) => {
        setGeneratedPdf(`data:application/pdf;base64,${data}`);
        setIsGenerating(false);
        toast.success("PDF generated successfully!");
        setShowExportOptions(false);
        
        // Clean up
        document.body.removeChild(tempDiv);
      });
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  const downloadPdf = () => {
    if (!generatedPdf) {
      generatePdf();
      return;
    }
    
    const link = document.createElement('a');
    link.href = generatedPdf;
    link.download = `${documentTitle || 'document'}.pdf`;
    link.click();
    toast.success("PDF downloaded successfully!");
  };

  const downloadAsText = () => {
    // Create a temporary div to extract plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle || 'document'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded successfully!");
  };

  const downloadAsHtml = () => {
    // Create HTML document with proper structure
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${documentTitle || 'Document'}</title>
        <style>
          body { font-family: ${fontFamily}, sans-serif; font-size: ${fontSize}pt; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle || 'document'}.html`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("HTML file downloaded successfully!");
  };

  const handleExport = () => {
    if (exportFormat === 'pdf') {
      generatePdf();
    } else if (exportFormat === 'txt') {
      downloadAsText();
    } else if (exportFormat === 'html') {
      downloadAsHtml();
    }
  };

  const handlePrint = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const html = quill.root.innerHTML;
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${documentTitle || 'Document'} - Print</title>
            <style>
              body { font-family: ${fontFamily}, sans-serif; margin: 20mm; }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            ${html}
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast.error("Unable to open print window. Please check your popup blocker settings.");
      }
    }
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.format('color', color);
    }
  };

  const handleHighlightColorChange = (color: string) => {
    setHighlightColor(color);
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      quill.format('background', color);
    }
  };

  const handleFormatClear = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.removeFormat(range.index, range.length);
        toast.success("Formatting cleared");
      } else {
        toast.info("Select text to clear formatting");
      }
    }
  };

  const handleAddComment = () => {
    const newComment = {
      id: Math.random().toString(36).substring(2, 9),
      text: "New comment",
      date: new Date()
    };
    setComments([...comments, newComment]);
    setShowCommentPanel(true);
    toast.success("Comment added");
  };

  const handleRemoveComment = (id: string) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  const handleSave = () => {
    // In a real app, this would save to a server or local storage
    localStorage.setItem('savedDocument', JSON.stringify({
      title: documentTitle,
      content: content,
      lastSaved: new Date().toISOString()
    }));
    toast.success("Document saved successfully");
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
            <Type className="h-4 w-4 mr-2" />
            Rich Text Editor
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleSave}
            className="border-purple-200 hover:border-purple-300 hover:bg-purple-50"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="border-purple-200 hover:border-purple-300 hover:bg-purple-50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {generatedPdf && (
            <Button 
              onClick={downloadPdf}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Document Title */}
      <div className="flex items-center gap-4">
        <Input
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Document Title"
          className="text-xl font-medium border-none shadow-none focus-visible:ring-0 px-0 max-w-md"
        />
      </div>

      {/* Export Options */}
      {showExportOptions && (
        <Card className="border-purple-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-purple-600" />
              Export Options
            </CardTitle>
            <CardDescription>
              Configure your document export settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Paper Size</Label>
                <Select value={paperSize} onValueChange={setPaperSize}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Orientation</Label>
                <Select value={orientation} onValueChange={setOrientation}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Select value={exportFormat} onValueChange={setExportFormat}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="txt">Plain Text</SelectItem>
                    <SelectItem value="html">HTML Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times">Times New Roman</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10pt</SelectItem>
                    <SelectItem value="11">11pt</SelectItem>
                    <SelectItem value="12">12pt</SelectItem>
                    <SelectItem value="14">14pt</SelectItem>
                    <SelectItem value="16">16pt</SelectItem>
                    <SelectItem value="18">18pt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Margins</Label>
                <Select value={margins} onValueChange={setMargins}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrow">Narrow</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-4">
            <Button variant="outline" onClick={() => setShowExportOptions(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleExport}
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isGenerating ? (
                <>Generating...</>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export as {exportFormat.toUpperCase()}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Text Editor Toolbar */}
      <Card className="border shadow-md">
        <CardContent className="p-0">
          <div className="border-b p-1 flex flex-wrap gap-1 items-center bg-gray-50" id="toolbar">
            {/* File Operations */}
            <div className="flex items-center border-r pr-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md" 
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.history.undo();
                  }
                }}
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.history.redo();
                  }
                }}
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={handlePrint}
                title="Print"
              >
                <Printer className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => toast.info("Spell check would be implemented here")}
                title="Spell Check"
              >
                <SpellCheck className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Zoom Control */}
            <div className="flex items-center border-r pr-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-xs rounded-md">
                    {zoom}%
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setZoom(50)}>50%</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setZoom(75)}>75%</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setZoom(100)}>100%</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setZoom(125)}>125%</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setZoom(150)}>150%</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setZoom(200)}>200%</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Text Style */}
            <div className="flex items-center border-r pr-1">
              <Select 
                defaultValue="normal"
                onValueChange={(value) => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    if (value === 'normal') {
                      quill.format('header', false);
                    } else if (['h1', 'h2', 'h3'].includes(value)) {
                      quill.format('header', parseInt(value.substring(1)));
                    }
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[130px] border-none focus:ring-0 focus:ring-offset-0 rounded-md">
                  <SelectValue placeholder="Normal Text" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal Text</SelectItem>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                  <SelectItem value="subtitle">Subtitle</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Font Family */}
            <div className="flex items-center border-r pr-1">
              <Select 
                defaultValue="Arial"
                onValueChange={(value) => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('font', value);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[130px] border-none focus:ring-0 focus:ring-offset-0 rounded-md">
                  <SelectValue placeholder="Arial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Verdana">Verdana</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Font Size */}
            <div className="flex items-center border-r pr-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const currentSize = quill.getFormat().size || '13';
                    const newSize = Math.max(8, parseInt(currentSize) - 1).toString();
                    quill.format('size', newSize);
                  }
                }}
                title="Decrease Font Size"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Select 
                defaultValue="13"
                onValueChange={(value) => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('size', value);
                  }
                }}
              >
                <SelectTrigger className="h-8 w-[60px] border-none focus:ring-0 focus:ring-offset-0 rounded-md">
                  <SelectValue placeholder="13" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="9">9</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="11">11</SelectItem>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="13">13</SelectItem>
                  <SelectItem value="14">14</SelectItem>
                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="18">18</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const currentSize = quill.getFormat().size || '13';
                    const newSize = Math.min(48, parseInt(currentSize) + 1).toString();
                    quill.format('size', newSize);
                  }
                }}
                title="Increase Font Size"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Text Formatting */}
            <div className="flex items-center border-r pr-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-bold"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const isBold = quill.getFormat().bold;
                    quill.format('bold', !isBold);
                  }
                }}
                title="Bold"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-italic"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const isItalic = quill.getFormat().italic;
                    quill.format('italic', !isItalic);
                  }
                }}
                title="Italic"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-underline"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const isUnderline = quill.getFormat().underline;
                    quill.format('underline', !isUnderline);
                  }
                }}
                title="Underline"
              >
                <Underline className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-strike"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const isStrike = quill.getFormat().strike;
                    quill.format('strike', !isStrike);
                  }
                }}
                title="Strikethrough"
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Text Color & Highlight */}
            <div className="flex items-center border-r pr-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative rounded-md" title="Text Color">
                    <Palette className="h-4 w-4" />
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-sm" 
                      style={{ backgroundColor: textColor }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Text Color</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
                        '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080',
                        '#808000', '#800080', '#008080', '#808080', '#C0C0C0'].map(color => (
                        <div 
                          key={color}
                          className="w-6 h-6 rounded-sm cursor-pointer border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleTextColorChange(color)}
                        />
                      ))}
                    </div>
                    <Input 
                      type="color" 
                      value={textColor} 
                      onChange={(e) => handleTextColorChange(e.target.value)} 
                      className="w-full h-8 mt-1"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative rounded-md" title="Highlight Color">
                    <Highlighter className="h-4 w-4" />
                    <div 
                      className="absolute bottom-0 left-0 right-0 h-1 rounded-sm" 
                      style={{ backgroundColor: highlightColor }}
                    />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-2">
                  <div className="space-y-2">
                    <Label className="text-xs">Highlight Color</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {['#FFFF00', '#00FFFF', '#FF00FF', '#FF0000', '#00FF00', 
                        '#0000FF', '#FFFFFF', '#F0F0F0', '#D3D3D3', '#FFA500',
                        '#FFC0CB', '#90EE90', '#ADD8E6', '#E6E6FA', '#FFFACD'].map(color => (
                        <div 
                          key={color}
                          className="w-6 h-6 rounded-sm cursor-pointer border border-gray-300 hover:scale-110 transition-transform"
                          style={{ backgroundColor: color }}
                          onClick={() => handleHighlightColorChange(color)}
                        />
                      ))}
                    </div>
                    <Input 
                      type="color" 
                      value={highlightColor} 
                      onChange={(e) => handleHighlightColorChange(e.target.value)} 
                      className="w-full h-8 mt-1"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            
            {/* Insert */}
            <div className="flex items-center border-r pr-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-link"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    if (range) {
                      const href = prompt('Enter link URL:');
                      if (href) {
                        quill.format('link', href);
                      } else {
                        quill.format('link', false);
                      }
                    } else {
                      toast.info("Select text to add a link");
                    }
                  }
                }}
                title="Insert Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-image"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const range = quill.getSelection();
                    if (range) {
                      const url = prompt('Enter image URL:');
                      if (url) {
                        quill.insertEmbed(range.index, 'image', url);
                      }
                    } else {
                      toast.info("Place cursor where you want to insert an image");
                    }
                  }
                }}
                title="Insert Image"
              >
                <ImageIcon className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={handleAddComment}
                title="Add Comment"
              >
                <MessageSquare className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx';
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      toast.success(`File "${files[0].name}" attached`);
                    }
                  };
                  input.click();
                }}
                title="Attach File"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Alignment */}
            <div className="flex items-center border-r pr-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-align"
                value=""
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('align', '');
                  }
                }}
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-align"
                value="center"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('align', 'center');
                  }
                }}
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-align"
                value="right"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('align', 'right');
                  }
                }}
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-align"
                value="justify"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('align', 'justify');
                  }
                }}
                title="Justify"
              >
                <AlignJustify className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Lists */}
            <div className="flex items-center border-r pr-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-list"
                value="bullet"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const format = quill.getFormat();
                    quill.format('list', format.list === 'bullet' ? false : 'bullet');
                  }
                }}
                title="Bullet List"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-list"
                value="ordered"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const format = quill.getFormat();
                    quill.format('list', format.list === 'ordered' ? false : 'ordered');
                  }
                }}
                title="Numbered List"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-indent"
                value="-1"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('indent', '-1');
                  }
                }}
                title="Decrease Indent"
              >
                <Outdent className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-indent"
                value="+1"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    quill.format('indent', '+1');
                  }
                }}
                title="Increase Indent"
              >
                <Indent className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Additional Formatting */}
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-blockquote"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const format = quill.getFormat();
                    quill.format('blockquote', !format.blockquote);
                  }
                }}
                title="Quote"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md ql-code-block"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    const format = quill.getFormat();
                    quill.format('code-block', !format['code-block']);
                  }
                }}
                title="Code Block"
              >
                <Code className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={() => {
                  if (quillRef.current) {
                    const quill = quillRef.current.getEditor();
                    // This is a simplified version - in a real app you'd have a proper line height selector
                    quill.format('lineHeight', '2.0');
                    toast.info("Line height adjusted");
                  }
                }}
                title="Line Height"
              >
                <LineHeight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-md"
                onClick={handleFormatClear}
                title="Clear Formatting"
              >
                <Eraser className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Editor Container */}
          <div className="flex">
            {/* Main Editor */}
            <div className="flex-1 min-h-[600px]" ref={contentRef}>
              <div 
                ref={editorContainerRef} 
                className="transition-transform duration-200"
                style={{ transformOrigin: 'top center' }}
              >
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Start typing your document here..."
                  className="h-[550px] border-none"
                />
              </div>
            </div>
            
            {/* Comments Panel */}
            {showCommentPanel && (
              <div className="w-64 border-l p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Comments</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => setShowCommentPanel(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {comments.length === 0 ? (
                  <p className="text-sm text-gray-500">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {comments.map(comment => (
                      <div key={comment.id} className="bg-white p-3 rounded-md shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">User</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 w-5 p-0"
                            onClick={() => handleRemoveComment(comment.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm">{comment.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {comment.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
                  onClick={handleAddComment}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Add Comment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      {generatedPdf && (
        <Card className="border-purple-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5 text-purple-600" />
              PDF Preview
            </CardTitle>
            <CardDescription>
              Your document has been converted to PDF format
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden h-[500px]">
              <iframe 
                src={generatedPdf} 
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button 
              onClick={downloadPdf}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Help Section */}
      <Alert className="bg-blue-50 border-blue-200 max-w-3xl mx-auto">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <strong>How to use the rich text editor:</strong> Type your content in the editor above. Use the toolbar to format text, add lists, links, images, and adjust alignment. When you're ready, click "Export" to configure your document settings and download it as a PDF.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TextEditorPage;