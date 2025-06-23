import { useState, useEffect } from "react";
import { QrCode, Download, Copy, Link, Mail, Phone, Check, RefreshCw, Share2, Smartphone, Palette, Settings, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const QrGeneratorPage = () => {
  const [qrType, setQrType] = useState("url");
  const [qrData, setQrData] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrSize, setQrSize] = useState("256");
  const [qrMargin, setQrMargin] = useState("4");
  const [qrFormat, setQrFormat] = useState("png");
  const [qrErrorCorrection, setQrErrorCorrection] = useState("M");
  const [qrLogo, setQrLogo] = useState<File | null>(null);
  const [qrLogoUrl, setQrLogoUrl] = useState<string | null>(null);
  const [qrRounded, setQrRounded] = useState(false);
  const [generatedQr, setGeneratedQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailData, setEmailData] = useState({ address: "", subject: "", body: "" });
  const [phoneData, setPhoneData] = useState({ number: "", text: "" });
  const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA" });
  const [vCardData, setVCardData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    company: "",
    title: "",
    website: ""
  });

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const generateQr = () => {
    if (!getQrContent().trim()) {
      toast.error("Please enter content for your QR code");
      return;
    }
    
    setIsGenerating(true);
    
    // Prepare QR code data based on type
    const content = encodeURIComponent(getQrContent());
    
    // Build QR code API URL with all parameters
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${content}`;
    
    // Add additional parameters
    qrUrl += `&color=${qrColor.substring(1)}&bgcolor=${qrBgColor.substring(1)}`;
    qrUrl += `&margin=${qrMargin}&format=${qrFormat}`;
    qrUrl += `&ecc=${qrErrorCorrection}`;
    
    // Add rounded corners if selected
    if (qrRounded) {
      qrUrl += "&qzone=1";
    }
    
    // Simulate a delay for better UX
    setTimeout(() => {
      setGeneratedQr(qrUrl);
      setIsGenerating(false);
      toast.success("QR code generated successfully!");
    }, 800);
  };

  const getQrContent = () => {
    switch (qrType) {
      case "url":
        return qrData;
      case "email":
        return `mailto:${emailData.address}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      case "phone":
        return `tel:${phoneData.number}`;
      case "sms":
        return `smsto:${phoneData.number}:${phoneData.text}`;
      case "wifi":
        return `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;
      case "vcard":
        return `BEGIN:VCARD
VERSION:3.0
N:${vCardData.lastName};${vCardData.firstName};;;
FN:${vCardData.firstName} ${vCardData.lastName}
ORG:${vCardData.company}
TITLE:${vCardData.title}
TEL;TYPE=WORK,VOICE:${vCardData.phone}
EMAIL:${vCardData.email}
URL:${vCardData.website}
END:VCARD`;
      case "text":
        return qrData;
      default:
        return qrData;
    }
  };

  const downloadQr = () => {
    if (!generatedQr) return;
    
    const link = document.createElement('a');
    link.href = generatedQr;
    link.download = `qr-code-${Date.now()}.${qrFormat}`;
    link.click();
    toast.success(`QR code downloaded as ${qrFormat.toUpperCase()}`);
  };

  const copyQrLink = () => {
    if (generatedQr) {
      navigator.clipboard.writeText(generatedQr);
      setCopied(true);
      toast.success("QR code URL copied to clipboard");
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Logo image must be less than 1MB");
        return;
      }
      
      setQrLogo(file);
      const reader = new FileReader();
      reader.onload = () => {
        setQrLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
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
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <QrCode className="h-4 w-4 mr-2" />
          QR Code Generator
        </div>
        <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="text-gray-600 mt-2">Create customizable QR codes for any content with advanced styling options</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - QR Settings */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                QR Code Content
              </CardTitle>
              <CardDescription>
                Select the type of content for your QR code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={qrType} onValueChange={setQrType} className="w-full">
                <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link className="h-4 w-4" />
                    <span className="hidden md:inline">URL</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    <span className="hidden md:inline">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <span className="hidden md:inline">Phone</span>
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-1">
                    <Smartphone className="h-4 w-4" />
                    <span className="hidden md:inline">SMS</span>
                  </TabsTrigger>
                  <TabsTrigger value="wifi" className="flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    <span className="hidden md:inline">WiFi</span>
                  </TabsTrigger>
                  <TabsTrigger value="vcard" className="flex items-center gap-1">
                    <QrCode className="h-4 w-4" />
                    <span className="hidden md:inline">vCard</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Website URL</Label>
                    <Input
                      placeholder="https://example.com"
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">Enter the full URL including https://</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="email" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      placeholder="contact@example.com"
                      value={emailData.address}
                      onChange={(e) => setEmailData({...emailData, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject (Optional)</Label>
                    <Input
                      placeholder="Meeting Request"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Body (Optional)</Label>
                    <Input
                      placeholder="Hello, I would like to schedule a meeting..."
                      value={emailData.body}
                      onChange={(e) => setEmailData({...emailData, body: e.target.value})}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="phone" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="+1234567890"
                      value={phoneData.number}
                      onChange={(e) => setPhoneData({...phoneData, number: e.target.value})}
                    />
                    <p className="text-xs text-gray-500">Include country code for international numbers</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="sms" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input
                      placeholder="+1234567890"
                      value={phoneData.number}
                      onChange={(e) => setPhoneData({...phoneData, number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message Text</Label>
                    <Input
                      placeholder="Hello, this is a pre-filled message..."
                      value={phoneData.text}
                      onChange={(e) => setPhoneData({...phoneData, text: e.target.value})}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="wifi" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Network Name (SSID)</Label>
                    <Input
                      placeholder="WiFi Network Name"
                      value={wifiData.ssid}
                      onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input
                      type="password"
                      placeholder="WiFi Password"
                      value={wifiData.password}
                      onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Encryption Type</Label>
                    <Select 
                      value={wifiData.encryption} 
                      onValueChange={(value) => setWifiData({...wifiData, encryption: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WPA">WPA/WPA2</SelectItem>
                        <SelectItem value="WEP">WEP</SelectItem>
                        <SelectItem value="nopass">No Password</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <TabsContent value="vcard" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        placeholder="John"
                        value={vCardData.firstName}
                        onChange={(e) => setVCardData({...vCardData, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        placeholder="Doe"
                        value={vCardData.lastName}
                        onChange={(e) => setVCardData({...vCardData, lastName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="+1234567890"
                        value={vCardData.phone}
                        onChange={(e) => setVCardData({...vCardData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        placeholder="john@example.com"
                        value={vCardData.email}
                        onChange={(e) => setVCardData({...vCardData, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input
                        placeholder="Company Name"
                        value={vCardData.company}
                        onChange={(e) => setVCardData({...vCardData, company: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        placeholder="Software Engineer"
                        value={vCardData.title}
                        onChange={(e) => setVCardData({...vCardData, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Website</Label>
                      <Input
                        placeholder="https://example.com"
                        value={vCardData.website}
                        onChange={(e) => setVCardData({...vCardData, website: e.target.value})}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="text" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Text Content</Label>
                    <Input
                      placeholder="Enter any text content"
                      value={qrData}
                      onChange={(e) => setQrData(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                QR Code Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your QR code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>QR Code Size</Label>
                    <Select value={qrSize} onValueChange={setQrSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="128">128×128 px</SelectItem>
                        <SelectItem value="256">256×256 px</SelectItem>
                        <SelectItem value="512">512×512 px</SelectItem>
                        <SelectItem value="1024">1024×1024 px</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Error Correction Level</Label>
                    <Select value={qrErrorCorrection} onValueChange={setQrErrorCorrection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Low (7%)</SelectItem>
                        <SelectItem value="M">Medium (15%)</SelectItem>
                        <SelectItem value="Q">Quartile (25%)</SelectItem>
                        <SelectItem value="H">High (30%)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      Higher levels allow QR code to remain scannable even if partially damaged
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select value={qrFormat} onValueChange={setQrFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="svg">SVG</SelectItem>
                        <SelectItem value="jpg">JPG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>QR Code Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: qrColor }}
                      />
                      <Input
                        type="color"
                        value={qrColor}
                        onChange={(e) => setQrColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: qrBgColor }}
                      />
                      <Input
                        type="color"
                        value={qrBgColor}
                        onChange={(e) => setQrBgColor(e.target.value)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Margin Size: {qrMargin}</Label>
                    <Select value={qrMargin} onValueChange={setQrMargin}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Margin</SelectItem>
                        <SelectItem value="1">Small (1)</SelectItem>
                        <SelectItem value="2">Medium (2)</SelectItem>
                        <SelectItem value="4">Standard (4)</SelectItem>
                        <SelectItem value="8">Large (8)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Rounded Corners</Label>
                    <p className="text-xs text-gray-500">Make QR code modules rounded instead of square</p>
                  </div>
                  <Switch
                    checked={qrRounded}
                    onCheckedChange={setQrRounded}
                  />
                </div>
              </div>
              
              <Button 
                onClick={generateQr} 
                disabled={isGenerating || !getQrContent().trim()} 
                className="w-full mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview & Download */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview & Download</span>
                {generatedQr && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                    Ready to Download
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Your generated QR code will appear here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedQr ? (
                <div className="space-y-4">
                  <div className="flex justify-center p-6 bg-gray-50 rounded-lg">
                    <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                      <img
                        src={generatedQr}
                        alt="Generated QR Code"
                        className="max-w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 text-center">
                    <p className="font-medium">QR Code contains:</p>
                    <p className="text-xs mt-1 max-h-20 overflow-y-auto p-2 bg-gray-50 rounded-md">
                      {getQrContent()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center text-gray-500">
                    <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Your QR code will appear here</p>
                    <p className="text-xs mt-2">Configure your settings and click Generate</p>
                  </div>
                </div>
              )}
            </CardContent>
            {generatedQr && (
              <CardFooter className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button onClick={downloadQr} className="bg-purple-600 hover:bg-purple-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download {qrFormat.toUpperCase()}
                  </Button>
                  <Button variant="outline" onClick={copyQrLink}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </div>
                
                <Button variant="ghost" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share QR Code
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QrGeneratorPage;