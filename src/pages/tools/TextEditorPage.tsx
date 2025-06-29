import { useState, useRef, useEffect } from "react";
import { Type, Download, Bold, Italic, Underline, List, ListOrdered, Link, Image, AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Heading3, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const TextEditorPage = () => {
  const [content, setContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');
  const [paperSize, setPaperSize] = useState('a4');
  const [orientation, setOrientation] = useState('portrait');
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Helvetica');
  const [margins, setMargins] = useState('normal');
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const quillRef = useRef<ReactQuill>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'indent',
    'link', 'image',
    'align', 'direction',
    'script'
  ];

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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Type className="h-4 w-4 mr-2" />
          Text Editor
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Rich Text Editor</h1>
        <p className="text-gray-600 mt-2">Create and format documents with our powerful text editor, then export to PDF</p>
      </div>

      {/* Document Title */}
      <div className="flex items-center gap-4">
        <Input
          value={documentTitle}
          onChange={(e) => setDocumentTitle(e.target.value)}
          placeholder="Document Title"
          className="text-xl font-medium border-none shadow-none focus-visible:ring-0 px-0 max-w-md"
        />
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="ml-auto"
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

      {/* Export Options */}
      {showExportOptions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Helvetica">Helvetica</SelectItem>
                    <SelectItem value="Times">Times New Roman</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select value={fontSize} onValueChange={setFontSize}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
          <CardFooter className="flex justify-between">
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

      {/* Text Editor */}
      <Card className="border shadow-md">
        <CardContent className="p-0">
          <div className="min-h-[600px]" ref={contentRef}>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={handleContentChange}
              modules={modules}
              formats={formats}
              placeholder="Start typing your document here..."
              className="h-[550px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* PDF Preview */}
      {generatedPdf && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
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
          <CardFooter>
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
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use the text editor:</strong> Type your content in the editor above. Use the toolbar to format text, add lists, links, and images. When you're ready, click "Export" to configure your document settings and download it as a PDF.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TextEditorPage;