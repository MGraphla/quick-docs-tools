
import { useState } from "react";
import { Link, Copy, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ShortenedLink {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  clicks: number;
}

const LinkShortenerPage = () => {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortenedLinks, setShortenedLinks] = useState<ShortenedLink[]>([]);
  const [isShortening, setIsShortening] = useState(false);

  const generateShortCode = () => {
    return Math.random().toString(36).substring(2, 8);
  };

  const shortenUrl = async () => {
    if (!url.trim()) {
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
      originalUrl: url,
      shortUrl,
      createdAt: new Date().toISOString(),
      clicks: 0
    };
    
    setShortenedLinks(prev => [newLink, ...prev]);
    setUrl("");
    setCustomAlias("");
    setIsShortening(false);
    toast.success("URL shortened successfully!");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Link Shortener</h1>
        <p className="text-gray-600 mt-2">Shorten long URLs and track their performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Shorten URL
          </CardTitle>
          <CardDescription>
            Enter a long URL to create a shortened version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Long URL</Label>
            <Input
              placeholder="https://example.com/very-long-url-path"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Custom Alias (Optional)</Label>
            <Input
              placeholder="my-custom-link"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
            />
          </div>

          <Button onClick={shortenUrl} disabled={isShortening} className="w-full">
            {isShortening ? 'Shortening...' : 'Shorten URL'}
          </Button>
        </CardContent>
      </Card>

      {shortenedLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Shortened Links</CardTitle>
            <CardDescription>
              Manage and track your shortened URLs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shortenedLinks.map((link) => (
                <div key={link.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-blue-600">{link.shortUrl}</p>
                      <p className="text-sm text-gray-500 truncate">{link.originalUrl}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(link.shortUrl)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(link.shortUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Created: {new Date(link.createdAt).toLocaleDateString()}</span>
                    <span>Clicks: {link.clicks}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LinkShortenerPage;
