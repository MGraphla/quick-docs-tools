import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, FileText, FileSpreadsheet, ShieldCheck, Zap, Users, CheckCircle, Table } from 'lucide-react';

const PdfToExcelInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/pdf-to-excel');
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <>
      <Helmet>
        <title>PDF to Excel Converter | Extract Data from PDF to Editable Excel</title>
        <meta
          name="description"
          content="Convert PDF files to editable Excel spreadsheets. Extract tables and data from your PDFs with high accuracy. Fast, secure, and easy to use."
        />
        <meta
          name="keywords"
          content="pdf to excel, pdf to xlsx, convert pdf to excel, pdf data extraction, pdf table extraction, online converter, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 text-white"
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
              PDF to Excel Converter
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-green-50 opacity-90"
              variants={sectionVariants}
            >
              Extract data from your PDFs into editable Excel spreadsheets with precision.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-green-600 hover:bg-green-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Convert PDF to Excel Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unlock Your Data in 3 Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Go from a static PDF to a fully functional Excel spreadsheet effortlessly.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: FileText, title: 'Upload Your PDF', description: 'Choose the PDF file containing the data you want to extract.' },
                { icon: Zap, title: 'Automatic Conversion', description: 'Our smart engine analyzes and extracts tables into an Excel format.' },
                { icon: FileSpreadsheet, title: 'Download Excel File', description: 'Your organized, editable spreadsheet is ready for download.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-teal-500 to-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">The Smart Way to Handle PDF Data</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Table, title: 'Accurate Table Extraction', description: 'Intelligently detects rows and columns to perfectly replicate your tables.' },
                { icon: CheckCircle, title: 'Data Integrity', description: 'Preserves numbers, text, and formatting, so your data remains accurate.' },
                { icon: Zap, title: 'OCR for Scanned PDFs', description: 'Extracts data even from scanned documents, turning images into editable text.' },
                { icon: ShieldCheck, title: 'Secure & Confidential', description: 'Your files are encrypted and automatically deleted, ensuring your data stays private.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-green-500" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Data Professionals</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">Hear from users who have streamlined their workflow with our tool.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { name: 'Financial Analyst', quote: 'This tool saves me hours of manual data entry every week. The accuracy of table extraction from bank statements is incredible.' },
                { name: 'Academic Researcher', quote: 'I use it to pull data from research papers into Excel for analysis. It has become an indispensable part of my toolkit.' },
              ].map((testimonial, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-500/30 shadow-lg rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                          <Users className="h-6 w-6 text-green-500" />
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
                { q: 'Can I convert multiple PDF files at once?', a: 'Our free tool processes one file at a time. For batch conversions, please check out our Pro subscription for more powerful features.' },
                { q: 'Does this tool work with scanned PDFs?', a: 'Yes, our PDF to Excel converter includes OCR technology to recognize and extract text and tables from scanned documents and images.' },
                { q: 'Is my financial or sensitive data secure?', a: 'Absolutely. We use end-to-end encryption, and your files are never stored on our servers for more than an hour. Your privacy is guaranteed.' },
                { q: 'What if my PDF has multiple tables on one page?', a: 'Our algorithm is designed to detect and separate multiple tables, placing them in different sheets or areas of your Excel file for clarity.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-green-600 dark:hover:text-teal-400">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-400 via-teal-500 to-blue-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop Copy-Pasting. Start Converting.</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-green-50 opacity-90">Unlock the data in your PDFs today. Get started for free.</p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-green-600 hover:bg-green-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Extract Data from PDF Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default PdfToExcelInfoPage;

