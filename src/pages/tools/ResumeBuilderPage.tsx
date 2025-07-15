import { useState, useRef } from "react";
import { FileText, Download, User, Briefcase, GraduationCap, Award, Phone, Mail, Globe, MapPin, Palette, CheckCircle, AlertCircle, Trash2, Plus, Edit, Save } from "lucide-react";
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

interface ResumeData {
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: number;
  }>;
}

const ResumeBuilderPage = () => {
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      summary: ""
    },
    education: [],
    experience: [],
    skills: []
  });
  
  const [activeTab, setActiveTab] = useState("personal");
  const [template, setTemplate] = useState("modern");
  const [color, setColor] = useState("#3b82f6");
  const [generatedPdf, setGeneratedPdf] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const resumeRef = useRef<HTMLDivElement>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handlePersonalInfoChange = (field: string, value: string) => {
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value
      }
    });
  };

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          id: generateId(),
          institution: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          description: ""
        }
      ]
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    });
  };

  const removeEducation = (id: string) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    });
  };

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          id: generateId(),
          company: "",
          position: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: ""
        }
      ]
    });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    });
  };

  const removeExperience = (id: string) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    });
  };

  const addSkill = () => {
    setResumeData({
      ...resumeData,
      skills: [
        ...resumeData.skills,
        {
          id: generateId(),
          name: "",
          level: 3
        }
      ]
    });
  };

  const updateSkill = (id: string, field: string, value: any) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    });
  };

  const removeSkill = (id: string) => {
    setResumeData({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill.id !== id)
    });
  };

  const generatePdf = async () => {
    if (!resumeData.personalInfo.fullName) {
      toast.error("Please enter at least your full name");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryColor = color;
      const textColor = '#333333';
      const lightColor = '#777777';
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      let currentY = margin;

      const checkPageBreak = (requiredHeight: number) => {
        if (currentY + requiredHeight >= pageHeight - margin) {
          doc.addPage();
          currentY = margin;
          return true; // Page break occurred
        }
        return false;
      };

      // Helper to draw text and handle page breaks
      const drawText = (text: string, x: number, y: number, options: any) => {
        const maxWidth = options.maxWidth || pageWidth - margin - x;
        const lines = doc.splitTextToSize(text, maxWidth);
        const lineHeight = doc.getLineHeight(options.font) / doc.internal.scaleFactor;

        lines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          doc.text(line, x, currentY);
          currentY += lineHeight;
        });
      };


      // --- DRAWING FUNCTIONS ---

      const drawHeader = () => {
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');
        doc.setTextColor('#ffffff');
        doc.setFontSize(24);
        doc.text(resumeData.personalInfo.fullName, margin, 20);
        doc.setFontSize(14);
        doc.text(resumeData.personalInfo.jobTitle, margin, 30);
        currentY = 45;
      };

      const drawContactInfo = () => {
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        let contactX = margin;
        if (resumeData.personalInfo.email) {
          doc.text(`Email: ${resumeData.personalInfo.email}`, contactX, currentY);
          currentY += 6;
        }
        if (resumeData.personalInfo.phone) {
          doc.text(`Phone: ${resumeData.personalInfo.phone}`, contactX, currentY);
          currentY += 6;
        }
        if (resumeData.personalInfo.location) {
          doc.text(`Location: ${resumeData.personalInfo.location}`, contactX, currentY);
          currentY += 6;
        }
        if (resumeData.personalInfo.website) {
          doc.text(`Website: ${resumeData.personalInfo.website}`, contactX, currentY);
          currentY += 6;
        }
      };

      const drawSectionTitle = (title: string) => {
        currentY += 5;
        checkPageBreak(12);
        doc.setFontSize(14);
        doc.setTextColor(primaryColor);
        doc.text(title, margin, currentY);
        currentY += 8;
        doc.setDrawColor(primaryColor);
        doc.line(margin, currentY - 4, pageWidth - margin, currentY - 4);
      };

      const drawSummary = () => {
        if (resumeData.personalInfo.summary) {
          drawSectionTitle('Professional Summary');
          doc.setFontSize(10);
          doc.setTextColor(textColor);
          drawText(resumeData.personalInfo.summary, margin, currentY, { });
        }
      };

      const drawExperience = () => {
        if (resumeData.experience.length > 0) {
          drawSectionTitle('Work Experience');
          resumeData.experience.forEach(exp => {
            checkPageBreak(20);
            doc.setFontSize(12);
            doc.setTextColor(textColor);
            doc.text(exp.position, margin, currentY);
            currentY += 6;

            doc.setFontSize(11);
            doc.setTextColor(primaryColor);
            doc.text(exp.company, margin, currentY);
            currentY += 6;

            doc.setFontSize(10);
            doc.setTextColor(lightColor);
            const dateText = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
            doc.text(dateText, margin, currentY);
            currentY += 6;

            if (exp.description) {
              doc.setTextColor(textColor);
              drawText(exp.description, margin, currentY, {});
            }
            currentY += 8;
          });
        }
      };

      const drawEducation = () => {
        if (resumeData.education.length > 0) {
          drawSectionTitle('Education');
          resumeData.education.forEach(edu => {
            checkPageBreak(20);
            doc.setFontSize(12);
            doc.setTextColor(textColor);
            doc.text(edu.degree, margin, currentY);
            currentY += 6;

            doc.setFontSize(11);
            doc.setTextColor(primaryColor);
            doc.text(edu.institution, margin, currentY);
            currentY += 6;

            doc.setFontSize(10);
            doc.setTextColor(lightColor);
            doc.text(`${edu.startDate} - ${edu.endDate}`, margin, currentY);
            currentY += 6;

            if (edu.description) {
              doc.setTextColor(textColor);
              drawText(edu.description, margin, currentY, {});
            }
            currentY += 8;
          });
        }
      };

      const drawSkills = () => {
        if (resumeData.skills.length > 0) {
          drawSectionTitle('Skills');
          doc.setFontSize(10);
          doc.setTextColor(textColor);

          const skillsPerRow = 2;
          const skillWidth = (pageWidth - (margin * 2)) / skillsPerRow;

          for (let i = 0; i < resumeData.skills.length; i += skillsPerRow) {
            checkPageBreak(8);
            let tempY = currentY;
            for (let j = 0; j < skillsPerRow; j++) {
              const index = i + j;
              if (index < resumeData.skills.length) {
                const skill = resumeData.skills[index];
                const skillX = margin + (j * skillWidth);
                doc.text(skill.name, skillX, tempY);

                const dotRadius = 1;
                const dotSpacing = 3;
                const dotStartX = skillX + 30;
                for (let k = 0; k < 5; k++) {
                  const dotX = dotStartX + (k * dotSpacing);
                  doc.setFillColor(k < skill.level ? primaryColor : '#d1d5db');
                  doc.circle(dotX, tempY - 1.5, dotRadius, 'F');
                }
              }
            }
            currentY += 8;
          }
        }
      };

      // --- TEMPLATE-SPECIFIC DRAWING LOGIC ---

      const drawClassicTemplate = () => {
        // Classic Header
        doc.setFontSize(26);
        doc.setTextColor(textColor);
        doc.text(resumeData.personalInfo.fullName, pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(lightColor);
        doc.text(resumeData.personalInfo.jobTitle, pageWidth / 2, currentY, { align: 'center' });
        currentY += 8;

        // Contact Info
        const contactInfo = [resumeData.personalInfo.email, resumeData.personalInfo.phone, resumeData.personalInfo.location, resumeData.personalInfo.website].filter(Boolean).join(' | ');
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.text(contactInfo, pageWidth / 2, currentY, { align: 'center' });
        currentY += 10;

        // Draw sections
        drawSummary();
        drawExperience();
        drawEducation();
        drawSkills();
      };

      const drawCreativeTemplate = () => {
        const leftColumnX = margin;
        const rightColumnX = pageWidth * 0.4 + 5;
        const leftColumnWidth = pageWidth * 0.4 - margin * 2;
        const rightColumnWidth = pageWidth * 0.6 - margin - 5;
        let leftY = margin;
        let rightY = margin;

        const addPageForCreative = () => {
          doc.addPage();
          leftY = margin;
          rightY = margin;
          doc.setFillColor(primaryColor);
          doc.rect(0, 0, pageWidth * 0.4, pageHeight, 'F');
        };

        const checkCreativePageBreak = (requiredHeight: number, column: 'left' | 'right') => {
          const currentY = column === 'left' ? leftY : rightY;
          if (currentY + requiredHeight >= pageHeight - margin) {
            addPageForCreative();
            return true;
          }
          return false;
        };

        const drawCreativeText = (text: string, x: number, options: { maxWidth: number; column: 'left' | 'right' }) => {
          const lines = doc.splitTextToSize(text, options.maxWidth);
          const lineHeight = doc.getLineHeight() / doc.internal.scaleFactor;
          let currentY = options.column === 'left' ? leftY : rightY;

          lines.forEach((line: string) => {
            if (checkCreativePageBreak(lineHeight, options.column)) {
              currentY = options.column === 'left' ? leftY : rightY;
            }
            doc.text(line, x, currentY);
            currentY += lineHeight;
          });

          if (options.column === 'left') {
            leftY = currentY;
          } else {
            rightY = currentY;
          }
        };

        // Initial page with sidebar
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, pageWidth * 0.4, pageHeight, 'F');

        // --- Left Column ---
        doc.setTextColor('#ffffff');
        doc.setFontSize(22).setFont(undefined, 'bold');
        drawCreativeText(resumeData.personalInfo.fullName, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
        leftY += 2;
        doc.setFontSize(14).setFont(undefined, 'normal');
        drawCreativeText(resumeData.personalInfo.jobTitle, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
        leftY += 10;

        doc.setFontSize(10).setFont(undefined, 'bold');
        drawCreativeText('Contact', leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
        leftY += 2;
        doc.setFontSize(10).setFont(undefined, 'normal');
        if(resumeData.personalInfo.email) drawCreativeText(resumeData.personalInfo.email, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
        if(resumeData.personalInfo.phone) drawCreativeText(resumeData.personalInfo.phone, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
        if(resumeData.personalInfo.location) drawCreativeText(resumeData.personalInfo.location, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
        if(resumeData.personalInfo.website) drawCreativeText(resumeData.personalInfo.website, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
        leftY += 10;

        if (resumeData.education.length > 0) {
          doc.setFontSize(12).setFont(undefined, 'bold');
          drawCreativeText('Education', leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
          leftY += 2;
          resumeData.education.forEach(edu => {
            doc.setFontSize(11).setFont(undefined, 'bold');
            drawCreativeText(edu.degree, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
            doc.setFontSize(10).setFont(undefined, 'normal');
            drawCreativeText(edu.institution, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
            drawCreativeText(`${edu.startDate} - ${edu.endDate}`, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
            leftY += 6;
          });
        }
        leftY += 10;

        if (resumeData.skills.length > 0) {
          doc.setFontSize(12).setFont(undefined, 'bold');
          drawCreativeText('Skills', leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
          leftY += 2;
          doc.setFontSize(10).setFont(undefined, 'normal');
          resumeData.skills.forEach(skill => {
            drawCreativeText(skill.name, leftColumnX, { maxWidth: leftColumnWidth, column: 'left' });
            leftY += 1;
          });
        }

        // --- Right Column ---
        doc.setTextColor(textColor);
        if (resumeData.personalInfo.summary) {
          doc.setFontSize(14).setFont(undefined, 'bold');
          drawCreativeText('Professional Summary', rightColumnX, { maxWidth: rightColumnWidth, column: 'right' });
          rightY += 2;
          doc.setFontSize(10).setFont(undefined, 'normal');
          drawCreativeText(resumeData.personalInfo.summary, rightColumnX, { maxWidth: rightColumnWidth, column: 'right' });
          rightY += 10;
        }

        if (resumeData.experience.length > 0) {
          doc.setFontSize(14).setFont(undefined, 'bold');
          drawCreativeText('Work Experience', rightColumnX, { maxWidth: rightColumnWidth, column: 'right' });
          rightY += 2;
          resumeData.experience.forEach(exp => {
            doc.setFontSize(12).setFont(undefined, 'bold');
            drawCreativeText(exp.position, rightColumnX, { maxWidth: rightColumnWidth, column: 'right' });
            doc.setFontSize(11).setFont(undefined, 'normal');
            doc.setTextColor(primaryColor);
            drawCreativeText(exp.company, rightColumnX, { maxWidth: rightColumnWidth, column: 'right' });
            doc.setTextColor(lightColor);
            const dateText = exp.current ? `${exp.startDate} - Present` : `${exp.startDate} - ${exp.endDate}`;
            drawCreativeText(dateText, rightColumnX, { maxWidth: rightColumnWidth, column: 'right' });
            doc.setTextColor(textColor);
            if (exp.description) {
              drawCreativeText(exp.description, rightColumnX, { maxWidth: rightColumnWidth, column: 'right' });
            }
            rightY += 8;
          });
        }
      };


      // --- GENERATE PDF --- 

      doc.setFont('helvetica');

      if (template === 'modern') {
        drawHeader();
        drawContactInfo();
        drawSummary();
        drawExperience();
        drawEducation();
        drawSkills();
      } else if (template === 'classic') {
        drawClassicTemplate();
      } else if (template === 'creative') {
        drawCreativeTemplate();
      } else {
        doc.text("This template is not yet fully supported.", margin, margin);
      }

      const pdfOutput = doc.output('datauristring');
      setGeneratedPdf(pdfOutput);
      toast.success("PDF generated successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("An unexpected error occurred while generating the PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResume = () => {
    if (!generatedPdf) {
      generatePdf();
      return;
    }
    
    const link = document.createElement('a');
    link.href = generatedPdf;
    link.download = `${resumeData.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
    link.click();
    toast.success("Resume downloaded successfully!");
  };

  const loadSampleData = () => {
    setResumeData({
      personalInfo: {
        fullName: "John Doe",
        jobTitle: "Senior Software Engineer",
        email: "john.doe@example.com",
        phone: "(123) 456-7890",
        location: "San Francisco, CA",
        website: "johndoe.com",
        summary: "Experienced software engineer with 8+ years of experience in developing scalable web applications. Proficient in JavaScript, TypeScript, React, and Node.js. Passionate about creating efficient, maintainable code and mentoring junior developers."
      },
      education: [
        {
          id: "edu1",
          institution: "University of California, Berkeley",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          startDate: "2010",
          endDate: "2014",
          description: "Graduated with honors. Relevant coursework: Data Structures, Algorithms, Database Systems, Web Development."
        }
      ],
      experience: [
        {
          id: "exp1",
          company: "Tech Solutions Inc.",
          position: "Senior Software Engineer",
          location: "San Francisco, CA",
          startDate: "2018",
          endDate: "",
          current: true,
          description: "Lead a team of 5 developers in building and maintaining enterprise-level web applications. Implemented CI/CD pipelines that reduced deployment time by 40%. Mentored junior developers and conducted code reviews."
        },
        {
          id: "exp2",
          company: "WebDev Co.",
          position: "Software Engineer",
          location: "San Jose, CA",
          startDate: "2014",
          endDate: "2018",
          current: false,
          description: "Developed and maintained front-end applications using React and Redux. Collaborated with UX designers to implement responsive designs. Optimized application performance, reducing load time by 30%."
        }
      ],
      skills: [
        { id: "skill1", name: "JavaScript", level: 5 },
        { id: "skill2", name: "React", level: 5 },
        { id: "skill3", name: "Node.js", level: 4 },
        { id: "skill4", name: "TypeScript", level: 4 },
        { id: "skill5", name: "HTML/CSS", level: 5 },
        { id: "skill6", name: "Git", level: 4 }
      ]
    });
    
    toast.success("Sample data loaded successfully!");
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileText className="h-4 w-4 mr-2" />
          Resume Builder
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600 mt-2">Create a professional resume with our easy-to-use builder</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSampleData}>
              Load Sample
            </Button>
            <Button 
              onClick={generatePdf}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? "Generating..." : "Generate Resume"}
            </Button>
            {generatedPdf && (
              <Button 
                onClick={downloadResume}
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
              <CardTitle>Resume Information</CardTitle>
              <CardDescription>
                Fill in the details for your resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="personal" className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Personal</span>
                  </TabsTrigger>
                  <TabsTrigger value="education" className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span className="hidden sm:inline">Education</span>
                  </TabsTrigger>
                  <TabsTrigger value="experience" className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span className="hidden sm:inline">Experience</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span className="hidden sm:inline">Skills</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="personal" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={resumeData.personalInfo.jobTitle}
                        onChange={(e) => handlePersonalInfoChange('jobTitle', e.target.value)}
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                        placeholder="john.doe@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={resumeData.personalInfo.location}
                        onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                        placeholder="San Francisco, CA"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => handlePersonalInfoChange('website', e.target.value)}
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                      placeholder="Brief overview of your professional background and key strengths"
                      rows={4}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="education" className="space-y-6">
                  {resumeData.education.map((edu, index) => (
                    <Card key={edu.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Education #{index + 1}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeEducation(edu.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Institution</Label>
                            <Input
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              placeholder="University name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Degree</Label>
                            <Input
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              placeholder="Bachelor of Science"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Field of Study</Label>
                            <Input
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                              placeholder="Computer Science"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label>Start Year</Label>
                              <Input
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                placeholder="2010"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Year</Label>
                              <Input
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                placeholder="2014"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description (Optional)</Label>
                          <Textarea
                            value={edu.description}
                            onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                            placeholder="Relevant coursework, achievements, etc."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addEducation}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </TabsContent>
                
                <TabsContent value="experience" className="space-y-6">
                  {resumeData.experience.map((exp, index) => (
                    <Card key={exp.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">Experience #{index + 1}</CardTitle>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                              placeholder="Company name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Position</Label>
                            <Input
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                              placeholder="Job title"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                              value={exp.location}
                              onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                              placeholder="City, State"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2">
                              <Label>Start Year</Label>
                              <Input
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                placeholder="2018"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>End Year</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  placeholder="2022"
                                  disabled={exp.current}
                                />
                                <div className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    id={`current-${exp.id}`}
                                    checked={exp.current}
                                    onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor={`current-${exp.id}`} className="text-xs">Current</Label>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements"
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="outline" 
                    onClick={addExperience}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </TabsContent>
                
                <TabsContent value="skills" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resumeData.skills.map((skill) => (
                      <div key={skill.id} className="flex items-center gap-2">
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                          placeholder="Skill name"
                          className="flex-1"
                        />
                        <Select
                          value={skill.level.toString()}
                          onValueChange={(value) => updateSkill(skill.id, 'level', parseInt(value))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue placeholder="Level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Basic</SelectItem>
                            <SelectItem value="2">Intermediate</SelectItem>
                            <SelectItem value="3">Proficient</SelectItem>
                            <SelectItem value="4">Advanced</SelectItem>
                            <SelectItem value="5">Expert</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeSkill(skill.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={addSkill}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
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
                <Palette className="h-5 w-5" />
                Template Settings
              </CardTitle>
              <CardDescription>
                Customize the look of your resume
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
                    <div className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-md mb-1"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded-sm"></div>
                    <p className="text-xs text-center mt-2 font-medium">Modern</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${template === 'classic' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setTemplate('classic')}
                  >
                    <div className="h-6 w-3/4 mx-auto bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-4 w-1/2 mx-auto bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-1 bg-blue-500 mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded-sm mb-1"></div>
                    <div className="h-4 w-full bg-gray-200 rounded-sm"></div>
                    <p className="text-xs text-center mt-2 font-medium">Classic</p>
                  </div>
                  
                  <div 
                    className={`border rounded-lg p-2 cursor-pointer transition-all ${template === 'creative' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setTemplate('creative')}
                  >
                    <div className="flex h-24">
                      <div className="w-1/3 bg-blue-500 rounded-tl-md"></div>
                      <div className="w-2/3 p-1">
                        <div className="h-4 w-3/4 bg-gray-200 rounded-sm mb-1"></div>
                        <div className="h-4 w-1/2 bg-gray-200 rounded-sm"></div>
                      </div>
                    </div>
                    <p className="text-xs text-center mt-2 font-medium">Creative</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: color }}
                  />
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* PDF Preview */}
          {generatedPdf && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Resume Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="border rounded-lg overflow-hidden h-[500px]">
                  <iframe 
                    src={generatedPdf} 
                    className="w-full h-full"
                    title="Resume Preview"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  onClick={downloadResume}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>How to use the resume builder:</strong> Fill in your personal information, education, work experience, and skills. Choose a template style and accent color, then click "Generate Resume" to create a professional PDF resume. You can download the resume once it's generated.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ResumeBuilderPage;