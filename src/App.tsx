import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import MergePdfPage from "./pages/tools/MergePdfPage";
import QrGeneratorPage from "./pages/tools/QrGeneratorPage";
import LinkShortenerPage from "./pages/tools/LinkShortenerPage";
import AudioToTextPage from "./pages/tools/AudioToTextPage";
import LiveTranscriptionPage from "./pages/tools/LiveTranscriptionPage";
import ProtectPdfPage from "./pages/tools/ProtectPdfPage";
import UnlockPdfPage from "./pages/tools/UnlockPdfPage";
import RotatePdfPage from "./pages/tools/RotatePdfPage";
import WatermarkPdfPage from "./pages/tools/WatermarkPdfPage";
import SignPdfPage from "./pages/tools/SignPdfPage";
import JpgToPdfPage from "./pages/tools/JpgToPdfPage";
import EditPdfPage from "./pages/tools/EditPdfPage";
import ExcelToPdfPage from "./pages/tools/ExcelToPdfPage";
import PowerpointToPdfPage from "./pages/tools/PowerpointToPdfPage";
import PdfToWordPage from "./pages/tools/PdfToWordPage";
import CompressPdfPage from "./pages/tools/CompressPdfPage";
import SplitPdfPage from "./pages/tools/SplitPdfPage";
import PdfToJpgPage from "./pages/tools/PdfToJpgPage";
import PdfToPowerpointPage from "./pages/tools/PdfToPowerpointPage";
import PdfToExcelPage from "./pages/tools/PdfToExcelPage";
import WordToPdfPage from "./pages/tools/WordToPdfPage";
import TextEditorPage from "./pages/tools/TextEditorPage";
import ResumeBuilderPage from "./pages/tools/ResumeBuilderPage";
import RedactPdfPage from "./pages/tools/RedactPdfPage";
import AudioTrimmerPage from "./pages/tools/AudioTrimmerPage";
import CalendarGeneratorPage from "./pages/tools/CalendarGeneratorPage";
import InvoiceGeneratorPage from "./pages/tools/InvoiceGeneratorPage";
import MergePdfInfoPage from "./pages/tool-info/MergePdfInfoPage";
import RotatePdfInfoPage from './pages/tool-info/RotatePdfInfoPage';
import ProtectPdfInfoPage from './pages/tool-info/ProtectPdfInfoPage';
import RedactPdfInfoPage from './pages/tool-info/RedactPdfInfoPage';
import AudioToTextInfoPage from './pages/tool-info/AudioToTextInfoPage';
import LiveTranscriptionInfoPage from './pages/tool-info/LiveTranscriptionInfoPage';
import TextEditorInfoPage from './pages/tool-info/TextEditorInfoPage';
import ResumeBuilderInfoPage from './pages/tool-info/ResumeBuilderInfoPage';
import AudioTrimmerInfoPage from './pages/tool-info/AudioTrimmerInfoPage';
import CalendarGeneratorInfoPage from './pages/tool-info/CalendarGeneratorInfoPage';
import InvoiceGeneratorInfoPage from './pages/tool-info/InvoiceGeneratorInfoPage';
import CompressPdfInfoPage from "./pages/tool-info/CompressPdfInfoPage";
import SplitPdfInfoPage from "./pages/tool-info/SplitPdfInfoPage";
import PdfToWordInfoPage from "./pages/tool-info/PdfToWordInfoPage";
import PdfToPowerpointInfoPage from "./pages/tool-info/PdfToPowerpointInfoPage";
import PdfToExcelInfoPage from "./pages/tool-info/PdfToExcelInfoPage";
import QrCodeGeneratorInfoPage from "./pages/tool-info/QrCodeGeneratorInfoPage";
import LinkShortenerInfoPage from "./pages/tool-info/LinkShortenerInfoPage";
import PdfToJpgInfoPage from "./pages/tool-info/PdfToJpgInfoPage";
import WordToPdfInfoPage from "./pages/tool-info/WordToPdfInfoPage";
import PowerpointToPdfInfoPage from "./pages/tool-info/PowerpointToPdfInfoPage";
import ExcelToPdfInfoPage from "./pages/tool-info/ExcelToPdfInfoPage";
import JpgToPdfInfoPage from "./pages/tool-info/JpgToPdfInfoPage";
import WatermarkPdfInfoPage from "./pages/tool-info/WatermarkPdfInfoPage";
import SignPdfInfoPage from "./pages/tool-info/SignPdfInfoPage";
import MainLayout from "@/components/layout/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/merge-pdf" element={<Dashboard><MergePdfPage /></Dashboard>} />
          <Route path="/dashboard/qr-generator" element={<Dashboard><QrGeneratorPage /></Dashboard>} />
          <Route path="/dashboard/link-shortener" element={<Dashboard><LinkShortenerPage /></Dashboard>} />
          <Route path="/dashboard/audio-to-text" element={<Dashboard><AudioToTextPage /></Dashboard>} />
          <Route path="/dashboard/live-transcription" element={<Dashboard><LiveTranscriptionPage /></Dashboard>} />
          <Route path="/dashboard/protect-pdf" element={<Dashboard><ProtectPdfPage /></Dashboard>} />
          <Route path="/dashboard/unlock-pdf" element={<Dashboard><UnlockPdfPage /></Dashboard>} />
          <Route path="/dashboard/rotate-pdf" element={<Dashboard><RotatePdfPage /></Dashboard>} />
          <Route path="/dashboard/watermark-pdf" element={<Dashboard><WatermarkPdfPage /></Dashboard>} />
          <Route path="/dashboard/sign-pdf" element={<Dashboard><SignPdfPage /></Dashboard>} />
          <Route path="/dashboard/jpg-to-pdf" element={<Dashboard><JpgToPdfPage /></Dashboard>} />
          <Route path="/dashboard/edit-pdf" element={<Dashboard><EditPdfPage /></Dashboard>} />
          <Route path="/dashboard/excel-to-pdf" element={<Dashboard><ExcelToPdfPage /></Dashboard>} />
          <Route path="/dashboard/powerpoint-to-pdf" element={<Dashboard><PowerpointToPdfPage /></Dashboard>} />
          <Route path="/dashboard/pdf-to-word" element={<Dashboard><PdfToWordPage /></Dashboard>} />
          <Route path="/dashboard/compress-pdf" element={<Dashboard><CompressPdfPage /></Dashboard>} />
          <Route path="/dashboard/split-pdf" element={<Dashboard><SplitPdfPage /></Dashboard>} />
          <Route path="/dashboard/pdf-to-jpg" element={<Dashboard><PdfToJpgPage /></Dashboard>} />
          <Route path="/dashboard/pdf-to-powerpoint" element={<Dashboard><PdfToPowerpointPage /></Dashboard>} />
          <Route path="/dashboard/pdf-to-excel" element={<Dashboard><PdfToExcelPage /></Dashboard>} />
          <Route path="/dashboard/word-to-pdf" element={<Dashboard><WordToPdfPage /></Dashboard>} />
          <Route path="/dashboard/text-editor" element={<Dashboard><TextEditorPage /></Dashboard>} />
          <Route path="/dashboard/resume-builder" element={<Dashboard><ResumeBuilderPage /></Dashboard>} />
          <Route path="/dashboard/redact-pdf" element={<Dashboard><RedactPdfPage /></Dashboard>} />
          <Route path="/dashboard/audio-trimmer" element={<Dashboard><AudioTrimmerPage /></Dashboard>} />
          <Route path="/dashboard/calendar-generator" element={<Dashboard><CalendarGeneratorPage /></Dashboard>} />
          <Route path="/dashboard/invoice-generator" element={<Dashboard><InvoiceGeneratorPage /></Dashboard>} />
          {/* Tool Info Pages */}
          <Route element={<MainLayout />}>
            <Route path="/info/merge-pdf" element={<MergePdfInfoPage />} />
            <Route path="/info/rotate-pdf" element={<RotatePdfInfoPage />} />
            <Route path="/info/protect-pdf" element={<ProtectPdfInfoPage />} />
            <Route path="/info/redact-pdf" element={<RedactPdfInfoPage />} />
            <Route path="/info/audio-to-text" element={<AudioToTextInfoPage />} />
            <Route path="/info/live-transcription" element={<LiveTranscriptionInfoPage />} />
            <Route path="/info/text-editor" element={<TextEditorInfoPage />} />
            <Route path="/info/resume-builder" element={<ResumeBuilderInfoPage />} />
            <Route path="/info/audio-trimmer" element={<AudioTrimmerInfoPage />} />
            <Route path="/info/calendar-generator" element={<CalendarGeneratorInfoPage />} />
            <Route path="/info/invoice-generator" element={<InvoiceGeneratorInfoPage />} />
            <Route path="/info/compress-pdf" element={<CompressPdfInfoPage />} />
            <Route path="/info/split-pdf" element={<SplitPdfInfoPage />} />
            <Route path="/info/pdf-to-word" element={<PdfToWordInfoPage />} />
            <Route path="/info/pdf-to-powerpoint" element={<PdfToPowerpointInfoPage />} />
            <Route path="/info/powerpoint-to-pdf" element={<PowerpointToPdfInfoPage />} />
            <Route path="/info/pdf-to-excel" element={<PdfToExcelInfoPage />} />
            <Route path="/info/qr-code-generator" element={<QrCodeGeneratorInfoPage />} />
                        <Route path="/info/link-shortener" element={<LinkShortenerInfoPage />} />
            <Route path="/info/pdf-to-jpg" element={<PdfToJpgInfoPage />} />
                        <Route path="/info/word-to-pdf" element={<WordToPdfInfoPage />} />
                        <Route path="/info/excel-to-pdf" element={<ExcelToPdfInfoPage />} />
            <Route path="/info/jpg-to-pdf" element={<JpgToPdfInfoPage />} />
            <Route path="/info/watermark-pdf" element={<WatermarkPdfInfoPage />} />
            <Route path="/info/sign-pdf" element={<SignPdfInfoPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;