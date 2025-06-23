import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  Clock,
  ArrowLeft,
  MessageCircle,
  HeadphonesIcon,
  Globe
} from "lucide-react";
import { toast } from "sonner";

const ContactUs = () => {
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="relative">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickDocs
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Get in 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Touch</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Have questions, feedback, or need support? We'd love to hear from you. 
            Our team typically responds within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Email Support</h3>
            <p className="text-gray-600 mb-4">Get help via email</p>
            <p className="text-blue-600 font-medium">support@quickdocs.com</p>
            <p className="text-sm text-gray-500 mt-2">Response within 24 hours</p>
          </Card>

          <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Phone Support</h3>
            <p className="text-gray-600 mb-4">Speak with our team</p>
            <p className="text-green-600 font-medium">+1 (555) 123-4567</p>
            <p className="text-sm text-gray-500 mt-2">Mon-Fri, 9AM-6PM EST</p>
          </Card>

          <Card className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-6">
              <MessageCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Live Chat</h3>
            <p className="text-gray-600 mb-4">Chat with us instantly</p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Start Chat
            </Button>
            <p className="text-sm text-gray-500 mt-2">Available 24/7</p>
          </Card>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="p-8 border-0 shadow-xl">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Send us a Message</CardTitle>
              <CardDescription className="text-lg">
                Fill out the form below and we'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
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
                    <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
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
                  <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
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
                  <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
                  <Textarea
                    id="message"
                    value={contactForm.message}
                    onChange={(e) => handleContactChange('message', e.target.value)}
                    placeholder="Tell us more about your inquiry..."
                    required
                    className="mt-1 min-h-32"
                  />
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-3">
                  <Send className="h-5 w-5 mr-2" />
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Email Us</h3>
                    <p className="text-gray-600">support@quickdocs.com</p>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Call Us</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                    <p className="text-sm text-gray-500">Mon-Fri, 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Visit Us</h3>
                    <p className="text-gray-600">123 Innovation Drive<br />San Francisco, CA 94105</p>
                    <p className="text-sm text-gray-500">By appointment only</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Monday - Friday: 9AM - 6PM EST</p>
                    <p className="text-gray-600">Saturday - Sunday: Closed</p>
                    <p className="text-sm text-gray-500">Emergency support available 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <Card className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-0">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Frequently Asked Questions</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Is my data secure?</p>
                  <p className="text-gray-600">Yes! All processing happens in your browser. We never see your files.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Do you offer enterprise plans?</p>
                  <p className="text-gray-600">Yes, we have custom solutions for businesses. Contact us for details.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Can I use QuickDocs offline?</p>
                  <p className="text-gray-600">Most tools work offline once loaded. Some features require internet.</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">What file formats do you support?</p>
                  <p className="text-gray-600">We support PDF, Word, Excel, PowerPoint, and various image formats.</p>
                </div>
              </div>
            </Card>

            {/* Office Hours */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <HeadphonesIcon className="h-5 w-5" />
                Support Availability
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email Support:</span>
                  <span className="font-medium text-green-600">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Support:</span>
                  <span className="font-medium text-blue-600">Mon-Fri 9AM-6PM EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Live Chat:</span>
                  <span className="font-medium text-purple-600">24/7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Response Time:</span>
                  <span className="font-medium text-orange-600">< 24 hours</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-20 mt-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Don't wait - try QuickDocs today and see why thousands of users trust us with their documents
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Try QuickDocs Free
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-gray-900">
                Learn More
              </Button>
            </Link>
          </div>
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
                <li><Link to="/" className="hover:text-white transition-colors">PDF Tools</Link></li>
                <li><Link to="/" className="hover:text-white transition-colors">Productivity Tools</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
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
    </div>
  );
};

export default ContactUs;