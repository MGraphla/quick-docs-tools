import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, FileText, Presentation, ShieldCheck, Zap, Star, Users, CheckCircle } from 'lucide-react';

const PdfToPowerpointInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/pdf-to-powerpoint');
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
        <title>PDF to PowerPoint Converter | Convert PDF to Editable PPTX Slides</title>
        <meta
          name="description"
          content="Easily convert your PDF files into fully editable PowerPoint (PPTX) presentations. Preserve layouts, text, and images with our fast, secure, and accurate online converter."
        />
        <meta
          name="keywords"
          content="pdf to powerpoint, pdf to pptx, convert pdf to powerpoint, pdf converter, online tool, editable powerpoint, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 text-white"
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
              PDF to PowerPoint Converter
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-orange-50 opacity-90"
              variants={sectionVariants}
            >
              Transform your PDFs into dynamic, fully editable PowerPoint presentations in seconds.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-white text-red-600 hover:bg-orange-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Convert PDF to PowerPoint Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Converting your PDF to a PowerPoint presentation is a simple, three-step process.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[                { icon: FileText, title: 'Upload Your PDF', description: 'Select the PDF file you want to convert from your device.' },
                { icon: Zap, title: 'Convert with a Click', description: 'Our tool automatically processes the file, turning each page into a slide.' },
                { icon: Presentation, title: 'Download Your PPTX', description: 'Your editable PowerPoint presentation is ready to download instantly.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-red-500 to-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Why Convert PDF to PowerPoint?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[                { icon: Presentation, title: 'Editable Slides', description: 'Modify text, images, and layouts just like any other PowerPoint presentation.' },
                { icon: CheckCircle, title: 'Layout Preservation', description: 'Retains the original structure and formatting of your PDF document.' },
                { icon: Zap, title: 'Fast & Efficient', description: 'Our powerful engine converts files quickly without compromising on quality.' },
                { icon: ShieldCheck, title: 'Secure & Private', description: 'Your files are processed securely and deleted from our servers after conversion.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-red-500" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Loved by Professionals</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">See what our users are saying about our PDF to PowerPoint converter.</p>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[                { name: 'Marketing Manager', quote: 'A lifesaver for turning quarterly reports into presentations. The formatting is surprisingly accurate!' },
                { name: 'University Student', quote: 'I convert my lecture notes from PDF to PPTX to add my own annotations. Works perfectly every time.' },
              ].map((testimonial, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-500/30 shadow-lg rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
                          <Users className="h-6 w-6 text-red-500" />
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
              {[                { q: 'Is the conversion from PDF to PowerPoint free?', a: 'Yes, our basic PDF to PowerPoint conversion is completely free. For advanced features or batch processing, you may consider our pro plan.' },
                { q: 'Will my formatting be preserved?', a: 'We strive to maintain the original layout, text, and images as accurately as possible. However, complex PDFs may see some minor variations.' },
                { q: 'How secure is my data?', a: 'Your privacy is our priority. All uploaded files are encrypted and automatically deleted from our servers within an hour of conversion.' },
                { q: 'Can I convert scanned PDFs?', a: 'Our standard converter works best with text-based PDFs. For scanned documents, you would need an OCR (Optical Character Recognition) enabled tool for best results.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-red-600 dark:hover:text-orange-400">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your PDFs?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-orange-50 opacity-90">Go from static document to dynamic presentation in just a few clicks.</p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-red-600 hover:bg-orange-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Start Converting for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default PdfToPowerpointInfoPage;

