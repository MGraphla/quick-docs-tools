import { useState } from "react";
import { Calendar as CalendarIcon, Download, Plus, Trash2, CheckCircle, AlertCircle, Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface CalendarNote {
  id: string;
  day: number;
  text: string;
  color: string;
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const CalendarGeneratorPage = () => {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth());
  const [year, setYear] = useState(currentDate.getFullYear());
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [noteDay, setNoteDay] = useState<number | null>(null);
  const [noteColor, setNoteColor] = useState("#4f46e5");
  const [calendarTitle, setCalendarTitle] = useState("");
  const [layout, setLayout] = useState("portrait");
  const [showWeekends, setShowWeekends] = useState(true);
  const [showWeekNumbers, setShowWeekNumbers] = useState(false);
  const [headerColor, setHeaderColor] = useState("#4f46e5");
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateId = () => Math.random().toString(36).substring(2, 9);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const addNote = () => {
    if (!noteText.trim() || noteDay === null) {
      toast.error("Please enter note text and select a day");
      return;
    }
    
    const daysInMonth = getDaysInMonth(month, year);
    if (noteDay < 1 || noteDay > daysInMonth) {
      toast.error(`Please enter a valid day between 1 and ${daysInMonth}`);
      return;
    }
    
    const newNote: CalendarNote = {
      id: generateId(),
      day: noteDay,
      text: noteText,
      color: noteColor
    };
    
    setNotes([...notes, newNote]);
    setNoteText("");
    setNoteDay(null);
    toast.success("Note added successfully");
  };

  const removeNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success("Note removed");
  };

  const getNotesForDay = (day: number) => {
    return notes.filter(note => note.day === day);
  };

  const generateCalendarPdf = async () => {
    setIsGenerating(true);
    
    try {
      const orientation = layout === 'landscape' ? 'landscape' : 'portrait';
      const doc = new jsPDF({
        orientation: orientation as 'portrait' | 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      // Calendar title
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      const title = calendarTitle || `${months[month]} ${year}`;
      doc.text(title, pageWidth / 2, margin + 10, { align: 'center' });
      
      // Month and year
      doc.setFontSize(16);
      doc.text(`${months[month]} ${year}`, pageWidth / 2, margin + 20, { align: 'center' });
      
      // Calendar grid
      const daysInMonth = getDaysInMonth(month, year);
      const firstDay = getFirstDayOfMonth(month, year);
      
      // Day names
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      if (!showWeekends) {
        dayNames.shift(); // Remove Sunday
        dayNames.pop();   // Remove Saturday
      }
      
      // Calculate cell dimensions
      const numCols = showWeekends ? 7 : 5;
      const numRows = Math.ceil((daysInMonth + firstDay) / numCols);
      
      const cellWidth = contentWidth / numCols;
      const cellHeight = (pageHeight - (margin * 2) - 30) / numRows;
      
      // Draw calendar header
      doc.setFillColor(hexToRgb(headerColor).r, hexToRgb(headerColor).g, hexToRgb(headerColor).b);
      doc.rect(margin, margin + 25, contentWidth, 10, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      
      // Draw day names
      for (let i = 0; i < numCols; i++) {
        const x = margin + (i * cellWidth) + (cellWidth / 2);
        doc.text(dayNames[i], x, margin + 31, { align: 'center' });
      }
      
      // Draw calendar grid
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(255, 255, 255);
      doc.setTextColor(0, 0, 0);
      
      let day = 1;
      let weekNum = getWeekNumber(new Date(year, month, 1));
      
      for (let row = 0; row < numRows; row++) {
        const y = margin + 35 + (row * cellHeight);
        
        // Draw week number if enabled
        if (showWeekNumbers) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(weekNum.toString(), margin - 5, y + 5, { align: 'right' });
          weekNum++;
        }
        
        for (let col = 0; col < numCols; col++) {
          // Skip weekends if not showing them
          if (!showWeekends && (col + (showWeekends ? 0 : 1)) % 7 === 0 || 
              !showWeekends && (col + (showWeekends ? 0 : 1)) % 7 === 6) {
            continue;
          }
          
          const x = margin + (col * cellWidth);
          
          // Draw cell
          doc.rect(x, y, cellWidth, cellHeight, 'S');
          
          // Skip days before the first day of the month
          if (row === 0 && col < firstDay && showWeekends) {
            continue;
          }
          
          // Skip days before the first day (adjusted for weekday-only view)
          if (row === 0 && !showWeekends) {
            const adjustedFirstDay = firstDay === 0 ? 1 : firstDay === 6 ? 5 : firstDay;
            if (col < adjustedFirstDay - 1) {
              continue;
            }
          }
          
          // Stop after the last day of the month
          if (day > daysInMonth) {
            continue;
          }
          
          // Draw day number
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(day.toString(), x + 5, y + 8);
          
          // Draw notes for this day
          const dayNotes = getNotesForDay(day);
          if (dayNotes.length > 0) {
            doc.setFontSize(8);
            
            dayNotes.forEach((note, index) => {
              const rgb = hexToRgb(note.color);
              doc.setTextColor(rgb.r, rgb.g, rgb.b);
              
              // Truncate note text if too long
              const maxChars = Math.floor(cellWidth / 1.5);
              let noteText = note.text;
              if (noteText.length > maxChars) {
                noteText = noteText.substring(0, maxChars - 3) + '...';
              }
              
              doc.text(noteText, x + 5, y + 15 + (index * 5));
            });
          }
          
          day++;
        }
      }
      
      // Convert to base64 and set state
      const pdfData = doc.output('datauristring');
      setGeneratedPdf(pdfData);
      setIsGenerating(false);
      toast.success("Calendar generated successfully!");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      toast.error("Failed to generate calendar. Please try again.");
    }
  };

  const downloadCalendar = () => {
    if (!generatedPdf) {
      generateCalendarPdf();
      return;
    }
    
    const link = document.createElement('a');
    link.href = generatedPdf;
    link.download = `${calendarTitle || months[month]}_${year}_Calendar.pdf`;
    link.click();
    toast.success("Calendar downloaded successfully!");
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

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <CalendarIcon className="h-4 w-4 mr-2" />
          Calendar Generator
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar Generator</h1>
            <p className="text-gray-600 mt-2">Create and download printable monthly calendars with custom notes</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={generateCalendarPdf}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? "Generating..." : "Generate Calendar"}
            </Button>
            {generatedPdf && (
              <Button 
                onClick={downloadCalendar}
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
        {/* Calendar Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Calendar Settings
              </CardTitle>
              <CardDescription>
                Configure your calendar options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Calendar Title (Optional)</Label>
                <Input
                  placeholder="My Calendar"
                  value={calendarTitle}
                  onChange={(e) => setCalendarTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((monthName, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {monthName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 2 + i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Layout</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${layout === 'portrait' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                    onClick={() => setLayout('portrait')}
                  >
                    <div className="h-20 w-16 mx-auto bg-gray-200 rounded-sm"></div>
                    <p className="text-xs text-center mt-2 font-medium">Portrait</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${layout === 'landscape' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
                    onClick={() => setLayout('landscape')}
                  >
                    <div className="h-16 w-20 mx-auto bg-gray-200 rounded-sm"></div>
                    <p className="text-xs text-center mt-2 font-medium">Landscape</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Header Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: headerColor }}
                  />
                  <Input
                    type="color"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Display Options</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-weekends"
                      checked={showWeekends}
                      onChange={(e) => setShowWeekends(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="show-weekends">Show weekends</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="show-week-numbers"
                      checked={showWeekNumbers}
                      onChange={(e) => setShowWeekNumbers(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="show-week-numbers">Show week numbers</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PDF Preview */}
          {generatedPdf && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-indigo-600" />
                  Calendar Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden h-[400px]">
                  <iframe 
                    src={generatedPdf} 
                    className="w-full h-full"
                    title="Calendar Preview"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  onClick={downloadCalendar}
                  className="bg-indigo-600 hover:bg-indigo-700 w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Calendar
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        {/* Calendar Preview and Notes */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Preview</CardTitle>
              <CardDescription>
                {months[month]} {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white rounded-lg border p-4">
                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div 
                      key={index} 
                      className="text-center font-medium p-2 text-sm"
                      style={{ backgroundColor: headerColor, color: 'white' }}
                    >
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar days */}
                  {Array.from({ length: getFirstDayOfMonth(month, year) }, (_, i) => (
                    <div key={`empty-${i}`} className="p-2 border border-gray-100 min-h-[80px]"></div>
                  ))}
                  
                  {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => {
                    const day = i + 1;
                    const dayNotes = getNotesForDay(day);
                    
                    return (
                      <div 
                        key={`day-${day}`} 
                        className={`p-2 border border-gray-100 min-h-[80px] relative ${
                          noteDay === day ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        onClick={() => setNoteDay(day)}
                      >
                        <div className="font-medium">{day}</div>
                        {dayNotes.map(note => (
                          <div 
                            key={note.id} 
                            className="text-xs mt-1 p-1 rounded truncate"
                            style={{ backgroundColor: `${note.color}20`, color: note.color }}
                          >
                            {note.text}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Notes
              </CardTitle>
              <CardDescription>
                Add notes to specific days on your calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select 
                    value={noteDay?.toString() || ""} 
                    onValueChange={(value) => setNoteDay(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: getDaysInMonth(month, year) }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label>Note Text</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter note text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={noteColor}
                        onChange={(e) => setNoteColor(e.target.value)}
                        className="w-10 h-10 p-1"
                      />
                      <Button 
                        onClick={addNote}
                        disabled={!noteText.trim() || noteDay === null}
                        className="whitespace-nowrap"
                      >
                        Add Note
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Notes List */}
              {notes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Added Notes</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-lg">
                    {notes.map(note => (
                      <div 
                        key={note.id} 
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: note.color }}
                          ></div>
                          <span className="font-medium">Day {note.day}:</span>
                          <span className="text-gray-700">{note.text}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeNote(note.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use the calendar generator:</strong> Select a month and year, customize the layout and display options, then add notes to specific days. Click "Generate Calendar" to create a PDF, which you can preview and download. The calendar will include all your notes and can be printed for personal or professional use.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default CalendarGeneratorPage;
