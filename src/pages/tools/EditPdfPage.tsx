
import { useState } from "react";
import { Upload, FileText, Download, Type, Square, Circle, Highlighter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const EditPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [editTool, setEditTool] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [editedFile, setEditedFile] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setEditedFile(null);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const savePdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    // Simulate saving process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setEditedFile(`edited-${file.name}`);
    toast.success("PDF saved successfully!");
  };

  const downloadEdited = () => {
    const link = document.createElement('a');
    link.href = '#';
    link.download = editedFile || 'edited-document.pdf';
    link.click();
    toast.success("Edited PDF downloaded!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit PDF</h1>
        <p className="text-gray-600 mt-2">Add text, shapes, and annotations to your PDF</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select the PDF file you want to edit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            onDrop={(e) => {
              e.preventDefault();
              const droppedFile = e.dataTransfer.files[0];
              if (droppedFile && droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setEditedFile(null);
              }
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Drop PDF file here</h3>
            <p className="text-gray-600 mb-4">or click to browse</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
              id="pdf-upload"
            />
            <Button asChild>
              <label htmlFor="pdf-upload" className="cursor-pointer">
                Select PDF File
              </label>
            </Button>
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
              <FileText className="h-4 w-4 text-red-600" />
              <span className="text-sm">{file.name}</span>
              <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {file && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Editing Tools</CardTitle>
              <CardDescription>
                Choose the tool you want to use for editing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant={editTool === "text" ? "default" : "outline"}
                  onClick={() => setEditTool("text")}
                  className="flex flex-col gap-2 h-16"
                >
                  <Type className="h-5 w-5" />
                  <span className="text-xs">Text</span>
                </Button>
                
                <Button
                  variant={editTool === "highlight" ? "default" : "outline"}
                  onClick={() => setEditTool("highlight")}
                  className="flex flex-col gap-2 h-16"
                >
                  <Highlighter className="h-5 w-5" />
                  <span className="text-xs">Highlight</span>
                </Button>
                
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
              </div>

              {editTool === "text" && (
                <div className="space-y-2">
                  <Label>Text to Add</Label>
                  <Input
                    placeholder="Enter text to add to PDF"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>PDF Preview & Editor</CardTitle>
              <CardDescription>
                Click on the PDF to add annotations and text
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg bg-gray-100 h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>PDF Editor Canvas</p>
                  <p className="text-sm">In a real implementation, this would show the PDF with editing capabilities</p>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button onClick={savePdf} className="flex-1">
                  Save Changes
                </Button>
                
                {editedFile && (
                  <Button onClick={downloadEdited} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              {editedFile && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">PDF Edited Successfully!</p>
                      <p className="text-sm text-green-600">{editedFile}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default EditPdfPage;
