import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, UploadCloud, Scissors, Download, ShieldOff, Trash2, FileScan, Lock } from 'lucide-react';

const RedactPdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/redact-pdf');
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
        <title>Redact PDF | Securely Blackout PDF Content</title>
        <meta
          name="description"
          content="Permanently remove sensitive text and images from your PDF files. Our secure redaction tool blacks out content to protect your privacy before sharing."
        />
        <meta
          name="keywords"
          content="redact pdf, pdf redaction, blackout pdf, remove text from pdf, secure pdf, privacy, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-700 via-gray-800 to-black text-white"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 container mx-auto">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg"
              variants={sectionVariants}
            >
              Redact PDF for Ultimate Privacy
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-300 opacity-90"
              variants={sectionVariants}
            >
              Permanently and securely remove sensitive information from your PDF documents before sharing.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-gray-800 hover:bg-gray-200 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Start Redacting Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Redaction in 3 Simple Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Our intuitive tool makes it easy to protect your confidential data.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: UploadCloud, title: 'Upload Your PDF', description: 'Select the document you need to redact from your device.' },
                { icon: Scissors, title: 'Select and Redact', description: 'Draw boxes over the text or images you want to permanently remove.' },
                { icon: Download, title: 'Download Secure File', description: 'Download your new, securely redacted PDF, ready for sharing.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-gray-300/50 dark:border-gray-600/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-gray-600 to-gray-800 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Why Redact with QuickDocs?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldOff, title: 'Permanent Removal', description: 'Redacted content is completely removed from the PDF, not just hidden.' },
                { icon: Trash2, title: 'Secure Deletion', description: 'The underlying data of redacted text and images is securely deleted.' },
                { icon: FileScan, title: 'Metadata Protection', description: 'We help protect against hidden data leaks by cleaning document metadata.' },
                { icon: Lock, title: 'Client-Side Security', description: 'All redaction is performed in your browser. Your files never leave your computer.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-gray-700 dark:text-gray-300" />
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
                { q: 'Is the redaction really permanent?', a: 'Yes. Unlike simply covering text with a black box, our tool removes the underlying text and image data from the file. It cannot be recovered.' },
                { q: 'Can I redact images as well as text?', a: 'Absolutely. You can draw a redaction box over any part of the PDF page, including images, graphics, and text.' },
                { q: 'What is the difference between redacting and deleting?', a: 'Deleting removes a whole page or section, while redacting removes specific content within a page, leaving the rest of the document layout intact.' },
                { q: 'Do you store my files?', a: 'No. To ensure maximum privacy, all file processing happens directly in your web browser. Your documents are never uploaded to our servers.' },
                { q: 'Can I undo a redaction?', a: 'Once you apply the redactions and download the new file, the changes are permanent. You can, however, refresh the page to start over before downloading.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-gray-700 dark:hover:text-gray-300 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-700 via-gray-800 to-black text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Protect Your Information Before It's Too Late</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-gray-300 opacity-90">Use our free tool to ensure your documents are safe and secure for sharing.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-gray-800 hover:bg-gray-200 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Redact Your PDF for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default RedactPdfInfoPage;
