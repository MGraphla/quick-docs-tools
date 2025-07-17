import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, UploadCloud, FileText, Download, Languages, Users, ShieldCheck, Clock } from 'lucide-react';

const AudioToTextInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/audio-to-text');
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
        <title>Audio to Text Transcription | Convert Speech to Text Free</title>
        <meta
          name="description"
          content="Transcribe audio to text accurately with our free tool. Supports multiple languages and formats like MP3, WAV. Secure, fast, and easy to use."
        />
        <meta
          name="keywords"
          content="audio to text, speech to text, transcribe audio, audio transcription, free transcription, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white"
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
              Accurate Audio-to-Text Transcription
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-red-100 opacity-90"
              variants={sectionVariants}
            >
              Effortlessly convert your interviews, podcasts, and voice notes into editable text.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-red-600 hover:bg-red-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Transcribe Your Audio <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Transcribe in 3 Simple Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Get accurate transcripts quickly with our streamlined process.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: UploadCloud, title: 'Upload Your Audio', description: 'Drag and drop your audio file (MP3, WAV, M4A, etc.) into the tool.' },
                { icon: FileText, title: 'Automatic Transcription', description: 'Our AI-powered engine transcribes your speech with high accuracy.' },
                { icon: Download, title: 'Export Your Text', description: 'Review, edit, and export the final transcript as a TXT or DOCX file.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-red-200/50 dark:border-red-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-red-500 to-pink-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Advanced Transcription Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Languages, title: 'Multi-Language Support', description: 'Transcribe audio in over 50 languages and dialects with high accuracy.' },
                { icon: Users, title: 'Speaker Identification', description: 'Automatically detect and label different speakers in your audio file.' },
                { icon: ShieldCheck, title: 'Secure & Private', description: 'Your files are encrypted and processed securely. We respect your privacy.' },
                { icon: Clock, title: 'Fast Turnaround', description: 'Get your transcripts back in minutes, not hours, thanks to our efficient engine.' },
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
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Common Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'How accurate is the transcription?', a: 'Our transcription service uses state-of-the-art AI to achieve up to 98% accuracy, depending on the audio quality and clarity.' },
                { q: 'What audio formats can I upload?', a: 'We support a wide range of formats, including MP3, WAV, M4A, FLAC, and OGG. If you have a different format, please contact support.' },
                { q: 'Is my data secure?', a: 'Absolutely. We use industry-standard encryption for data in transit and at rest. Your files are processed securely and are never shared.' },
                { q: 'Can it handle multiple speakers?', a: 'Yes, our system can automatically identify and separate different speakers in the transcript, making conversations easy to follow.' },
                { q: 'Is there a limit on the audio file length?', a: 'Our free plan supports files up to 30 minutes long. For longer files and batch processing, please check out our affordable premium plans.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-red-600 dark:hover:text-pink-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Unlock the Content in Your Audio</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-red-100 opacity-90">Stop manually typing out audio. Let our AI do the heavy lifting so you can focus on what matters.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-red-600 hover:bg-red-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Start Transcribing for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default AudioToTextInfoPage;
