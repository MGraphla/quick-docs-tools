import React from "react";
import { useState, useEffect } from "react";
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
  FileSpreadsheet,
  Presentation,
  Minimize2,
  RotateCw,
  Type,
  Highlighter
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
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const navigate = useNavigate();

  const allTools = [
    { name: "Merge PDF", icon: FileText, color: "text-blue-500" },
    { name: "Split PDF", icon: Scissors, color: "text-green-500" },
    { name: "Compress PDF", icon: Minimize2, color: "text-purple-500" },
    { name: "PDF to Word", icon: FileDown, color: "text-orange-500" },
    { name: "PDF to PowerPoint", icon: Presentation, color: "text-red-500" },
    { name: "PDF to Excel", icon: FileSpreadsheet, color: "text-emerald-500" },
    { name: "Word to PDF", icon: FileUp, color: "text-blue-600" },
    { name: "PowerPoint to PDF", icon: FileUp, color: "text-pink-500" },
    { name: "Excel to PDF", icon: FileUp, color: "text-teal-500" },
    { name: "Edit PDF", icon: Edit, color: "text-indigo-500" },
    { name: "PDF to JPG", icon: Image, color: "text-yellow-500" },
    { name: "JPG to PDF", icon: FileUp, color: "text-cyan-500" },
    { name: "Sign PDF", icon: Signature, color: "text-violet-500" },
    { name: "Watermark PDF", icon: Shield, color: "text-rose-500" },
    { name: "Rotate PDF", icon: RotateCw, color: "text-amber-500" },
    { name: "Protect PDF", icon: Shield, color: "text-slate-500" },
    { name: "QR Generator", icon: QrCode, color: "text-lime-500" },
    { name: "Link Shortener", icon: LinkIcon, color: "text-sky-500" },
    { name: "Audio to Text", icon: Mic, color: "text-fuchsia-500" },
    { name: "Live Transcription", icon: Mic, color: "text-emerald-600" },
  ];

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

  // Animated tool cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToolIndex((prev) => (prev + 1) % allTools.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-10 animate-spin" style={{ animationDuration: '20s' }}></div>
        
        {/* Floating icons */}
        <div className="absolute top-20 left-20 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}>
          <FileText className="h-8 w-8 text-blue-300 opacity-60" />
        </div>
        <div className="absolute top-40 right-32 animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>
          <Scissors className="h-6 w-6 text-green-300 opacity-60" />
        </div>
        <div className="absolute bottom-40 left-32 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3s' }}>
          <QrCode className="h-7 w-7 text-purple-300 opacity-60" />
        </div>
        <div className="absolute top-60 right-20 animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '3s' }}>
          <Edit className="h-5 w-5 text-orange-300 opacity-60" />
        </div>
        
        {/* Animated particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 hover-scale cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="relative">
                <FileText className="h-8 w-8 text-blue-600 animate-pulse" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickDocs
              </span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={() => scrollToSection('home')}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeSection === 'home' ? 'text-blue-600' : 'text-gray-700'}`}
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeSection === 'about' ? 'text-blue-600' : 'text-gray-700'}`}
              >
                About Us
              </button>
              <button 
                onClick={() => scrollToSection('contact')}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${activeSection === 'contact' ? 'text-blue-600' : 'text-gray-700'}`}
              >
                Contact Us
              </button>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => openAuthModal('signin')}
                className="hover-scale transition-all duration-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600"
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
        </div>
      </header>

      {/* Enhanced Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-6xl mx-auto animate-fade-in">
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-6 py-3 rounded-full text-sm font-medium mb-8 animate-bounce shadow-lg">
            <Star className="h-4 w-4 mr-2 animate-spin" style={{ animationDuration: '3s' }} />
            Trusted by 50,000+ users worldwide
            <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            Complete 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse"> PDF</span> & 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Productivity</span> 
            <span className="inline-block animate-bounce ml-2 text-6xl">⚡</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Transform, edit, and manage your documents with our comprehensive suite of 
            <span className="font-semibold text-blue-600"> 25+ professional tools</span>. 
            Everything you need for document productivity, all in one place.
          </p>

          {/* Animated Tool Display */}
          <div className="mb-12 p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transform transition-all duration-500 ${currentToolIndex % 2 === 0 ? 'scale-110' : 'scale-100'}`}>
                  {React.createElement(allTools[currentToolIndex].icon, {
                    className: "h-6 w-6 text-white"
                  })}
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500 font-medium">Currently featuring:</p>
                  <p className={`text-xl font-bold transition-all duration-500 ${allTools[currentToolIndex].color}`}>
                    {allTools[currentToolIndex].name}
                  </p>
                </div>
              </div>
              <div className="flex space-x-1">
                {allTools.slice(0, 5).map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentToolIndex % 5 ? 'bg-blue-500 scale-125' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
            <Button 
              size="lg" 
              onClick={() => openAuthModal('signup')} 
              className="text-xl px-10 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover-scale shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl"
            >
              <Zap className="mr-3 h-6 w-6 animate-pulse" />
              Start Free Now
              <ArrowRight className="ml-3 h-6 w-6 animate-bounce" style={{ animationDirection: 'alternate' }} />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => scrollToSection('tools')}
              className="text-xl px-10 py-6 hover-scale border-2 hover:border-blue-300 transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm"
            >
              <FileText className="mr-3 h-6 w-6" />
              View All Tools
            </Button>
          </div>

          {/* Enhanced Feature Pills */}
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {features.map((feature, index) => (
              <div 
                key={feature}
                className="flex items-center bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale group"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 group-hover:animate-spin" />
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover-scale">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <stat.icon className="h-8 w-8 text-white group-hover:animate-pulse" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Floating Action Buttons */}
          <div className="fixed bottom-8 right-8 z-40 flex flex-col space-y-4">
            <Button
              onClick={() => openAuthModal('signup')}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse"
            >
              <Zap className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center mb-12 animate-fade-in">
          <Badge variant="secondary" className="mb-4 text-lg px-6 py-2 animate-bounce bg-gradient-to-r from-blue-100 to-purple-100">
            <Sparkles className="h-4 w-4 mr-2 animate-spin" />
            25+ Tools Available
          </Badge>
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
                className="hover:shadow-2xl transition-all duration-500 cursor-pointer hover-scale border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white group relative overflow-hidden"
                onClick={handleToolClick}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors duration-300 group-hover:scale-110 transform">
                      <tool.icon className="h-6 w-6 text-blue-600 group-hover:animate-pulse" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors duration-300">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
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
                className="hover:shadow-2xl transition-all duration-500 cursor-pointer hover-scale border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white group relative overflow-hidden"
                onClick={handleToolClick}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <CardHeader className="pb-3 relative z-10">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-xl bg-purple-50 group-hover:bg-purple-100 transition-colors duration-300 group-hover:scale-110 transform">
                      <tool.icon className="h-6 w-6 text-purple-600 group-hover:animate-pulse" />
                    </div>
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors duration-300">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="group-hover:text-gray-700 transition-colors duration-300">{tool.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="bg-gradient-to-r from-gray-50 to-blue-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About <span className="text-blue-600">QuickDocs</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to simplify document management for everyone. Founded in 2020, 
              QuickDocs has grown from a simple PDF merger to a comprehensive document productivity platform.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
              <div className="space-y-4 text-gray-600">
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
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">50,000+ Happy Users</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mission, Vision, Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                <Target className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Our Mission</h4>
              <p className="text-gray-600">
                To democratize document processing by making professional-grade tools accessible to everyone, 
                while maintaining the highest standards of privacy and security.
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Our Vision</h4>
              <p className="text-gray-600">
                A world where anyone can efficiently manage, edit, and transform documents without 
                compromising on quality, speed, or security.
              </p>
            </Card>

            <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">Our Values</h4>
              <p className="text-gray-600">
                Privacy-first design, user-centric innovation, and unwavering commitment to quality. 
                We believe great tools should be simple, powerful, and trustworthy.
              </p>
            </Card>
          </div>

          {/* Team Section */}
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h3>
            <p className="text-xl text-gray-600">
              The passionate people behind QuickDocs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Get in <span className="text-blue-600">Touch</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions, feedback, or need support? We'd love to hear from you. 
              Our team typically responds within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8 border-0 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => handleContactChange('name', e.target.value)}
                      placeholder="Your full name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => handleContactChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={contactForm.subject}
                    onChange={(e) => handleContactChange('subject', e.target.value)}
                    placeholder="What's this about?"
                    required
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleContactChange('message', e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    required
                    className="mt-1 min-h-32"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </form>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Us</h4>
                      <p className="text-gray-600">support@quickdocs.com</p>
                      <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Phone className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Call Us</h4>
                      <p className="text-gray-600">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Visit Us</h4>
                      <p className="text-gray-600">123 Innovation Drive<br />San Francisco, CA 94105</p>
                      <p className="text-sm text-gray-500">By appointment only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <Card className="p-6 bg-gray-50 border-0">
                <h4 className="font-bold text-gray-900 mb-4">Frequently Asked Questions</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Is my data secure?</p>
                    <p className="text-gray-600">Yes! All processing happens in your browser. We never see your files.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Do you offer enterprise plans?</p>
                    <p className="text-gray-600">Yes, we have custom solutions for businesses. Contact us for details.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Can I use QuickDocs offline?</p>
                    <p className="text-gray-600">Most tools work offline once loaded. Some features require internet.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-4 h-4 bg-white/20 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Join thousands of professionals who trust QuickDocs for their document processing needs
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => openAuthModal('signup')}
            className="text-xl px-10 py-6 hover-scale bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in rounded-2xl"
            style={{ animationDelay: '0.4s' }}
          >
            <Sparkles className="mr-3 h-6 w-6 animate-spin" />
            Get Started for Free
            <ArrowRight className="ml-3 h-6 w-6 animate-bounce" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <FileText className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">QuickDocs</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional document tools that work entirely in your browser. 
                Fast, secure, and always free.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">PDF Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Productivity Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
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