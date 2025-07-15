import { useState } from "react";
import { Receipt, Download, Plus, Trash2, CheckCircle, AlertCircle, Settings, Save, Upload, Mail, DollarSign, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  taxRate: number;
  businessInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    taxId: string;
  };
  clientInfo: {
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  items: InvoiceItem[];
  notes: string;
  paymentTerms: string;
  logo: string | null;
}

const InvoiceGeneratorPage = () => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({
    invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
    taxRate: 0,
    businessInfo: {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      taxId: ""
    },
    clientInfo: {
      name: "",
      address: "",
      email: "",
      phone: ""
    },
    items: [],
    notes: "",
    paymentTerms: "Payment due within 30 days",
    logo: null
  });
  
  const [template, setTemplate] = useState("modern");
  const [accentColor, setAccentColor] = useState("#4f46e5");
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleBusinessInfoChange = (field: string, value: string) => {
    setInvoiceData({
      ...invoiceData,
      businessInfo: {
        ...invoiceData.businessInfo,
        [field]: value
      }
    });
  };

  const handleClientInfoChange = (field: string, value: string) => {
    setInvoiceData({
      ...invoiceData,
      clientInfo: {
        ...invoiceData.clientInfo,
        [field]: value
      }
    });
  };

  const handleInvoiceChange = (field: string, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      [field]: value
    });
  };

  const addItem = () => {
    setInvoiceData({
      ...invoiceData,
      items: [
        ...invoiceData.items,
        {
          id: generateId(),
          description: "",
          quantity: 1,
          price: 0,
          tax: invoiceData.taxRate
        }
      ]
    });
  };

  const updateItem = (id: string, field: string, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeItem = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter(item => item.id !== id)
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setInvoiceData({
          ...invoiceData,
          logo: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTaxTotal = () => {
    return invoiceData.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.price;
      return sum + (itemTotal * (item.tax / 100));
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxTotal();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoiceData.currency
    }).format(amount);
  };

  const generateInvoicePdf = async () => {
    if (!invoiceData.businessInfo.name || !invoiceData.clientInfo.name) {
      toast.error("Please enter at least business and client names");
      return;
    }

    if (invoiceData.items.length === 0) {
      toast.error("Please add at least one item to the invoice");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Define colors
      const primaryColor = accentColor;
      const textColor = '#333333';
      const lightColor = '#777777';
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      if (template === 'modern') {
        // Modern template
        
        // Header with business info and logo
        if (invoiceData.logo) {
          doc.addImage(invoiceData.logo, 'JPEG', margin, margin, 40, 20, undefined, 'FAST');
        }
        
        // Business info
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        let businessInfoY = margin + 10;
        
        if (invoiceData.logo) {
          // If logo exists, place business info to the right
          const businessInfoX = margin + 50;
          
          doc.setFontSize(14);
          doc.setTextColor(primaryColor);
          doc.text(invoiceData.businessInfo.name, businessInfoX, businessInfoY);
          businessInfoY += 6;
          
          doc.setFontSize(9);
          doc.setTextColor(textColor);
          if (invoiceData.businessInfo.address) {
            const addressLines = doc.splitTextToSize(invoiceData.businessInfo.address, 80);
            doc.text(addressLines, businessInfoX, businessInfoY);
            businessInfoY += (addressLines.length * 4);
          }

          if (invoiceData.businessInfo.phone) {
            doc.text(`Phone: ${invoiceData.businessInfo.phone}`, businessInfoX, businessInfoY);
            businessInfoY += 5;
          }
          if (invoiceData.businessInfo.email) {
            doc.text(`Email: ${invoiceData.businessInfo.email}`, businessInfoX, businessInfoY);
            businessInfoY += 5;
          }
          if (invoiceData.businessInfo.website) {
            doc.text(`Website: ${invoiceData.businessInfo.website}`, businessInfoX, businessInfoY);
            businessInfoY += 5;
          }
          if (invoiceData.businessInfo.taxId) {
            doc.text(`Tax ID: ${invoiceData.businessInfo.taxId}`, businessInfoX, businessInfoY);
            businessInfoY += 5;
          }
        } else {
          // No logo, center business info
          doc.setFontSize(16);
          doc.setTextColor(primaryColor);
          doc.text(invoiceData.businessInfo.name, pageWidth / 2, businessInfoY, { align: 'center' });
          businessInfoY += 7;
          
          doc.setFontSize(9);
          doc.setTextColor(textColor);
          if (invoiceData.businessInfo.address) {
            const addressLines = doc.splitTextToSize(invoiceData.businessInfo.address, 80);
            doc.text(addressLines, pageWidth / 2, businessInfoY, { align: 'center' });
            businessInfoY += (addressLines.length * 4);
          }

          if (invoiceData.businessInfo.phone) {
            doc.text(`Phone: ${invoiceData.businessInfo.phone}`, pageWidth / 2, businessInfoY, { align: 'center' });
            businessInfoY += 5;
          }
          if (invoiceData.businessInfo.email) {
            doc.text(`Email: ${invoiceData.businessInfo.email}`, pageWidth / 2, businessInfoY, { align: 'center' });
            businessInfoY += 5;
          }
          if (invoiceData.businessInfo.website) {
            doc.text(`Website: ${invoiceData.businessInfo.website}`, pageWidth / 2, businessInfoY, { align: 'center' });
            businessInfoY += 5;
          }
          if (invoiceData.businessInfo.taxId) {
            doc.text(`Tax ID: ${invoiceData.businessInfo.taxId}`, pageWidth / 2, businessInfoY, { align: 'center' });
            businessInfoY += 5;
          }
        }
        
        // Invoice title and details
        const invoiceHeaderY = margin + 50;
        
        doc.setFillColor(hexToRgb(primaryColor).r, hexToRgb(primaryColor).g, hexToRgb(primaryColor).b);
        doc.rect(margin, invoiceHeaderY, pageWidth - (margin * 2), 12, 'F');
        
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.text('INVOICE', pageWidth / 2, invoiceHeaderY + 8, { align: 'center' });
        
        // Invoice details
        let detailsY = invoiceHeaderY + 20;
        
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        
        doc.text('Invoice Number:', margin, detailsY);
        doc.text(invoiceData.invoiceNumber, margin + 35, detailsY);
        detailsY += 7;
        
        doc.text('Date:', margin, detailsY);
        doc.text(formatDate(invoiceData.invoiceDate), margin + 35, detailsY);
        detailsY += 7;
        
        doc.text('Due Date:', margin, detailsY);
        doc.text(formatDate(invoiceData.dueDate), margin + 35, detailsY);
        
        // Client info
        const clientY = detailsY;
        const clientX = pageWidth / 2 + 10;
        
        doc.setFontSize(11);
        doc.setTextColor(primaryColor);
        doc.text('Bill To:', clientX, clientY);
        
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(invoiceData.clientInfo.name, clientX, clientY + 7);
        
        if (invoiceData.clientInfo.address) {
          const addressLines = doc.splitTextToSize(invoiceData.clientInfo.address, pageWidth / 3);
          doc.text(addressLines, clientX, clientY + 14);
        }
        
        let clientContactY = clientY + 14 + (invoiceData.clientInfo.address ? 10 : 0);
        
        if (invoiceData.clientInfo.email) {
          doc.text(`Email: ${invoiceData.clientInfo.email}`, clientX, clientContactY);
          clientContactY += 5;
        }
        
        if (invoiceData.clientInfo.phone) {
          doc.text(`Phone: ${invoiceData.clientInfo.phone}`, clientX, clientContactY);
        }
        
        // Items table
        const tableY = detailsY + 35;
        
        // Table header
        doc.setFillColor(hexToRgb(primaryColor).r, hexToRgb(primaryColor).g, hexToRgb(primaryColor).b, 0.1);
        doc.setDrawColor(hexToRgb(primaryColor).r, hexToRgb(primaryColor).g, hexToRgb(primaryColor).b);
        
        // Use jspdf-autotable for the items
        (doc as any).autoTable({
          startY: tableY,
          head: [['Description', 'Quantity', 'Unit Price', 'Tax', 'Amount']],
          body: invoiceData.items.map(item => [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.price),
            `${item.tax}%`,
            formatCurrency(item.quantity * item.price)
          ]),
          foot: [
            ['', '', '', 'Subtotal:', formatCurrency(calculateSubtotal())],
            ['', '', '', 'Tax:', formatCurrency(calculateTaxTotal())],
            ['', '', '', 'Total:', formatCurrency(calculateTotal())]
          ],
          theme: 'striped',
          headStyles: {
            fillColor: hexToRgb(primaryColor),
            textColor: [255, 255, 255],
            fontStyle: 'bold'
          },
          footStyles: {
            fillColor: [245, 245, 245],
            fontStyle: 'bold'
          },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 20, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
          }
        });
        
        // Get the final Y position after the table
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Notes and payment terms
        if (invoiceData.notes) {
          doc.setFontSize(10);
          doc.text('Notes:', margin, finalY);
          
          const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - (margin * 2));
          doc.text(notesLines, margin, finalY + 5);
        }
        
        // Payment terms
        const termsY = finalY + (invoiceData.notes ? 20 : 0);
        
        doc.setFontSize(10);
        doc.setTextColor(primaryColor);
        doc.text('Payment Terms:', margin, termsY);
        
        doc.setTextColor(textColor);
        doc.text(invoiceData.paymentTerms, margin + 30, termsY);
        
        // Footer
        const footerY = pageHeight - margin;
        
        doc.setFontSize(8);
        doc.setTextColor(lightColor);
        doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
        
      } else if (template === 'classic') {
        // Classic template
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(textColor);
        doc.text('INVOICE', pageWidth / 2, margin + 10, { align: 'center' });
        
        // Business info
        let businessInfoY = margin + 25;
        
        if (invoiceData.logo) {
          doc.addImage(invoiceData.logo, 'JPEG', margin, businessInfoY, 40, 20, undefined, 'FAST');
          businessInfoY += 25;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(textColor);
        doc.text(invoiceData.businessInfo.name, margin, businessInfoY);
        businessInfoY += 6;
        if (invoiceData.businessInfo.address) {
            const addressLines = doc.splitTextToSize(invoiceData.businessInfo.address, 80);
            doc.text(addressLines, margin, businessInfoY);
            businessInfoY += (addressLines.length * 4);
        }
        if (invoiceData.businessInfo.phone) {
            doc.text(`Phone: ${invoiceData.businessInfo.phone}`, margin, businessInfoY);
            businessInfoY += 5;
        }
        if (invoiceData.businessInfo.email) {
            doc.text(`Email: ${invoiceData.businessInfo.email}`, margin, businessInfoY);
            businessInfoY += 5;
        }
        if (invoiceData.businessInfo.website) {
            doc.text(`Website: ${invoiceData.businessInfo.website}`, margin, businessInfoY);
            businessInfoY += 5;
        }
        if (invoiceData.businessInfo.taxId) {
            doc.text(`Tax ID: ${invoiceData.businessInfo.taxId}`, margin, businessInfoY);
            businessInfoY += 5;
        }
        
        // Invoice details
        const detailsX = pageWidth - margin - 60;
        let detailsY = margin + 25;
        
        doc.setFontSize(10);
        doc.text('Invoice Number:', detailsX, detailsY);
        doc.text(invoiceData.invoiceNumber, detailsX + 30, detailsY);
        detailsY += 7;
        
        doc.text('Date:', detailsX, detailsY);
        doc.text(formatDate(invoiceData.invoiceDate), detailsX + 30, detailsY);
        detailsY += 7;
        
        doc.text('Due Date:', detailsX, detailsY);
        doc.text(formatDate(invoiceData.dueDate), detailsX + 30, detailsY);
        
        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, businessInfoY + 10, pageWidth - margin, businessInfoY + 10);
        
        // Client info
        const clientY = businessInfoY + 20;
        
        doc.setFontSize(11);
        doc.setTextColor(textColor);
        doc.text('Bill To:', margin, clientY);
        
        doc.setFontSize(10);
        doc.text(invoiceData.clientInfo.name, margin, clientY + 7);
        
        if (invoiceData.clientInfo.address) {
          const addressLines = doc.splitTextToSize(invoiceData.clientInfo.address, pageWidth / 3);
          doc.text(addressLines, margin, clientY + 14);
        }
        
        let clientContactY = clientY + 14 + (invoiceData.clientInfo.address ? 10 : 0);
        
        if (invoiceData.clientInfo.email) {
          doc.text(`Email: ${invoiceData.clientInfo.email}`, margin, clientContactY);
          clientContactY += 5;
        }
        
        if (invoiceData.clientInfo.phone) {
          doc.text(`Phone: ${invoiceData.clientInfo.phone}`, margin, clientContactY);
        }
        
        // Items table
        const tableY = clientY + 40;
        
        // Use jspdf-autotable for the items
        (doc as any).autoTable({
          startY: tableY,
          head: [['Item Description', 'Quantity', 'Unit Price', 'Tax', 'Amount']],
          body: invoiceData.items.map(item => [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.price),
            `${item.tax}%`,
            formatCurrency(item.quantity * item.price)
          ]),
          foot: [
            ['', '', '', 'Subtotal:', formatCurrency(calculateSubtotal())],
            ['', '', '', 'Tax:', formatCurrency(calculateTaxTotal())],
            ['', '', '', 'Total:', formatCurrency(calculateTotal())]
          ],
          theme: 'grid',
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          footStyles: {
            fillColor: [240, 240, 240],
            fontStyle: 'bold'
          },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 20, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 20, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
          }
        });
        
        // Get the final Y position after the table
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Notes and payment terms
        if (invoiceData.notes) {
          doc.setFontSize(10);
          doc.text('Notes:', margin, finalY);
          
          const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - (margin * 2));
          doc.text(notesLines, margin, finalY + 5);
        }
        
        // Payment terms
        const termsY = finalY + (invoiceData.notes ? 20 : 0);
        
        doc.setFontSize(10);
        doc.text('Payment Terms:', margin, termsY);
        doc.text(invoiceData.paymentTerms, margin + 30, termsY);
        
        // Footer
        const footerY = pageHeight - margin;
        
        doc.setFontSize(8);
        doc.setTextColor(lightColor);
        doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
        
      } else if (template === 'minimal') {
        // Minimal template
        
        // Logo
        if (invoiceData.logo) {
          doc.addImage(invoiceData.logo, 'JPEG', margin, margin, 40, 20, undefined, 'FAST');
        }
        
        // Invoice title
        doc.setFontSize(24);
        doc.setTextColor(primaryColor);
        doc.text('INVOICE', pageWidth - margin, margin + 15, { align: 'right' });
        
        // Invoice details
        let detailsY = margin + 30;
        
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, pageWidth - margin, detailsY, { align: 'right' });
        detailsY += 5;
        
        doc.text(`Date: ${formatDate(invoiceData.invoiceDate)}`, pageWidth - margin, detailsY, { align: 'right' });
        detailsY += 5;
        
        doc.text(`Due Date: ${formatDate(invoiceData.dueDate)}`, pageWidth - margin, detailsY, { align: 'right' });
        
        // Business and client info
        const infoY = margin + 50;
        
        // Business info
        doc.setFontSize(11);
        doc.setTextColor(primaryColor);
        doc.text('From:', margin, infoY);
        
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(invoiceData.businessInfo.name, margin, infoY + 7);
        
        let businessInfoY = infoY + 7;
        
        if (invoiceData.businessInfo.address) {
          const addressLines = doc.splitTextToSize(invoiceData.businessInfo.address, pageWidth / 4);
          doc.text(addressLines, margin, businessInfoY + 5);
          businessInfoY += 5 + (addressLines.length * 5);
        }
        
        if (invoiceData.businessInfo.email) {
          doc.text(invoiceData.businessInfo.email, margin, businessInfoY + 5);
          businessInfoY += 5;
        }
        
        if (invoiceData.businessInfo.phone) {
          doc.text(invoiceData.businessInfo.phone, margin, businessInfoY + 5);
        }
        
        // Client info
        doc.setFontSize(11);
        doc.setTextColor(primaryColor);
        doc.text('To:', pageWidth / 2, infoY);
        
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(invoiceData.clientInfo.name, pageWidth / 2, infoY + 7);
        
        let clientInfoY = infoY + 7;
        
        if (invoiceData.clientInfo.address) {
          const addressLines = doc.splitTextToSize(invoiceData.clientInfo.address, pageWidth / 4);
          doc.text(addressLines, pageWidth / 2, clientInfoY + 5);
          clientInfoY += 5 + (addressLines.length * 5);
        }
        
        if (invoiceData.clientInfo.email) {
          doc.text(invoiceData.clientInfo.email, pageWidth / 2, clientInfoY + 5);
          clientInfoY += 5;
        }
        
        if (invoiceData.clientInfo.phone) {
          doc.text(invoiceData.clientInfo.phone, pageWidth / 2, clientInfoY + 5);
        }
        
        // Items table
        const tableY = infoY + 60;
        
        // Use jspdf-autotable for the items
        (doc as any).autoTable({
          startY: tableY,
          head: [['Description', 'Qty', 'Price', 'Tax', 'Amount']],
          body: invoiceData.items.map(item => [
            item.description,
            item.quantity.toString(),
            formatCurrency(item.price),
            `${item.tax}%`,
            formatCurrency(item.quantity * item.price)
          ]),
          foot: [
            ['', '', '', 'Subtotal:', formatCurrency(calculateSubtotal())],
            ['', '', '', 'Tax:', formatCurrency(calculateTaxTotal())],
            ['', '', '', 'Total:', formatCurrency(calculateTotal())]
          ],
          theme: 'plain',
          headStyles: {
            fillColor: [245, 245, 245],
            textColor: [0, 0, 0],
            fontStyle: 'bold'
          },
          footStyles: {
            fontStyle: 'bold'
          },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 15, halign: 'center' },
            2: { cellWidth: 30, halign: 'right' },
            3: { cellWidth: 15, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
          }
        });
        
        // Get the final Y position after the table
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Notes and payment terms
        if (invoiceData.notes) {
          doc.setFontSize(10);
          doc.setTextColor(primaryColor);
          doc.text('Notes:', margin, finalY);
          
          doc.setTextColor(textColor);
          const notesLines = doc.splitTextToSize(invoiceData.notes, pageWidth - (margin * 2));
          doc.text(notesLines, margin, finalY + 5);
        }
        
        // Payment terms
        const termsY = finalY + (invoiceData.notes ? 20 : 0);
        
        doc.setFontSize(10);
        doc.setTextColor(primaryColor);
        doc.text('Payment Terms:', margin, termsY);
        
        doc.setTextColor(textColor);
        doc.text(invoiceData.paymentTerms, margin + 30, termsY);
        
        // Thank you message
        doc.setFontSize(11);
        doc.setTextColor(primaryColor);
        doc.text('Thank you for your business!', pageWidth / 2, pageHeight - margin, { align: 'center' });
      }
      
      // Convert to base64 and set state
      const pdfData = doc.output('datauristring');
      setGeneratedPdf(pdfData);
      setIsGenerating(false);
      toast.success("Invoice generated successfully!");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      toast.error("Failed to generate invoice. Please try again.");
    }
  };

  const downloadInvoice = () => {
    if (!generatedPdf) {
      generateInvoicePdf();
      return;
    }
    
    const link = document.createElement('a');
    link.href = generatedPdf;
    link.download = `Invoice_${invoiceData.invoiceNumber}.pdf`;
    link.click();
    toast.success("Invoice downloaded successfully!");
  };

  const sendInvoiceByEmail = () => {
    if (!invoiceData.clientInfo.email) {
      toast.error("Please enter client email address");
      return;
    }
    
    if (!generatedPdf) {
      generateInvoicePdf();
      return;
    }
    
    // In a real implementation, this would send the invoice via email
    // For this demo, we'll just show a success message
    toast.success(`Invoice would be sent to ${invoiceData.clientInfo.email}`);
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const loadSampleData = () => {
    setInvoiceData({
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      currency: 'USD',
      taxRate: 7.5,
      businessInfo: {
        name: "Acme Web Solutions",
        address: "123 Business Street\nSuite 100\nSan Francisco, CA 94107",
        phone: "(555) 123-4567",
        email: "billing@acmewebsolutions.com",
        website: "www.acmewebsolutions.com",
        taxId: "12-3456789"
      },
      clientInfo: {
        name: "John Smith",
        address: "456 Client Avenue\nNew York, NY 10001",
        email: "john.smith@example.com",
        phone: "(555) 987-6543"
      },
      items: [
        {
          id: "item1",
          description: "Website Design",
          quantity: 1,
          price: 1200,
          tax: 7.5
        },
        {
          id: "item2",
          description: "Web Hosting (Annual)",
          quantity: 1,
          price: 300,
          tax: 7.5
        },
        {
          id: "item3",
          description: "Content Creation (5 pages)",
          quantity: 5,
          price: 100,
          tax: 7.5
        }
      ],
      notes: "Payment is due within 30 days. Please make checks payable to Acme Web Solutions or pay online at www.acmewebsolutions.com/pay",
      paymentTerms: "Net 30",
      logo: null
    });
    
    toast.success("Sample data loaded successfully!");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Receipt className="h-4 w-4 mr-2" />
          Invoice Generator
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoice Generator</h1>
            <p className="text-gray-600 mt-2">Create professional invoices for your clients</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSampleData}>
              Load Sample
            </Button>
            <Button 
              onClick={generateInvoicePdf}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? "Generating..." : "Generate Invoice"}
            </Button>
            {generatedPdf && (
              <Button 
                onClick={downloadInvoice}
                className="bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Invoice Information</CardTitle>
              <CardDescription>
                Fill in the details for your invoice
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="details" className="flex items-center gap-1">
                    <Receipt className="h-4 w-4" />
                    <span className="hidden sm:inline">Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="business" className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Business</span>
                  </TabsTrigger>
                  <TabsTrigger value="client" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Client</span>
                  </TabsTrigger>
                  <TabsTrigger value="items" className="flex items-center gap-1">
                    <ListChecks className="h-4 w-4" />
                    <span className="hidden sm:inline">Items</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Input
                        id="invoiceNumber"
                        value={invoiceData.invoiceNumber}
                        onChange={(e) => handleInvoiceChange('invoiceNumber', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={invoiceData.currency} 
                        onValueChange={(value) => handleInvoiceChange('currency', value)}
                      >
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                          <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Invoice Date</Label>
                      <Input
                        id="invoiceDate"
                        type="date"
                        value={invoiceData.invoiceDate}
                        onChange={(e) => handleInvoiceChange('invoiceDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => handleInvoiceChange('dueDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
                      <Input
                        id="taxRate"
                        type="number"
                        min="0"
                        step="0.1"
                        value={invoiceData.taxRate}
                        onChange={(e) => handleInvoiceChange('taxRate', parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo">Company Logo</Label>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => document.getElementById('logo-upload')?.click()}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {invoiceData.logo && (
                          <div className="h-10 w-10 relative">
                            <img 
                              src={invoiceData.logo} 
                              alt="Logo" 
                              className="h-full w-full object-contain"
                            />
                            <button
                              onClick={() => setInvoiceData({...invoiceData, logo: null})}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-4 w-4 flex items-center justify-center"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={invoiceData.notes}
                      onChange={(e) => handleInvoiceChange('notes', e.target.value)}
                      placeholder="Additional notes to the client"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                    <Input
                      id="paymentTerms"
                      value={invoiceData.paymentTerms}
                      onChange={(e) => handleInvoiceChange('paymentTerms', e.target.value)}
                      placeholder="e.g., Net 30, Due on Receipt"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="business" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={invoiceData.businessInfo.name}
                      onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                      placeholder="Your Company Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Address</Label>
                    <Textarea
                      id="businessAddress"
                      value={invoiceData.businessInfo.address}
                      onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
                      placeholder="Street, City, State, ZIP"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail">Email</Label>
                      <Input
                        id="businessEmail"
                        type="email"
                        value={invoiceData.businessInfo.email}
                        onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
                        placeholder="your@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">Phone</Label>
                      <Input
                        id="businessPhone"
                        value={invoiceData.businessInfo.phone}
                        onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessWebsite">Website</Label>
                      <Input
                        id="businessWebsite"
                        value={invoiceData.businessInfo.website}
                        onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
                        placeholder="www.yourcompany.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessTaxId">Tax ID / VAT Number</Label>
                      <Input
                        id="businessTaxId"
                        value={invoiceData.businessInfo.taxId}
                        onChange={(e) => handleBusinessInfoChange('taxId', e.target.value)}
                        placeholder="Tax ID or VAT Number"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="client" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      value={invoiceData.clientInfo.name}
                      onChange={(e) => handleClientInfoChange('name', e.target.value)}
                      placeholder="Client Name or Company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clientAddress">Address</Label>
                    <Textarea
                      id="clientAddress"
                      value={invoiceData.clientInfo.address}
                      onChange={(e) => handleClientInfoChange('address', e.target.value)}
                      placeholder="Street, City, State, ZIP"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientEmail">Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={invoiceData.clientInfo.email}
                        onChange={(e) => handleClientInfoChange('email', e.target.value)}
                        placeholder="client@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Phone</Label>
                      <Input
                        id="clientPhone"
                        value={invoiceData.clientInfo.phone}
                        onChange={(e) => handleClientInfoChange('phone', e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="items" className="space-y-6">
                  {invoiceData.items.map((item, index) => (
                    <Card key={item.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Item #{index + 1}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item or service description"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unit Price</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tax Rate (%)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, 'tax', parseFloat(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Amount:</div>
                            <div className="font-medium">{formatCurrency(item.quantity * item.price)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addItem}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                  
                  {invoiceData.items.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Subtotal:</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Tax:</span>
                        <span>{formatCurrency(calculateTaxTotal())}</span>
                      </div>
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Invoice Settings
              </CardTitle>
              <CardDescription>
                Customize the look of your invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Template Style</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div 
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${template === 'modern' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setTemplate('modern')}
                  >
                    <div className="h-2 bg-blue-500 rounded-t-sm mb-2"></div>
                    <div className="h-3 w-3/4 bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-3 w-1/2 bg-gray-200 rounded-sm mb-2"></div>
                    <div className="h-2 w-full bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-2 w-full bg-gray-200 rounded-sm mb-1"></div>
                    <p className="text-xs text-center mt-1 font-medium">Modern</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${template === 'classic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setTemplate('classic')}
                  >
                    <div className="h-3 w-1/2 mx-auto bg-gray-200 rounded-sm mb-2"></div>
                    <div className="h-2 w-3/4 bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-2 w-1/2 bg-gray-200 rounded-sm mb-2"></div>
                    <div className="h-1 bg-gray-300 mb-2"></div>
                    <div className="h-2 w-full bg-gray-200 rounded-sm mb-1"></div>
                    <p className="text-xs text-center mt-1 font-medium">Classic</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${template === 'minimal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setTemplate('minimal')}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="h-3 w-1/3 bg-gray-200 rounded-sm"></div>
                      <div className="h-3 w-1/3 bg-blue-500 rounded-sm"></div>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-2 w-full bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-2 w-full bg-gray-200 rounded-sm mb-1"></div>
                    <p className="text-xs text-center mt-1 font-medium">Minimal</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: accentColor }}
                  />
                  <Input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Invoice Number:</span>
                <span className="font-medium">{invoiceData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Date:</span>
                <span>{formatDate(invoiceData.invoiceDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Due Date:</span>
                <span>{formatDate(invoiceData.dueDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Items:</span>
                <span>{invoiceData.items.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Tax:</span>
                <span>{formatCurrency(calculateTaxTotal())}</span>
              </div>
              <div className="flex justify-between items-center font-bold">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </CardContent>
          </Card>
          
          {/* PDF Preview */}
          {generatedPdf && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  Invoice Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden h-[400px]">
                  <iframe 
                    src={generatedPdf} 
                    className="w-full h-full"
                    title="Invoice Preview"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex gap-2 pt-4">
                <Button 
                  onClick={downloadInvoice}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                {invoiceData.clientInfo.email && (
                  <Button 
                    onClick={sendInvoiceByEmail}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use the invoice generator:</strong> Fill in your business and client information, add items to the invoice, then click "Generate Invoice" to create a professional PDF invoice. You can customize the template style and colors, and download or email the final invoice.
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Add missing components
function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ListChecks(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 7 3 3 3-3" />
      <path d="M6 10V5" />
      <path d="M21 11h-8" />
      <path d="m3 17 3 3 3-3" />
      <path d="M6 20v-5" />
      <path d="M21 21h-8" />
    </svg>
  );
}

export default InvoiceGeneratorPage;