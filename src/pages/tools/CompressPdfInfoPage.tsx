import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  ArrowRight,
  CheckCircle,
  Star,
  Shield,
  Zap,
  ChevronRight,
  Play,
  Minimize2,
  Download,
  Settings
} from "lucide-react";

const CompressPdfInfoPage = () => {
  const features = [
    {
      icon: Minimize2,
      title: "Smart Compression",
      description: "Advanced algorithms reduce file size while preserving document quality"
    },
    {
      icon: Settings,
      title: "Quality Control",
      description: "Choose compression levels from light to maximum based on your needs"
    },
    {
      icon: Shield,
      title: "Content Preserved",
      description: "Keep all text, images, and formatting intact during compression"
    },
    {
      icon: Zap,
      title: "Instant Processing",
      description: "Compress large PDFs in seconds with our optimized engine"
    }
  ];

  const steps = [
    {
      step: 1,
      title: "Upload PDF File",
      description: "Select the PDF document you want to compress"
    },
    {
      step: 2,
      title: "Choose Compression",
      description: "Select compression level: Light, Medium, or Maximum"
    },
    {
      step: 3,
      title: "Preview Results",
      description: "See the size reduction preview before processing"
    },
    {
      step: 4,
      title: "Download Compressed",
      description: "Get your optimized PDF file instantly"
    }
  ];

  const compressionLevels = [
    {
      level: "Light",
      reduction: "10-30%",
      description: "Minimal compression, best quality",
      useCase: "Professional documents, presentations"
    },
    {
      level: "Medium", 
      reduction: "30-50%",
      description: "Balanced compression and quality",
      useCase: "General documents, email attachments"
    },
    {
      level: "Maximum",
      reduction: "50-80%",
      description: "Highest compression for smallest files",
      useCase: "Web uploads, storage optimization"
    }
  ];

  const benefits = [
    "Faster email sending and receiving",
    "Reduced cloud storage costs",
    "Improved website loading speeds", 
    "Better mobile device performance",
    "Compliance with file size limits"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QuickDocs
              </span>
            </Link>
            <Link to="/dashboard/compress-pdf">
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Play className="h-4 w-4 mr-2" />
                Use Tool Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6 bg-purple-100 text-purple-800 px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            Most Powerful Tool
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Compress PDF Files
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"> Intelligently</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Reduce PDF file sizes up to 80% while maintaining professional quality. 
            Perfect for email attachments, web uploads, and storage optimization.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/dashboard/compress-pdf">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-lg">
                <Minimize2 className="h-5 w-5 mr-2" />
                Start Compressing PDFs
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
              <Play className="h-5 w-5 mr-2" />
              See Examples
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">2M+</div>
              <div className="text-gray-600">PDFs Compressed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">80%</div>
              <div className="text-gray-600">Max Size Reduction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600">Quality Maintained</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">Unlimited</div>
              <div className="text-gray-600">File Size</div>
            </div>
          </div>
        </div>
      </section>

      {/* Compression Levels Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Compression Level
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Different compression options for different use cases
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {compressionLevels.map((level, index) => (
              <Card key={index} className="border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <Minimize2 className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">{level.level}</CardTitle>
                  <div className="text-3xl font-bold text-purple-600">{level.reduction}</div>
                  <CardDescription>{level.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-center">
                    <strong>Best for:</strong> {level.useCase}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Advanced Compression Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              State-of-the-art algorithms for optimal file size reduction
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 bg-purple-100 rounded-xl w-fit mb-4">
                    <feature.icon className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Compress PDFs in 4 Steps
            </h2>
            <p className="text-xl text-gray-600">
              Reduce your PDF file sizes in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < steps.length - 1 && (
                  <ChevronRight className="hidden lg:block h-6 w-6 text-gray-400 mx-auto mt-4" />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/dashboard/compress-pdf">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Try Compression Now - Free!
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Compress Your PDFs?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-purple-500 mr-3" />
                    <span className="text-lg text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">File Size Examples:</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span>Original: 50MB</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-purple-600 font-semibold">Compressed: 15MB</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span>Original: 20MB</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-purple-600 font-semibold">Compressed: 6MB</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <span>Original: 5MB</span>
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                  <span className="text-purple-600 font-semibold">Compressed: 1.5MB</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Compress Your PDFs?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Reduce file sizes without compromising quality
          </p>
          <Link to="/dashboard/compress-pdf">
            <Button size="lg" variant="secondary" className="px-8 py-4 text-lg">
              <Minimize2 className="h-5 w-5 mr-2" />
              Start Compressing Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">QuickDocs</span>
            </Link>
            <p className="text-gray-400 mb-6">
              Professional PDF tools that work entirely in your browser
            </p>
            <div className="flex justify-center space-x-6">
              <Link to="/tools" className="text-gray-400 hover:text-white">All Tools</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
              <Link to="/terms" className="text-gray-400 hover:text-white">Terms</Link>
              <Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CompressPdfInfoPage;