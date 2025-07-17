import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Type, Wand2, Save, Code, FileText, ShieldCheck, DownloadCloud } from 'lucide-react';

const TextEditorInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/text-editor');
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
        <title>Online Text Editor | Free Rich Text & Code Editor</title>
        <meta
          name="description"
          content="A powerful and free online text editor with rich formatting, Markdown support, and syntax highlighting. Write, edit, and save your documents securely."
        />
        <meta
          name="keywords"
          content="text editor, online editor, rich text editor, code editor, markdown editor, free text editor, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white"
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
              Powerful Online Text & Code Editor
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-amber-100 opacity-90"
              variants={sectionVariants}
            >
              Your versatile space to write, edit, and format text or code with ease and efficiency.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-amber-600 hover:bg-amber-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Start Writing Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Yet Powerful</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Get your thoughts down or draft your code in a clean, intuitive environment.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Type, title: 'Start Writing', description: 'Open the editor and begin typing. No setup or configuration needed.' },
                { icon: Wand2, title: 'Use Rich Tools', description: 'Apply formatting, use markdown shortcuts, or switch to code view.' },
                { icon: Save, title: 'Save & Export', description: 'Your work is auto-saved. Export your document as TXT, MD, or HTML.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-amber-200/50 dark:border-amber-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-amber-500 to-orange-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Everything You Need to Write Better</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: FileText, title: 'Markdown Support', description: 'Write in Markdown with a live preview for fast and easy formatting.' },
                { icon: Code, title: 'Syntax Highlighting', description: 'Write code with highlighting for dozens of popular languages.' },
                { icon: ShieldCheck, title: 'Privacy First', description: 'Your work is saved directly in your browser. Nothing is stored on our servers.' },
                { icon: DownloadCloud, title: 'Multiple Export Options', description: 'Download your work as plain text, Markdown, or HTML files.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-amber-500" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Common Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'Is the text editor free to use?', a: 'Yes, our online text editor is completely free. There are no subscriptions, ads, or feature limits. Just open it and start writing.' },
                { q: 'Where is my work saved?', a: 'For your privacy and security, all your text is saved automatically to your browser\'s local storage. It is not sent to or stored on our servers.' },
                { q: 'Can I use this editor offline?', a: 'Once the page is loaded, you can continue to use the editor offline. Your work will be saved locally. You will need an internet connection to export or share.' },
                { q: 'What programming languages are supported for syntax highlighting?', a: 'Our editor supports syntax highlighting for a wide variety of languages, including JavaScript, Python, Java, C++, HTML, CSS, and many more.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-amber-600 dark:hover:text-orange-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Bring Your Ideas to Life?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-amber-100 opacity-90">Whether it\'s a blog post, a code snippet, or just a quick note, our editor is ready for you.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-amber-600 hover:bg-amber-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Open the Editor <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default TextEditorInfoPage;
