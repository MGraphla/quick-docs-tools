
import { Loader2, Eraser, Undo, Redo, Eye, Trash2, Save, CheckCircle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EditedFile, PdfEdit } from "@/types/pdfEdit";

interface PdfEditorProps {
  fileInfo: { size: string; pages: number } | null;
  currentPage: number;
  pageImage: string | null;
  edits: PdfEdit[];
  processing: boolean;
  progress: number;
  progressMessage: string;
  editedFile: EditedFile | null;
  onCanvasClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClearEdits: () => void;
  onSavePdf: () => void;
  onDownloadEdited: () => void;
}

export const PdfEditor = ({
  fileInfo,
  currentPage,
  pageImage,
  edits,
  processing,
  progress,
  progressMessage,
  editedFile,
  onCanvasClick,
  onClearEdits,
  onSavePdf,
  onDownloadEdited
}: PdfEditorProps) => {
  return (
    <div className="lg:col-span-3 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>PDF Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClearEdits}>
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
            {fileInfo && (
              <>Page {currentPage} of {fileInfo.pages} - Click on the document to add content ({edits.length} edits)</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg flex items-center justify-center min-h-[600px]">
            <div 
              className="bg-white shadow-lg rounded-lg overflow-hidden cursor-crosshair relative"
              style={{ width: '595px', height: '842px' }}
              onClick={onCanvasClick}
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
              onClick={onSavePdf}
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
                onClick={onDownloadEdited}
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
  );
};
