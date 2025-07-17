import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, FileSignature, Palette, DownloadCloud, ScanText, Sparkles, ShieldCheck, FilePlus } from 'lucide-react';

const ResumeBuilderInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/resume-builder');
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
        <title>Professional Resume Builder | Create Your Resume for Free</title>
        <meta
          name="description"
          content="Build a professional, ATS-friendly resume in minutes with our free Resume Builder. Choose from modern templates, customize content, and download as a PDF."
        />
        <meta
          name="keywords"
          content="resume builder, free resume builder, professional resume, resume templates, cv maker, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 via-teal-500 to-green-600 text-white"
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
              Build Your Professional Resume, Faster
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-blue-100 opacity-90"
              variants={sectionVariants}
            >
              Create a standout, professional resume in minutes with our intuitive builder and expert templates.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-blue-600 hover:bg-blue-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Create Your Resume Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Create Your Resume in 3 Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Land your dream job with a resume that gets noticed.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Palette, title: 'Choose a Template', description: 'Select from a collection of modern, ATS-friendly resume templates.' },
                { icon: FileSignature, title: 'Customize Your Content', description: 'Fill in your details with our guided editor and real-time preview.' },
                { icon: DownloadCloud, title: 'Download & Share', description: 'Export your finished resume as a high-quality PDF, ready to send.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-blue-200/50 dark:border-blue-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-blue-500 to-teal-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Features to Help You Succeed</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ScanText, title: 'ATS-Friendly', description: 'Our templates are optimized to pass through Applicant Tracking Systems.' },
                { icon: Sparkles, title: 'Expert Guidance', description: 'Get tips and suggestions to make your resume content shine.' },
                { icon: ShieldCheck, title: 'Privacy Focused', description: 'Your data is saved locally in your browser, ensuring complete privacy.' },
                { icon: FilePlus, title: 'Unlimited Creation', description: 'Create and download as many resumes as you need, completely free.' },
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
                { q: 'Is the resume builder completely free?', a: 'Yes, our resume builder is 100% free to use. You can create, edit, and download unlimited resumes without any hidden charges or subscriptions.' },
                { q: 'Are the templates suitable for all industries?', a: 'Our templates are designed to be professional and versatile, suitable for a wide range of industries from tech to creative fields. Choose the one that best fits your personality and career.' },
                { q: 'Can I edit my resume after downloading it?', a: 'Your resume data is stored in your browser, so you can return anytime to make updates and download a new version. The downloaded PDF itself is not directly editable.' },
                { q: 'What is an ATS-friendly resume?', a: 'An Applicant Tracking System (ATS) is software used by recruiters to scan resumes. Our templates are structured to be easily readable by these systems, increasing your chances of getting noticed.' },
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-500 via-teal-500 to-green-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Land Your Dream Job?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-blue-100 opacity-90">A great resume is the first step. Start building yours for free today and take the next step in your career.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-blue-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Build My Resume for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default ResumeBuilderInfoPage;
