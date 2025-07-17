import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Calendar, Settings, Eye, Download, Printer, Sun, Star, Palette } from 'lucide-react';

const CalendarGeneratorInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/calendar-generator');
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
        <title>Free Printable Calendar Generator | Customize & Download</title>
        <meta
          name="description"
          content="Create and download custom printable calendars for any year or month. Add events, choose holidays, and select your own style. Free and easy to use."
        />
        <meta
          name="keywords"
          content="calendar generator, printable calendar, custom calendar, free calendar, monthly calendar, yearly calendar, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-600 text-white"
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
              Your Personal Calendar, Your Way
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-sky-100 opacity-90"
              variants={sectionVariants}
            >
              Design, customize, and print beautiful calendars for planning your life and work.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-sky-600 hover:bg-sky-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Create Your Calendar <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Generate in Three Simple Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              From idea to printable calendar in just a few clicks.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Settings, title: 'Customize Your Calendar', description: 'Choose the year, month, week start day, and add custom events or holidays.' },
                { icon: Eye, title: 'Preview Instantly', description: 'See a live preview of your calendar as you make changes to the design and layout.' },
                { icon: Download, title: 'Download or Print', description: 'Export your finished calendar as a high-quality PDF, ready for printing.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-sky-200/50 dark:border-sky-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-sky-500 to-cyan-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Plan with Power and Style</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Printer, title: 'Printable PDF Output', description: 'Generate high-resolution PDFs perfect for printing at home or the office.' },
                { icon: Sun, title: 'Holiday Integration', description: 'Automatically include public holidays for your selected country and region.' },
                { icon: Star, title: 'Add Custom Events', description: 'Personalize your calendar with birthdays, anniversaries, and important deadlines.' },
                { icon: Palette, title: 'Multiple Design Options', description: 'Choose from different themes, colors, and layouts to fit your style.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-sky-500" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Your Questions, Answered</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'Is this calendar generator free?', a: 'Yes, it is completely free to create, customize, and download as many calendars as you need. There are no hidden fees or subscriptions.' },
                { q: 'Can I create a calendar for a future year?', a: 'Absolutely. You can generate a calendar for any month and year, past, present, or future. Just enter the desired year in the settings.' },
                { q: 'Are my custom events saved?', a: 'For your privacy, custom events are processed in your browser and are not saved on our servers. You will need to re-enter them if you refresh the page.' },
                { q: 'What paper sizes can I print on?', a: 'The generated PDF is a standard high-resolution file that can be scaled to print on various paper sizes, including A4, Letter, and Legal, through your printer settings.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-sky-600 dark:hover:text-cyan-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-sky-500 via-cyan-500 to-teal-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Organized?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-sky-100 opacity-90">Start planning your year with a calendar that is uniquely yours.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-sky-600 hover:bg-sky-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Design Your Free Calendar <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default CalendarGeneratorInfoPage;
