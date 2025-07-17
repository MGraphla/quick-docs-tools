import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, UploadCloud, Scissors, Download, GaugeCircle, ShieldCheck, FileAudio } from 'lucide-react';

const AudioTrimmerInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/audio-trimmer');
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
        <title>Online Audio Trimmer | Cut & Trim MP3 Files Free</title>
        <meta
          name="description"
          content="Easily trim, cut, and edit your audio files online for free. Supports MP3, WAV, and more. Fast, secure, and no software installation required."
        />
        <meta
          name="keywords"
          content="audio trimmer, mp3 cutter, audio editor, cut audio, trim mp3, online audio tool, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 text-white"
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
              Free Online Audio Trimmer
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-rose-100 opacity-90"
              variants={sectionVariants}
            >
              The simplest way to cut and trim your audio files right in your browser.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-rose-600 hover:bg-rose-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Trim Your Audio Now <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trim Audio in 3 Easy Steps</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Get the perfect audio clip in seconds with our intuitive editor.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: UploadCloud, title: 'Upload Your File', description: 'Select an audio file from your device. We support all major formats.' },
                { icon: Scissors, title: 'Select & Trim', description: 'Use the visual editor to select the part of the audio you want to keep.' },
                { icon: Download, title: 'Download Your Clip', description: 'Instantly download your trimmed audio file in high quality.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-rose-200/50 dark:border-rose-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-rose-500 to-pink-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">Powerful Features for Perfect Edits</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: GaugeCircle, title: 'Millisecond Precision', description: 'Zoom in on the waveform for frame-by-frame accuracy to get the perfect cut.' },
                { icon: FileAudio, title: 'Broad Format Support', description: 'Works with MP3, WAV, M4A, AAC, FLAC, and many other audio formats.' },
                { icon: ShieldCheck, title: 'Client-Side Privacy', description: 'Your files are processed in your browser. Nothing is uploaded to our servers.' },
                { icon: ArrowRight, title: 'Fast & Efficient', description: 'No waiting for uploads or downloads. The trimming process is instant.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-rose-500" />
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
                { q: 'Is the audio trimmer free?', a: 'Yes, our tool is 100% free to use with no hidden costs or limitations on the number of files you can trim.' },
                { q: 'Are my audio files safe?', a: 'Absolutely. All audio processing is done directly in your web browser. Your files are never uploaded to our servers, ensuring your data remains private.' },
                { q: 'What is the maximum file size I can upload?', a: 'Since the processing is done locally, the main limitation is your browser\'s and device\'s memory. Most modern computers can handle very large audio files without any issues.' },
                { q: 'Can I add fade-in or fade-out effects?', a: 'Currently, our tool focuses on providing a simple and fast trimming experience. We are considering adding features like fades in a future update.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-rose-600 dark:hover:text-pink-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Create the Perfect Audio Clip?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-rose-100 opacity-90">Create ringtones, edit podcasts, or shorten audio notes in just a few clicks.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-rose-600 hover:bg-rose-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default AudioTrimmerInfoPage;
