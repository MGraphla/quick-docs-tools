
import { useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PdfUploadProps {
  onFileSelect: (files: FileList | null) => void;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const PdfUpload = ({ onFileSelect, dragOver, onDragOver, onDragLeave, onDrop }: PdfUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="border-2 border-dashed border-gray-300 hover:border-violet-400 transition-all duration-300">
      <CardContent className="p-8">
        <div
          className={`text-center transition-all duration-300 cursor-pointer ${
            dragOver ? 'scale-105 bg-violet-50' : ''
          }`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
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
            onChange={(e) => onFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
};
