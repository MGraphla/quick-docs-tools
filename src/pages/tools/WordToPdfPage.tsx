import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { createPdfProcessor, formatFileSize } from '@/lib/pdfUtils';
import { UploadCloud, File as FileIcon, X, Download, RefreshCw, FileCheck2, Loader2 } from 'lucide-react';

const WordToPdfPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const pdfProcessor = useMemo(() => createPdfProcessor(), []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isConverting) return;
    const docxFile = acceptedFiles.find(
      (f) => f.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    if (docxFile) {
      handleReset();
      setFile(docxFile);
      toast.success(`File "${docxFile.name}" loaded.`);
    } else {
      toast.error('Invalid file type. Please upload a .docx file.');
    }
  }, [isConverting]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    multiple: false,
    disabled: isConverting,
  });

  const handleProgressUpdate = (prog: number, msg: string) => {
    setProgress(prog);
    setProgressMessage(msg);
  };

  const handleConvert = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }

    setIsConverting(true);
    setProgress(0);
    setProgressMessage('Starting conversion...');
    toast.info('Conversion process has started.');

    try {
      const pdfBlob = await pdfProcessor.convertWordToPdf(file, handleProgressUpdate);
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      toast.success('File converted successfully!');
    } catch (error) {
      console.error('Conversion failed:', error);
      toast.error('An error occurred during conversion. Please try again.');
      setProgress(0);
      setProgressMessage('');
    } finally {
      setIsConverting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setIsConverting(false);
    setProgress(0);
    setProgressMessage('');
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  const renderInitialState = () => (
    <div {...getRootProps()} 
      className={`relative group w-full h-80 flex flex-col justify-center items-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer transition-all duration-300 ease-in-out 
      ${isDragActive ? 'border-solid border-primary-500 bg-primary-500/10 shadow-lg' : 'hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
      <div className={`absolute inset-0 rounded-2xl ring-4 ring-primary-500/30 ring-offset-4 ring-offset-background scale-95 opacity-0 transition-all duration-300 ${isDragActive ? 'scale-100 opacity-100' : ''}`}></div>
      <input {...getInputProps()} />
      <div className="text-center z-10 p-6">
        <UploadCloud className={`mx-auto h-20 w-20 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isDragActive ? 'scale-110 -translate-y-2' : 'group-hover:scale-105'}`} />
        <p className="mt-6 text-2xl font-semibold text-gray-700 dark:text-gray-300">Drop your .docx file here</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">or click to browse</p>
      </div>
    </div>
  );

  const renderFileSelectedState = () => (
    <Card className="shadow-lg border-2 border-primary/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl text-gray-800 dark:text-gray-200">
          <FileCheck2 className="h-8 w-8 text-green-500" />
          File Ready for Conversion
        </CardTitle>
        <CardDescription>Your document is prepared and ready to be transformed into a PDF.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="p-4 border border-dashed rounded-lg flex items-center justify-between bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4 overflow-hidden">
            <FileIcon className="h-10 w-10 text-primary flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="font-medium truncate text-gray-800 dark:text-gray-200">{file?.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file?.size ?? 0)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleReset} className="flex-shrink-0 ml-4">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <Button onClick={handleConvert} disabled={isConverting} size="lg" className="w-full mt-6 text-lg font-bold group">
          Convert to PDF
          <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
        </Button>
      </CardContent>
    </Card>
  );

  const renderConversionState = () => (
    <Card className="shadow-lg border-2 border-primary/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl text-gray-800 dark:text-gray-200">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          Conversion in Progress
        </CardTitle>
        <CardDescription>Please wait while we work our magic on your document.</CardDescription>
      </CardHeader>
      <CardContent className="text-center py-8">
        <Progress value={progress} className="w-full h-3 mb-4" />
        <p className="text-lg text-muted-foreground font-medium">{progressMessage} ({progress}%)</p>
      </CardContent>
    </Card>
  );

  const renderResultState = () => (
    <Card className="shadow-lg border-2 border-green-500/30 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-800 dark:text-gray-200">Conversion Complete!</CardTitle>
        <CardDescription>Your PDF is ready. You can preview it below or download it.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden mb-6 shadow-inner bg-gray-100 dark:bg-gray-900">
          <iframe src={pdfUrl ?? ''} className="w-full h-[600px]" title="PDF Preview" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <a href={pdfUrl ?? '#'} download={`${file?.name.replace(/\.docx$/, '')}.pdf`} className="flex-1">
            <Button size="lg" className="w-full font-bold">
              <Download className="mr-2 h-5 w-5" />
              Download PDF
            </Button>
          </a>
          <Button variant="outline" size="lg" onClick={handleReset} className="flex-1 font-bold">
            <RefreshCw className="mr-2 h-5 w-5" />
            Convert Another File
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary-400/30 opacity-20 blur-[100px]"></div>
      </div>
      <div className="container mx-auto max-w-4xl">
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 pb-2">
            Word to PDF Converter
          </h1>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">High-fidelity conversion that preserves your document's formatting, now with a fresh new look.</p>
        </header>

        <div className="mx-auto transition-all duration-500">
          {isConverting
            ? renderConversionState()
            : pdfUrl
            ? renderResultState()
            : file
            ? renderFileSelectedState()
            : renderInitialState()}
        </div>
      </div>
    </div>
  );
};

export default WordToPdfPage;