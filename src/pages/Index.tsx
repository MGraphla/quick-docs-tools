import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  CheckCircle,
  Users,
  Target,
  Award,
  Mail,
  Phone,
  MapPin,
  Send,
  Clock,
  Globe,
  Zap,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  Presentation,
  Minimize2
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { toast } from "sonner";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [activeSection, setActiveSection] = useState('home');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const navigate = useNavigate();

  const pdfTools = [
    { 
      name: "Merge PDF", 
      description: "Combine multiple PDF files into one seamless document", 
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      popular: true
    },
    { 
      name: "Split PDF", 
      description: "Extract pages or split into separate documents with precision", 
      icon: Scissors,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      popular: true
    },
    { 
      name: "Compress PDF", 
      description: "Reduce file size while maintaining professional quality", 
      icon: Minimize2,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      iconColor: "text-purple-600",
      popular: true
    },
    { 
      name: "PDF to Word", 
      description: "Convert PDF to fully editable Word documents", 
      icon: FileDown,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      iconColor: "text-orange-600",
      popular: true
    },
    { 
      name: "PDF to PowerPoint", 
      description: "Transform PDFs into editable presentation slides", 
      icon: Presentation,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
    { 
      name: "PDF to Excel", 
      description: "Extract tables and data into Excel spreadsheets", 
      icon: FileSpreadsheet,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600"
    },
    { 
      name: "Word to PDF", 
      description: "Convert Word documents to professional PDFs", 
      icon: FileUp,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      iconColor: "text-indigo-600"
    },
    { 
      name: "PowerPoint to PDF", 
      description: "Convert presentations to shareable PDF format", 
      icon: FileUp,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      iconColor: "text-pink-600"
    },
    { 
      name: "Excel to PDF", 
      description: "Transform spreadsheets into professional PDFs", 
      icon: FileUp,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      iconColor: "text-teal-600"
    },
    { 
      name: "Edit PDF", 
      description: "Add text, shapes, images, and professional annotations", 
      icon: Edit,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600"
    },
    { 
      name: "PDF to JPG", 
      description: "Convert PDF pages to high-quality JPG images", 
      icon: Image,
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50",
      iconColor: "text-cyan-600"
    },
    { 
      name: "JPG to PDF", 
      description: "Convert images to professional PDF documents", 
      icon: FileUp,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600"
    },
    { 
      name: "Sign PDF", 
      description: "Add legally binding digital signatures", 
      icon: Signature,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-rose-50",
      iconColor: "text-rose-600"
    },
    { 
      name: "Watermark PDF", 
      description: "Add professional text or image watermarks", 
      icon: Shield,
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50",
      iconColor: "text-slate-600"
    },
    { 
      name: "Rotate PDF", 
      description: "Rotate pages left or right with precision", 
      icon: Settings,
      color: "from-lime-500 to-lime-600",
      bgColor: "bg-lime-50",
      iconColor: "text-lime-600"
    },
    { 
      name: "Protect PDF", 
      description: "Add enterprise-grade password protection", 
      icon: Shield,
      color: "from-red-600 to-red-700",
      bgColor: "bg-red-50",
      iconColor: "text-red-600"
    },
  ];

  const additionalTools = [
    { 
      name: "QR Code Generator", 
      description: "Create customizable QR codes with analytics", 
      icon: QrCode,
      color: "from-blue-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-purple-50",
      iconColor: "text-blue-600"
    },
    { 
      name: "Link Shortener", 
      description: "Shorten URLs with detailed click analytics", 
      icon: LinkIcon,
      color: "from-green-500 to-teal-600",
      bgColor: "bg-gradient-to-br from-green-50 to-teal-50",
      iconColor: "text-green-600"
    },
    { 
      name: "Audio to Text", 
      description: "AI-powered local audio transcription", 
      icon: Mic,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-pink-50",
      iconColor: "text-purple-600"
    },
    { 
      name: "Live Transcription", 
      description: "Real-time speech to text conversion", 
      icon: Mic,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-red-50",
      iconColor: "text-orange-600"
    },
  ];

  const features = [
    "25+ Professional Tools",
    "100% Client-Side Processing",
    "No File Size Limits",
    "Enterprise-Grade Security"
  ];

  const stats = [
    { number: "50,000+", label: "Happy Users", icon: Users },
    { number: "1M+", label: "Files Processed", icon: FileText },
    { number: "99.9%", label: "Uptime", icon: Clock },
    { number: "25+", label: "Tools Available", icon: Zap }
  ];

  const teamMembers = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      description: "Former Google engineer with 10+ years in document processing technology.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Michael Chen",
      role: "CTO",
      description: "Expert in PDF technology and cloud infrastructure with Stanford CS background.",
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Emily Rodriguez",
      role: "Head of Product",
      description: "UX specialist focused on making complex tools simple and intuitive.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleToolClick = () => {
    openAuthModal('signin');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    toast.success("Thank you for your message! We'll get back to you within 24 hours.");
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleContactChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200/5 to-purple-200/5 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300 cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QuickDocs
                </span>
                <p className="text-xs text-gray-500 font-medium">Professional Tools</p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 ${activeSection === 'home' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 ${activeSection === 'about' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
              >
                About Us
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 ${activeSection === 'contact' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
              >
                Contact Us
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => openAuthModal('signin')}
                className="hover:scale-105 transition-all duration-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => openAuthModal('signup')}
                className="hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-6xl mx-auto animate-fade-in">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 animate-bounce shadow-lg">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            Trusted by 50,000+ professionals worldwide
            <Sparkles className="h-4 w-4 ml-2 text-purple-500" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            Complete 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 animate-pulse"> PDF</span> & 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800"> Productivity</span> 
            <span className="inline-block animate-bounce ml-2 text-4xl">⚡</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform, edit, and manage your documents with our comprehensive suite of 
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mx-1"> 25+ professional tools</span>. 
            Everything you need for document productivity, all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Button 
              size="lg" 
              onClick={() => openAuthModal('signup')} 
              className="text-lg px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold"
            >
              Start Free Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => scrollToSection('tools')}
              className="text-lg px-10 py-6 hover:scale-105 border-2 hover:border-blue-300 transition-all duration-300 font-semibold hover:bg-blue-50"
            >
              View All Tools
              <Sparkles className="ml-3 h-5 w-5" />
            </Button>
          </div>

          {/* Enhanced Feature Pills */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {features.map((feature, index) => (
              <div 
                key={feature}
                className="flex items-center bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-semibold text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-all duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <stat.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm font-medium text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Tools Section */}
      <section id="tools" className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-6 text-lg px-8 py-3 animate-bounce bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-semibold shadow-lg">
              25+ Professional Tools Available
            </Badge>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need for 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> PDF Management</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              From basic conversions to advanced editing, our tools handle all your document needs with professional precision
            </p>
          </div>

          {/* Enhanced PDF Tools Grid */}
          <div className="mb-20">
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center bg-white rounded-full px-8 py-4 shadow-lg border-2 border-red-100">
                <div className="p-2 bg-red-100 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">PDF Tools</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {pdfTools.map((tool, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white relative overflow-hidden"
                  onClick={handleToolClick}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {tool.popular && (
                    <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      POPULAR
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${tool.bgColor} group-hover:scale-110 transition-all duration-300 shadow-md`}>
                        <tool.icon className={`h-7 w-7 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-300 font-semibold">{tool.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="group-hover:text-gray-700 transition-colors duration-300 font-medium leading-relaxed">{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Additional Tools Grid */}
          <div>
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center bg-white rounded-full px-8 py-4 shadow-lg border-2 border-green-100">
                <div className="p-2 bg-green-100 rounded-full mr-4">
                  <QrCode className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900">Productivity Tools</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {additionalTools.map((tool, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white relative overflow-hidden"
                  onClick={handleToolClick}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="pb-4 relative z-10">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${tool.bgColor} group-hover:scale-110 transition-all duration-300 shadow-md`}>
                        <tool.icon className={`h-7 w-7 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-green-600 transition-colors duration-300 font-semibold">{tool.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="group-hover:text-gray-700 transition-colors duration-300 font-medium leading-relaxed">{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced About Us Section */}
      <section id="about" className="bg-white py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">QuickDocs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-medium">
              We're on a mission to simplify document management for everyone. Founded in 2020, 
              QuickDocs has grown from a simple PDF merger to a comprehensive document productivity platform trusted by professionals worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-8">Our Story</h3>
              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <p>
                  QuickDocs was born out of frustration with existing document tools that were either 
                  too complex, too expensive, or required uploading sensitive files to unknown servers.
                </p>
                <p>
                  Our team of engineers and designers came together with a simple vision: create powerful, 
                  easy-to-use document tools that work entirely in your browser, keeping your files 
                  completely private and secure.
                </p>
                <p>
                  Today, we're proud to serve over 50,000 users worldwide, from students and freelancers 
                  to Fortune 500 companies, all trusting us with their most important documents.
                </p>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="Team collaboration" 
                className="rounded-3xl shadow-2xl hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-8 -right-8 bg-white p-6 rounded-2xl shadow-xl border-2 border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-lg font-bold text-gray-900">50,000+ Happy Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
            <Card className="text-center p-10 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-8 shadow-lg">
                <Target className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h4>
              <p className="text-gray-600 leading-relaxed font-medium">
                To democratize document processing by making professional-grade tools accessible to everyone, 
                while maintaining the highest standards of privacy and security.
              </p>
            </Card>

            <Card className="text-center p-10 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-8 shadow-lg">
                <Globe className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Our Vision</h4>
              <p className="text-gray-600 leading-relaxed font-medium">
                A world where anyone can efficiently manage, edit, and transform documents without 
                compromising on quality, speed, or security.
              </p>
            </Card>

            <Card className="text-center p-10 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mb-8 shadow-lg">
                <Award className="h-10 w-10 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Our Values</h4>
              <p className="text-gray-600 leading-relaxed font-medium">
                Privacy-first design, user-centric innovation, and unwavering commitment to quality. 
                We believe great tools should be simple, powerful, and trustworthy.
              </p>
            </Card>
          </div>

          {/* Enhanced Team Section */}
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Meet Our Team</h3>
            <p className="text-xl text-gray-600 font-medium">
              The passionate people behind QuickDocs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center p-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-6 object-cover shadow-lg hover:scale-110 transition-transform duration-300"
                />
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{member.name}</h4>
                <p className="text-blue-600 font-semibold mb-4 text-lg">{member.role}</p>
                <p className="text-gray-600 leading-relaxed font-medium">{member.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Contact Us Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
              Get in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium leading-relaxed">
              Have questions, feedback, or need support? We'd love to hear from you. 
              Our team typically responds within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Enhanced Contact Form */}
            <Card className="p-10 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 bg-white">
              <h3 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="text-lg font-semibold">Full Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                      className="mt-2 h-12 text-lg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-lg font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="mt-2 h-12 text-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject" className="text-lg font-semibold">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => handleContactChange('subject', e.target.value)}
                    placeholder="What's this about?"
                    required
                    className="mt-2 h-12 text-lg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message" className="text-lg font-semibold">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleContactChange('message', e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    required
                    className="mt-2 min-h-40 text-lg"
                  />
                </div>
                
                <Button type="submit" className="w-full h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                  <Send className="h-5 w-5 mr-3" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Enhanced Contact Information */}
            <div className="space-y-10">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-8">Contact Information</h3>
                <div className="space-y-8">
                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Mail className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">Email Us</h4>
                      <p className="text-gray-600 text-lg font-medium">support@quickdocs.com</p>
                      <p className="text-sm text-gray-500 mt-1">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Phone className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">Call Us</h4>
                      <p className="text-gray-600 text-lg font-medium">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500 mt-1">Mon-Fri, 9AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <MapPin className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-xl mb-2">Visit Us</h4>
                      <p className="text-gray-600 text-lg font-medium">123 Innovation Drive<br />San Francisco, CA 94105</p>
                      <p className="text-sm text-gray-500 mt-1">By appointment only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced FAQ Section */}
              <Card className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 border-0 shadow-xl">
                <h4 className="font-bold text-gray-900 mb-6 text-xl">Frequently Asked Questions</h4>
                <div className="space-y-6">
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Is my data secure?</p>
                    <p className="text-gray-600 leading-relaxed">Yes! All processing happens in your browser. We never see your files.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Do you offer enterprise plans?</p>
                    <p className="text-gray-600 leading-relaxed">Yes, we have custom solutions for businesses. Contact us for details.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Can I use QuickDocs offline?</p>
                    <p className="text-gray-600 leading-relaxed">Most tools work offline once loaded. Some features require internet.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-2xl mb-10 opacity-90 max-w-3xl mx-auto animate-fade-in font-medium leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Join thousands of professionals who trust QuickDocs for their document processing needs
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => openAuthModal('signup')}
            className="text-xl px-12 py-6 hover:scale-105 bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in font-semibold"
            style={{ animationDelay: '0.4s' }}
          >
            Get Started for Free
            <ArrowRight className="ml-3 h-6 w-6" />
          </Button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">QuickDocs</span>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium">
                Professional document tools that work entirely in your browser. 
                Fast, secure, and always free.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors font-medium">PDF Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Productivity Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors font-medium">About Us</button></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Blog</a></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors font-medium">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-lg">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors font-medium">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 font-medium">
            <p>&copy; 2024 QuickDocs. All rights reserved. Made with ❤️ for document productivity.</p>
          </div>
        </div>
      </footer>

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