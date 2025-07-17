import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Droplets, UploadCloud, Edit, Download, Shield, Zap, Smile, ThumbsUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const WatermarkPdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/watermark-pdf');
  };

  return (
    <>
      <Helmet>
        <title>Add Watermark to PDF | Secure & Easy PDF Watermarking</title>
        <meta
          name="description"
          content="Easily add text or image watermarks to your PDF files online. Protect your documents with customizable watermarks. Fast, secure, and free."
        />
        <meta
          name="keywords"
          content="watermark pdf, add watermark to pdf, pdf watermarker, secure pdf, protect pdf, online tool, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 text-white"
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
              Add Watermark to Your PDFs
            </motion.h1>
            <motion.p
              className="max-w-2xl mx-auto text-lg md:text-xl mb-8 text-shadow"
              variants={sectionVariants}
            >
              Protect your documents by adding customizable text or image watermarks. Simple, fast, and secure.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Watermark Your PDF Now
                <Droplets className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">How It Works in 3 Easy Steps</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">A seamless process from start to finish.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[ 
                { icon: UploadCloud, title: '1. Upload PDF', description: 'Select and upload the PDF file you want to watermark.', iconBg: 'bg-gradient-to-br from-cyan-400 to-teal-500' },
                { icon: Edit, title: '2. Add Watermark', description: 'Customize your text or image watermark, position, and opacity.', iconBg: 'bg-gradient-to-br from-teal-400 to-emerald-500' },
                { icon: Download, title: '3. Download', description: 'Download your new, securely watermarked PDF instantly.', iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500' },
              ].map((step, index) => (
                <motion.div key={index} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } } }}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-cyan-200/50 dark:border-cyan-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl text-center h-full">
                    <CardHeader>
                      <div className={`mx-auto ${step.iconBg} text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg`}>
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
          className="py-16 sm:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Why Use Our Watermark Tool?</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Enjoy a range of powerful features designed for security and ease of use.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-red-100 rounded-full w-fit">
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="mt-4">Document Protection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Prevent unauthorized use and distribution of your documents by adding a visible watermark.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                    <Edit className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="mt-4">Full Customization</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Control the text, font, size, color, rotation, and opacity of your watermark for the perfect look.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="mt-4">Batch Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Apply the same watermark to multiple pages or documents at once to save valuable time.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Loved by Professionals</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">See what our users are saying about our tools.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Smile className="h-10 w-10 text-yellow-500 mr-4" />
                    <div>
                      <p className="font-semibold">John Doe, Photographer</p>
                      <div className="flex text-yellow-500">
                        <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">"The best tool for watermarking my photo portfolios before sending them to clients. It's fast, easy, and looks professional."
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="h-10 w-10 text-blue-500 mr-4" />
                    <div>
                      <p className="font-semibold">Jane Smith, Legal Advisor</p>
                      <div className="flex text-yellow-500">
                        <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">"We use this to mark all our legal documents as 'Confidential' or 'Draft'. It's an essential part of our workflow."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="py-16 sm:py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes, absolutely. All processing is done locally in your browser. Your files never leave your computer, ensuring complete privacy and security.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Can I use images as watermarks?</AccordionTrigger>
                <AccordionContent>
                  Yes, our tool supports both text and image (e.g., your logo) watermarks. You have full control over the placement and appearance.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Is this service free?</AccordionTrigger>
                <AccordionContent>
                  Yes, our PDF watermarking tool is completely free to use with generous limits for all users.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          className="py-20 bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Protect Your Documents?</h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl mb-8">
              Add a professional watermark to your PDFs in seconds. Get started now!
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-cyan-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Get Started for Free
              <Droplets className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default WatermarkPdfInfoPage;
