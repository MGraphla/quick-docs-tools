import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, CheckCircle, HelpCircle } from "lucide-react";

const CompressPdfInfoPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="container mx-auto px-4 md:px-6 py-12">
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">
            Compress PDF Files Online
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-400">
            Reduce the file size of your PDFs for easy sharing and storage, without compromising quality. Our tool is fast, free, and secure.
          </p>
          <a
            href="/tools/compress-pdf"
            className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
          >
            Go to Compressor <ArrowRight className="inline-block ml-2" />
          </a>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-10">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="text-blue-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Upload Your PDF</h3>
              <p className="text-gray-600 dark:text-gray-400">Drag and drop your file or select it from your device.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="text-blue-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Choose Compression Level</h3>
              <p className="text-gray-600 dark:text-gray-400">Select from presets to balance size and quality.</p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <div className="text-blue-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Download Your File</h3>
              <p className="text-gray-600 dark:text-gray-400">Your compressed PDF will be ready in seconds.</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <Card className="bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Why Compress PDFs?</CardTitle>
              <CardDescription>Discover the advantages of reducing your PDF file sizes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Faster Sharing</h4>
                  <p className="text-gray-600 dark:text-gray-400">Smaller files are quicker to email and upload.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Save Storage Space</h4>
                  <p className="text-gray-600 dark:text-gray-400">Keep your hard drive or cloud storage tidy.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-semibold">Improved Accessibility</h4>
                  <p className="text-gray-600 dark:text-gray-400">Smaller files are easier to open on mobile devices.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            <details className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer">
              <summary className="font-semibold flex items-center justify-between">
                Is the compression process secure?
                <HelpCircle className="h-5 w-5 text-gray-500" />
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yes, your files are uploaded over a secure connection and deleted from our servers after one hour.</p>
            </details>
            <details className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer">
              <summary className="font-semibold flex items-center justify-between">
                Will compressing a PDF reduce its quality?
                <HelpCircle className="h-5 w-5 text-gray-500" />
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Our tool aims to find the best balance between file size and quality. You can choose from different compression levels to suit your needs.</p>
            </details>
             <details className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md cursor-pointer">
              <summary className="font-semibold flex items-center justify-between">
                Is this service free to use?
                <HelpCircle className="h-5 w-5 text-gray-500" />
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yes, our basic PDF compression tool is completely free. For advanced features, you can check out our pro version.</p>
            </details>
          </div>
        </section>
      </main>
    </div>
  );
};

export default CompressPdfInfoPage;
