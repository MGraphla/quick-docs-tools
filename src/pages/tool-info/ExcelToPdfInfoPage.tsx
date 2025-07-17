import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, ShieldCheck, Zap, Users, CheckCircle, UploadCloud, Download, FileSpreadsheet } from 'lucide-react';

const ExcelToPdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/excel-to-pdf');
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
        <title>Excel to PDF Converter | Free Online XLSX to PDF</title>
        <meta
          name="description"
          content="Convert your Excel spreadsheets (XLSX, XLS) to high-quality, professional PDFs for free. Our online tool preserves formatting, formulas, and tables."
        />
        <meta
          name="keywords"
          content="excel to pdf, xlsx to pdf, xls to pdf, convert excel to pdf, spreadsheet converter, free converter, online tool, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 text-white"
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
              Excel to PDF Converter
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-green-100 opacity-90"
              variants={sectionVariants}
            >
              Transform your spreadsheets into professional, shareable PDFs in seconds.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-green-600 hover:bg-green-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Convert Excel to PDF <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">From Spreadsheet to PDF in Three Easy Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Our streamlined process makes converting spreadsheets incredibly simple.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: UploadCloud, title: 'Upload Your Spreadsheet', description: 'Select the XLSX or XLS file you want to convert.' },
                { icon: Zap, title: 'Instant Conversion', description: 'Our tool processes your file, perfectly preserving your tables and formatting.' },
                { icon: Download, title: 'Download Your PDF', description: 'Download your new, professional PDF, ready for distribution.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-green-200/50 dark:border-green-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-green-500 to-teal-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Why Convert Your Spreadsheets with Us?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: FileSpreadsheet, title: 'Retain Formatting', description: 'All your tables, charts, and cell formatting are perfectly preserved.' },
                { icon: CheckCircle, title: 'Universal Compatibility', description: 'Create PDFs that are easy to share and open on any device, anywhere.' },
                { icon: Zap, title: 'Blazing-Fast Speed', description: 'Our optimized conversion engine works at maximum speed to save you time.' },
                { icon: ShieldCheck, title: 'Guaranteed Privacy', description: 'Your files are encrypted and automatically deleted from our servers after one hour.' },
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Professionals Everywhere</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">See why users love our tool for sharing their spreadsheets.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                { name: 'Financial Analyst', quote: 'I use this to send reports to clients. It keeps my data looking clean and professional, no matter how it is viewed.' },
                { name: 'Small Business Owner', quote: 'This is a lifesaver for creating invoices from my Excel templates. It is fast, reliable, and incredibly easy to use.' },
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
                      <p className="text-gray-600 dark:text-gray-300 italic">\"{testimonial.quote}\"</p>
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
                { q: 'Will my formulas be calculated in the PDF?', a: 'The PDF will display the calculated values from your Excel sheet, but the formulas themselves will not be interactive in the PDF.' },
                { q: 'Can I convert multiple sheets at once?', a: 'Yes, our tool converts all sheets in your Excel workbook into a single, multi-page PDF document by default.' },
                { q: 'Is there a limit on the file size I can convert?', a: 'For free users, spreadsheets are limited to 1000 rows and 50MB. For larger files, consider our premium plans for increased limits and batch processing.' },
                { q: 'How secure is my data?', a: 'We prioritize your privacy. All uploaded spreadsheets and resulting PDFs are encrypted and permanently deleted from our servers after one hour.' },
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-500 via-teal-500 to-blue-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Share Your Data?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-green-100 opacity-90">Create polished, professional PDFs from your spreadsheets in just a few clicks. It's fast, secure, and free.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-green-600 hover:bg-green-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default ExcelToPdfInfoPage;
