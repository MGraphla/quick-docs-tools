// import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ArrowRight,
  CheckCircle,
  Star,
  Clock,
  Shield,
  Zap,
  Users,
  ChevronRight,
  Play,
  Download,
  Upload,
  Merge
} from "lucide-react";

const MergePdfInfoPage = () => {
  const features = [
    {
      icon: Upload,
      title: "Drag & Drop Upload",
      description: "Simply drag your PDF files or click to browse and select multiple files at once"
    },
    {
      icon: Merge,
      title: "Smart Merging",
      description: "Automatically combines PDFs while preserving formatting, bookmarks, and metadata"
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "All processing happens in your browser - your files never leave your device"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Merge large PDFs in seconds with our optimized processing engine"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Upload PDF Files",
      description: "Select or drag multiple PDF files into the upload area"
    },
    {
      step: 2,
      title: "Arrange Order",
      description: "Use the arrow buttons to reorder files in your preferred sequence"
    },
    {
      step: 3,
      title: "Merge PDFs",
      description: "Click the merge button to combine all files into one document"
    },
    {
      step: 4,
      title: "Download Result",
      description: "Download your merged PDF file instantly"
    }
  ];

  const faqs = [
    {
      question: "Is there a limit to the number of PDFs I can merge?",
      answer: "No, there's no limit to the number of PDF files you can merge. However, for optimal performance, we recommend merging up to 50 files at once."
    },
    {
      question: "Are my files secure when using the merge tool?",
      answer: "Yes, absolutely. All PDF processing happens entirely in your browser. Your files are never uploaded to our servers, ensuring complete privacy and security."
    },
    {
      question: "What happens to bookmarks and metadata when merging?",
      answer: "Our smart merging algorithm preserves bookmarks, metadata, and document structure from all original files in the merged document."
    },
    {
      question: "Can I merge password-protected PDFs?",
      answer: "Yes, but you'll need to unlock password-protected PDFs first using our Unlock PDF tool before merging them."
    },
    {
      question: "Is the merge tool free to use?",
      answer: "Yes, the PDF merge tool is completely free to use with no hidden costs or subscription requirements."
    }
  ];

  const benefits = [
    "Save time by combining multiple documents",
    "Create professional document packages",
    "Reduce email attachment clutter",
    "Maintain document organization",
    "Preserve original formatting and quality"
  ];

  return (
    <>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/95 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QuickDocs
                </span>
              </Link>
              <Link to="/dashboard/merge-pdf">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Play className="h-4 w-4 mr-2" />
                  Use Tool Now
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 bg-blue-100 text-blue-800 px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              Most Popular Tool
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Merge PDF Files
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Instantly</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Combine multiple PDF documents into one seamless file with our free, secure, and lightning-fast PDF merger. 
              Perfect for creating reports, presentations, and document packages.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/dashboard/merge-pdf">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
                  <Merge className="h-5 w-5 mr-2" />
                  Start Merging PDFs
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">1M+</div>
                <div className="text-gray-600">PDFs Merged</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-600">Free Forever</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">0 Seconds</div>
                <div className="text-gray-600">Server Upload</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Available</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our PDF Merger?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built for professionals who need reliable, secure, and fast PDF merging
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="text-center">
                    <div className="mx-auto p-3 bg-blue-100 rounded-xl w-fit mb-4">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How to Merge PDFs in 4 Simple Steps
              </h2>
              <p className="text-xl text-gray-600">
                Follow our easy step-by-step guide to merge your PDF files
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                  {index < steps.length - 1 && (
                    <ChevronRight className="hidden lg:block h-6 w-6 text-gray-400 mx-auto mt-4" />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/dashboard/merge-pdf">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Try It Now - It's Free!
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Benefits of Merging PDFs
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                      <span className="text-lg text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Perfect for:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li>• Creating comprehensive reports</li>
                  <li>• Combining invoices and receipts</li>
                  <li>• Merging contracts and agreements</li>
                  <li>• Building presentation packages</li>
                  <li>• Organizing research documents</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about merging PDFs
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Merge Your PDFs?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join millions of users who trust QuickDocs for their PDF needs
            </p>
            <Link to="/dashboard/merge-pdf">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
                <Merge className="h-5 w-5 mr-2" />
                Start Merging Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <Link to="/" className="inline-flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">QuickDocs</span>
              </Link>
              <p className="text-gray-400 mb-6">
                Professional PDF tools that work entirely in your browser
              </p>
              <div className="flex justify-center space-x-6">
                <Link to="/tools" className="text-gray-400 hover:text-white">All Tools</Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
                <Link to="/terms" className="text-gray-400 hover:text-white">Terms</Link>
                <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default MergePdfInfoPage;