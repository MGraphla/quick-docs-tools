import React from 'react';
import { ArrowLeft, FileText, Download, Shield, Zap, CheckCircle, Users, Clock, Star, HelpCircle, ChevronRight, Scissors, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const SplitPdfInfoPage = () => {
  React.useEffect(() => {
    // SEO Meta Description
    document.title = "Split PDF Files Online - Extract Pages from PDF Documents | QuickDocs";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Split PDF files online by extracting specific pages or ranges. Fast, secure, and free PDF splitter tool. No software installation required.');
    }
  }, []);

  const faqs = [
    {
      question: "How do I split a PDF file?",
      answer: "Upload your PDF file, select the pages you want to extract by entering page numbers or ranges, then click split to create separate PDF files."
    },
    {
      question: "Can I split multiple page ranges at once?",
      answer: "Yes, you can specify multiple page ranges (e.g., 1-3, 5-7, 10-12) to create multiple PDF files from a single document."
    },
    {
      question: "Is there a limit to the PDF file size I can split?",
      answer: "There's no strict file size limit, but very large files may take longer to process. We recommend files under 100MB for optimal performance."
    },
    {
      question: "What happens to bookmarks and metadata when splitting?",
      answer: "Relevant bookmarks and metadata are preserved in the split PDF files where applicable, maintaining document structure."
    },
    {
      question: "Can I extract single pages from a PDF?",
      answer: "Absolutely! You can extract individual pages by specifying single page numbers, creating separate PDF files for each page."
    }
  ];

  const benefits = [
    { icon: Scissors, title: "Precise Extraction", description: "Extract exact pages or ranges with pixel-perfect accuracy" },
    { icon: Shield, title: "100% Secure", description: "Client-side processing ensures your documents never leave your device" },
    { icon: Zap, title: "Lightning Fast", description: "Split large PDFs in seconds with our optimized engine" },
    { icon: Target, title: "Multiple Formats", description: "Create individual files or batch extract multiple ranges" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/20">
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 transition-colors group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <Scissors className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Split PDF</h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  Extract pages from PDF files
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-6 bg-purple-100 text-purple-800 px-4 py-2 text-sm font-semibold">
              ✂️ PDF Splitting Tool
            </Badge>
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Split PDF Files Online
              <span className="block text-purple-600 mt-2">Extract & Organize</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Extract specific pages or split PDF documents into multiple files quickly and securely. 
              Professional-grade PDF splitter with precise page selection.
            </p>
            <div className="flex justify-center">
              <Link to="/split-pdf">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105">
                  Start Splitting PDFs
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl w-fit mb-4">
                      <Icon className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg font-bold text-gray-900">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* How-To Guide */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              How to Split PDF Files
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Upload PDF</h4>
                <p className="text-gray-600 leading-relaxed">
                  Click "Choose File" or drag and drop your PDF document into the upload area.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Select Pages</h4>
                <p className="text-gray-600 leading-relaxed">
                  Choose specific pages or page ranges (e.g., 1-5, 8, 10-15) that you want to extract.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">Download Results</h4>
                <p className="text-gray-600 leading-relaxed">
                  Click "Split PDF" and download your extracted pages as separate PDF files.
                </p>
              </div>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Perfect for These Use Cases
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📄 Document Organization</h4>
                <p className="text-gray-600">Separate chapters, sections, or topics from large documents</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📧 Email Attachments</h4>
                <p className="text-gray-600">Extract specific pages to send as smaller attachments</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">🎓 Academic Research</h4>
                <p className="text-gray-600">Extract relevant pages from research papers and studies</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">💼 Business Reports</h4>
                <p className="text-gray-600">Share specific sections with different stakeholders</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📋 Form Processing</h4>
                <p className="text-gray-600">Separate individual forms from batch submissions</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-md">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">📚 Book Chapters</h4>
                <p className="text-gray-600">Extract specific chapters or sections from e-books</p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl shadow-xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center flex items-center justify-center">
              <HelpCircle className="h-8 w-8 text-purple-600 mr-3" />
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-gray-900 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl shadow-2xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Split Your PDFs?</h3>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who trust our secure PDF splitter tool
            </p>
            <Link to="/split-pdf">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                Start Splitting Now
                <Scissors className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SplitPdfInfoPage;
