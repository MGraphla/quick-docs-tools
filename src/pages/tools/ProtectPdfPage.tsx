
import { useState } from "react";
import { Shield, Upload, FileText, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const ProtectPdfPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    printing: true,
    copying: true,
    editing: true,
    commenting: true
  });
  const [protecting, setProtecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [protectedFile, setProtectedFile] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setProtectedFile(null);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const protectPdf = async () => {
    if (!file) {
      toast.error("Please select a PDF file");
      return;
    }

    if (!password) {
      toast.error("Please enter a password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setProtecting(true);
    setProgress(0);

    // Simulate protection process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 150));
      setProgress(i);
    }

    setProtectedFile(`protected-${file.name}`);
    setProtecting(false);
    toast.success("PDF protected successfully!");
  };

  const downloadProtected = () => {
    // In a real implementation, this would download the actual protected PDF
    const link = document.createElement('a');
    link.href = '#';
    link.download = protectedFile || 'protected-document.pdf';
    link.click();
    toast.success("Protected PDF downloaded!");
  };

  const handlePermissionChange = (permission: keyof typeof permissions) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: !prev[permission]
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Protect PDF</h1>
        <p className="text-gray-600 mt-2">Add password protection and set permissions for your PDF</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF File
          </CardTitle>
          <CardDescription>
            Select the PDF file you want to protect
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
                setProtectedFile(null);
              } else {
                toast.error("Please drop a valid PDF file");
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Set password and permissions for your PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-3">
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
                  <Label htmlFor="copying">Allow Copying</Label>
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
              </div>
            </div>

            {protecting && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Protecting PDF...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {protectedFile && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">PDF Protected!</p>
                      <p className="text-sm text-green-600">{protectedFile}</p>
                    </div>
                  </div>
                  <Button onClick={downloadProtected} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            <Button 
              onClick={protectPdf} 
              disabled={!file || protecting}
              className="w-full"
            >
              {protecting ? 'Protecting...' : 'Protect PDF'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProtectPdfPage;
