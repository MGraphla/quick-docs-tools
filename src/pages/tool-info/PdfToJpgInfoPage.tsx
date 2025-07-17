import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, FileText, Image, ShieldCheck, Zap, Users, CheckCircle, Download } from 'lucide-react';

const PdfToJpgInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/pdf-to-jpg');
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Helmet>
        <title>PDF to JPG Converter | Free Online PDF to Image Tool</title>
        <meta
          name="description"
          content="Convert your PDF files to high-quality JPG images for free. Our online tool is fast, secure, and easy to use. Turn PDF pages into individual JPGs in seconds."
        />
        <meta
          name="keywords"
          content="pdf to jpg, pdf to image, convert pdf to jpg, pdf converter, free converter, online tool, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="absolute inset-0 bg-black opacity-30"></div>
          <div className="relative z-10 container mx-auto">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg"
              variants={sectionVariants}
            >
              PDF to JPG Converter
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-yellow-50 opacity-90"
              variants={sectionVariants}
            >
              Transform each page of your PDF into a high-quality JPG image effortlessly.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-orange-600 hover:bg-yellow-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Convert PDF to JPG Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* How-To Section */}
        <motion.section
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From Document to Image in Seconds</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Our streamlined process makes converting PDFs to JPGs incredibly simple.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: FileText, title: 'Upload Your PDF', description: 'Select the PDF document you wish to convert.' },
                { icon: Zap, title: 'Instant Conversion', description: 'Our tool processes your file and converts each page into a JPG.' },
                { icon: Download, title: 'Download Images', description: 'Download your new JPG files individually or as a single ZIP archive.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-yellow-200/50 dark:border-yellow-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-orange-500 to-yellow-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <step.icon className="h-8 w-8" />
                      </div>
                      <CardTitle className="text-xl font-semibold">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Benefits Section */}
        <motion.section
          className="py-20 px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Why You'll Love Our Converter</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Image, title: 'High-Quality Output', description: 'Choose your desired image quality to get crisp, clear JPGs every time.' },
                { icon: CheckCircle, title: 'Page Selection', description: 'Convert all pages at once or select specific pages to turn into images.' },
                { icon: Zap, title: 'Incredibly Fast', description: 'Our optimized conversion process is designed for speed and efficiency.' },
                { icon: ShieldCheck, title: 'Complete Privacy', description: 'Your files are secure with us. We delete them automatically after processing.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-orange-500" />
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Praised by Creatives and Professionals</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">Discover why users trust us for their PDF to JPG conversion needs.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { name: 'Graphic Designer', quote: 'The best tool for quickly grabbing pages from a PDF to use as mockups. The quality options are fantastic.' },
                { name: 'Real Estate Agent', quote: 'I use this to convert property flyers into images for social media posts. It’s fast, simple, and effective.' },
              ].map((testimonial, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-yellow-200/50 dark:border-yellow-500/30 shadow-lg rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                          <Users className="h-6 w-6 text-orange-500" />
                        </div>
                        <p className="ml-4 font-bold text-lg">{testimonial.name}</p>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 italic">"{testimonial.quote}"</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="py-20 px-4 sm:px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'Can I choose the resolution of the output JPG?', a: 'Yes, our tool provides options to select the DPI (dots per inch), allowing you to control the resolution and file size of the output images.' },
                { q: 'Are there any limits on file size or number of conversions?', a: 'For free users, there are generous daily limits on file size and the number of conversions. For unlimited access, consider our Pro plan.' },
                { q: 'Will the converted JPGs have watermarks?', a: 'No, we do not add any watermarks to your converted images. What you upload is what you get, just in a different format.' },
                { q: 'What happens to my files after I convert them?', a: 'To protect your privacy, all uploaded and converted files are permanently deleted from our servers after one hour.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-orange-600 dark:hover:text-yellow-400">{faq.q}</AccordionTrigger>
                  <AccordionContent className="text-base text-gray-600 dark:text-gray-300">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Bring Your PDFs to Life?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-yellow-50 opacity-90">Convert your documents into versatile images today. It's free and easy.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-orange-600 hover:bg-yellow-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default PdfToJpgInfoPage;
