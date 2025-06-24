
import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Unlock, Loader2, CheckCircle, AlertCircle, Key, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { createPdfProcessor, formatFileSize } from "@/lib/pdfUtils";

interface UnlockedFile {
  name: string;
  url: string;
  size: string;
}

const UnlockPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [password, setPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [unlockedFile, setUnlockedFile] = useState<UnlockedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      // Try to load without password first to check if it's protected
      try {
        const info = await pdfProcessor.loadPdf(selectedFile);
        setFile(selectedFile);
        setFileInfo({
          size: formatFileSize(selectedFile.size),
          pages: info.pageCount
        });
        toast.success("PDF loaded - this file is not password protected");
      } catch (error) {
        // File is likely password protected
        setFile(selectedFile);
        setFileInfo({
          size: formatFileSize(selectedFile.size),
          pages: 0 // Will be determined after unlock
        });
        toast.info("PDF is password protected - enter password to unlock");
      }
      
      setUnlockedFile(null);
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error(error instanceof Error ? error.message : "Failed to load PDF");
    } finally {
      toast.dismiss(loadingToast);
    }
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

  const unlockPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!password.trim()) {
      toast.error("Please enter the password");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Attempting to unlock PDF...");

    try {
      const steps = [
        { message: "Verifying password...", progress: 25 },
        { message: "Removing encryption...", progress: 50 },
        { message: "Preserving document content...", progress: 75 },
        { message: "Finalizing unlocked PDF...", progress: 90 }
      ];

      for (const step of steps) {
        setProgressMessage(step.message);
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const unlockedData = await pdfProcessor.unlockPdf(file, password);
      
      setUnlockedFile({
        name: `unlocked-${file.name}`,
        url: pdfProcessor.createDownloadLink(unlockedData, `unlocked-${file.name}`),
        size: formatFileSize(unlockedData.length)
      });
      
      setProgress(100);
      setProgressMessage("PDF unlocked successfully!");
      toast.success("PDF unlocked successfully!");
      
    } catch (error) {
      console.error('Unlock error:', error);
      toast.error("Invalid password or failed to unlock PDF. Please check your password and try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadUnlocked = () => {
    if (!unlockedFile) return;
    
    const link = document.createElement('a');
    link.href = unlockedFile.url;
    link.download = unlockedFile.name;
    link.click();
    toast.success(`Downloaded ${unlockedFile.name}`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Unlock className="h-4 w-4 mr-2" />
          PDF Unlock Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Unlock PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Remove password protection from PDF documents and create an unlocked version that can be opened without a password.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-green-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-green-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a password-protected PDF file to unlock
              </p>
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                <Upload className="h-5 w-5 mr-2" />
                Choose PDF File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* PDF Unlock Interface */}
      {file && fileInfo && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-500">{fileInfo.size}</p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  Password Protected
                </Badge>
              </div>
              
              <Alert className="bg-yellow-50 border-yellow-200">
                <Key className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700">
                  This PDF file is password protected. Enter the correct password to remove protection and create an unlocked version.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enter Password</CardTitle>
              <CardDescription>
                Enter the password for this protected PDF document
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter PDF password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && unlockPdf()}
                />
              </div>
              
              <Button
                onClick={unlockPdf}
                disabled={processing || !password.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Unlocking...
                  </>
                ) : (
                  <>
                    <Unlock className="h-5 w-5 mr-2" />
                    Unlock PDF
                  </>
                )}
              </Button>

              {/* Processing Progress */}
              {processing && (
                <div className="mt-6">
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      {progressMessage || "Removing password protection..."}
                    </p>
                    <div className="max-w-md mx-auto">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Unlocked File */}
          {unlockedFile && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                      PDF Unlocked Successfully!
                    </h3>
                    <p className="text-green-700 mb-2">{unlockedFile.name}</p>
                    <p className="text-sm text-green-600">
                      Password protection has been removed. The file can now be opened without a password.
                    </p>
                  </div>
                  <Button
                    onClick={downloadUnlocked}
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
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to unlock a PDF:</strong> Upload a password-protected PDF file, enter the correct password, then click "Unlock PDF" to remove the protection and download an unlocked version.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UnlockPdfPage;
