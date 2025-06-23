import { useState, useEffect } from "react";
import { Link, Copy, ExternalLink, QrCode, BarChart2, Clock, Clipboard, Check, RefreshCw, Trash2, Edit, Share2, Globe, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
  lastClicked?: string;
  title?: string;
  customAlias?: string;
  qrCode?: string;
  tags?: string[];
  analytics?: {
    browsers: Record<string, number>;
    countries: Record<string, number>;
    referrers: Record<string, number>;
    devices: Record<string, number>;
  };
}

const LinkShortenerPage = () => {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  const [shortenedLinks, setShortenedLinks] = useState<ShortenedLink[]>([]);
  const [isShortening, setIsShortening] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ShortenedLink | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [expiryDate, setExpiryDate] = useState("");
  const [password, setPassword] = useState("");
  const [utmParams, setUtmParams] = useState({
    source: "",
    medium: "",
    campaign: ""
  });
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [generateQr, setGenerateQr] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const shortenUrl = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch (e) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsShortening(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const shortCode = customAlias || generateShortCode();
    const shortUrl = `https://qd.ly/${shortCode}`;
    
    const newLink: ShortenedLink = {
      id: Date.now().toString(),
      originalUrl: url.startsWith('http') ? url : `https://${url}`,
      shortUrl,
      createdAt: new Date().toISOString(),
      clicks: 0,
      title: title || url.replace(/^https?:\/\//, '').split('/')[0],
      customAlias: customAlias || undefined,
      qrCode: generateQr ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shortUrl)}` : undefined,
      tags: tags.length > 0 ? [...tags] : undefined,
      analytics: {
        browsers: { "Chrome": 0, "Firefox": 0, "Safari": 0, "Other": 0 },
        countries: { "United States": 0, "United Kingdom": 0, "Canada": 0, "Other": 0 },
        referrers: { "Direct": 0, "Google": 0, "Twitter": 0, "Other": 0 },
        devices: { "Desktop": 0, "Mobile": 0, "Tablet": 0 }
      }
    };
    
    if (isEditing && selectedLink) {
      // Update existing link
      setShortenedLinks(prev => prev.map(link => 
        link.id === selectedLink.id ? { ...newLink, id: link.id, clicks: link.clicks, createdAt: link.createdAt } : link
      ));
      setIsEditing(false);
      setSelectedLink(null);
      toast.success("Link updated successfully!");
    } else {
      // Add new link
      setShortenedLinks(prev => [newLink, ...prev]);
      toast.success("URL shortened successfully!");
    }
    
    setUrl("");
    setCustomAlias("");
    setTitle("");
    setTags([]);
    setIsAdvancedOpen(false);
    setIsShortening(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
  };

  const deleteLink = (id: string) => {
    setShortenedLinks(prev => prev.filter(link => link.id !== id));
    toast.success("Link deleted successfully");
  };

  const editLink = (link: ShortenedLink) => {
    setSelectedLink(link);
    setUrl(link.originalUrl);
    setCustomAlias(link.customAlias || "");
    setTitle(link.title || "");
    setTags(link.tags || []);
    setIsEditing(true);
    setIsAdvancedOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const filteredLinks = shortenedLinks.filter(link => {
    if (activeTab === "all") return true;
    if (activeTab === "recent") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(link.createdAt) >= oneWeekAgo;
    }
    if (activeTab === "popular") return link.clicks > 5;
    if (activeTab === "tagged") return link.tags && link.tags.length > 0;
    return true;
  }).filter(link => {
    if (!searchTerm) return true;
    return (
      link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.shortUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.title && link.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (link.tags && link.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );
  });

  const resetForm = () => {
    setUrl("");
    setCustomAlias("");
    setTitle("");
    setTags([]);
    setIsAdvancedOpen(false);
    setIsEditing(false);
    setSelectedLink(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Link className="h-4 w-4 mr-2" />
          Link Shortener
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Link Shortener</h1>
        <p className="text-gray-600 mt-2">Create short, memorable links with advanced tracking and analytics</p>
      </div>

      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Edit className="h-5 w-5 text-blue-600" />
                Edit Link
              </>
            ) : (
              <>
                <Link className="h-5 w-5 text-blue-600" />
                Shorten URL
              </>
            )}
          </CardTitle>
          <CardDescription>
            {isEditing 
              ? "Update your shortened link details" 
              : "Enter a long URL to create a shortened version"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Long URL</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="https://example.com/very-long-url-path"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
              {isEditing && (
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Custom Alias (Optional)</Label>
              <Badge variant="outline" className="text-xs">qd.ly/your-alias</Badge>
            </div>
            <Input
              placeholder="my-custom-link"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Leave blank to generate a random short code
            </p>
          </div>

          <div className="space-y-2">
            <Label>Link Title (Optional)</Label>
            <Input
              placeholder="My Awesome Link"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isAdvancedOpen ? "Hide Advanced Options" : "Show Advanced Options"}
            </Button>
            
            <div className="flex items-center gap-2">
              <Label htmlFor="generate-qr" className="text-sm">Generate QR Code</Label>
              <Switch
                id="generate-qr"
                checked={generateQr}
                onCheckedChange={setGenerateQr}
              />
            </div>
          </div>

          {isAdvancedOpen && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg mt-2">
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={addTag} disabled={!newTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button 
                          onClick={() => removeTag(tag)}
                          className="ml-1 h-3 w-3 rounded-full bg-gray-400 text-white flex items-center justify-center hover:bg-gray-500"
                        >
                          <span className="sr-only">Remove</span>
                          <Trash2 className="h-2 w-2" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Expiry Date (Optional)</Label>
                  <Input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password Protection (Optional)</Label>
                  <Input
                    type="password"
                    placeholder="Set a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>UTM Parameters (Optional)</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="utm_source"
                    value={utmParams.source}
                    onChange={(e) => setUtmParams({...utmParams, source: e.target.value})}
                  />
                  <Input
                    placeholder="utm_medium"
                    value={utmParams.medium}
                    onChange={(e) => setUtmParams({...utmParams, medium: e.target.value})}
                  />
                  <Input
                    placeholder="utm_campaign"
                    value={utmParams.campaign}
                    onChange={(e) => setUtmParams({...utmParams, campaign: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="private-link"
                  checked={isPrivate}
                  onCheckedChange={setIsPrivate}
                />
                <Label htmlFor="private-link">Private Link (only visible to you)</Label>
              </div>
            </div>
          )}

          <Button 
            onClick={shortenUrl} 
            disabled={isShortening || !url.trim()} 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isShortening ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                {isEditing ? "Updating..." : "Shortening..."}
              </>
            ) : (
              <>
                {isEditing ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Link
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Shorten URL
                  </>
                )}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {shortenedLinks.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Your Shortened Links</CardTitle>
                <CardDescription>
                  Manage and track your shortened URLs
                </CardDescription>
              </div>
              <div className="flex-1 md:max-w-xs">
                <Input
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All Links</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="tagged">Tagged</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            {filteredLinks.length === 0 ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Link className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No links found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "Try a different search term" 
                    : "Your shortened links will appear here"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLinks.map((link) => (
                  <Card key={link.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                              {link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}
                            </Badge>
                            {link.tags && link.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="bg-gray-100">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created {new Date(link.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-lg text-gray-900 mb-1">
                          {link.title || link.originalUrl.replace(/^https?:\/\//, '').split('/')[0]}
                        </h3>
                        
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-500 truncate">{link.originalUrl}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 px-2 text-gray-500"
                              onClick={() => window.open(link.originalUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              <span className="text-xs">Original</span>
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                              {link.shortUrl}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={() => copyToClipboard(link.shortUrl, link.id)}
                            >
                              {copied === link.id ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              onClick={() => window.open(link.shortUrl, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              <span className="text-xs">Visit</span>
                            </Button>
                            
                            {link.qrCode && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7"
                                onClick={() => window.open(link.qrCode, '_blank')}
                              >
                                <QrCode className="h-3 w-3 mr-1" />
                                <span className="text-xs">QR</span>
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7"
                              onClick={() => editLink(link)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              <span className="text-xs">Edit</span>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteLink(link.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              <span className="text-xs">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {link.analytics && (
                        <div className="border-t p-3 bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            <div>
                              <p className="text-gray-500 mb-1">Top Browsers</p>
                              <div className="flex items-center justify-between">
                                <span>Chrome</span>
                                <span className="font-medium">{link.analytics.browsers.Chrome}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Top Countries</p>
                              <div className="flex items-center justify-between">
                                <span>United States</span>
                                <span className="font-medium">{link.analytics.countries["United States"]}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Top Referrers</p>
                              <div className="flex items-center justify-between">
                                <span>Direct</span>
                                <span className="font-medium">{link.analytics.referrers.Direct}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Devices</p>
                              <div className="flex items-center justify-between">
                                <span>Desktop</span>
                                <span className="font-medium">{link.analytics.devices.Desktop}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {shortenedLinks.length === 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <Link className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Getting Started with Link Shortener</h3>
              <AlertDescription className="text-blue-700">
                Enter a long URL above to create a shortened version. You can customize your short link with a custom alias, add tags for organization, and track click analytics. All shortened links include QR codes for easy sharing.
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default LinkShortenerPage;