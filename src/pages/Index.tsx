
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Signature,
  Star,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const navigate = useNavigate();

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

  const features = [
    "25+ Professional Tools",
    "100% Client-Side Processing",
    "No File Size Limits",
    "Enterprise-Grade Security"
  ];

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleToolClick = () => {
    openAuthModal('signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-5 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Hero Section */}
      <header className="container mx-auto px-4 py-8 relative z-10">
        <nav className="flex items-center justify-between mb-16 animate-fade-in">
          <div className="flex items-center space-x-2 hover-scale">
            <div className="relative">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-2xl font-bold text-gray-900">QuickDocs</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => openAuthModal('signin')}
              className="hover-scale transition-all duration-300 hover:bg-blue-50"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => openAuthModal('signup')}
              className="hover-scale bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Get Started
            </Button>
          </div>
        </nav>

        <div className="text-center max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-bounce">
            <Star className="h-4 w-4 mr-2" />
            Trusted by 50,000+ users worldwide
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Complete 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"> PDF</span> & 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Productivity</span> 
            <span className="inline-block animate-bounce ml-2">⚡</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform, edit, and manage your documents with our comprehensive suite of 
            <span className="font-semibold text-blue-600"> 25+ professional tools</span>. 
            Everything you need for document productivity, all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button 
              size="lg" 
              onClick={() => openAuthModal('signup')} 
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-scale shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Start Free Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-4 hover-scale border-2 hover:border-blue-300 transition-all duration-300"
            >
              View All Tools
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {features.map((feature, index) => (
              <div 
                key={feature}
                className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300 hover-scale"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Overview */}
      <section className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2 animate-bounce">25+ Tools Available</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need for 
            <span className="text-blue-600"> PDF Management</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From basic conversions to advanced editing, our tools handle all your document needs
          </p>
        </div>

        {/* PDF Tools Grid */}
        <div className="mb-16">
          <h3 className="text-3xl font-semibold text-gray-900 mb-8 text-center">PDF Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pdfTools.map((tool, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer hover-scale border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white group"
                onClick={handleToolClick}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300">
                      <tool.icon className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-300">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">{tool.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Tools Grid */}
        <div>
          <h3 className="text-3xl font-semibold text-gray-900 mb-8 text-center">Productivity Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalTools.map((tool, index) => (
              <Card 
                key={index} 
                className="hover:shadow-xl transition-all duration-300 cursor-pointer hover-scale border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white group"
                onClick={handleToolClick}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300">
                      <tool.icon className="h-6 w-6 text-purple-600 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors duration-300">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">{tool.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Join thousands of professionals who trust QuickDocs for their document processing needs
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => openAuthModal('signup')}
            className="text-lg px-8 py-4 hover-scale bg-white text-gray-900 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in"
            style={{ animationDelay: '0.4s' }}
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        mode={authMode}
        onModeChange={setAuthMode}
        onSuccess={() => navigate('/dashboard')}
      />
    </div>
  );
};

export default Index;
