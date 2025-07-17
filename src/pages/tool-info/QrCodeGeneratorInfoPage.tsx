import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Link as LinkIcon, Palette, Download, QrCode, BarChart2, Smartphone, InfinityIcon } from 'lucide-react';

const QrCodeGeneratorInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/qr-code-generator');
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
        <title>QR Code Generator | Create Custom QR Codes for Free</title>
        <meta
          name="description"
          content="Generate custom QR codes for URLs, text, Wi-Fi, and more. Our free tool allows you to customize the design and download high-resolution QR codes instantly."
        />
        <meta
          name="keywords"
          content="qr code generator, create qr code, free qr code, custom qr code, qr code for url, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 text-white"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative z-10 container mx-auto">
            <motion.h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg"
              variants={sectionVariants}
            >
              Instant QR Code Generator
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-blue-100 opacity-90"
              variants={sectionVariants}
            >
              Create, customize, and download high-quality QR codes for any purpose in seconds.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-blue-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Create Your QR Code <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Generate in 3 Easy Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Connect the physical and digital worlds effortlessly with our simple process.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: LinkIcon, title: 'Enter Your Data', description: 'Input a URL, text, contact info, or Wi-Fi credentials.' },
                { icon: Palette, title: 'Customize Design', description: 'Choose colors, add a logo, and select a custom shape.' },
                { icon: Download, title: 'Download & Share', description: 'Get your high-resolution QR code, ready for print or web.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-blue-500 to-teal-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Powerful Features at Your Fingertips</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: QrCode, title: 'Dynamic Codes', description: 'Update the destination URL of your QR code anytime without reprinting.' },
                { icon: BarChart2, title: 'Scan Analytics', description: 'Track how many people are scanning your codes, where, and when.' },
                { icon: Smartphone, title: 'Mobile-Friendly', description: 'Our QR codes are optimized for seamless scanning on all mobile devices.' },
                { icon: InfinityIcon, title: 'Unlimited & Free', description: 'Create as many static QR codes as you need, with no expiration.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-blue-500" />
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
                { q: 'What is the difference between a static and a dynamic QR code?', a: 'A static QR code has a fixed destination; you cannot change its content once created. A dynamic QR code allows you to change the destination URL at any time, even after it has been printed.' },
                { q: 'Can I use my own logo in the QR code?', a: 'Yes, our tool allows you to upload your logo, which will be placed in the center of the QR code. This is a great way to increase brand recognition.' },
                { q: 'Do the generated QR codes ever expire?', a: 'Static QR codes generated with our tool are free and will never expire. Dynamic QR codes may be subject to limits based on your subscription plan.' },
                { q: 'In what formats can I download my QR code?', a: 'You can download your QR codes in high-resolution PNG and SVG formats, making them perfect for both web and high-quality print applications.' },
                { q: 'Is it free to generate QR codes?', a: 'Yes, creating unlimited static QR codes is completely free. We offer premium features like dynamic codes and advanced analytics in our paid plans.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-blue-600 dark:hover:text-teal-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 via-teal-500 to-green-500 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Connect with Your Audience?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-blue-100 opacity-90">Start creating powerful, engaging QR codes today and watch your interactions grow.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-blue-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default QrCodeGeneratorInfoPage;
