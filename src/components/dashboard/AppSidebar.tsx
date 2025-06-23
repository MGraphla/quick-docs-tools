
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
  ChevronRight,
  Minimize2,
  FileType
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const pdfTools = [
  { name: "Merge PDF", path: "/dashboard/merge-pdf", icon: FileText },
  { name: "Split PDF", path: "/dashboard/split-pdf", icon: Scissors },
  { name: "Compress PDF", path: "/dashboard/compress-pdf", icon: Minimize2 },
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
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfToolsOpen, setPdfToolsOpen] = useState(true);
  const [productivityToolsOpen, setProductivityToolsOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-72"} collapsible="icon">
      <SidebarHeader className="border-b bg-white/50 backdrop-blur-sm p-6">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                QuickDocs
              </span>
              <p className="text-xs text-gray-500 font-medium">Document Tools</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto">
            <FileText className="h-6 w-6 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-white/30 backdrop-blur-sm">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton 
                onClick={() => navigate('/dashboard')}
                isActive={isActive('/dashboard')}
                className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500 data-[active=true]:to-purple-600 data-[active=true]:text-white"
              >
                <div className="p-1.5 rounded-lg bg-blue-100 data-[active=true]:bg-white/20">
                  <Home className="h-4 w-4" />
                </div>
                {!isCollapsed && <span className="font-medium">Dashboard</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {!isCollapsed && (
          <>
            <SidebarGroup>
              <Collapsible open={pdfToolsOpen} onOpenChange={setPdfToolsOpen}>
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-blue-50 hover:text-blue-700 rounded-lg px-3 py-2 transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-red-100">
                        <FileText className="h-3 w-3 text-red-600" />
                      </div>
                      <span className="font-semibold">PDF Tools</span>
                    </div>
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
                            className="hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500 data-[active=true]:to-purple-600 data-[active=true]:text-white ml-2"
                          >
                            <div className="p-1.5 rounded-lg bg-gray-100 data-[active=true]:bg-white/20">
                              <tool.icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{tool.name}</span>
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
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-green-50 hover:text-green-700 rounded-lg px-3 py-2 transition-all duration-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded bg-green-100">
                        <QrCode className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="font-semibold">Productivity Tools</span>
                    </div>
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
                            className="hover:bg-green-50 hover:text-green-700 transition-all duration-200 data-[active=true]:bg-gradient-to-r data-[active=true]:from-green-500 data-[active=true]:to-teal-600 data-[active=true]:text-white ml-2"
                          >
                            <div className="p-1.5 rounded-lg bg-gray-100 data-[active=true]:bg-white/20">
                              <tool.icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium">{tool.name}</span>
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
