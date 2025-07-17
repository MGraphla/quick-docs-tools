import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Mic, FileText, Copy, Languages, Zap, ShieldCheck, Clock } from 'lucide-react';

const LiveTranscriptionInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/live-transcription');
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
        <title>Live Transcription | Real-Time Speech-to-Text</title>
        <meta
          name="description"
          content="Convert speech to text in real-time with our free Live Transcription tool. Perfect for meetings, lectures, and interviews. Accurate, fast, and secure."
        />
        <meta
          name="keywords"
          content="live transcription, real-time speech to text, voice to text, voice typing, dictation, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 text-white"
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
              Real-Time Speech-to-Text Transcription
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-violet-100 opacity-90"
              variants={sectionVariants}
            >
              Capture every word from meetings, lectures, and live events instantly as you speak.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-violet-600 hover:bg-violet-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Start Transcribing Live <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Seconds</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Our tool is designed for speed and simplicity. No sign-up required.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Mic, title: 'Start Listening', description: 'Click the button and grant microphone access to begin.' },
                { icon: FileText, title: 'Speak Naturally', description: 'The tool transcribes your speech into text in real-time as you talk.' },
                { icon: Copy, title: 'Copy Your Transcript', description: 'Instantly copy the full text to your clipboard when you are finished.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-violet-200/50 dark:border-violet-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-violet-500 to-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Powerful Features for Everyone</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Zap, title: 'Instant Feedback', description: 'See your words appear on screen milliseconds after you say them.' },
                { icon: Languages, title: 'Multi-Language Support', description: 'Dictate in over 50 languages and dialects with impressive accuracy.' },
                { icon: ShieldCheck, title: 'Completely Private', description: 'All transcription is processed in your browser. Nothing is stored on our servers.' },
                { icon: Clock, title: 'No Time Limits', description: 'Transcribe for as long as you need without interruptions. It is completely free.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-violet-500" />
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Your Questions Answered</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'What do I need to use the live transcription tool?', a: 'All you need is a computer or mobile device with a microphone and an internet connection. Our tool runs directly in modern web browsers like Chrome, Firefox, and Safari.' },
                { q: 'How accurate is the real-time transcription?', a: 'Accuracy is very high but can be affected by factors like background noise, speaker clarity, and strong accents. For best results, speak clearly in a quiet environment.' },
                { q: 'Is my speech recorded or stored anywhere?', a: 'No. Your privacy is our priority. All audio processing happens in real-time directly in your browser. We do not record, store, or transmit your voice data.' },
                { q: 'Can I save the transcript after I am done?', a: 'Yes. Once you stop the transcription, the full text remains on the screen. You can easily select and copy it to your clipboard to save or use it anywhere you like.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-violet-600 dark:hover:text-indigo-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Capture Every Word?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-violet-100 opacity-90">Boost your productivity in meetings, classes, and interviews. Start transcribing with a single click.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-violet-600 hover:bg-violet-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Try Live Transcription Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default LiveTranscriptionInfoPage;
