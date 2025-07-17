import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, UploadCloud, RotateCw, Download, Save, Layers, Target, ShieldCheck } from 'lucide-react';

const RotatePdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/rotate-pdf');
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
        <title>Rotate PDF | Free Online PDF Page Rotator</title>
        <meta
          name="description"
          content="Permanently rotate pages in your PDF files online for free. Correct the orientation of your documents easily and securely with our PDF rotator tool."
        />
        <meta
          name="keywords"
          content="rotate pdf, pdf rotator, rotate pdf pages, online pdf tool, free pdf rotator, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-600 text-white"
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
              Rotate PDF Pages with Ease
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-teal-100 opacity-90"
              variants={sectionVariants}
            >
              Effortlessly fix the orientation of your PDF pages and save the changes permanently.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-teal-600 hover:bg-teal-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Rotate Your PDF Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Three Simple Steps to Rotate</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Our intuitive tool makes rotating PDFs straightforward and fast.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: UploadCloud, title: 'Upload Your PDF', description: 'Select the PDF document you need to adjust.' },
                { icon: RotateCw, title: 'Choose Rotation', description: 'Rotate all pages or select specific ones to turn left or right.' },
                { icon: Download, title: 'Download Your File', description: 'Download your newly oriented PDF, with changes saved permanently.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-teal-200/50 dark:border-teal-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-cyan-500 to-teal-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Why Use Our PDF Rotator?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Save, title: 'Permanent Rotation', description: 'Unlike viewers that only temporarily rotate, our tool saves the orientation permanently.' },
                { icon: Layers, title: 'Batch Processing', description: 'Rotate all pages in a document at once, or select specific pages to rotate.' },
                { icon: Target, title: 'High Precision', description: 'Maintain the original quality and formatting of your document without any loss.' },
                { icon: ShieldCheck, title: 'Secure & Private', description: 'Your files are processed securely and deleted from our servers after one hour.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-teal-500" />
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'Can I rotate just one page in a multi-page PDF?', a: 'Yes, our tool allows you to select and rotate specific pages. You can apply different rotations to different pages within the same document before saving.' },
                { q: 'Is the rotation permanent?', a: 'Absolutely. When you download the file, the rotation changes are saved permanently in the PDF, so it will open in the correct orientation in any PDF viewer.' },
                { q: 'What rotation angles are supported?', a: 'You can rotate pages by 90 degrees clockwise, 90 degrees counter-clockwise (270 degrees), or 180 degrees (upside down). ' },
                { q: 'Is there a file size limit for rotating PDFs?', a: 'For free users, the file size limit is 50MB. For larger files, please consider our premium plans which offer higher limits and more features.' },
                { q: 'Are my files secure when I use this tool?', a: 'Yes, your privacy is our priority. All files are processed securely and are automatically deleted from our servers one hour after you are done.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-teal-600 dark:hover:text-cyan-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-400 via-cyan-500 to-emerald-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Fix Your PDFs?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-teal-100 opacity-90">Correct your document orientation in seconds. It’s fast, free, and secure.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-teal-600 hover:bg-teal-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default RotatePdfInfoPage;
