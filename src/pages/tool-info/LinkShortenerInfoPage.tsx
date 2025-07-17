import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, ClipboardPaste, Settings2, Share2, Award, BarChartBig, FolderKanban, ShieldCheck } from 'lucide-react';

const LinkShortenerInfoPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard/link-shortener');
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
        <title>Link Shortener | Create Short, Branded URLs for Free</title>
        <meta
          name="description"
          content="Shorten long URLs into memorable, branded links. Track click analytics, manage your links, and use custom domains with our free link shortener tool."
        />
        <meta
          name="keywords"
          content="link shortener, url shortener, custom url, branded links, free url shortener, quickdocs"
        />
      </Helmet>

      <div className="w-full text-gray-900 bg-white dark:bg-gray-900 dark:text-white">
        {/* Hero Section */}
        <motion.section
          className="relative text-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white"
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
              Shorten. Brand. Track.
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-purple-100 opacity-90"
              variants={sectionVariants}
            >
              Create powerful, short links that boost your brand and provide deep analytics.
            </motion.p>
            <motion.div variants={sectionVariants}>
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-white text-purple-600 hover:bg-purple-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
              >
                Shorten Your First Link <ArrowRight className="ml-2 h-5 w-5" />
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">It's as Easy as 1-2-3</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
              Transform long, unwieldy URLs into short, powerful links in just a few clicks.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: ClipboardPaste, title: 'Paste Long URL', description: 'Simply copy your long link and paste it into our shortener.' },
                { icon: Settings2, title: 'Customize Your Link', description: 'Create a custom alias or use your own domain for a branded look.' },
                { icon: Share2, title: 'Share & Track', description: 'Share your new link and monitor its performance with our analytics.' },
              ].map((step, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-2 border-purple-200/50 dark:border-purple-500/30 shadow-lg hover:shadow-2xl transition-shadow duration-300 rounded-2xl h-full">
                    <CardHeader>
                      <div className="mx-auto bg-gradient-to-br from-purple-600 to-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
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
            <h2 className="text-3xl md:text-4xl font-bold mb-12">More Than Just a Short Link</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Award, title: 'Custom Branding', description: 'Boost brand recognition with links that feature your custom domain name.' },
                { icon: BarChartBig, title: 'Detailed Analytics', description: 'Gain insights with data on clicks, geographic location, and referrers.' },
                { icon: FolderKanban, title: 'Link Management', description: 'Organize your links in one place with our easy-to-use dashboard.' },
                { icon: ShieldCheck, title: 'Secure & Reliable', description: 'All links are protected with HTTPS encryption and our reliable infrastructure.' },
              ].map((benefit, index) => (
                <motion.div key={index} variants={cardVariants}>
                  <div className="p-6">
                    <benefit.icon className="h-12 w-12 mx-auto mb-4 text-purple-600" />
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
                { q: 'Can I edit the destination of a short link after creating it?', a: 'Yes! All our short links are dynamic, meaning you can change the destination URL anytime without having to create a new short link.' },
                { q: 'How do custom domains work?', a: 'You can connect your own domain name to use for your short links. Instead of a generic short URL, your links will reflect your brand (e.g., yourbrand.co/promo).' },
                { q: 'What kind of analytics do you provide?', a: 'We provide real-time analytics, including the total number of clicks, click-through rates over time, geographic data of your audience, and the top referral sources.' },
                { q: 'Are the links permanent? Do they expire?', a: 'By default, links do not expire. However, you have the option to set an expiration date and time, which is perfect for time-sensitive promotions.' },
                { q: 'Is there a limit to how many links I can create?', a: 'Our free plan allows for a generous number of links per month. For unlimited links and advanced features, you can upgrade to one of our premium plans.' },
              ].map((faq, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`}>
                  <AccordionTrigger className="text-lg font-semibold hover:text-purple-600 dark:hover:text-indigo-400 text-left">{faq.q}</AccordionTrigger>
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
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Elevate Your Links?</h2>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-purple-100 opacity-90">Join thousands of users who trust QuickDocs to power their links. Get started in seconds.</p>
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-purple-600 hover:bg-purple-100 font-bold text-lg px-8 py-6 rounded-full shadow-2xl transition-transform transform hover:scale-105"
            >
              Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.section>
      </div>
    </>
  );
};

export default LinkShortenerInfoPage;
