import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, Variants, Transition } from 'framer-motion';
import { Scissors, UploadCloud, FileCheck, Download, ShieldCheck, Zap, GaugeCircle, Quote, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const transition: Transition = {
  duration: 0.6,
  ease: "easeOut",
};

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition,
  },
};

const SplitPdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToTool = () => {
    navigate('/dashboard/split-pdf');
  };

  const benefits = [
    { icon: GaugeCircle, title: "Precise Splitting", description: "Extract specific pages or page ranges with perfect accuracy." },
    { icon: ShieldCheck, title: "100% Secure & Private", description: "Your files are processed locally and never leave your device." },
    { icon: Zap, title: "Lightning Fast", description: "Our high-performance engine splits large PDFs in just seconds." },
    { icon: FileText, title: "Multiple Split Options", description: "Extract pages into a single PDF or as individual files." }
  ];

  const testimonials = [
    { name: "Maria G.", role: "Real Estate Agent", quote: "Splitting large property documents into smaller, client-specific files has never been easier. This tool is a game-changer for my workflow!" },
    { name: "David L.", role: "University Student", quote: "I use this to extract chapters from my e-textbooks for studying. It's fast, free, and incredibly simple to use. A must-have for any student." },
  ];

  const faqs = [
    { q: "How do I split a PDF file?", a: "Upload your PDF, select the pages or ranges you want to extract, and click 'Split PDF'. You can then download your new, smaller PDF files." },
    { q: "Can I extract multiple page ranges at once?", a: "Yes, you can define multiple ranges (e.g., 1-3, 5, 8-10) to create several new PDFs from a single source document in one go." },
    { q: "Is it secure to split my files here?", a: "Absolutely. All processing happens in your browser. Your files are never uploaded to our servers, ensuring 100% privacy and security." },
    { q: "Will the split PDFs maintain the original quality?", a: "Yes. Our tool is designed to preserve the original high quality, formatting, and orientation of your pages in the final split files." },
    { q: "Can I split a password-protected PDF?", a: "You must first unlock the PDF using our 'Unlock PDF' tool before you can split it. For security reasons, we cannot bypass password protection directly." },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Helmet>
        <title>Split PDF Files Online Free | Extract Pages from PDFs</title>
        <meta name="description" content="Easily split a PDF into multiple files or extract specific pages for free. Our online tool is fast, secure, and preserves document quality. Try it now!" />
      </Helmet>

      <main>
        {/* Hero Section */}
        <motion.section 
          className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 text-white overflow-hidden text-center py-20 md:py-32"
          variants={sectionVariants} initial="hidden" animate="visible"
        >
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg">Split PDFs with Precision</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-purple-50 opacity-90">Quickly extract pages or divide your document into separate files. Secure, intuitive, and completely free.</p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 font-bold hover:bg-purple-50 transition-transform transform hover:scale-105 shadow-2xl px-8 py-6 text-lg"
              onClick={handleGoToTool}
            >
              Split Your PDF Now
            </Button>
          </div>
        </motion.section>

        {/* How it works Section */}
        <motion.section 
          className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50"
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Extract Pages in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Three Simple Steps</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">1. Upload PDF</h3>
                    <p className="text-gray-600 dark:text-gray-400">Select or drag and drop the PDF document you want to split.</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <FileCheck size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">2. Select Pages</h3>
                    <p className="text-gray-600 dark:text-gray-400">Choose the exact pages or page ranges you need to extract.</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <Download size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">3. Download Files</h3>
                    <p className="text-gray-600 dark:text-gray-400">Click 'Split' and download your new PDF files in seconds.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section 
          className="py-16 md:py-24 bg-white dark:bg-gray-900"
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Split PDFs with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">QuickDocs</span>?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg border border-purple-200/50 dark:border-pink-800/50 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <CardHeader className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-lg shadow-md">
                        <Icon size={24} />
                      </div>
                      <CardTitle className="text-lg font-bold">{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50"
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Trusted by <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Users Worldwide</span></h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <CardContent className="flex flex-col items-center text-center">
                    <Quote className="w-12 h-12 text-purple-300 dark:text-pink-700 mb-4" />
                    <p className="italic mb-4 text-gray-600 dark:text-gray-400">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          className="py-16 md:py-24 bg-white dark:bg-gray-900"
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">Questions</span></h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                  <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-4">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400 pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section 
          className="py-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500"
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-shadow-lg">Ready to Extract Your Pages?</h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">Start splitting your documents with our powerful and easy-to-use tool. It's free!</p>
            <Button 
              size="lg" 
              className="bg-white text-purple-600 font-bold hover:bg-purple-50 transition-transform transform hover:scale-105 shadow-2xl px-8 py-6 text-lg"
              onClick={handleGoToTool}
            >
              Start Splitting Now <Scissors className="ml-2" />
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default SplitPdfInfoPage;