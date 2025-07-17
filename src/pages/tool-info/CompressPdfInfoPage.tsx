import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { motion, Variants, Transition } from 'framer-motion';
import { ArrowLeft, Minimize2, Zap, ShieldCheck, GaugeCircle, UploadCloud, Download, HelpCircle, Star, Quote } from 'lucide-react';

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

const CompressPdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <GaugeCircle className="w-10 h-10 text-indigo-500" />,
      title: 'High-Level Compression',
      description: 'Our advanced algorithms significantly reduce file sizes while maintaining the best possible quality for your documents.',
    },
    {
      icon: <Zap className="w-10 h-10 text-indigo-500" />,
      title: 'Incredibly Fast',
      description: 'Compress your PDF files in seconds. Our powerful servers handle your files at lightning speed, so you don’t have to wait.',
    },
    {
      icon: <ShieldCheck className="w-10 h-10 text-indigo-500" />,
      title: 'Secure and Private',
      description: 'Your privacy is paramount. We use secure connections and automatically delete your files from our servers after a short period.',
    },
  ];

  const faqs = [
    {
      question: 'How much can I reduce my PDF file size?',
      answer: 'The compression ratio depends on the original file. Our tool can reduce file sizes by up to 80% for documents with many images, while still preserving visual quality.',
    },
    {
      question: 'Will compressing a PDF reduce its quality?',
      answer: 'Our tool aims to find the perfect balance between file size and quality. While some quality loss is inevitable with compression, we use advanced techniques to make it virtually unnoticeable for most documents.',
    },
    {
      question: 'Is it safe to compress my PDF files with this tool?',
      answer: 'Absolutely. We use TLS encryption to protect your files during transfer, and we permanently delete them from our servers a few hours after processing to ensure your data remains private.',
    },
    {
      question: 'What is the maximum file size I can upload?',
      answer: 'You can upload and compress PDF files up to 200MB. For larger files, our premium plans offer more flexibility and power.',
    },
  ];

  const handleGoToTool = () => {
    navigate('/compress-pdf');
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Helmet>
        <title>Free Online PDF Compressor - Reduce PDF File Size Securely</title>
        <meta name="description" content="Compress PDF files to a smaller size online for free. Our tool reduces the size of your PDFs while preserving quality. Fast, easy, and 100% secure PDF compression." />
      </Helmet>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
            <Badge variant="outline" className="mb-4 bg-white/20 text-white border-white/50">Free & Online</Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">The Ultimate PDF Compressor</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-indigo-100">Drastically reduce your PDF file sizes for easy sharing and storage, while maintaining the highest quality.</p>
            <div className="mt-8 flex justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleGoToTool} size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg transform transition-transform duration-300">
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Compress Your PDF Now
                </Button>
              </motion.div>
            </div>
            <p className="mt-4 text-sm text-indigo-200">No registration required. 100% secure.</p>
          </div>
        </section>

        {/* How it works */}
        <motion.section
          id="how-it-works"
          className="py-16 sm:py-24 bg-white dark:bg-gray-900"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Compress in Three Simple Steps</h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">A seamless experience from start to finish.</p>
            </div>
            <div className="mt-20 grid gap-8 md:grid-cols-3">
              <div className="p-1 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 h-full text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 mx-auto">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">1. Upload Your PDF</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Drag and drop your file or select it from your device. We support PDFs of all sizes.</p>
                </div>
              </div>
              <div className="p-1 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 h-full text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 mx-auto">
                    <Minimize2 className="w-8 h-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">2. Choose Quality</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Select a compression level. Our smart engine will optimize for the best size-to-quality ratio.</p>
                </div>
              </div>
              <div className="p-1 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 h-full text-center">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 mx-auto">
                    <Download className="w-8 h-8" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">3. Download</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">Your compressed file is ready in an instant. Download it and share it with the world.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Optimized for Excellence</h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">More than just a compressor, it’s a tool designed for performance and security.</p>
            </div>
            <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white/10 dark:bg-gray-800/20 backdrop-blur-lg p-8 rounded-2xl shadow-lg border border-gray-200/20 dark:border-gray-700/30 text-center transform hover:-translate-y-2 transition-transform duration-300">
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/20 dark:bg-gray-700/50 shadow-md mx-auto">
                    {benefit.icon}
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">{benefit.title}</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section
          className="py-16 sm:py-24 bg-white dark:bg-gray-900 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">Loved by Professionals Worldwide</h2>
            </div>
            <div className="mt-12 grid gap-8 lg:grid-cols-2">
              <div className="relative bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <Quote className="absolute top-4 left-4 w-16 h-16 text-gray-200 dark:text-gray-700 opacity-50" />
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                </div>
                <blockquote className="relative z-10 text-lg text-gray-700 dark:text-gray-300 italic">"This is hands down the best PDF compressor I've used. It's fast, the interface is clean, and the quality is amazing. It saved me so much time preparing documents for clients."</blockquote>
                <p className="mt-4 font-semibold text-gray-900 dark:text-white text-right">- Sarah J., Freelance Designer</p>
              </div>
              <div className="relative bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg transform hover:-translate-y-2 transition-transform duration-300">
                <Quote className="absolute top-4 left-4 w-16 h-16 text-gray-200 dark:text-gray-700 opacity-50" />
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                  </div>
                </div>
                <blockquote className="relative z-10 text-lg text-gray-700 dark:text-gray-300 italic">"Our team sends out dozens of PDFs daily. This tool has been a lifesaver for keeping our email attachments small and our storage costs down. Highly recommended!"</blockquote>
                <p className="mt-4 font-semibold text-gray-900 dark:text-white text-right">- Mark T., Project Manager</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          id="faq"
          className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.</p>
            </div>
            <div className="mt-12 max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index + 1}`} className="border bg-white/80 dark:bg-gray-800/50 border-gray-200/80 dark:border-gray-700/60 rounded-lg shadow-sm transition-shadow hover:shadow-md">
                    <AccordionTrigger className="p-6 text-lg font-semibold text-gray-900 dark:text-white hover:no-underline">
                      <div className="flex items-center space-x-3">
                        <HelpCircle className="w-6 h-6 text-indigo-500 dark:text-blue-400" />
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 text-base text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </motion.section>

        {/* Final CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Ready to Shrink Your PDFs?</h2>
            <p className="mt-4 text-lg text-indigo-100">Give our compressor a try and see the magic for yourself. It's free!</p>
            <div className="mt-8">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleGoToTool} size="lg" className="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg transform transition-transform duration-300">
                  <Zap className="mr-2 h-5 w-5" />
                  Compress PDF Now
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

            <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} QuickDocs. All rights reserved.</p>
          <p className="mt-2">Your files are safe with us. We automatically delete all processed files.</p>
        </div>
      </footer>
    </div>
  );
};

export default CompressPdfInfoPage;