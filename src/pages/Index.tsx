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
  Highlighter,
  Rocket,
  Crown,
  Diamond,
  Flame,
  Heart,
  Lightbulb,
  Magic,
  Palette,
  Wand2
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  const allTools = [
    { name: "Merge PDF", icon: FileText, color: "text-blue-500", gradient: "from-blue-500 to-cyan-500" },
    { name: "Split PDF", icon: Scissors, color: "text-green-500", gradient: "from-green-500 to-emerald-500" },
    { name: "Compress PDF", icon: Minimize2, color: "text-purple-500", gradient: "from-purple-500 to-violet-500" },
    { name: "PDF to Word", icon: FileDown, color: "text-orange-500", gradient: "from-orange-500 to-red-500" },
    { name: "PDF to PowerPoint", icon: Presentation, color: "text-red-500", gradient: "from-red-500 to-pink-500" },
    { name: "PDF to Excel", icon: FileSpreadsheet, color: "text-emerald-500", gradient: "from-emerald-500 to-teal-500" },
    { name: "Word to PDF", icon: FileUp, color: "text-blue-600", gradient: "from-blue-600 to-indigo-600" },
    { name: "PowerPoint to PDF", icon: FileUp, color: "text-pink-500", gradient: "from-pink-500 to-rose-500" },
    { name: "Excel to PDF", icon: FileUp, color: "text-teal-500", gradient: "from-teal-500 to-cyan-500" },
    { name: "Edit PDF", icon: Edit, color: "text-indigo-500", gradient: "from-indigo-500 to-purple-500" },
    { name: "PDF to JPG", icon: Image, color: "text-yellow-500", gradient: "from-yellow-500 to-orange-500" },
    { name: "JPG to PDF", icon: FileUp, color: "text-cyan-500", gradient: "from-cyan-500 to-blue-500" },
    { name: "Sign PDF", icon: Signature, color: "text-violet-500", gradient: "from-violet-500 to-purple-500" },
    { name: "Watermark PDF", icon: Shield, color: "text-rose-500", gradient: "from-rose-500 to-pink-500" },
    { name: "Rotate PDF", icon: RotateCw, color: "text-amber-500", gradient: "from-amber-500 to-yellow-500" },
    { name: "Protect PDF", icon: Shield, color: "text-slate-500", gradient: "from-slate-500 to-gray-500" },
    { name: "QR Generator", icon: QrCode, color: "text-lime-500", gradient: "from-lime-500 to-green-500" },
    { name: "Link Shortener", icon: LinkIcon, color: "text-sky-500", gradient: "from-sky-500 to-blue-500" },
    { name: "Audio to Text", icon: Mic, color: "text-fuchsia-500", gradient: "from-fuchsia-500 to-pink-500" },
    { name: "Live Transcription", icon: Mic, color: "text-emerald-600", gradient: "from-emerald-600 to-green-600" },
  ];

  const pdfTools = [
    { name: "Merge PDF", description: "Combine multiple PDF files into one", icon: FileText, gradient: "from-blue-500 to-cyan-500" },
    { name: "Split PDF", description: "Extract pages or split into separate documents", icon: Scissors, gradient: "from-green-500 to-emerald-500" },
    { name: "Compress PDF", description: "Reduce file size while maintaining quality", icon: Archive, gradient: "from-purple-500 to-violet-500" },
    { name: "PDF to Word", description: "Convert PDF to editable Word document", icon: FileDown, gradient: "from-orange-500 to-red-500" },
    { name: "PDF to PowerPoint", description: "Convert PDF to editable presentations", icon: FileDown, gradient: "from-red-500 to-pink-500" },
    { name: "PDF to Excel", description: "Convert PDF tables to Excel spreadsheets", icon: FileDown, gradient: "from-emerald-500 to-teal-500" },
    { name: "Word to PDF", description: "Convert Word documents to PDF", icon: FileUp, gradient: "from-blue-600 to-indigo-600" },
    { name: "PowerPoint to PDF", description: "Convert presentations to PDF", icon: FileUp, gradient: "from-pink-500 to-rose-500" },
    { name: "Excel to PDF", description: "Convert spreadsheets to PDF", icon: FileUp, gradient: "from-teal-500 to-cyan-500" },
    { name: "Edit PDF", description: "Add text, shapes, images, and annotations", icon: Edit, gradient: "from-indigo-500 to-purple-500" },
    { name: "PDF to JPG", description: "Convert PDF pages to JPG images", icon: Image, gradient: "from-yellow-500 to-orange-500" },
    { name: "JPG to PDF", description: "Convert images to PDF document", icon: FileUp, gradient: "from-cyan-500 to-blue-500" },
    { name: "Sign PDF", description: "Add digital signatures to PDFs", icon: Signature, gradient: "from-violet-500 to-purple-500" },
    { name: "Watermark", description: "Add text or image watermarks", icon: Shield, gradient: "from-rose-500 to-pink-500" },
    { name: "Rotate PDF", description: "Rotate pages left or right", icon: Settings, gradient: "from-amber-500 to-yellow-500" },
    { name: "Protect PDF", description: "Add password protection", icon: Shield, gradient: "from-slate-500 to-gray-500" },
  ];

  const additionalTools = [
    { name: "QR Code Generator", description: "Create customizable QR codes", icon: QrCode, gradient: "from-lime-500 to-green-500" },
    { name: "Link Shortener", description: "Shorten URLs with analytics", icon: LinkIcon, gradient: "from-sky-500 to-blue-500" },
    { name: "Audio to Text", description: "Local audio transcription", icon: Mic, gradient: "from-fuchsia-500 to-pink-500" },
    { name: "Live Transcription", description: "Real-time speech to text", icon: Mic, gradient: "from-emerald-600 to-green-600" },
  ];

  const features = [
    { text: "25+ Professional Tools", icon: Crown },
    { text: "100% Client-Side Processing", icon: Shield },
    { text: "No File Size Limits", icon: Rocket },
    { text: "Enterprise-Grade Security", icon: Diamond }
  ];

  const stats = [
    { number: "50,000+", label: "Happy Users", icon: Users, gradient: "from-blue-500 to-purple-600" },
    { number: "1M+", label: "Files Processed", icon: FileText, gradient: "from-green-500 to-teal-600" },
    { number: "99.9%", label: "Uptime", icon: Clock, gradient: "from-orange-500 to-red-600" },
    { number: "25+", label: "Tools Available", icon: Zap, gradient: "from-purple-500 to-pink-600" }
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

  // Enhanced animations and effects
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToolIndex((prev) => (prev + 1) % allTools.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
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
    toast.success("Thank you for your message! We'll get back to you within 24 hours.");
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleContactChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Ultra Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-500/30 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            top: '-10%',
            right: '-10%'
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-gradient-to-br from-purple-400/30 to-pink-500/30 rounded-full blur-3xl animate-pulse delay-1000"
          style={{
            transform: `translate(${-mousePosition.x * 0.015}px, ${-mousePosition.y * 0.015}px)`,
            bottom: '-10%',
            left: '-10%'
          }}
        ></div>
        <div 
          className="absolute w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-500"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px) rotate(${scrollY * 0.1}deg)`,
            top: '50%',
            left: '50%'
          }}
        ></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 animate-float" style={{ animationDelay: '0s' }}>
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-60 animate-pulse"></div>
        </div>
        <div className="absolute top-40 right-32 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rotate-45 opacity-60 animate-spin" style={{ animationDuration: '8s' }}></div>
        </div>
        <div className="absolute bottom-40 left-32 animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-60 animate-bounce"></div>
        </div>
        <div className="absolute top-60 right-20 animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="w-3 h-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full opacity-60 animate-pulse"></div>
        </div>

        {/* Enhanced floating icons with trails */}
        {[FileText, Scissors, QrCode, Edit, Shield, Mic].map((Icon, index) => (
          <div
            key={index}
            className="absolute animate-float opacity-40"
            style={{
              left: `${10 + (index * 15)}%`,
              top: `${20 + (index * 10)}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${4 + index}s`
            }}
          >
            <Icon className={`h-6 w-6 text-gradient-to-r ${allTools[index]?.color || 'text-blue-500'} drop-shadow-lg`} />
          </div>
        ))}

        {/* Animated particles with trails */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-ping opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              transform: `scale(${0.5 + Math.random() * 0.5})`
            }}
          >
            <div className={`w-2 h-2 bg-gradient-to-r ${allTools[i % allTools.length]?.gradient || 'from-blue-400 to-purple-400'} rounded-full`}></div>
          </div>
        ))}

        {/* Magical sparkles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${1 + Math.random() * 2}s`
            }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400 opacity-60" />
          </div>
        ))}
      </div>

      {/* Ultra Modern Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-xl">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-3 hover-scale cursor-pointer group" onClick={() => scrollToSection('home')}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                  <FileText className="h-8 w-8 text-white animate-pulse" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-ping"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QuickDocs
                </span>
                <div className="text-xs text-gray-500 font-medium">Document Magic ✨</div>
              </div>
            </div>

            {/* Enhanced Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['home', 'about', 'contact'].map((section) => (
                <button 
                  key={section}
                  onClick={() => scrollToSection(section)}
                  className={`text-sm font-medium transition-all duration-300 hover:text-blue-600 relative group ${
                    activeSection === section ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')}
                  <div className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 transform transition-transform duration-300 ${
                    activeSection === section ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></div>
                </button>
              ))}
            </div>

            {/* Enhanced Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => openAuthModal('signin')}
                className="hover-scale transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 text-gray-700 hover:text-blue-600 border border-transparent hover:border-blue-200"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => openAuthModal('signup')}
                className="hover-scale bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">Get Started</span>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Ultra Enhanced Hero Section */}
      <section id="home" className="container mx-auto px-4 py-24 relative z-10">
        <div className="text-center max-w-7xl mx-auto">
          {/* Premium Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 text-blue-800 px-8 py-4 rounded-full text-sm font-medium mb-12 animate-bounce shadow-2xl border border-white/50 backdrop-blur-sm">
            <Crown className="h-5 w-5 mr-3 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
            Trusted by 50,000+ users worldwide
            <Sparkles className="h-5 w-5 ml-3 text-purple-500 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          </div>
          
          {/* Ultra Dynamic Title */}
          <h1 className="text-7xl md:text-9xl font-bold text-gray-900 mb-12 leading-tight relative">
            <span className="inline-block animate-float">Complete</span>{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 animate-gradient-x inline-block animate-float" style={{ animationDelay: '0.2s' }}>
              PDF
            </span>{' '}
            <span className="inline-block animate-float" style={{ animationDelay: '0.1s' }}>&</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 animate-gradient-x inline-block animate-float" style={{ animationDelay: '0.3s' }}>
              Productivity
            </span>{' '}
            <span className="inline-block animate-bounce text-8xl" style={{ animationDelay: '0.4s' }}>⚡</span>
            
            {/* Magical effects around title */}
            <div className="absolute -top-10 -left-10">
              <Magic className="h-8 w-8 text-purple-400 animate-spin opacity-60" style={{ animationDuration: '4s' }} />
            </div>
            <div className="absolute -top-5 -right-5">
              <Wand2 className="h-6 w-6 text-blue-400 animate-bounce opacity-60" />
            </div>
          </h1>
          
          {/* Enhanced Description */}
          <p className="text-2xl md:text-3xl text-gray-600 mb-12 max-w-5xl mx-auto leading-relaxed">
            Transform, edit, and manage your documents with our comprehensive suite of 
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> 25+ professional tools</span>. 
            Everything you need for document productivity, all in one magical place.
          </p>

          {/* Ultra Dynamic Tool Display */}
          <div className="mb-16 p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 max-w-4xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl bg-gradient-to-r ${allTools[currentToolIndex].gradient} shadow-xl transform transition-all duration-700 hover:scale-110 relative`}>
                    <div className="absolute inset-0 bg-white/20 rounded-2xl animate-pulse"></div>
                    {React.createElement(allTools[currentToolIndex].icon, {
                      className: "h-8 w-8 text-white relative z-10"
                    })}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-gray-500 font-medium">Currently featuring:</p>
                    <p className={`text-2xl font-bold transition-all duration-700 ${allTools[currentToolIndex].color} animate-pulse`}>
                      {allTools[currentToolIndex].name}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {allTools.slice(0, 8).map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        index === currentToolIndex % 8 
                          ? `bg-gradient-to-r ${allTools[currentToolIndex].gradient} scale-150 shadow-lg` 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              {/* Tool preview carousel */}
              <div className="grid grid-cols-4 gap-4">
                {allTools.slice(0, 4).map((tool, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl transition-all duration-500 ${
                      index === currentToolIndex % 4 
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 scale-105 shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <tool.icon className={`h-6 w-6 mx-auto mb-2 ${tool.color}`} />
                    <p className="text-xs font-medium text-gray-700">{tool.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Ultra Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-16">
            <Button 
              size="lg" 
              onClick={() => openAuthModal('signup')} 
              className="text-2xl px-12 py-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 hover-scale shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Rocket className="mr-4 h-8 w-8 animate-bounce relative z-10" />
              <span className="relative z-10">Start Free Now</span>
              <ArrowRight className="ml-4 h-8 w-8 animate-pulse relative z-10" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => scrollToSection('tools')}
              className="text-2xl px-12 py-8 hover-scale border-2 border-gray-300 hover:border-blue-400 transition-all duration-500 rounded-3xl bg-white/90 backdrop-blur-sm hover:bg-white group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Palette className="mr-4 h-8 w-8 relative z-10" />
              <span className="relative z-10">View All Tools</span>
            </Button>
          </div>

          {/* Ultra Enhanced Feature Pills */}
          <div className="flex flex-wrap justify-center gap-8 mb-20">
            {features.map((feature, index) => (
              <div 
                key={feature.text}
                className="flex items-center bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-8 py-4 shadow-xl hover:shadow-2xl transition-all duration-500 hover-scale group relative overflow-hidden"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <feature.icon className="h-6 w-6 text-blue-500 mr-4 group-hover:animate-spin relative z-10" />
                <span className="text-sm font-medium text-gray-700 relative z-10">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Ultra Enhanced Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover-scale">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r ${stat.gradient} rounded-2xl mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-125 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <stat.icon className="h-10 w-10 text-white group-hover:animate-pulse relative z-10" />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Ultra Enhanced Floating Action Buttons */}
          <div className="fixed bottom-8 right-8 z-40 flex flex-col space-y-4">
            <Button
              onClick={() => openAuthModal('signup')}
              className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-pulse hover:animate-bounce relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Flame className="h-8 w-8 relative z-10" />
            </Button>
            <Button
              onClick={() => scrollToSection('tools')}
              className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:animate-spin relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Heart className="h-6 w-6 relative z-10" />
            </Button>
          </div>
        </div>
      </section>

      {/* Ultra Enhanced Tools Section */}
      <section id="tools" className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 text-xl px-8 py-3 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-0 shadow-xl">
            <Lightbulb className="h-5 w-5 mr-3 text-yellow-500 animate-pulse" />
            25+ Magical Tools Available
            <Sparkles className="h-5 w-5 ml-3 text-purple-500 animate-spin" />
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Everything You Need for 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient-x"> PDF Magic</span>
          </h2>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            From basic conversions to advanced editing, our tools handle all your document needs with style
          </p>
        </div>

        {/* Ultra Enhanced PDF Tools Grid */}
        <div className="mb-20">
          <h3 className="text-4xl font-bold text-gray-900 mb-12 text-center">PDF Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pdfTools.map((tool, index) => (
              <Card 
                key={index} 
                className="hover:shadow-2xl transition-all duration-700 cursor-pointer hover-scale border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:bg-white group relative overflow-hidden"
                onClick={handleToolClick}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${tool.gradient} shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110 transform relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <tool.icon className="h-7 w-7 text-white group-hover:animate-pulse relative z-10" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-500">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="group-hover:text-gray-700 transition-colors duration-500 text-base">{tool.description}</CardDescription>
                </CardContent>
                
                {/* Magical hover effect */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Sparkles className="h-5 w-5 text-yellow-400 animate-spin" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Ultra Enhanced Productivity Tools Grid */}
        <div>
          <h3 className="text-4xl font-bold text-gray-900 mb-12 text-center">Productivity Tools</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalTools.map((tool, index) => (
              <Card 
                key={index} 
                className="hover:shadow-2xl transition-all duration-700 cursor-pointer hover-scale border-0 shadow-xl bg-white/90 backdrop-blur-sm hover:bg-white group relative overflow-hidden"
                onClick={handleToolClick}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <CardHeader className="pb-4 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-r ${tool.gradient} shadow-lg group-hover:shadow-xl transition-all duration-500 group-hover:scale-110 transform relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <tool.icon className="h-7 w-7 text-white group-hover:animate-pulse relative z-10" />
                    </div>
                    <CardTitle className="text-xl group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-500">{tool.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="group-hover:text-gray-700 transition-colors duration-500 text-base">{tool.description}</CardDescription>
                </CardContent>
                
                {/* Magical hover effect */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <Magic className="h-5 w-5 text-purple-400 animate-spin" />
                </div>
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

      {/* Ultra Enhanced CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Ultra enhanced animated background */}
        <div className="absolute top-0 left-0 w-full h-full">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-ping opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-4 h-4 bg-white rounded-full`}></div>
            </div>
          ))}
          
          {/* Floating magical elements */}
          {[Magic, Wand2, Sparkles, Crown, Diamond].map((Icon, index) => (
            <div
              key={index}
              className="absolute animate-float opacity-30"
              style={{
                left: `${10 + index * 20}%`,
                top: `${20 + index * 15}%`,
                animationDelay: `${index * 0.5}s`,
                animationDuration: `${4 + index}s`
              }}
            >
              <Icon className="h-8 w-8 text-white" />
            </div>
          ))}
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold mb-8 animate-fade-in">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-2xl mb-12 opacity-90 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Join thousands of professionals who trust QuickDocs for their document processing magic
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => openAuthModal('signup')}
            className="text-2xl px-12 py-8 hover-scale bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-500 animate-fade-in rounded-3xl relative overflow-hidden group"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Rocket className="mr-4 h-8 w-8 animate-bounce relative z-10" />
            <span className="relative z-10">Get Started for Free</span>
            <ArrowRight className="ml-4 h-8 w-8 animate-pulse relative z-10" />
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
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default Index;