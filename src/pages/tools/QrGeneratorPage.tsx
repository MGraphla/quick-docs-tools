
import { useState } from "react";
import { QrCode, Download, Copy, Link, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const QrGeneratorPage = () => {
  const [qrType, setQrType] = useState("url");
  const [qrData, setQrData] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrSize, setQrSize] = useState("256");
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);

  const generateQr = () => {
    if (!qrData.trim()) return;
    
    // Simulate QR generation with a placeholder
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrData)}&color=${qrColor.substring(1)}&bgcolor=ffffff`;
    setGeneratedQr(qrUrl);
  };

  const downloadQr = () => {
    if (!generatedQr) return;
    
    const link = document.createElement('a');
    link.href = generatedQr;
    link.download = `qr-code-${Date.now()}.png`;
    link.click();
  };

  const copyQrLink = () => {
    if (generatedQr) {
      navigator.clipboard.writeText(generatedQr);
    }
  };

  const getPlaceholder = () => {
    switch (qrType) {
      case "url": return "https://example.com";
      case "email": return "contact@example.com";
      case "phone": return "+1234567890";
      case "text": return "Your custom text here";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="text-gray-600 mt-2">Create customizable QR codes for any content</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Generate QR Code
            </CardTitle>
            <CardDescription>
              Configure your QR code settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>QR Code Type</Label>
              <Select value={qrType} onValueChange={setQrType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="url">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Website URL
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </div>
                  </SelectItem>
                  <SelectItem value="text">Plain Text</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Input
                placeholder={getPlaceholder()}
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={qrSize} onValueChange={setQrSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128x128</SelectItem>
                    <SelectItem value="256">256x256</SelectItem>
                    <SelectItem value="512">512x512</SelectItem>
                    <SelectItem value="1024">1024x1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            <Button onClick={generateQr} disabled={!qrData.trim()} className="w-full">
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview & Download</CardTitle>
            <CardDescription>
              Your generated QR code will appear here
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQr ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img
                    src={generatedQr}
                    alt="Generated QR Code"
                    className="border rounded-lg shadow-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={downloadQr} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download PNG
                  </Button>
                  <Button variant="outline" onClick={copyQrLink}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm text-gray-600 text-center">
                  QR Code contains: {qrData}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center text-gray-500">
                  <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Your QR code will appear here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QrGeneratorPage;
