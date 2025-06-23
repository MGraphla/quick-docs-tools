
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Scissors, 
  Archive, 
  FileDown, 
  FileUp, 
  Edit, 
  Image, 
  Shield, 
  Settings,
  QrCode,
  Link as LinkIcon,
  Mic,
  Signature
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const pdfTools = [
    { name: "Merge PDF", description: "Combine multiple PDF files into one", icon: FileText },
    { name: "Split PDF", description: "Extract pages or split into separate documents", icon: Scissors },
    { name: "Compress PDF", description: "Reduce file size while maintaining quality", icon: Archive },
    { name: "PDF to Word", description: "Convert PDF to editable Word document", icon: FileDown },
    { name: "PDF to PowerPoint", description: "Convert PDF to editable presentations", icon: FileDown },
    { name: "PDF to Excel", description: "Convert PDF tables to Excel spreadsheets", icon: FileDown },
    { name: "Word to PDF", description: "Convert Word documents to PDF", icon: FileUp },
    { name: "PowerPoint to PDF", description: "Convert presentations to PDF", icon: FileUp },
    { name: "Excel to PDF", description: "Convert spreadsheets to PDF", icon: FileUp },
    { name: "Edit PDF", description: "Add text, shapes, images, and annotations", icon: Edit },
    { name: "PDF to JPG", description: "Convert PDF pages to JPG images", icon: Image },
    { name: "JPG to PDF", description: "Convert images to PDF document", icon: FileUp },
    { name: "Sign PDF", description: "Add digital signatures to PDFs", icon: Signature },
    { name: "Watermark", description: "Add text or image watermarks", icon: Shield },
    { name: "Rotate PDF", description: "Rotate pages left or right", icon: Settings },
    { name: "Protect PDF", description: "Add password protection", icon: Shield },
  ];

  const additionalTools = [
    { name: "QR Code Generator", description: "Create customizable QR codes", icon: QrCode },
    { name: "Link Shortener", description: "Shorten URLs with analytics", icon: LinkIcon },
    { name: "Audio to Text", description: "Local audio transcription", icon: Mic },
    { name: "Live Transcription", description: "Real-time speech to text", icon: Mic },
  ];

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8">
        <nav className="flex items-center justify-between mb-16">
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">QuickDocs</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => openAuthModal('signin')}>
              Sign In
            </Button>
            <Button onClick={() => openAuthModal('signup')}>
              Get Started
            </Button>
          </div>
        </nav>

        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Complete PDF & 
            <span className="text-blue-600"> Productivity</span> Toolkit
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform, edit, and manage your documents with our comprehensive suite of PDF tools. 
            Everything you need for document productivity, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => openAuthModal('signup')} className="text-lg px-8 py-3">
              Start Free Now
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              View All Tools
            </Button>
          </div>
        </div>
      </header>

      {/* Features Overview */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">25+ Tools Available</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for PDF Management
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From basic conversions to advanced editing, our tools handle all your document needs
          </p>
        </div>

        {/* PDF Tools Grid */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">PDF Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pdfTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <tool.icon className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Tools Grid */}
        <div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Productivity Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalTools.map((tool, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <tool.icon className="h-6 w-6 text-purple-600" />
                    <CardTitle className="text-lg">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{tool.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust QuickDocs for their document needs
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => openAuthModal('signup')}
            className="text-lg px-8 py-3"
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
};

export default Index;
