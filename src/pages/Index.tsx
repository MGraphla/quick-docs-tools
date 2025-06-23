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
  Zap
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full opacity-5 animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2 hover-scale cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="relative">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
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

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 py-16 relative z-10">
        <div className="text-center max-w-5xl mx-auto animate-fade-in">
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
              onClick={() => scrollToSection('tools')}
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

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="container mx-auto px-4 py-16 relative z-10">
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