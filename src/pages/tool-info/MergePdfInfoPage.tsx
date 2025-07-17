import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { motion, Variants, Transition } from 'framer-motion';
import { Layers, UploadCloud, Shuffle, Download, ShieldCheck, Zap, GaugeCircle, Star, Quote } from 'lucide-react';
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

const MergePdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToTool = () => {
    navigate('/dashboard/merge-pdf');
  };

  const benefits = [
    { icon: GaugeCircle, title: "Unlimited Merges", description: "Combine as many PDF files as you need with no restrictions." },
    { icon: ShieldCheck, title: "100% Secure & Private", description: "Your files are processed locally and never leave your device." },
    { icon: Zap, title: "Lightning Fast", description: "Our high-performance engine merges large batches of PDFs in seconds." },
    { icon: Layers, title: "Preserve Quality", description: "Maintains the original formatting and high quality of all documents." }
  ];

  const testimonials = [
    { name: "Alex R.", role: "Project Manager", quote: "This is the simplest and fastest PDF merger I've ever used. It's a lifesaver for compiling reports. The quality is always perfect!" },
    { name: "Samantha B.", role: "Legal Assistant", quote: "I merge dozens of legal documents daily. QuickDocs' tool is incredibly reliable and secure, which is crucial for my work. Highly recommended!" },
  ];

  const faqs = [
    { q: "How do I merge PDF files?", a: "Simply upload your PDFs, arrange them in your desired order by dragging and dropping, and click the merge button. Your new combined PDF will be ready instantly." },
    { q: "Is there a limit to how many PDFs I can combine?", a: "You can merge up to 20 PDF files at once. For larger projects, you can merge batches and then combine the merged files." },
    { q: "Is it secure to merge my files here?", a: "Absolutely. All processing happens in your browser. Your files are never uploaded to our servers, ensuring 100% privacy and security." },
    { q: "Will the merged PDF maintain the original quality?", a: "Yes. Our tool is designed to preserve the original quality, formatting, and orientation of all your documents in the final merged file." },
    { q: "Can I rearrange the order of my PDFs before merging?", a: "Of course! You have full control. Drag and drop the uploaded files to arrange them in any order you prefer before you combine them." },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Helmet>
        <title>Merge PDF Files Online Free | Combine Multiple PDFs into One</title>
        <meta name="description" content="Combine multiple PDFs into one seamless file for free. Our tool lets you merge documents securely online while preserving quality. Fast, easy, and reliable." />
      </Helmet>

      <main>
        {/* Hero Section */}
        <motion.section 
          className="relative bg-gradient-to-br from-green-400 via-teal-500 to-cyan-500 text-white overflow-hidden text-center py-20 md:py-32"
          variants={sectionVariants} initial="hidden" animate="visible"
        >
          <div className="relative z-10 container mx-auto px-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg">Merge PDFs, Simplified</h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-green-50 opacity-90">Effortlessly combine multiple PDF documents into a single, organized file. Fast, secure, and completely free.</p>
            <Button 
              size="lg" 
              className="bg-white text-teal-600 font-bold hover:bg-green-50 transition-transform transform hover:scale-105 shadow-2xl px-8 py-6 text-lg"
              onClick={handleGoToTool}
            >
              Merge PDFs Now
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
              Combine PDFs in <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">Three Easy Steps</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">1. Upload Files</h3>
                    <p className="text-gray-600 dark:text-gray-400">Select or drag and drop all the PDF documents you want to merge.</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <Shuffle size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">2. Arrange Order</h3>
                    <p className="text-gray-600 dark:text-gray-400">Drag and drop the files to set your preferred order for the final document.</p>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-teal-400 rounded-xl blur-md opacity-50"></div>
                  <div className="relative bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-full mx-auto mb-6 shadow-lg">
                      <Download size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">3. Download</h3>
                    <p className="text-gray-600 dark:text-gray-400">Click 'Merge' and download your perfectly combined PDF in seconds.</p>
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Merge PDFs with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">QuickDocs</span>?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <Card key={index} className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-lg border border-green-200/50 dark:border-teal-800/50 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                    <CardHeader className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 text-white rounded-lg shadow-md">
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">Professionals</span></h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                  <CardContent className="flex flex-col items-center text-center">
                    <Quote className="w-12 h-12 text-green-300 dark:text-teal-700 mb-4" />
                    <p className="italic mb-4 text-gray-600 dark:text-gray-400">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">Questions</span></h2>
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
          className="py-20 bg-gradient-to-br from-green-400 via-teal-500 to-cyan-500"
          variants={sectionVariants} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.5 }}
        >
          <div className="container mx-auto px-4 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-shadow-lg">Ready to Combine Your PDFs?</h2>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 opacity-90">Experience the simplest way to merge your documents. Get started now—it's free!</p>
            <Button 
              size="lg" 
              className="bg-white text-teal-600 font-bold hover:bg-green-50 transition-transform transform hover:scale-105 shadow-2xl px-8 py-6 text-lg"
              onClick={handleGoToTool}
            >
              Start Merging Now <Layers className="ml-2" />
            </Button>
          </div>
        </motion.section>
      </main>
    </div>
  );
};

export default MergePdfInfoPage;