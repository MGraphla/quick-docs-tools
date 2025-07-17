import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { PenTool, UploadCloud, Edit, Download, Shield, Zap, Smile, ThumbsUp, Star, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const SignPdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/sign-pdf');
  };

  return (
    <>
      <Helmet>
        <title>Sign PDF Online | Free & Secure PDF Signature Tool</title>
        <meta
          name="description"
          content="Easily sign PDF documents online for free. Create your digital signature, upload your PDF, and sign it in seconds. Secure, fast, and legally binding."
        />
        <meta
          name="keywords"
          content="sign pdf, pdf signature, esign, digital signature, sign documents online, free pdf signer, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white"
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
              Sign Your PDFs with Ease
            </motion.h1>
            <motion.p
              className="max-w-2xl mx-auto text-lg md:text-xl mb-8 text-shadow"
              variants={sectionVariants}
            >
              Create your digital signature and sign documents online in just a few clicks. It's fast, secure, and free.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                Sign Your PDF Now
                <PenTool className="ml-2 h-5 w-5" />
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
              <h2 className="text-3xl md:text-4xl font-bold">Get Your Document Signed in Seconds</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">A simple, intuitive, and secure signing process.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[ 
                { icon: UploadCloud, title: '1. Upload PDF', description: 'Choose the PDF document you need to sign from your device.', iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500' },
                { icon: FileSignature, title: '2. Create & Sign', description: 'Draw, type, or upload your signature and place it on the document.', iconBg: 'bg-gradient-to-br from-indigo-400 to-purple-500' },
                { icon: Download, title: '3. Download', description: 'Download your securely signed PDF file instantly.', iconBg: 'bg-gradient-to-br from-purple-400 to-pink-500' },
              ].map((step, index) => (
                <motion.div key={index} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.1 } } }}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl text-center h-full">
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
              <h2 className="text-3xl md:text-4xl font-bold">Why Sign PDFs with QuickDocs?</h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">Experience the future of document signing with our powerful features.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-red-100 rounded-full w-fit">
                    <Shield className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="mt-4">Legally Binding</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Our eSignatures are compliant with eIDAS, ESIGN, and UETA regulations, making them legally valid.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                    <Edit className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="mt-4">Multiple Signature Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Create your signature by drawing with a mouse, typing your name, or uploading an image.</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="mt-4">Blazing Fast Speed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Sign and finalize your documents in seconds, not hours. No registration required.</p>
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
              <h2 className="text-3xl md:text-4xl font-bold">Trusted by Thousands of Users</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <Smile className="h-10 w-10 text-yellow-500 mr-4" />
                    <div>
                      <p className="font-semibold">Michael Chen, Freelancer</p>
                      <div className="flex text-yellow-500">
                        <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">"Signing contracts has never been easier. I use QuickDocs for all my client agreements. It's a lifesaver!"
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <ThumbsUp className="h-10 w-10 text-blue-500 mr-4" />
                    <div>
                      <p className="font-semibold">Sarah Rodriguez, HR Manager</p>
                      <div className="flex text-yellow-500">
                        <Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} /><Star size={16} />
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">"The security and ease of use are top-notch. We've streamlined our entire onboarding process with this tool."
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
                <AccordionTrigger>Are digital signatures legally binding?</AccordionTrigger>
                <AccordionContent>
                  Yes, our digital signatures comply with major e-signature laws like the ESIGN Act and UETA in the United States, and eIDAS in the European Union, making them legally binding for most documents.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Is it secure to sign my documents here?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. We prioritize your privacy. All signing is performed locally in your browser, and your documents are never uploaded to our servers.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Do I need to create an account?</AccordionTrigger>
                <AccordionContent>
                  No account or registration is required. You can use our PDF signing tool for free, instantly.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          className="py-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Sign Your Documents?</h2>
            <p className="max-w-2xl mx-auto text-lg md:text-xl mb-8">
              Finalize your agreements and contracts in seconds. Get started with our free and secure PDF signer now.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Sign My PDF for Free
              <PenTool className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default SignPdfInfoPage;
