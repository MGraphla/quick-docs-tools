
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
import RotatePdfPage from "./pages/tools/RotatePdfPage";
import WatermarkPdfPage from "./pages/tools/WatermarkPdfPage";
import SignPdfPage from "./pages/tools/SignPdfPage";
import JpgToPdfPage from "./pages/tools/JpgToPdfPage";
import EditPdfPage from "./pages/tools/EditPdfPage";
import ExcelToPdfPage from "./pages/tools/ExcelToPdfPage";

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
          <Route path="/dashboard/rotate-pdf" element={<Dashboard><RotatePdfPage /></Dashboard>} />
          <Route path="/dashboard/watermark-pdf" element={<Dashboard><WatermarkPdfPage /></Dashboard>} />
          <Route path="/dashboard/sign-pdf" element={<Dashboard><SignPdfPage /></Dashboard>} />
          <Route path="/dashboard/jpg-to-pdf" element={<Dashboard><JpgToPdfPage /></Dashboard>} />
          <Route path="/dashboard/edit-pdf" element={<Dashboard><EditPdfPage /></Dashboard>} />
          <Route path="/dashboard/excel-to-pdf" element={<Dashboard><ExcelToPdfPage /></Dashboard>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
