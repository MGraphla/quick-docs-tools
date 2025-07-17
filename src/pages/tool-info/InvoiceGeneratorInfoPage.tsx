import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, FilePlus, Eye, Send, LayoutTemplate, Calculator, ShieldCheck, DownloadCloud } from 'lucide-react';

const InvoiceGeneratorInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/invoice-generator');
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
        <title>Free Invoice Generator | Create Professional Invoices Online</title>
        <meta
          name="description"
          content="Generate, customize, and download professional PDF invoices for free. Easy-to-use templates, automatic calculations, and no watermarks."
        />
        <meta
          name="keywords"
          content="invoice generator, free invoice template, create invoice, online invoice maker, pdf invoice, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white"
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
              Create Professional Invoices in Seconds
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-emerald-100 opacity-90"
              variants={sectionVariants}
            >
              Look professional and get paid faster with our simple, powerful invoice generator.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-emerald-600 hover:bg-emerald-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Make an Invoice Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get It Done in 3 Simple Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Go from blank page to a professional invoice ready to be sent.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: FilePlus, title: 'Fill In Your Details', description: 'Add your business info, client details, line items, and taxes.' },
                { icon: Eye, title: 'Preview Your Invoice', description: 'Choose a template and see a live preview of your professional invoice.' },
                { icon: Send, title: 'Send or Download', description: 'Download your invoice as a PDF or send it directly to your client.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-emerald-200/50 dark:border-emerald-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Features to Streamline Your Billing</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: LayoutTemplate, title: 'Professional Templates', description: 'Choose from a variety of clean, modern templates to match your brand.' },
                { icon: Calculator, title: 'Automatic Calculations', description: 'Let us handle the math. We calculate totals, taxes, and discounts for you.' },
                { icon: ShieldCheck, title: 'Secure & Private', description: 'Your invoice data is processed in your browser and is never stored on our servers.' },
                { icon: DownloadCloud, title: 'Multiple Export Options', description: 'Download a professional PDF, print it, or email it directly to your client.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Invoice Questions Answered</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'Is this invoice generator completely free?', a: 'Yes, absolutely. You can create, download, and send unlimited invoices for free, with no watermarks or hidden charges.' },
                { q: 'Is my business and client data saved?', a: 'No. For your privacy, all data you enter is processed and stored only in your browser. Nothing is saved on our servers.' },
                { q: 'Can I add my company logo to the invoice?', a: 'Yes, our templates include an option to easily upload your company logo for a branded, professional look.' },
                { q: 'What currencies do you support?', a: 'Our invoice generator supports all major global currencies. You can select your desired currency from the settings menu within the tool.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-emerald-600 dark:hover:text-teal-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Paid Faster?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-emerald-100 opacity-90">Create and send a professional invoice in minutes. It’s fast, free, and easy.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-emerald-600 hover:bg-emerald-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Create Your Free Invoice <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default InvoiceGeneratorInfoPage;
