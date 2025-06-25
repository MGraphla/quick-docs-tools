
import { useRef } from "react";
import { FileText, Upload, Type, Square, Circle, Highlighter, ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

interface EditToolsSidebarProps {
  file: File | null;
  fileInfo: { size: string; pages: number } | null;
  currentPage: number;
  editTool: string;
  textInput: string;
  textColor: string;
  fontSize: number[];
  fontFamily: string;
  strokeWidth: number[];
  fillColor: string;
  opacity: number[];
  onEditToolChange: (tool: string) => void;
  onTextInputChange: (text: string) => void;
  onTextColorChange: (color: string) => void;
  onFontSizeChange: (size: number[]) => void;
  onFontFamilyChange: (family: string) => void;
  onStrokeWidthChange: (width: number[]) => void;
  onFillColorChange: (color: string) => void;
  onOpacityChange: (opacity: number[]) => void;
  onPageChange: (page: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditToolsSidebar = ({
  file,
  fileInfo,
  currentPage,
  editTool,
  textInput,
  textColor,
  fontSize,
  fontFamily,
  strokeWidth,
  fillColor,
  opacity,
  onEditToolChange,
  onTextInputChange,
  onTextColorChange,
  onFontSizeChange,
  onFontFamilyChange,
  onStrokeWidthChange,
  onFillColorChange,
  onOpacityChange,
  onPageChange,
  onImageUpload
}: EditToolsSidebarProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Info
          </CardTitle>
        </CardHeader>
        <CardContent>
          {file && fileInfo && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                  <FileText className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{fileInfo.pages} pages</span>
                    <span>•</span>
                    <span>{fileInfo.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Previous
                </Button>
                <div className="text-sm">
                  Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{fileInfo.pages}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= fileInfo.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editing Tools</CardTitle>
          <CardDescription>
            Choose a tool to edit your PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={editTool} onValueChange={onEditToolChange}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="shapes">Shapes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label>Text Content</Label>
                <Input
                  placeholder="Enter text to add"
                  value={textInput}
                  onChange={(e) => onTextInputChange(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select value={fontFamily} onValueChange={onFontFamilyChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Arial">Arial</SelectItem>
                    <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                    <SelectItem value="Courier New">Courier New</SelectItem>
                    <SelectItem value="Georgia">Georgia</SelectItem>
                    <SelectItem value="Verdana">Verdana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Font Size: {fontSize[0]}px</Label>
                <Slider
                  value={fontSize}
                  onValueChange={onFontSizeChange}
                  min={8}
                  max={72}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: textColor }}
                  />
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => onTextColorChange(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="shapes" className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={editTool === "rectangle" ? "default" : "outline"}
                  onClick={() => onEditToolChange("rectangle")}
                  className="flex flex-col gap-2 h-16"
                >
                  <Square className="h-5 w-5" />
                  <span className="text-xs">Rectangle</span>
                </Button>
                
                <Button
                  variant={editTool === "circle" ? "default" : "outline"}
                  onClick={() => onEditToolChange("circle")}
                  className="flex flex-col gap-2 h-16"
                >
                  <Circle className="h-5 w-5" />
                  <span className="text-xs">Circle</span>
                </Button>
                
                <Button
                  variant={editTool === "highlight" ? "default" : "outline"}
                  onClick={() => onEditToolChange("highlight")}
                  className="flex flex-col gap-2 h-16"
                >
                  <Highlighter className="h-5 w-5" />
                  <span className="text-xs">Highlight</span>
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Stroke Width: {strokeWidth[0]}px</Label>
                <Slider
                  value={strokeWidth}
                  onValueChange={onStrokeWidthChange}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Fill Color</Label>
                <div className="flex gap-2">
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: fillColor }}
                  />
                  <Input
                    type="color"
                    value={fillColor}
                    onChange={(e) => onFillColorChange(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Opacity: {opacity[0]}%</Label>
                <Slider
                  value={opacity}
                  onValueChange={onOpacityChange}
                  min={10}
                  max={100}
                  step={5}
                />
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditToolChange("image")}
              className={`w-full ${editTool === "image" ? "bg-blue-50 border-blue-300" : ""}`}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Image
            </Button>
            {editTool === "image" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => imageInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
