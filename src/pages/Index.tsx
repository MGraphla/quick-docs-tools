import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  Clock,
  Zap,
  Sparkles,
  FileSpreadsheet,
  Presentation,
  Minimize2,
  FileEdit,
  ClipboardList,
  Calendar,
  Receipt,
  EyeOff,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [toolsInfoOpen, setToolsInfoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    { 
      name: "Redact PDF", 
      description: "Permanently remove sensitive content from PDFs", 
      icon: EyeOff,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      iconColor: "text-gray-600"
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
    { 
      name: "Text Editor", 
      description: "A simple and elegant text editor for your notes", 
      icon: FileEdit,
      color: "from-sky-500 to-sky-600",
      bgColor: "bg-gradient-to-br from-sky-50 to-cyan-50",
      iconColor: "text-sky-600"
    },
    { 
      name: "Resume Builder", 
      description: "Build a professional resume in minutes", 
      icon: ClipboardList,
      color: "from-fuchsia-500 to-fuchsia-600",
      bgColor: "bg-gradient-to-br from-fuchsia-50 to-purple-50",
      iconColor: "text-fuchsia-600"
    },
    { 
      name: "Audio Trimmer", 
      description: "Trim and cut audio files with ease", 
      icon: Scissors,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-yellow-50",
      iconColor: "text-amber-600"
    },
    { 
      name: "Calendar Generator", 
      description: "Create and customize printable calendars", 
      icon: Calendar,
      color: "from-rose-500 to-rose-600",
      bgColor: "bg-gradient-to-br from-rose-50 to-red-50",
      iconColor: "text-rose-600"
    },
    { 
      name: "Invoice Generator", 
      description: "Generate professional invoices for your business", 
      icon: Receipt,
      color: "from-lime-500 to-lime-600",
      bgColor: "bg-gradient-to-br from-lime-50 to-green-50",
      iconColor: "text-lime-600"
    },
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
            <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300 cursor-pointer">
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

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-blue-600 font-semibold">
                Home
              </a>
              <div className="relative">
                <button 
                  onClick={() => setToolsInfoOpen(!toolsInfoOpen)}
                  onBlur={() => setTimeout(() => setToolsInfoOpen(false), 150)}
                  className="flex items-center text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700"
                >
                  Tool Info
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${toolsInfoOpen ? 'rotate-180' : ''}`} />
                </button>
                {toolsInfoOpen && (
                  <div className="absolute top-full mt-2 w-64 bg-white rounded-md shadow-lg z-50 border max-h-96 overflow-y-auto">
                    {/* PDF Tools Section */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
                      PDF Tools
                    </div>
                    {pdfTools.map(tool => (
                      <Link key={tool.name} to={`/info/${tool.name.toLowerCase().replace(/ /g, '-')}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                        {tool.name} Info
                      </Link>
                    ))}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
                      Productivity Tools
                    </div>
                    {additionalTools.map(tool => (
                      <Link key={tool.name} to={`/info/${tool.name.toLowerCase().replace(/ /g, '-')}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                        {tool.name} Info
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <a href="#features" className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700">
                Features
              </a>
              <a href="#about" className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700">
                About
              </a>
              <a href="#contact" className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700">
                Contact
              </a>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" onClick={() => openAuthModal('signin')} className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
              <Button onClick={() => openAuthModal('signup')} className="text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300">
                Get Started
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(true)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100">
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-gradient-to-br from-white via-blue-50/50 to-purple-50/50 backdrop-blur-lg"
        >
          <div className="container mx-auto px-4 h-full flex flex-col">
            <div className="flex justify-between items-center py-4 border-b border-gray-200/50 shrink-0">
              <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">QuickDocs</span>
                  </div>
                </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full text-gray-700 hover:bg-gray-200/70 transition-colors">
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            <div className="mt-8 px-2 flex-grow overflow-y-auto pb-32">
              <motion.nav 
                className="flex flex-col space-y-2"
                initial="hidden"
                animate="visible"
                variants={{ 
                  visible: { transition: { staggerChildren: 0.07 } },
                  hidden: {}
                }}
              >
                {[ 
                  { href: "#home", label: "Home" },
                  { href: "#features", label: "Features" },
                ].map((item, i) => (
                  <motion.a 
                    key={i}
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="text-xl font-semibold text-gray-800 hover:text-blue-600 p-4 rounded-lg hover:bg-white/70 transition-colors duration-200"
                    variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  >
                    {item.label}
                  </motion.a>
                ))}
                
                <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1" className="border-b-0">
                      <AccordionTrigger className="text-xl font-semibold text-gray-800 hover:text-blue-600 p-4 rounded-lg hover:bg-white/70 transition-colors no-underline hover:no-underline">
                        Tool Info
                      </AccordionTrigger>
                      <AccordionContent className="pl-6 pr-2 pb-2">
                        <div className="flex flex-col space-y-1 mt-1 border-l-2 border-blue-200">
                          <h4 className="px-4 pt-2 pb-1 text-base font-bold text-blue-800/80">PDF Tools</h4>
                          {pdfTools.map(tool => (
                            <Link key={tool.name} to={`/info/${tool.name.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)} className="block pl-4 pr-2 py-2.5 text-lg text-gray-700 hover:bg-blue-100/50 hover:text-blue-700 rounded-r-lg transition-all duration-200 font-medium">
                              {tool.name}
                            </Link>
                          ))}
                          <h4 className="px-4 pt-4 pb-1 text-base font-bold text-purple-800/80">Productivity Tools</h4>
                          {additionalTools.map(tool => (
                            <Link key={tool.name} to={`/info/${tool.name.toLowerCase().replace(/ /g, '-')}`} onClick={() => setMobileMenuOpen(false)} className="block pl-4 pr-2 py-2.5 text-lg text-gray-700 hover:bg-purple-100/50 hover:text-purple-700 rounded-r-lg transition-all duration-200 font-medium">
                              {tool.name}
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </motion.div>

                {[ 
                  { href: "#about", label: "About" },
                  { href: "#contact", label: "Contact" },
                ].map((item, i) => (
                  <motion.a 
                    key={i}
                    href={item.href} 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="text-xl font-semibold text-gray-800 hover:text-blue-600 p-4 rounded-lg hover:bg-white/70 transition-colors duration-200"
                    variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </motion.nav>
            </div>
            <motion.div 
              className="absolute bottom-0 left-0 right-0 p-4 bg-white/50 backdrop-blur-sm border-t border-gray-200/60"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
            >
              <div className="flex items-center space-x-3">
                  <Button variant="ghost" onClick={() => { openAuthModal('signin'); setMobileMenuOpen(false); }} className="text-lg font-bold w-full py-6 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 transition-colors duration-200">Sign In</Button>
                  <Button onClick={() => { openAuthModal('signup'); setMobileMenuOpen(false); }} className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white w-full py-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">Get Started</Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Hero Section */}
      <section id="home" className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center max-w-6xl mx-auto animate-fade-in">
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight">
            Complete 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 animate-pulse"> PDF</span> & 
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800"> Productivity</span> 
            <span className="inline-block animate-bounce ml-2 text-2xl sm:text-4xl">⚡</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed font-medium">
            Transform, edit, and manage your documents with our comprehensive suite of 
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg mx-1"> 25+ professional tools</span>. 
            Everything you need for document productivity, all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-12">
            <Button 
              size="lg" 
              onClick={() => openAuthModal('signup')} 
              className="w-full sm:w-auto text-lg px-8 sm:px-10 py-4 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-2xl hover:shadow-3xl transition-all duration-300 font-semibold"
            >
              Start Free Now
              <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto text-lg px-8 sm:px-10 py-4 sm:py-6 hover:scale-105 border-2 hover:border-blue-300 transition-all duration-300 font-semibold hover:bg-blue-50"
            >
              View All Tools
              <Sparkles className="ml-3 h-5 w-5" />
            </Button>
          </div>

          {/* Enhanced Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-16">
            {features.map((feature, index) => (
              <div 
                key={feature}
                className="flex items-center bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-full px-3 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:border-blue-300"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mr-2 sm:mr-3" />
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          {/* Startup Banner */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center bg-gradient-to-r from-green-100 via-yellow-50 to-green-100 text-gray-800 px-8 py-4 rounded-full text-lg font-semibold shadow-lg border-2 border-green-200">
                <Sparkles className="h-5 w-5 mr-3 text-yellow-500 animate-pulse" />
                <p>This is a startup looking for investors. Built by young Cameroonians, fully working!</p>
                <Sparkles className="h-5 w-5 ml-3 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Tools Section */}
      <section id="tools" className="bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 py-16 sm:py-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <Badge variant="secondary" className="mb-4 sm:mb-6 text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 animate-bounce bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-semibold shadow-lg">
              25+ Professional Tools Available
            </Badge>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Everything You Need for 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> PDF Management</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
              From basic conversions to advanced editing, our tools handle all your document needs with professional precision
            </p>
          </div>

          {/* Enhanced PDF Tools Grid */}
          <div className="mb-16 sm:mb-20">
            <div className="flex items-center justify-center mb-8 sm:mb-12">
              <div className="flex items-center bg-white rounded-full px-6 sm:px-8 py-3 sm:py-4 shadow-lg border-2 border-red-100">
                <div className="p-2 bg-red-100 rounded-full mr-3 sm:mr-4">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">PDF Tools</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {pdfTools.map((tool, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white relative overflow-hidden"
                  onClick={handleToolClick}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {tool.popular && (
                    <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                      POPULAR
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="pb-3 sm:pb-4 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`p-2 sm:p-3 rounded-xl ${tool.bgColor} group-hover:scale-110 transition-all duration-300 shadow-md`}>
                        <tool.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg group-hover:text-blue-600 transition-colors duration-300 font-semibold">{tool.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="group-hover:text-gray-700 transition-colors duration-300 font-medium leading-relaxed text-sm">{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Enhanced Additional Tools Grid */}
          <div>
            <div className="flex items-center justify-center mb-8 sm:mb-12">
              <div className="flex items-center bg-white rounded-full px-6 sm:px-8 py-3 sm:py-4 shadow-lg border-2 border-green-100">
                <div className="p-2 bg-green-100 rounded-full mr-3 sm:mr-4">
                  <QrCode className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">Productivity Tools</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {additionalTools.map((tool, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105 border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:bg-white relative overflow-hidden"
                  onClick={handleToolClick}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <CardHeader className="pb-3 sm:pb-4 relative z-10">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`p-2 sm:p-3 rounded-xl ${tool.bgColor} group-hover:scale-110 transition-all duration-300 shadow-md`}>
                        <tool.icon className={`h-5 w-5 sm:h-7 sm:w-7 ${tool.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base sm:text-lg group-hover:text-green-600 transition-colors duration-300 font-semibold">{tool.name}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="group-hover:text-gray-700 transition-colors duration-300 font-medium leading-relaxed text-sm">{tool.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-16 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 via-purple-600/50 to-pink-600/50"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 animate-fade-in">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg sm:text-2xl mb-8 sm:mb-10 opacity-90 max-w-3xl mx-auto animate-fade-in font-medium leading-relaxed" style={{ animationDelay: '0.2s' }}>
            Join thousands of professionals who trust QuickDocs for their document processing needs
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => openAuthModal('signup')}
            className="text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 hover:scale-105 bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in font-semibold"
            style={{ animationDelay: '0.4s' }}
          >
            Get Started for Free
            <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-bold">QuickDocs</span>
              </div>
              <p className="text-gray-400 leading-relaxed font-medium text-sm sm:text-base">
                Professional document tools that work entirely in your browser. 
                Fast, secure, and always free.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 sm:mb-6 text-lg">Product</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">PDF Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Productivity Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 sm:mb-6 text-lg">Company</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4 sm:mb-6 text-lg">Support</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors font-medium text-sm sm:text-base">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 font-medium">
            <p className="text-sm sm:text-base">&copy; 2024 QuickDocs. All rights reserved. Made with ❤️ for document productivity.</p>
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