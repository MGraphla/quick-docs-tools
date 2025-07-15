import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Zap,
  ChevronRight,
  Play,
  Scissors,
  SplitSquareHorizontal
} from "lucide-react";

const SplitPdfInfoPage = () => {
  const features = [
    {
      icon: SplitSquareHorizontal,
      title: "Range Selection",
      description: "Extract specific page ranges or individual pages with precision"
    },
    {
      icon: Scissors,
      title: "Bulk Splitting",
      description: "Split large PDFs into multiple smaller documents automatically"
    },
    {
      icon: Shield,
      title: "Quality Preserved",
      description: "Maintain original PDF quality, formatting, and metadata in split files"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Split even large PDFs in seconds with our optimized engine"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Upload PDF File",
      description: "Select the PDF document you want to split"
    },
    {
      step: 2,
      title: "Choose Split Method",
      description: "Select page ranges or specify how to split your document"
    },
    {
      step: 3,
      title: "Preview Split",
      description: "Review the pages that will be extracted or split"
    },
    {
      step: 4,
      title: "Download Files",
      description: "Get your split PDF files instantly"
    }
  ];

  const faqs = [
    {
      question: "Can I split a PDF into individual pages?",
      answer: "Yes! You can extract each page as a separate PDF file, or select specific page ranges to create multiple documents."
    },
    {
      question: "Will the split PDFs maintain their quality?",
      answer: "Absolutely. Our splitting tool preserves the original quality, formatting, fonts, and images from your PDF."
    },
    {
      question: "Is there a limit to PDF file size?",
      answer: "No file size limits! Split PDFs of any size, whether they're a few pages or hundreds of pages long."
    },
    {
      question: "Can I split password-protected PDFs?",
      answer: "You'll need to unlock password-protected PDFs first using our Unlock PDF tool before splitting them."
    },
    {
      question: "Are my files safe when splitting?",
      answer: "Yes, all PDF processing happens locally in your browser. Your files are never uploaded to our servers."
    }
  ];

  const useCases = [
    "Extract specific chapters from reports",
    "Create individual invoices from batch files", 
    "Separate exam papers for distribution",
    "Split presentation slides for editing",
    "Extract pages for email attachments"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                QuickDocs
              </span>
            </Link>
            <Link to="/dashboard/split-pdf">
              <Button className="bg-green-600 hover:bg-green-700">
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
          <Badge variant="secondary" className="mb-6 bg-green-100 text-green-800 px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            Essential PDF Tool
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Split PDF Files with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600"> Precision</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Extract specific pages or split large PDF documents into smaller files. 
            Perfect for organizing documents, sharing specific sections, or creating manageable file sizes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/dashboard/split-pdf">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg">
                <Scissors className="h-5 w-5 mr-2" />
                Start Splitting PDFs
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
              <div className="text-3xl font-bold text-green-600 mb-2">500K+</div>
              <div className="text-gray-600">PDFs Split</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Quality Preserved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">No Limits</div>
              <div className="text-gray-600">File Size</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">Instant</div>
              <div className="text-gray-600">Processing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful PDF Splitting Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade tools for precise PDF document management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-green-100 rounded-xl w-fit mb-4">
                    <feature.icon className="h-8 w-8 text-green-600" />
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
              How to Split PDFs in 4 Easy Steps
            </h2>
            <p className="text-xl text-gray-600">
              Extract pages from your PDF documents in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
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
            <Link to="/dashboard/split-pdf">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                Try Splitting Now - Free!
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Perfect for Every Use Case
              </h2>
              <div className="space-y-4">
                {useCases.map((useCase, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                    <span className="text-lg text-gray-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Split PDFs?</h3>
              <ul className="space-y-3 text-gray-700">
                <li>• Reduce file sizes for easier sharing</li>
                <li>• Extract specific content for presentations</li>
                <li>• Organize large documents into sections</li>
                <li>• Create focused documents for teams</li>
                <li>• Comply with file size restrictions</li>
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
              Everything you need to know about splitting PDFs
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
      <section className="py-16 bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Split Your PDFs?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Start organizing your documents with precision splitting
          </p>
          <Link to="/dashboard/split-pdf">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              <Scissors className="h-5 w-5 mr-2" />
              Start Splitting Now
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
              <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl">
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
  );
};

export default SplitPdfInfoPage;