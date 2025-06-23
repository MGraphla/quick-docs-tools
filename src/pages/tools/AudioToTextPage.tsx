import { useState, useRef, useEffect } from "react";
import { Upload, FileAudio, Download, Trash2, Play, Pause, RefreshCw, Clock, Volume2, VolumeX, Clipboard, Check, Mic, FileText, Settings, Zap, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AudioToTextPage = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [model, setModel] = useState("standard");
  const [speakerIdentification, setSpeakerIdentification] = useState(false);
  const [punctuation, setPunctuation] = useState(true);
  const [timestamps, setTimestamps] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleAudioFile(file);
    }
  };

  const handleAudioFile = (file: File) => {
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/m4a', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid audio file (MP3, WAV, M4A, OGG, WEBM)");
      return;
    }
    
    // Clean up previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setTranscript("");
    setProgress(0);
    
    // Reset audio player
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Get audio duration
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
    };
    
    toast.success(`Audio file "${file.name}" loaded successfully`);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleAudioFile(file);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const transcribeAudio = async () => {
    if (!audioFile) return;

    setTranscribing(true);
    setProgress(0);

    // Simulate transcription process with realistic progress
    progressIntervalRef.current = window.setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressIntervalRef.current as number);
          return prev;
        }
        return prev + (Math.random() * 5);
      });
    }, 300);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Generate a realistic transcript based on the model and settings
    let sampleTranscript = "";
    
    if (model === "standard") {
      sampleTranscript = `This is a sample transcription of your audio file "${audioFile.name}". In a real implementation, this would use a speech-to-text service to convert the audio content into text. The transcription would capture the spoken words with basic accuracy.`;
    } else if (model === "enhanced") {
      sampleTranscript = `This is an enhanced transcription of your audio file "${audioFile.name}". In a real implementation, this would use an advanced speech-to-text service to convert the audio content into text with high accuracy. The transcription would capture the spoken words, including proper punctuation and formatting.`;
    } else if (model === "premium") {
      sampleTranscript = `This is a premium transcription of your audio file "${audioFile.name}". In a real implementation, this would use a state-of-the-art speech-to-text service to convert the audio content into text with exceptional accuracy. The transcription would capture the spoken words with precise punctuation, formatting, and context awareness.`;
    }
    
    if (speakerIdentification) {
      sampleTranscript = `Speaker 1: Hello and welcome to this demonstration.\n\nSpeaker 2: Thank you for having me today.\n\nSpeaker 1: ${sampleTranscript.split('.')[0]}.\n\nSpeaker 2: ${sampleTranscript.split('.')[1] || "That's correct."}\n\nSpeaker 1: ${sampleTranscript.split('.')[2] || "Exactly."}`;
    }
    
    if (timestamps) {
      sampleTranscript = `[00:00:01] ${sampleTranscript.split('.')[0]}.\n\n[00:00:15] ${sampleTranscript.split('.')[1] || "The next part of the transcription would continue here."}\n\n[00:00:32] ${sampleTranscript.split('.')[2] || "And the transcription continues with timestamps."}`;
    }
    
    if (!punctuation) {
      sampleTranscript = sampleTranscript.replace(/[.,;:!?]/g, '');
    }
    
    setProgress(100);
    setTranscript(sampleTranscript);
    setTranscribing(false);
    toast.success("Audio transcribed successfully!");
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript-${audioFile?.name || Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Transcript downloaded successfully");
  };

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    toast.success("Transcript copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const removeFile = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioFile(null);
    setAudioUrl(null);
    setTranscript("");
    setProgress(0);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Audio file removed");
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <FileAudio className="h-4 w-4 mr-2" />
          Audio to Text Converter
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Audio to Text</h1>
        <p className="text-gray-600 mt-2">Convert audio files to text using advanced AI transcription</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Upload and Settings */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" />
                Upload Audio File
              </CardTitle>
              <CardDescription>
                Supported formats: MP3, WAV, M4A, OGG, WEBM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!audioFile ? (
                <div 
                  className={`border-2 border-dashed ${dragOver ? 'border-purple-400 bg-purple-50' : 'border-gray-300'} rounded-lg p-8 text-center hover:border-purple-400 transition-colors cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="mb-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Drop audio file here</h3>
                  <p className="text-gray-600 mb-4">or click to browse</p>
                  <p className="text-xs text-gray-500">Maximum file size: 500MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileAudio className="h-8 w-8 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">{audioFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(audioFile.size / 1024 / 1024).toFixed(2)} MB • {formatTime(duration)}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeFile} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {audioUrl && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={togglePlayPause}
                          className="p-1 h-8 w-8"
                        >
                          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{formatTime(currentTime)}</span>
                          <span className="text-xs text-gray-400">/</span>
                          <span className="text-xs text-gray-500">{formatTime(duration)}</span>
                        </div>
                      </div>
                      
                      <input
                        type="range"
                        min="0"
                        max={duration || 0}
                        step="0.01"
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={toggleMute}
                          className="p-1 h-8 w-8"
                        >
                          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                        </Button>
                        <Slider
                          value={volume}
                          onValueChange={setVolume}
                          max={100}
                          step={1}
                          className="w-24"
                        />
                      </div>
                      
                      <audio
                        ref={audioRef}
                        src={audioUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                        onLoadedMetadata={() => {
                          if (audioRef.current) {
                            setDuration(audioRef.current.duration);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {audioFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Transcription Settings
                </CardTitle>
                <CardDescription>
                  Configure how your audio should be transcribed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                      <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                      <SelectItem value="ja-JP">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Transcription Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (Free)</SelectItem>
                      <SelectItem value="enhanced">Enhanced (Paid)</SelectItem>
                      <SelectItem value="premium">Premium (Paid)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Premium models offer higher accuracy and better handling of accents and background noise
                  </p>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="speaker-identification">Speaker Identification</Label>
                      <p className="text-xs text-gray-500">Identify different speakers in the audio</p>
                    </div>
                    <Switch
                      id="speaker-identification"
                      checked={speakerIdentification}
                      onCheckedChange={setSpeakerIdentification}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="punctuation">Auto Punctuation</Label>
                      <p className="text-xs text-gray-500">Add punctuation to the transcript</p>
                    </div>
                    <Switch
                      id="punctuation"
                      checked={punctuation}
                      onCheckedChange={setPunctuation}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="timestamps">Word Timestamps</Label>
                      <p className="text-xs text-gray-500">Add timestamps to the transcript</p>
                    </div>
                    <Switch
                      id="timestamps"
                      checked={timestamps}
                      onCheckedChange={setTimestamps}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={transcribeAudio} 
                  disabled={transcribing || !audioFile}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  {transcribing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Transcribing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Start Transcription
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Transcription Results */}
        <div className="lg:col-span-3 space-y-6">
          {transcribing && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <RefreshCw className="h-8 w-8 text-purple-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Transcribing Audio</h3>
                  <p className="text-gray-600 mb-4">
                    Our AI is converting your audio to text. This may take a few minutes depending on the file size.
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {transcript && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Transcript
                  </CardTitle>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {model === "standard" ? "Standard" : model === "enhanced" ? "Enhanced" : "Premium"}
                  </Badge>
                </div>
                <CardDescription>
                  Your audio has been converted to text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <p className="whitespace-pre-wrap">{transcript}</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-3">
                <Button onClick={downloadTranscript} className="sm:flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download as TXT
                </Button>
                <Button 
                  variant="outline" 
                  onClick={copyTranscript}
                  className="sm:flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4 mr-2" />
                      Copy Text
                    </>
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setTranscript("")}
                  className="sm:flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Transcript
                </Button>
              </CardFooter>
            </Card>
          )}

          {!transcript && !transcribing && (
            <Card>
              <CardHeader>
                <CardTitle>Transcription Results</CardTitle>
                <CardDescription>
                  Your transcript will appear here after processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transcript Yet</h3>
                  <p className="text-gray-500 max-w-md">
                    {audioFile 
                      ? "Click 'Start Transcription' to convert your audio to text" 
                      : "Upload an audio file to get started with transcription"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Transcription Features</CardTitle>
              <CardDescription>
                Our audio to text converter offers powerful features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Mic className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-medium">Multiple Languages</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Support for 50+ languages with accurate transcription
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Timestamps</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Add word-level or paragraph timestamps to your transcript
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-medium">Speaker Detection</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Automatically identify different speakers in your audio
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Add missing Users component
function Users(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export default AudioToTextPage;