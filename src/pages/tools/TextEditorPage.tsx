import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

const TextEditorPage = () => {
  const [message, setMessage] = useState("");

  const handleExportPdf = () => {
    if (!message.trim()) {
      toast.error("Please enter a message to export.");
      return;
    }

    try {
      const doc = new jsPDF();
      
      doc.setFontSize(12);

      const textLines = doc.splitTextToSize(message, 180); 
      doc.text(textLines, 15, 20);
      
      doc.save("message.pdf");
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("An error occurred while exporting the PDF.");
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <FileText className="h-6 w-6 text-gray-700" />
            Simple Text to PDF
          </CardTitle>
          <CardDescription className="mt-1">
            Type your message or note below and export it as a clean PDF.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-64 p-4 border rounded-md resize-y min-h-[200px] focus:ring-2 focus:ring-blue-500"
          />
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button 
            onClick={handleExportPdf} 
            className="w-full sm:w-auto ml-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TextEditorPage;