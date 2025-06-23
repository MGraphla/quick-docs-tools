import React, { useState, useEffect } from "react";
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
  Signature,
  Star,
  ArrowRight,
  CheckCircle,
  Users,
  Target,
  Award,
  Clock,
  Globe,
  Zap,
  Crown,
  Sparkles,
  Wand2,
  Diamond,
  Rocket,
  Heart,
  Flame
} from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";
import { toast } from "sonner";

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentToolIndex, setCurrentToolIndex] = useState(0);
  const navigate = useNavigate();

  const pdfTools = [
    { name: "Merge PDF", description: "Combine multiple PDF files into one", icon: FileText, gradient: "from-red-500 to-pink-600" },
    { name: "Split PDF", description: "Extract pages or split into separate documents", icon: Scissors, gradient: "from-blue-500 to-cyan-600" },
    { name: "Compress PDF", description: "Reduce file size while maintaining quality", icon: Archive, gradient: "from-green-500 to-emerald-600" },
    { name: "PDF to Word", description: "Convert PDF to editable Word document", icon: FileDown, gradient: "from-purple-500 to-violet-600" },
    { name: "PDF to PowerPoint", description: "Convert PDF to editable presentations", icon: FileDown, gradient: "from-orange-500 to-amber-600" },
    { name: "PDF to Excel", description: "Convert PDF tables to Excel spreadsheets", icon: FileDown, gradient: "from-teal-500 to-cyan-600" },
    { name: "Word to PDF", description: "Convert Word documents to PDF", icon: FileUp, gradient: "from-indigo-500 to-blue-600" },
    { name: "PowerPoint to PDF", description: "Convert presentations to PDF", icon: FileUp, gradient: "from-rose-500 to-pink-600" },
    { name: "Excel to PDF", description: "Convert spreadsheets to PDF", icon: FileUp, gradient: "from-emerald-500 to-green-600" },
    { name: "Edit PDF", description: "Add text, shapes, images, and annotations", icon: Edit, gradient: "from-violet-500 to-purple-600" },
    { name: "PDF to JPG", description: "Convert PDF pages to JPG images", icon: Image, gradient: "from-amber-500 to-orange-600" },
    { name: "JPG to PDF", description: "Convert images to PDF document", icon: FileUp, gradient: "from-cyan-500 to-teal-600" },
    { name: "Sign PDF", description: "Add digital signatures to PDFs", icon: Signature, gradient: "from-pink-500 to-rose-600" },
    { name: "Watermark", description: "Add text or image watermarks", icon: Shield, gradient: "from-lime-500 to-green-600" },
    { name: "Rotate PDF", description: "Rotate pages left or right", icon: Settings, gradient: "from-sky-500 to-blue-600" },
    { name: "Protect PDF", description: "Add password protection", icon: Shield, gradient: "from-fuchsia-500 to-purple-600" },
  ];

  const features = [
    { text: "16+ Professional Tools", icon: Crown },
    { text: "100% Client-Side Processing", icon: Shield },
    { text: "No File Size Limits", icon: Rocket },
    { text: "Enterprise-Grade Security", icon: Diamond }
  ];

  const stats = [
    { number: "50K+", label: "Happy Users", icon: Users, gradient: "from-blue-500 to-cyan-600" },
    { number: "1M+", label: "Files Processed", icon: FileText, gradient: "from-green-500 to-emerald-600" },
    { number: "99.9%", label: "Uptime", icon: Clock, gradient: "from-purple-500 to-violet-600" },
    { number: "16+", label: "Tools Available", icon: Zap, gradient: "from-orange-500 to-amber-600" }
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToolIndex((prev) => (prev + 1) % Math.min(pdfTools.length, 4));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleToolClick = () => {
    openAuthModal('signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden relative">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Mouse-responsive gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: `scale(${1 + Math.sin(Date.now() * 0.001) * 0.1})`
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-pink-500/5 to-rose-600/5 rounded-full blur-3xl transition-all duration-1500 ease-out"
          style={{
            left: mousePosition.x - 160,
            top: mousePosition.y - 160,
            transform: `scale(${1 + Math.cos(Date.now() * 0.0015) * 0.15}) rotate(${Date.now() * 0.01}deg)`
          }}
        />

        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-gradient-to-r ${
              ['from-blue-400 to-cyan-400', 'from-purple-400 to-pink-400', 'from-green-400 to-emerald-400', 'from-orange-400 to-amber-400'][i % 4]
            } rounded-full opacity-30 animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}

        {/* Magical sparkles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute text-blue-400 opacity-40 animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              fontSize: `${0.5 + Math.random() * 1}rem`
            }}
          >
            ✨
          </div>
        ))}

        {/* Geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 border border-blue-200 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-purple-200 rotate-45 animate-pulse" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg animate-bounce" style={{ animationDuration: '3s' }} />
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <nav className="flex items-center justify-between">
            {/* Enhanced Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3 hover:scale-105 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-2xl">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                  QuickDocs
                </span>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">Document Tools</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => openAuthModal('signin')}
                className="text-xs sm:text-sm hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-300 hover:scale-105 px-3 py-2 sm:px-4"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => openAuthModal('signup')}
                className="text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 px-3 py-2 sm:px-6"
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Ultra-Enhanced Hero Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          {/* Magical Badge */}
          <div className="inline-flex items-center bg-blue-100 border border-blue-200 text-blue-800 px-3 py-2 sm:px-4 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-float shadow-lg">
            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600" />
            Trusted by 50,000+ users worldwide
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2 text-blue-600 animate-twinkle" />
          </div>
          
          {/* Ultra-Dynamic Title */}
          <div className="relative mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-gray-900 leading-tight">
              <span className="inline-block animate-float" style={{ animationDelay: '0s' }}>
                Complete
              </span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient-x inline-block animate-float" style={{ animationDelay: '0.2s' }}>
                PDF
              </span>{' '}
              <span className="inline-block animate-float" style={{ animationDelay: '0.4s' }}>
                &
              </span>
              <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 animate-gradient-x inline-block animate-float" style={{ animationDelay: '0.6s' }}>
                Document
              </span>{' '}
              <span className="inline-block animate-float" style={{ animationDelay: '0.8s' }}>
                Suite
              </span>
              <span className="inline-block animate-bounce ml-2 text-2xl sm:text-4xl" style={{ animationDelay: '1s' }}>⚡</span>
            </h1>
            
            {/* Magical icons around title */}
            <Crown className="absolute -top-4 -left-4 sm:-top-8 sm:-left-8 h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 animate-twinkle" />
            <Wand2 className="absolute -top-4 -right-4 sm:-top-8 sm:-right-8 h-6 w-6 sm:h-8 sm:w-8 text-purple-500 animate-float" />
            <Sparkles className="absolute -bottom-4 left-1/4 h-5 w-5 sm:h-6 sm:w-6 text-pink-500 animate-twinkle" style={{ animationDelay: '1s' }} />
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
            Transform, edit, and manage your documents with our comprehensive suite of 
            <span className="font-semibold text-blue-600"> 16+ professional tools</span>. 
            Everything you need for document productivity, all in one place.
          </p>
          
          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-8 px-4">
            <Button 
              size="lg" 
              onClick={() => openAuthModal('signup')} 
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              Start Free Now
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:scale-105 transition-all duration-300"
            >
              View All Tools
            </Button>
          </div>

          {/* Enhanced Feature Pills */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12 px-4">
            {features.map((feature, index) => (
              <div 
                key={feature.text}
                className="flex items-center bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-2 sm:px-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white group"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <feature.icon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs sm:text-sm font-medium text-gray-700">{feature.text}</span>
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 ml-2 text-yellow-500 opacity-0 group-hover:opacity-100 animate-twinkle transition-opacity" />
              </div>
            ))}
          </div>

          {/* Enhanced Stats Section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-16 px-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-110 transition-all duration-500">
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${stat.gradient} rounded-full mb-2 sm:mb-3 shadow-lg group-hover:shadow-xl group-hover:shadow-current/25`}>
                  <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">{stat.number}</div>
                <div className="text-xs sm:text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ultra-Enhanced PDF Tools Section */}
      <section id="tools" className="container mx-auto px-4 py-8 sm:py-16 relative z-10">
        <div className="text-center mb-8 sm:mb-12">
          <Badge variant="secondary" className="mb-3 sm:mb-4 text-sm sm:text-lg px-4 sm:px-6 py-2 bg-blue-100 text-blue-800 border-blue-200 animate-float shadow-lg">
            16+ Tools Available
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Everything You Need for 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-gradient-x"> PDF Management</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            From basic conversions to advanced editing, our tools handle all your document needs
          </p>
        </div>

        {/* Dynamic Tool Preview */}
        <div className="mb-8 sm:mb-12">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-2">
              {pdfTools.slice(0, 4).map((tool, index) => (
                <div
                  key={index}
                  className={`flex-shrink-0 p-2 sm:p-3 rounded-lg transition-all duration-500 cursor-pointer ${
                    index === currentToolIndex 
                      ? `bg-gradient-to-r ${tool.gradient} shadow-2xl scale-110` 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setCurrentToolIndex(index)}
                >
                  <tool.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {pdfTools[currentToolIndex]?.name}
            </h3>
            <p className="text-gray-600 text-sm sm:text-base px-4">
              {pdfTools[currentToolIndex]?.description}
            </p>
          </div>
        </div>

        {/* Enhanced Tools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {pdfTools.map((tool, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white hover:scale-105 relative overflow-hidden"
              onClick={handleToolClick}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-r ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Magical sparkle indicator */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 animate-twinkle" />
              </div>

              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${tool.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                  </div>
                  <CardTitle className="text-sm sm:text-base lg:text-lg text-gray-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {tool.name}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 text-xs sm:text-sm">
                  {tool.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Ultra-Enhanced CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 py-12 sm:py-20 relative overflow-hidden">
        {/* Floating magical elements */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={`cta-magic-${i}`}
            className="absolute text-white/20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
              fontSize: `${1 + Math.random() * 2}rem`
            }}
          >
            {['✨', '🪄', '⭐', '👑', '💎'][Math.floor(Math.random() * 5)]}
          </div>
        ))}

        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 text-white">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-blue-100 max-w-3xl mx-auto px-4">
            Join thousands of professionals who trust QuickDocs for their document processing needs
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            onClick={() => openAuthModal('signup')}
            className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 hover:bg-gray-100 shadow-2xl hover:shadow-white/25 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            Get Started for Free
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold">QuickDocs</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional document tools that work entirely in your browser. 
                Fast, secure, and always free.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">PDF Tools</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2024 QuickDocs. All rights reserved. Made with ❤️ for document productivity.</p>
          </div>
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col space-y-2 sm:space-y-3">
        <Button
          size="icon"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-2xl hover:shadow-pink-500/25 transition-all duration-300 hover:scale-110 group"
          onClick={() => openAuthModal('signup')}
        >
          <Heart className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
        </Button>
        <Button
          size="icon"
          className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-110 group"
          onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Flame className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform" />
        </Button>
      </div>

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
          50% { transform: translateY(-10px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .hover-scale {
          transition: transform 0.2s ease-in-out;
        }
        .hover-scale:hover {
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
};

export default Index;