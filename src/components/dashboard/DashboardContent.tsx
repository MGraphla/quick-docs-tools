
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  Star,
  ArrowRight,
  Zap,
  Users,
  BarChart3,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DashboardContent() {
  const navigate = useNavigate();

  const recentTools = [
    { name: "Merge PDF", lastUsed: "2 hours ago", count: 5, path: "/dashboard/merge-pdf" },
    { name: "PDF to Word", lastUsed: "1 day ago", count: 3, path: "/dashboard/pdf-to-word" },
    { name: "Compress PDF", lastUsed: "3 days ago", count: 2, path: "/dashboard/compress-pdf" },
  ];

  const popularTools = [
    { name: "Merge PDF", usage: "89%", path: "/dashboard/merge-pdf" },
    { name: "PDF to Word", usage: "76%", path: "/dashboard/pdf-to-word" },
    { name: "Split PDF", usage: "64%", path: "/dashboard/split-pdf" },
    { name: "Compress PDF", usage: "58%", path: "/dashboard/compress-pdf" },
  ];

  const quickActions = [
    { name: "Merge PDF", icon: FileText, path: "/dashboard/merge-pdf", color: "bg-blue-500" },
    { name: "Split PDF", icon: FileText, path: "/dashboard/split-pdf", color: "bg-green-500" },
    { name: "Compress", icon: FileText, path: "/dashboard/compress-pdf", color: "bg-purple-500" },
    { name: "PDF to Word", icon: FileText, path: "/dashboard/pdf-to-word", color: "bg-orange-500" },
    { name: "Sign PDF", icon: FileText, path: "/dashboard/sign-pdf", color: "bg-red-500" },
    { name: "QR Generator", icon: FileText, path: "/dashboard/qr-generator", color: "bg-teal-500" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-blue-100 text-lg mb-6">
            Ready to supercharge your document workflow? Let's get started.
          </p>
          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => navigate('/dashboard/merge-pdf')}
            >
              <Zap className="h-4 w-4 mr-2" />
              Quick Start
            </Button>
            <Button 
              variant="outline" 
              className="border-white/30 text-white hover:bg-white/10"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300 hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Documents</CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <FileText className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">47</div>
            <p className="text-xs text-blue-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300 hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Tools Used</CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <Activity className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">23</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +5 new this week
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300 hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Time Saved</CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">8.5h</div>
            <p className="text-xs text-purple-600">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300 hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Favorite Tool</CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <Star className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">Merge PDF</div>
            <p className="text-xs text-orange-600">
              Used 15 times
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Tools */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              Recently Used Tools
            </CardTitle>
            <CardDescription>
              Your most recent document processing activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{tool.name}</p>
                    <p className="text-sm text-muted-foreground">{tool.lastUsed}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">{tool.count}x</Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(tool.path)}
                      className="hover:bg-blue-50"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Tools */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              Popular Tools
            </CardTitle>
            <CardDescription>
              Most used tools across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularTools.map((tool, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium leading-none">{tool.name}</p>
                    <span className="text-sm text-muted-foreground">{tool.usage}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: tool.usage }}
                      ></div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(tool.path)}
                      className="hover:bg-green-50"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
            Quick Actions
          </CardTitle>
          <CardDescription>
            Jump straight into your most common tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action, index) => (
              <Button 
                key={index}
                variant="outline" 
                className="h-24 flex-col border-0 shadow-md hover:shadow-lg transition-all duration-300 hover-scale bg-white"
                onClick={() => navigate(action.path)}
              >
                <div className={`p-2 rounded-lg mb-2 ${action.color}`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs font-medium">{action.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
