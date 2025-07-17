import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, UploadCloud, Lock, Download, ShieldCheck, KeyRound, FileLock2, Users } from 'lucide-react';

const ProtectPdfInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/protect-pdf');
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
        <title>Protect PDF | Free PDF Password Protection</title>
        <meta
          name="description"
          content="Secure your PDF files with a strong password for free. Our online tool encrypts your documents to prevent unauthorized access and protect sensitive information."
        />
        <meta
          name="keywords"
          content="protect pdf, password protect pdf, encrypt pdf, pdf security, secure pdf, free pdf protection, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 text-white"
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
              Password Protect Your PDF
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-red-100 opacity-90"
              variants={sectionVariants}
            >
              Add a password to your PDF files to keep sensitive content secure from unauthorized viewers.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-red-600 hover:bg-red-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Secure Your PDF Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Secure Your File in Three Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Our process makes PDF protection simple, fast, and highly secure.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: UploadCloud, title: 'Upload Your PDF', description: 'Choose the PDF file you wish to encrypt and protect.' },
                { icon: Lock, title: 'Set a Strong Password', description: 'Enter a secure password to encrypt your document.' },
                { icon: Download, title: 'Download Encrypted File', description: 'Your password-protected PDF is ready for secure sharing and storage.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-red-200/50 dark:border-red-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-rose-500 to-red-500 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Advanced Security Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, title: 'Strong Encryption', description: 'We use robust AES-256 bit encryption to make your files virtually unbreakable.' },
                { icon: KeyRound, title: 'Access Control', description: 'Only individuals with the correct password can open and view your document.' },
                { icon: FileLock2, title: 'Prevent Copying', description: 'Protect your content by restricting others from copying text and images.' },
                { icon: Users, title: 'Confidential Sharing', description: 'Share sensitive documents with peace of mind, knowing they are protected.' },
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
                { q: 'How strong is the password protection?', a: 'Our tool uses AES-256 bit encryption, which is a military-grade standard used by governments and security agencies worldwide. It is considered extremely secure.' },
                { q: 'What happens if I forget the password?', a: 'Password protection is irreversible. If you forget the password, there is no way to recover it or open the file. Please store your password in a safe place.' },
                { q: 'Can I remove a password from a PDF?', a: 'To remove a password, you will need to use an "Unlock PDF" tool. You must know the current password to successfully unlock the file.' },
                { q: 'Can I set different passwords for opening and editing?', a: 'Our free tool applies one password for opening the document. More advanced permission controls, such as setting a separate password for editing, are available in our premium plans.' },
                { q: 'Are my files safe on your servers?', a: 'Yes, your privacy is paramount. All files are processed securely and are automatically deleted from our servers one hour after processing is complete.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-red-600 dark:hover:text-rose-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-rose-600 to-pink-700 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Secure Your PDFs?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-red-100 opacity-90">Protect your sensitive information with strong, reliable password encryption.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-red-600 hover:bg-red-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default ProtectPdfInfoPage;
