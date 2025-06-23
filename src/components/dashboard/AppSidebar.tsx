
import { useState } from "react";
import { 
  FileText, 
  Scissors, 
  Archive, 
  FileDown, 
  FileUp, 
  Edit, 
  Image, 
  Shield, 
  Settings,
  QrCode,
  Link as LinkIcon,
  Mic,
  Signature,
  Home,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const pdfTools = [
  { name: "Merge PDF", path: "/dashboard/merge-pdf", icon: FileText },
  { name: "Split PDF", path: "/dashboard/split-pdf", icon: Scissors },
  { name: "Compress PDF", path: "/dashboard/compress-pdf", icon: Archive },
  { name: "PDF to Word", path: "/dashboard/pdf-to-word", icon: FileDown },
  { name: "PDF to PowerPoint", path: "/dashboard/pdf-to-powerpoint", icon: FileDown },
  { name: "PDF to Excel", path: "/dashboard/pdf-to-excel", icon: FileDown },
  { name: "Word to PDF", path: "/dashboard/word-to-pdf", icon: FileUp },
  { name: "PowerPoint to PDF", path: "/dashboard/powerpoint-to-pdf", icon: FileUp },
  { name: "Excel to PDF", path: "/dashboard/excel-to-pdf", icon: FileUp },
  { name: "Edit PDF", path: "/dashboard/edit-pdf", icon: Edit },
  { name: "PDF to JPG", path: "/dashboard/pdf-to-jpg", icon: Image },
  { name: "JPG to PDF", path: "/dashboard/jpg-to-pdf", icon: FileUp },
  { name: "Sign PDF", path: "/dashboard/sign-pdf", icon: Signature },
  { name: "Watermark", path: "/dashboard/watermark-pdf", icon: Shield },
  { name: "Rotate PDF", path: "/dashboard/rotate-pdf", icon: Settings },
  { name: "Protect PDF", path: "/dashboard/protect-pdf", icon: Shield },
];

const productivityTools = [
  { name: "QR Code Generator", path: "/dashboard/qr-generator", icon: QrCode },
  { name: "Link Shortener", path: "/dashboard/link-shortener", icon: LinkIcon },
  { name: "Audio to Text", path: "/dashboard/audio-to-text", icon: Mic },
  { name: "Live Transcription", path: "/dashboard/live-transcription", icon: Mic },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfToolsOpen, setPdfToolsOpen] = useState(true);
  const [productivityToolsOpen, setProductivityToolsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible>
      <SidebarHeader className="border-b p-4">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">QuickDocs</span>
          </div>
        )}
        {collapsed && (
          <FileText className="h-8 w-8 text-blue-600 mx-auto" />
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate('/dashboard')}
                isActive={isActive('/dashboard')}
              >
                <Home className="h-4 w-4" />
                {!collapsed && <span>Dashboard</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {!collapsed && (
          <>
            <SidebarGroup>
              <Collapsible open={pdfToolsOpen} onOpenChange={setPdfToolsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1">
                    <span>PDF Tools</span>
                    {pdfToolsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {pdfTools.map((tool) => (
                        <SidebarMenuItem key={tool.path}>
                          <SidebarMenuButton 
                            onClick={() => navigate(tool.path)}
                            isActive={isActive(tool.path)}
                          >
                            <tool.icon className="h-4 w-4" />
                            <span>{tool.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>

            <SidebarGroup>
              <Collapsible open={productivityToolsOpen} onOpenChange={setProductivityToolsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1">
                    <span>Productivity Tools</span>
                    {productivityToolsOpen ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {productivityTools.map((tool) => (
                        <SidebarMenuItem key={tool.path}>
                          <SidebarMenuButton 
                            onClick={() => navigate(tool.path)}
                            isActive={isActive(tool.path)}
                          >
                            <tool.icon className="h-4 w-4" />
                            <span>{tool.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
