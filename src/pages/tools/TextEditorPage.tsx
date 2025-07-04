import { useState, useRef, useEffect, useCallback } from "react";
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Save, Download, Undo, Redo, Loader2, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const TextEditorPage = () => {
  const [text, setText] = useState("");
  const [filename, setFilename] = useState("document.txt");
  const [fileType, setFileType] = useState("text/plain");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previousContent, setPreviousContent] = useState(null);
  const quillRef = useRef<ReactQuill>(null);

  const undo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // Simple undo by restoring previous content
      if (previousContent) {
        quill.setContents(previousContent);
      }
    }
  };

  const redo = () => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // Simple redo functionality - this is a basic implementation
      // For full undo/redo, you'd need to implement a proper history stack
    }
  };

  const handleChange = (content: string, delta: any, source: string, editor: any) => {
    setText(content);
    if (source === 'user') {
      setPreviousContent(editor.getContents());
    }
  };

  const handleFilenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(e.target.value);
  };

  const handleFileTypeChange = (value: string) => {
    setFileType(value);
  };

  const saveText = () => {
    setProcessing(true);
    setProgress(0);

    try {
      const blob = new Blob([text], { type: fileType });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      setProgress(100);
      toast.success("Text saved successfully!");
    } catch (error) {
      console.error("Error saving text:", error);
      toast.error("Failed to save text. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  const downloadText = () => {
    if (!downloadUrl) {
      toast.error("No text saved yet. Please save the text first.");
      return;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    toast.success("Text downloaded successfully!");
  };

  const modules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' },
      { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean'],
      ['code-block'],
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'code-block'
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileText className="h-4 w-4 mr-2" />
          Text Editor
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Online Text Editor</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Create, edit, and save your text documents online with our easy-to-use text editor.
        </p>
      </div>

      {/* Editor Card */}
      <Card>
        <CardHeader>
          <CardTitle>Text Editor</CardTitle>
          <CardDescription>
            Start writing your document here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={text}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder="Start writing here..."
            className="bg-white rounded-md shadow-sm"
          />
        </CardContent>
      </Card>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Customize your document settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                type="text"
                id="filename"
                placeholder="document.txt"
                value={filename}
                onChange={handleFilenameChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filetype">File Type</Label>
              <Select onValueChange={handleFileTypeChange} defaultValue={fileType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a file type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text/plain">Plain Text (.txt)</SelectItem>
                  <SelectItem value="text/html">HTML (.html)</SelectItem>
                  <SelectItem value="application/json">JSON (.json)</SelectItem>
                  <SelectItem value="text/csv">CSV (.csv)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={undo}
                className="p-2 hover:bg-gray-100"
                title="Undo"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={redo}
                className="p-2 hover:bg-gray-100"
                title="Redo"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveText}
                disabled={processing}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Text
                  </>
                )}
              </Button>
              <Button
                onClick={downloadText}
                disabled={!downloadUrl}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Processing State */}
      {processing && (
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Saving Text</h3>
              <p className="text-gray-600 mb-4">
                Please wait while we save your text document.
              </p>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success State */}
      {downloadUrl && !processing && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Text Saved Successfully!</h3>
                <p className="text-sm text-green-600">
                  Your text has been saved and is ready for download.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use the Text Editor:</strong> Start typing in the editor area to create your document. Use the toolbar to format your text. Set the filename and file type, then click "Save Text" to generate a downloadable file.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TextEditorPage;
