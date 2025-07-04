import { useState, useEffect, useRef } from "react";
import { Save, Download, Upload, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Undo, Redo, Type, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/pdfUtils";

// Simplified Quill interface
interface QuillEditor {
  root: HTMLElement;
  getText: () => string;
  getHTML: () => string;
  setText: (text: string) => void;
  setHTML: (html: string) => void;
  format: (name: string, value: any) => void;
  getSelection: () => { index: number; length: number } | null;
  setSelection: (index: number, length?: number) => void;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
  // Removed history property to fix TypeScript errors
}

const TextEditorPage = () => {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("document.txt");
  const [fontSize, setFontSize] = useState([14]);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [saving, setSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const quillRef = useRef<QuillEditor | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Quill editor
  useEffect(() => {
    const initQuill = async () => {
      try {
        const Quill = (await import('quill')).default;
        
        if (editorRef.current && !quillRef.current) {
          const quill = new Quill(editorRef.current, {
            theme: 'snow',
            modules: {
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['blockquote', 'code-block'],
                ['link', 'image'],
                ['clean']
              ]
            },
            placeholder: 'Start typing your document...'
          });

          // Handle content changes
          quill.on('text-change', () => {
            const text = quill.getText();
            const html = quill.getHTML();
            setContent(html);
            
            // Update word and character count
            const words = text.trim().split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
            setCharCount(text.length);
            
            // Save to undo stack
            setUndoStack(prev => [...prev.slice(-9), html]);
          });

          quillRef.current = quill as QuillEditor;
        }
      } catch (error) {
        console.error('Failed to load Quill editor:', error);
        toast.error('Failed to load text editor');
      }
    };

    initQuill();
  }, []);

  const handleUndo = () => {
    if (undoStack.length > 1 && quillRef.current) {
      const currentContent = undoStack[undoStack.length - 1];
      const previousContent = undoStack[undoStack.length - 2];
      
      setRedoStack(prev => [...prev, currentContent]);
      setUndoStack(prev => prev.slice(0, -1));
      
      quillRef.current.setHTML(previousContent);
      setContent(previousContent);
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0 && quillRef.current) {
      const contentToRestore = redoStack[redoStack.length - 1];
      
      setUndoStack(prev => [...prev, contentToRestore]);
      setRedoStack(prev => prev.slice(0, -1));
      
      quillRef.current.setHTML(contentToRestore);
      setContent(contentToRestore);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (quillRef.current) {
        if (file.type === 'text/html' || file.name.endsWith('.html')) {
          quillRef.current.setHTML(text);
        } else {
          quillRef.current.setText(text);
        }
        setFileName(file.name);
        toast.success(`Loaded ${file.name}`);
      }
    };
    
    if (file.type === 'text/html' || file.name.endsWith('.html')) {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }
  };

  const saveAsText = () => {
    if (!quillRef.current) return;
    
    setSaving(true);
    try {
      const text = quillRef.current.getText();
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace(/\.[^/.]+$/, "") + '.txt';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Document saved as text file');
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const saveAsHTML = () => {
    if (!quillRef.current) return;
    
    setSaving(true);
    try {
      const html = quillRef.current.getHTML();
      const fullHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body { font-family: ${fontFamily}, sans-serif; font-size: ${fontSize[0]}px; line-height: 1.6; margin: 40px; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
      
      const blob = new Blob([fullHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName.replace(/\.[^/.]+$/, "") + '.html';
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Document saved as HTML file');
    } catch (error) {
      toast.error('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const exportToPDF = async () => {
    if (!quillRef.current) return;
    
    setSaving(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      const text = quillRef.current.getText();
      const lines = text.split('\n');
      
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const lineHeight = fontSize[0] * 0.4;
      
      doc.setFontSize(fontSize[0]);
      
      for (const line of lines) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        
        // Handle long lines by wrapping
        const maxWidth = 170;
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + word + ' ';
          const textWidth = doc.getTextWidth(testLine);
          
          if (textWidth > maxWidth && currentLine !== '') {
            doc.text(currentLine.trim(), 20, yPosition);
            yPosition += lineHeight;
            currentLine = word + ' ';
            
            if (yPosition > pageHeight - 20) {
              doc.addPage();
              yPosition = 20;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine.trim()) {
          doc.text(currentLine.trim(), 20, yPosition);
        }
        
        yPosition += lineHeight;
      }
      
      doc.save(fileName.replace(/\.[^/.]+$/, "") + '.pdf');
      toast.success('Document exported as PDF');
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setSaving(false);
    }
  };

  const clearDocument = () => {
    if (quillRef.current) {
      quillRef.current.setText('');
      setContent('');
      setFileName('document.txt');
      setUndoStack([]);
      setRedoStack([]);
      toast.success('Document cleared');
    }
  };

  const applyFormatting = (format: string, value?: any) => {
    if (quillRef.current) {
      quillRef.current.format(format, value);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Type className="h-4 w-4 mr-2" />
          Text Editor
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Text Editor</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create, edit, and format documents with our powerful online text editor.
        </p>
      </div>

      {/* Toolbar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Open
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.html,.htm"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={undoStack.length <= 1}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRedo}
                disabled={redoStack.length === 0}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Select value={fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Arial">Arial</SelectItem>
                  <SelectItem value="Georgia">Georgia</SelectItem>
                  <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                  <SelectItem value="Helvetica">Helvetica</SelectItem>
                  <SelectItem value="Courier New">Courier New</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-sm">Size: {fontSize[0]}px</Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                max={24}
                min={8}
                step={1}
                className="w-20"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={saveAsText}
                disabled={saving}
              >
                <Save className="h-4 w-4 mr-2" />
                Save TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={saveAsHTML}
                disabled={saving}
              >
                <FileText className="h-4 w-4 mr-2" />
                Save HTML
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToPDF}
                disabled={saving}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="p-0">
          <div 
            ref={editorRef} 
            className="min-h-[600px]"
            style={{ 
              fontFamily: fontFamily,
              fontSize: `${fontSize[0]}px`
            }}
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Words: {wordCount}</span>
            <span>Characters: {charCount}</span>
            <span>Document: {fileName}</span>
            <Button variant="ghost" size="sm" onClick={clearDocument}>
              Clear Document
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Text Editor Features:</strong> Create and edit documents with rich formatting, save in multiple formats (TXT, HTML, PDF), and use keyboard shortcuts for quick formatting.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TextEditorPage;
