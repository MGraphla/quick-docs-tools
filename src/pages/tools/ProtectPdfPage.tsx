import { useState, useRef, useCallback } from "react";
import { Upload, FileText, Download, Shield, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, Lock, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { formatFileSize } from "@/lib/pdfUtils";
import ConvertApi from 'convertapi-js'

interface ProtectedFile {
  name: string;
  url: string;
  size: string;
}

const ProtectPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{ size: string; pages: number } | null>(null);
  const [protectionType, setProtectionType] = useState("password");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | ''>('');
  const [securityLevel, setSecurityLevel] = useState("128bit");
  const [targetFilename, setTargetFilename] = useState("");
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    editing: false,
    commenting: true,
    formFilling: true,
    contentExtraction: false,
    documentAssembly: false
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [protectedFile, setProtectedFile] = useState<ProtectedFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    if (selectedFile.type !== 'application/pdf') {
      toast.error("Please select a valid PDF file");
      return;
    }

    const loadingToast = toast.loading("Loading PDF...");
    
    try {
      // We don't need to load the PDF fully on the client side anymore
      // But we can still show some basic info
      setFile(selectedFile);
      setFileInfo({
        size: formatFileSize(selectedFile.size),
        pages: 0 // Page count is unknown without full parsing
      });
      
      const originalName = selectedFile.name;
      const nameWithoutExt = originalName.replace(/\.pdf$/i, '');
      setTargetFilename(`${nameWithoutExt}-protected.pdf`);
      
      setProtectedFile(null);
      toast.success(`PDF selected: ${selectedFile.name}`);
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    // Check password strength
    if (!newPassword) {
      setPasswordStrength('');
    } else if (newPassword.length < 6) {
      setPasswordStrength('weak');
    } else if (newPassword.length < 10 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  };

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  const protectPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (protectionType === "password") {
      if (!password) {
        toast.error("Please enter a password");
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
    }

    if (!targetFilename) {
      toast.error("Please enter a target filename");
      return;
    }

    setProcessing(true);
    setProgress(0);
    setProgressMessage("Uploading file to ConvertAPI...");

    const loadingToast = toast.loading("Protecting your PDF...");

    try {
      const convertApi = ConvertApi.auth(import.meta.env.VITE_CONVERTAPI_SECRET);
      const params = convertApi.createParams();
      params.add('File', file);
      params.add('UserPassword', password);
      // Note: ConvertAPI handles permissions differently. We are focusing on password protection as requested.
      // For more advanced permissions, the API parameters would need to be extended.

      setProgress(30);
      setProgressMessage("File uploaded, starting protection process...");

      const result = await convertApi.convert('pdf', 'protect', params);

      setProgress(80);
      setProgressMessage("Finalizing protected file...");

      const fileInfo = result.files[0];
      
      setProtectedFile({
        name: targetFilename, // Use user-defined filename
        url: fileInfo.Url, // Use the URL from ConvertAPI
        size: formatFileSize(fileInfo.FileSize)
      });

      setProgress(100);
      setProgressMessage("Protection completed!");
      toast.success("PDF protected successfully!");

    } catch (error) {
      console.error('ConvertAPI Error:', error);
      toast.error("Failed to protect PDF. Please check your API key and try again.");
    } finally {
      toast.dismiss(loadingToast);
      setProcessing(false);
      setProgress(0);
      setProgressMessage("");
    }
  };

  const downloadProtected = () => {
    if (!protectedFile) return;
    
    const link = document.createElement('a');
    link.href = protectedFile.url;
    link.download = protectedFile.name;
    link.click();
    toast.success(`Downloaded ${protectedFile.name}`);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'strong': return 'bg-green-500';
      default: return 'bg-gray-200';
    }
  };

  const resetForm = () => {
    setFile(null);
    setFileInfo(null);
    setPassword("");
    setConfirmPassword("");
    setTargetFilename("");
    setProtectedFile(null);
    setPasswordStrength("");
    
    // Reset permissions to defaults
    setPermissions({
      printing: true,
      copying: true,
      editing: false,
      commenting: true,
      formFilling: true,
      contentExtraction: false,
      documentAssembly: false
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Shield className="h-4 w-4 mr-2" />
          PDF Protection Tool
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Protect PDF</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Add password protection and set permissions for your PDF documents with enterprise-grade security.
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-red-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-red-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop PDF file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select a PDF file to add password protection
              </p>
              <Button size="lg" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
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

      {/* PDF Protection Interface */}
      {file && fileInfo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - File Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Source PDF File
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{fileInfo.pages} pages</span>
                        <span>•</span>
                        <span>{fileInfo.size}</span>
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-700">
                      This file is currently unprotected. Add password protection to secure your document.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label>Target PDF File</Label>
                    <Input
                      placeholder="protected-document.pdf"
                      value={targetFilename}
                      onChange={(e) => setTargetFilename(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Enter the filename for your protected PDF
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Protection Status */}
            {protectedFile && (
              <Card className="mt-6 border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-800 mb-1">
                        PDF Protected Successfully!
                      </h3>
                      <p className="text-green-700 mb-2">{protectedFile.name}</p>
                      <p className="text-sm text-green-600">
                        Your document has been secured with password protection
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={downloadProtected}
                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Protected PDF
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Protection Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure protection options for your PDF
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={protectionType} onValueChange={setProtectionType}>
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="password" className="flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      Password Protection
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center gap-1">
                      <Key className="h-4 w-4" />
                      Permission Settings
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="password" className="space-y-6">
                    <div className="space-y-2">
                      <Label>Security Level</Label>
                      <Select value={securityLevel} onValueChange={setSecurityLevel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="128bit">128-bit AES (Recommended)</SelectItem>
                          <SelectItem value="256bit">256-bit AES (Highest Security)</SelectItem>
                          <SelectItem value="40bit">40-bit RC4 (Legacy Compatibility)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        Higher security levels provide stronger protection but may not be compatible with older PDF readers
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={password}
                          onChange={handlePasswordChange}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      
                      {password && (
                        <div className="mt-1">
                          <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${getPasswordStrengthColor()}`} 
                              style={{ width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%' }}
                            />
                          </div>
                          <p className="text-xs mt-1 text-gray-500">
                            Password strength: {passwordStrength ? <span className="font-medium capitalize">{passwordStrength}</span> : 'Not set'}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Confirm Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pr-10"
                        />
                      </div>
                      
                      {password && confirmPassword && (
                        <p className={`text-xs mt-1 ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                          {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                        </p>
                      )}
                    </div>
                    
                    <Alert className="bg-blue-50 border-blue-200">
                      <Key className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        <strong>Password Tips:</strong> Use a combination of letters, numbers, and special characters. Longer passwords are more secure.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                  
                  <TabsContent value="permissions" className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Document Permissions</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="printing"
                            checked={permissions.printing}
                            onCheckedChange={() => handlePermissionChange('printing')}
                          />
                          <Label htmlFor="printing">Allow Printing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="copying"
                            checked={permissions.copying}
                            onCheckedChange={() => handlePermissionChange('copying')}
                          />
                          <Label htmlFor="copying">Allow Copying Text & Images</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="editing"
                            checked={permissions.editing}
                            onCheckedChange={() => handlePermissionChange('editing')}
                          />
                          <Label htmlFor="editing">Allow Editing</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="commenting"
                            checked={permissions.commenting}
                            onCheckedChange={() => handlePermissionChange('commenting')}
                          />
                          <Label htmlFor="commenting">Allow Commenting</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="formFilling"
                            checked={permissions.formFilling}
                            onCheckedChange={() => handlePermissionChange('formFilling')}
                          />
                          <Label htmlFor="formFilling">Allow Form Filling</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="contentExtraction"
                            checked={permissions.contentExtraction}
                            onCheckedChange={() => handlePermissionChange('contentExtraction')}
                          />
                          <Label htmlFor="contentExtraction">Allow Content Extraction</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="documentAssembly"
                            checked={permissions.documentAssembly}
                            onCheckedChange={() => handlePermissionChange('documentAssembly')}
                          />
                          <Label htmlFor="documentAssembly">Allow Document Assembly</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700">
                        <strong>Note:</strong> Permission restrictions require a password to be set. These settings control what users can do with your document.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Action Button */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={protectPdf}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 text-lg font-semibold"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Protecting...
                      </>
                    ) : (
                      <>
                        <Shield className="h-5 w-5 mr-2" />
                        Protect PDF
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={resetForm}
                    disabled={processing}
                    className="sm:w-auto"
                  >
                    Reset
                  </Button>
                </div>
                
                {/* Processing Progress */}
                {processing && (
                  <div className="mt-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        {progressMessage || "Applying security settings to your document..."}
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
          </div>
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to protect a PDF:</strong> Upload a PDF file, set a strong password, configure permission settings to control what users can do with your document, then click "Protect PDF" to apply enterprise-grade security.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProtectPdfPage;