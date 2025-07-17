import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, ChevronDown, Zap, Twitter, Linkedin, Github } from 'lucide-react';
import AuthModal from '@/components/auth/AuthModal';

export type OutletContextType = {
  openAuthModal: (mode: 'signin' | 'signup') => void;
  authModalOpen: boolean;
  setAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  authMode: 'signin' | 'signup';
  setAuthMode: React.Dispatch<React.SetStateAction<'signin' | 'signup'>>;
};

const MainLayout = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toolsInfoOpen, setToolsInfoOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300 cursor-pointer">
              <div className="relative">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  QuickDocs
                </span>
                <p className="text-xs text-gray-500 font-medium">Professional Tools</p>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700">
                Home
              </Link>
              <div className="relative">
                <button 
                  onClick={() => setToolsInfoOpen(!toolsInfoOpen)}
                  onBlur={() => setTimeout(() => setToolsInfoOpen(false), 150)}
                  className="flex items-center text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700"
                >
                  Tools Info
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${toolsInfoOpen ? 'rotate-180' : ''}`} />
                </button>
                {toolsInfoOpen && (
                  <div className="absolute top-full mt-2 w-64 bg-white rounded-md shadow-lg z-50 border max-h-96 overflow-y-auto">
                    {/* PDF Tools Section */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
                      PDF Tools
                    </div>
                    <Link to="/info/merge-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Merge PDF Info
                    </Link>
                    <Link to="/info/split-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Split PDF Info
                    </Link>
                    <Link to="/info/compress-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Compress PDF Info
                    </Link>
                    <Link to="/info/pdf-to-word" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      PDF to Word Info
                    </Link>
                    <Link to="/info/pdf-to-powerpoint" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      PDF to PowerPoint Info
                    </Link>
                    <Link to="/info/pdf-to-excel" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      PDF to Excel Info
                    </Link>
                    <Link to="/info/pdf-to-jpg" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      PDF to JPG Info
                    </Link>
                    <Link to="/info/word-to-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Word to PDF Info
                    </Link>
                    <Link to="/info/powerpoint-to-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      PowerPoint to PDF Info
                    </Link>
                    <Link to="/info/excel-to-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Excel to PDF Info
                    </Link>
                    <Link to="/info/jpg-to-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      JPG to PDF Info
                    </Link>
                    <Link to="/info/sign-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Sign PDF Info
                    </Link>
                    <Link to="/info/watermark-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Watermark PDF Info
                    </Link>
                    <Link to="/info/rotate-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Rotate PDF Info
                    </Link>
                    <Link to="/info/protect-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Protect PDF Info
                    </Link>
                    <Link to="/info/redact-pdf" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Redact PDF Info
                    </Link>
                    
                    {/* Productivity Tools Section */}
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b">
                      Productivity Tools
                    </div>
                    <Link to="/info/qr-code-generator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      QR Code Generator Info
                    </Link>
                    <Link to="/info/link-shortener" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Link Shortener Info
                    </Link>
                    <Link to="/info/audio-to-text" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Audio to Text Info
                    </Link>
                    <Link to="/info/live-transcription" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Live Transcription Info
                    </Link>
                    <Link to="/info/text-editor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Text Editor Info
                    </Link>
                    <Link to="/info/resume-builder" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Resume Builder Info
                    </Link>
                    <Link to="/info/audio-trimmer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Audio Trimmer Info
                    </Link>
                    <Link to="/info/calendar-generator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-100">
                      Calendar Generator Info
                    </Link>
                    <Link to="/info/invoice-generator" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Invoice Generator Info
                    </Link>
                  </div>
                )}
              </div>
              <a href="#" className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700">
                About
              </a>
              <a href="#" className="text-sm font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 text-gray-700">
                Contact
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => openAuthModal('signin')}
                className="hover:scale-105 transition-all duration-300 hover:bg-blue-50 text-gray-700 hover:text-blue-600 font-medium"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => openAuthModal('signup')}
                className="hover:scale-105 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl font-medium"
              >
                Get Started
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet context={{ openAuthModal, authModalOpen, setAuthModalOpen, authMode, setAuthMode }} />
      </main>

      <footer className="bg-gray-50 border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-lg mb-2">QuickDocs</h4>
              <p className="text-sm text-gray-600">Your all-in-one solution for document productivity.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-blue-600"><Twitter /></a>
                <a href="#" className="text-gray-500 hover:text-blue-600"><Linkedin /></a>
                <a href="#" className="text-gray-500 hover:text-blue-600"><Github /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">Powered by</h4>
              <Zap className="h-6 w-6 text-yellow-500"/>
            </div>
          </div>
          <div className="text-center text-sm text-gray-500 mt-8 border-t pt-4">
            &copy; {new Date().getFullYear()} QuickDocs. All rights reserved. Built in Cameroon 🇨🇲.
          </div>
        </div>
      </footer>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        mode={authMode}
        onModeChange={setAuthMode} 
      />
    </div>
  );
};

export default MainLayout;
