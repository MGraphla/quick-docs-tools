import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, Variants, Transition } from 'framer-motion';
import { FileText, UploadCloud, Repeat, Download, ShieldCheck, Zap, Layers, Quote, FileType } from 'lucide-react';
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

const PdfToWordInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToTool = () => {
    navigate('/dashboard/pdf-to-word');
  };

  const benefits = [
    { icon: Layers, title: "Layout Preservation", description: "Maintains original tables, columns, and graphics accurately." },
    { icon: ShieldCheck, title: "Secure Conversion", description: "Your files are processed locally and are never uploaded to servers." },
    { icon: Zap, title: "High-Speed Engine", description: "Convert even the most complex PDFs to DOCX in seconds." },
    { icon: FileType, title: "OCR for Scanned PDFs", description: "Extracts text from scanned documents to make them editable." }
  ];

  const testimonials = [
    { name: "John P.", role: "Legal Assistant", quote: "This tool is a lifesaver. It perfectly converts legal documents from PDF to Word, keeping all the formatting intact. Saves me hours of work!" },
    { name: "Samantha K.", role: "Researcher", quote: "I frequently convert academic papers. The accuracy of the text and table conversion is the best I've seen from any online tool. Highly recommended." },
  ];

  const faqs = [
    { q: "How do I convert a PDF to Word?", a: "Simply upload your PDF, click the 'Convert' button, and our tool will process it. You can then download the fully editable Word (DOCX) file." },
    { q: "Will my formatting be preserved?", a: "Yes, our converter is designed to retain the original layout, including fonts, images, tables, and columns, as accurately as possible." },
    { q: "Is it safe to convert my sensitive documents?", a: "Absolutely. The entire conversion process happens in your browser. Your files are never sent to our servers, ensuring complete privacy and security." },
    { q: "Can I convert a scanned PDF?", a: "Yes, our tool includes Optical Character Recognition (OCR) technology that can extract text from scanned PDFs, making them editable in Word." },
    { q: "Is there a file size or page limit?", a: "For optimal performance, we recommend files up to 50MB. While there's no strict page limit, larger files may take longer to convert." },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Helmet>
        <title>PDF to Word Converter | Free & Secure Online Tool</title>
        <meta name="description" content="Convert your PDF files to editable Word documents (DOCX) for free. Our online converter preserves formatting and supports OCR for scanned PDFs. Fast and secure!" />
      </Helmet>

      <main>
        {/* Hero Section */}
        <motion.section 
          className="relative bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white overflow-hidden text-center py-20 md:py-32"
          variants={sectionVariants} initial="hidden" animate="visible"
        >
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg">PDF to Word Converter</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-blue-50 opacity-90">Convert PDF to fully editable Word documents with superior accuracy. Free, fast, and secure.</p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 font-bold hover:bg-blue-50 transition-transform transform hover:scale-105 shadow-2xl px-8 py-6 text-lg"
              onClick={handleGoToTool}
            >
              Convert PDF to Word Now
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
              From Static PDF to Dynamic Word in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">3 Easy Steps</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">1. Upload PDF</h3>
                    <p className="text-gray-600 dark:text-gray-400">Drag and drop your PDF file or select it from your device.</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <Repeat size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">2. Convert</h3>
                    <p className="text-gray-600 dark:text-gray-400">Our engine analyzes and converts your file to DOCX format.</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <Download size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">3. Download Word</h3>
                    <p className="text-gray-600 dark:text-gray-400">Download your new, fully editable Word document instantly.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Conversion Experience</span></h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg border border-blue-200/50 dark:border-purple-800/50 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <CardHeader className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-md">
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Professionals <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Choose Us</span></h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <CardContent className="flex flex-col items-center text-center">
                    <Quote className="w-12 h-12 text-blue-300 dark:text-purple-700 mb-4" />
                    <p className="italic mb-4 text-gray-600 dark:text-gray-400">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Your Questions, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Answered</span></h2>
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
          className="py-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-shadow-lg">Ready to Make Your PDFs Editable?</h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">Experience the best-in-class PDF to Word conversion. Get started for free, right now.</p>
            <Button 
              size="lg" 
              className="bg-white text-blue-600 font-bold hover:bg-blue-50 transition-transform transform hover:scale-105 shadow-2xl px-8 py-6 text-lg"
              onClick={handleGoToTool}
            >
              Convert to Word Now <FileText className="ml-2" />
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default PdfToWordInfoPage;
