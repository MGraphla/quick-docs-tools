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
      // Create new PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Set font
      doc.setFont('helvetica');
      
      // Define colors
      const primaryColor = color;
      const textColor = '#333333';
      const lightColor = '#777777';
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      
      if (template === 'modern') {
        // Modern template
        
        // Header with name and title
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor('#ffffff');
        doc.setFontSize(24);
        doc.text(resumeData.personalInfo.fullName, margin, 20);
        
        doc.setFontSize(14);
        doc.text(resumeData.personalInfo.jobTitle, margin, 30);
        
        // Contact information
        doc.setTextColor(textColor);
        doc.setFontSize(10);
        let contactY = 50;
        
        if (resumeData.personalInfo.email) {
          doc.text(`Email: ${resumeData.personalInfo.email}`, margin, contactY);
          contactY += 6;
        }
        
        if (resumeData.personalInfo.phone) {
          doc.text(`Phone: ${resumeData.personalInfo.phone}`, margin, contactY);
          contactY += 6;
        }
        
        if (resumeData.personalInfo.location) {
          doc.text(`Location: ${resumeData.personalInfo.location}`, margin, contactY);
          contactY += 6;
        }
        
        if (resumeData.personalInfo.website) {
          doc.text(`Website: ${resumeData.personalInfo.website}`, margin, contactY);
          contactY += 6;
        }
        
        // Summary
        if (resumeData.personalInfo.summary) {
          contactY += 4;
          doc.setFontSize(14);
          doc.setTextColor(primaryColor);
          doc.text('Professional Summary', margin, contactY);
          contactY += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(textColor);
          
          // Split summary into lines
          const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, pageWidth - (margin * 2));
          doc.text(summaryLines, margin, contactY);
          contactY += (summaryLines.length * 5) + 10;
        }
        
        // Experience
        if (resumeData.experience.length > 0) {
          doc.setFontSize(14);
          doc.setTextColor(primaryColor);
          doc.text('Work Experience', margin, contactY);
          contactY += 6;
          
          resumeData.experience.forEach(exp => {
            doc.setFontSize(12);
            doc.setTextColor(textColor);
            doc.text(exp.position, margin, contactY);
            contactY += 5;
            
            doc.setFontSize(11);
            doc.setTextColor(primaryColor);
            doc.text(exp.company, margin, contactY);
            contactY += 5;
            
            doc.setFontSize(10);
            doc.setTextColor(lightColor);
            const dateText = exp.current 
              ? `${exp.startDate} - Present` 
              : `${exp.startDate} - ${exp.endDate}`;
            doc.text(dateText, margin, contactY);
            contactY += 5;
            
            if (exp.description) {
              doc.setTextColor(textColor);
              const descLines = doc.splitTextToSize(exp.description, pageWidth - (margin * 2));
              doc.text(descLines, margin, contactY);
              contactY += (descLines.length * 5) + 5;
            }
            
            contactY += 5;
          });
        }
        
        // Education
        if (resumeData.education.length > 0) {
          doc.setFontSize(14);
          doc.setTextColor(primaryColor);
          doc.text('Education', margin, contactY);
          contactY += 6;
          
          resumeData.education.forEach(edu => {
            doc.setFontSize(12);
            doc.setTextColor(textColor);
            doc.text(edu.degree, margin, contactY);
            contactY += 5;
            
            doc.setFontSize(11);
            doc.setTextColor(primaryColor);
            doc.text(edu.institution, margin, contactY);
            contactY += 5;
            
            doc.setFontSize(10);
            doc.setTextColor(lightColor);
            doc.text(`${edu.startDate} - ${edu.endDate}`, margin, contactY);
            contactY += 5;
            
            if (edu.description) {
              doc.setTextColor(textColor);
              const descLines = doc.splitTextToSize(edu.description, pageWidth - (margin * 2));
              doc.text(descLines, margin, contactY);
              contactY += (descLines.length * 5) + 5;
            }
            
            contactY += 5;
          });
        }
        
        // Skills
        if (resumeData.skills.length > 0) {
          doc.setFontSize(14);
          doc.setTextColor(primaryColor);
          doc.text('Skills', margin, contactY);
          contactY += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(textColor);
          
          const skillsPerRow = 2;
          const skillWidth = (pageWidth - (margin * 2)) / skillsPerRow;
          
          for (let i = 0; i < resumeData.skills.length; i += skillsPerRow) {
            for (let j = 0; j < skillsPerRow; j++) {
              const index = i + j;
              if (index < resumeData.skills.length) {
                const skill = resumeData.skills[index];
                const skillX = margin + (j * skillWidth);
                
                doc.text(skill.name, skillX, contactY);
                
                // Draw skill level
                const levelWidth = 30;
                const dotRadius = 1;
                const dotSpacing = 7;
                
                for (let k = 0; k < 5; k++) {
                  const dotX = skillX + 40 + (k * dotSpacing);
                  if (k < skill.level) {
                    doc.setFillColor(primaryColor);
                  } else {
                    doc.setFillColor(lightColor);
                  }
                  doc.circle(dotX, contactY - 1, dotRadius, 'F');
                }
              }
            }
            contactY += 8;
          }
        }
        
      } else if (template === 'classic') {
        // Classic template
        
        // Header
        doc.setFontSize(24);
        doc.setTextColor(primaryColor);
        doc.text(resumeData.personalInfo.fullName, pageWidth / 2, 20, { align: 'center' });
        
        doc.setFontSize(14);
        doc.text(resumeData.personalInfo.jobTitle, pageWidth / 2, 30, { align: 'center' });
        
        // Contact information
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        let contactText = '';
        
        if (resumeData.personalInfo.email) contactText += resumeData.personalInfo.email;
        if (resumeData.personalInfo.phone) {
          if (contactText) contactText += ' | ';
          contactText += resumeData.personalInfo.phone;
        }
        if (resumeData.personalInfo.location) {
          if (contactText) contactText += ' | ';
          contactText += resumeData.personalInfo.location;
        }
        if (resumeData.personalInfo.website) {
          if (contactText) contactText += ' | ';
          contactText += resumeData.personalInfo.website;
        }
        
        doc.text(contactText, pageWidth / 2, 40, { align: 'center' });
        
        // Divider
        doc.setDrawColor(primaryColor);
        doc.setLineWidth(0.5);
        doc.line(margin, 45, pageWidth - margin, 45);
        
        let currentY = 55;
        
        // Summary
        if (resumeData.personalInfo.summary) {
          doc.setFontSize(12);
          doc.setTextColor(primaryColor);
          doc.text('PROFESSIONAL SUMMARY', margin, currentY);
          currentY += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(textColor);
          const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, pageWidth - (margin * 2));
          doc.text(summaryLines, margin, currentY);
          currentY += (summaryLines.length * 5) + 10;
        }
        
        // Experience
        if (resumeData.experience.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(primaryColor);
          doc.text('WORK EXPERIENCE', margin, currentY);
          currentY += 6;
          
          resumeData.experience.forEach(exp => {
            doc.setFontSize(11);
            doc.setTextColor(textColor);
            doc.text(exp.position, margin, currentY);
            
            const dateText = exp.current 
              ? `${exp.startDate} - Present` 
              : `${exp.startDate} - ${exp.endDate}`;
            
            const dateWidth = doc.getTextWidth(dateText);
            doc.text(dateText, pageWidth - margin - dateWidth, currentY);
            currentY += 5;
            
            doc.setFontSize(10);
            doc.text(`${exp.company}, ${exp.location}`, margin, currentY);
            currentY += 5;
            
            if (exp.description) {
              const descLines = doc.splitTextToSize(exp.description, pageWidth - (margin * 2));
              doc.text(descLines, margin, currentY);
              currentY += (descLines.length * 5);
            }
            
            currentY += 8;
          });
        }
        
        // Education
        if (resumeData.education.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(primaryColor);
          doc.text('EDUCATION', margin, currentY);
          currentY += 6;
          
          resumeData.education.forEach(edu => {
            doc.setFontSize(11);
            doc.setTextColor(textColor);
            doc.text(edu.degree, margin, currentY);
            
            const dateText = `${edu.startDate} - ${edu.endDate}`;
            const dateWidth = doc.getTextWidth(dateText);
            doc.text(dateText, pageWidth - margin - dateWidth, currentY);
            currentY += 5;
            
            doc.setFontSize(10);
            doc.text(edu.institution, margin, currentY);
            currentY += 5;
            
            if (edu.description) {
              const descLines = doc.splitTextToSize(edu.description, pageWidth - (margin * 2));
              doc.text(descLines, margin, currentY);
              currentY += (descLines.length * 5);
            }
            
            currentY += 8;
          });
        }
        
        // Skills
        if (resumeData.skills.length > 0) {
          doc.setFontSize(12);
          doc.setTextColor(primaryColor);
          doc.text('SKILLS', margin, currentY);
          currentY += 6;
          
          doc.setFontSize(10);
          doc.setTextColor(textColor);
          
          const skillsText = resumeData.skills.map(skill => skill.name).join(' • ');
          const skillsLines = doc.splitTextToSize(skillsText, pageWidth - (margin * 2));
          doc.text(skillsLines, margin, currentY);
        }
        
      } else if (template === 'creative') {
        // Creative template
        
        // Sidebar
        doc.setFillColor(primaryColor);
        doc.rect(0, 0, 60, pageHeight, 'F');
        
        // Name and title
        doc.setTextColor('#ffffff');
        doc.setFontSize(18);
        doc.text(resumeData.personalInfo.fullName, 30, 30, { align: 'center' });
        
        doc.setFontSize(12);
        const titleLines = doc.splitTextToSize(resumeData.personalInfo.jobTitle, 50);
        doc.text(titleLines, 30, 45, { align: 'center' });
        
        // Contact info in sidebar
        let sidebarY = 70;
        doc.setFontSize(9);
        
        if (resumeData.personalInfo.email) {
          doc.text('Email', 10, sidebarY);
          doc.text(resumeData.personalInfo.email, 10, sidebarY + 5);
          sidebarY += 15;
        }
        
        if (resumeData.personalInfo.phone) {
          doc.text('Phone', 10, sidebarY);
          doc.text(resumeData.personalInfo.phone, 10, sidebarY + 5);
          sidebarY += 15;
        }
        
        if (resumeData.personalInfo.location) {
          doc.text('Location', 10, sidebarY);
          doc.text(resumeData.personalInfo.location, 10, sidebarY + 5);
          sidebarY += 15;
        }
        
        if (resumeData.personalInfo.website) {
          doc.text('Website', 10, sidebarY);
          doc.text(resumeData.personalInfo.website, 10, sidebarY + 5);
          sidebarY += 15;
        }
        
        // Skills in sidebar
        if (resumeData.skills.length > 0) {
          sidebarY += 10;
          doc.text('SKILLS', 10, sidebarY);
          sidebarY += 8;
          
          resumeData.skills.forEach(skill => {
            doc.text(skill.name, 10, sidebarY);
            
            // Skill level dots
            for (let i = 0; i < 5; i++) {
              const dotX = 10 + (i * 4);
              if (i < skill.level) {
                doc.setFillColor('#ffffff');
              } else {
                doc.setFillColor('#aaaaaa');
              }
              doc.circle(dotX, sidebarY + 5, 1, 'F');
            }
            
            sidebarY += 12;
          });
        }
        
        // Main content
        const contentX = 70;
        let contentY = 30;
        
        // Summary
        if (resumeData.personalInfo.summary) {
          doc.setTextColor(primaryColor);
          doc.setFontSize(14);
          doc.text('ABOUT ME', contentX, contentY);
          contentY += 8;
          
          doc.setTextColor(textColor);
          doc.setFontSize(10);
          const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, pageWidth - contentX - margin);
          doc.text(summaryLines, contentX, contentY);
          contentY += (summaryLines.length * 5) + 15;
        }
        
        // Experience
        if (resumeData.experience.length > 0) {
          doc.setTextColor(primaryColor);
          doc.setFontSize(14);
          doc.text('EXPERIENCE', contentX, contentY);
          contentY += 8;
          
          resumeData.experience.forEach(exp => {
            doc.setFontSize(12);
            doc.setTextColor(textColor);
            doc.text(exp.position, contentX, contentY);
            contentY += 5;
            
            doc.setFontSize(10);
            doc.setTextColor(primaryColor);
            doc.text(exp.company, contentX, contentY);
            
            const dateText = exp.current 
              ? `${exp.startDate} - Present` 
              : `${exp.startDate} - ${exp.endDate}`;
            
            const dateWidth = doc.getTextWidth(dateText);
            doc.text(dateText, pageWidth - margin - dateWidth, contentY);
            contentY += 5;
            
            if (exp.description) {
              doc.setTextColor(textColor);
              const descLines = doc.splitTextToSize(exp.description, pageWidth - contentX - margin);
              doc.text(descLines, contentX, contentY);
              contentY += (descLines.length * 5);
            }
            
            contentY += 10;
          });
        }
        
        // Education
        if (resumeData.education.length > 0) {
          doc.setTextColor(primaryColor);
          doc.setFontSize(14);
          doc.text('EDUCATION', contentX, contentY);
          contentY += 8;
          
          resumeData.education.forEach(edu => {
            doc.setFontSize(12);
            doc.setTextColor(textColor);
            doc.text(edu.degree, contentX, contentY);
            contentY += 5;
            
            doc.setFontSize(10);
            doc.setTextColor(primaryColor);
            doc.text(edu.institution, contentX, contentY);
            
            const dateText = `${edu.startDate} - ${edu.endDate}`;
            const dateWidth = doc.getTextWidth(dateText);
            doc.text(dateText, pageWidth - margin - dateWidth, contentY);
            contentY += 5;
            
            if (edu.description) {
              doc.setTextColor(textColor);
              const descLines = doc.splitTextToSize(edu.description, pageWidth - contentX - margin);
              doc.text(descLines, contentX, contentY);
              contentY += (descLines.length * 5);
            }
            
            contentY += 10;
          });
        }
      }
      
      // Convert to base64 and set state
      const pdfData = doc.output('datauristring');
      setGeneratedPdf(pdfData);
      setIsGenerating(false);
      toast.success("Resume generated successfully!");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsGenerating(false);
      toast.error("Failed to generate resume. Please try again.");
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
                    {resumeData.skills.map((skill, index) => (
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