import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Download, Trash2, Pause, Play, RefreshCw, Clock, Volume2, VolumeX, Clipboard, Check, FileText, Settings, Zap, RotateCcw, Save, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const LiveTranscriptionPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [punctuation, setPunctuation] = useState(true);
  const [speakerIdentification, setSpeakerIdentification] = useState(false);
  const [profanityFilter, setProfanityFilter] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [copied, setCopied] = useState(false);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [micVolume, setMicVolume] = useState(0);
  const [transcriptFormat, setTranscriptFormat] = useState("txt");
  const [transcriptTitle, setTranscriptTitle] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(prev => {
            // Apply punctuation if enabled
            let newText = finalTranscript;
            if (punctuation && prev.length > 0 && !prev.endsWith('.') && !prev.endsWith('!') && !prev.endsWith('?')) {
              newText = '. ' + newText;
            }
            
            // Apply profanity filter if enabled
            if (profanityFilter) {
              const profanityWords = ['damn', 'hell', 'crap', 'shit', 'fuck', 'ass'];
              profanityWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                newText = newText.replace(regex, '****');
              });
            }
            
            // Apply speaker identification if enabled
            if (speakerIdentification && prev.length > 0 && !prev.endsWith('\n\n')) {
              return prev + '\n\nSpeaker: ' + newText;
            }
            
            return prev + newText;
          });
        }
        
        setLiveText(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setMicPermission(false);
          toast.error("Microphone access denied. Please check your browser permissions.");
        } else {
          toast.error(`Speech recognition error: ${event.error}`);
        }
        stopRecording();
      };
    } else {
      toast.error("Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (volumeIntervalRef.current) {
        clearInterval(volumeIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [language, punctuation, profanityFilter, speakerIdentification, audioUrl]);

  // Update recognition language when language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      setupAudioAnalyser(stream);
      micStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error('Microphone permission error:', error);
      setMicPermission(false);
      toast.error("Could not access microphone. Please check your browser permissions.");
      return null;
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);
    
    analyserRef.current.fftSize = 256;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Monitor volume levels
    volumeIntervalRef.current = window.setInterval(() => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
        setMicVolume(average);
      }
    }, 100);
  };

  const startRecording = async () => {
    // Request microphone permission if not already granted
    if (micPermission !== true) {
      const stream = await requestMicrophonePermission();
      if (!stream) return;
    }
    
    try {
      if (!micStreamRef.current) {
        micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        setupAudioAnalyser(micStreamRef.current);
      }
      
      // Start media recorder
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(micStreamRef.current);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };
      
      mediaRecorderRef.current.start();
      
      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setIsRecording(true);
      setIsPaused(false);
      toast.success("Recording started. Start speaking...");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("Could not start recording. Please check your microphone permissions.");
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsPaused(true);
    toast.info("Recording paused");
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
    
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    setIsPaused(false);
    toast.info("Recording resumed");
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setLiveText("");
    toast.success("Recording stopped");
    
    // Auto-save if enabled
    if (autoSave && transcript) {
      setTimeout(() => {
        downloadTranscript();
      }, 1000);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const downloadTranscript = () => {
    if (!transcript) return;
    
    let content = transcript;
    let mimeType = 'text/plain';
    let extension = 'txt';
    
    // Format based on selected format
    if (transcriptFormat === 'txt') {
      // Plain text - already set
    } else if (transcriptFormat === 'docx') {
      // For demo purposes, we'll just use text but in reality would create a proper DOCX
      mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      extension = 'docx';
    } else if (transcriptFormat === 'srt') {
      // Create a simple SRT format
      const lines = transcript.split('\n');
      content = lines.map((line, i) => {
        return `${i+1}\n00:00:${(i*5).toString().padStart(2, '0')},000 --> 00:00:${(i*5+4).toString().padStart(2, '0')},000\n${line}\n`;
      }).join('\n');
      mimeType = 'text/srt';
      extension = 'srt';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript-${transcriptTitle || new Date().toISOString().slice(0, 10)}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Transcript downloaded as ${extension.toUpperCase()}`);
  };

  const downloadAudio = () => {
    if (!audioBlob) return;
    
    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording-${new Date().toISOString().slice(0, 10)}.wav`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Audio recording downloaded");
  };

  const copyTranscript = () => {
    if (!transcript) return;
    
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    toast.success("Transcript copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearTranscript = () => {
    setTranscript("");
    setLiveText("");
    toast.info("Transcript cleared");
  };

  const getVolumeBarHeight = (index: number) => {
    if (!isRecording || isPaused) return 4;
    
    const baseHeight = 4;
    const maxAdditionalHeight = 20;
    
    // Create a wave-like pattern based on index and current volume
    const normalizedVolume = micVolume / 255; // Normalize to 0-1
    const waveOffset = Math.sin(Date.now() / 200 + index) * 0.5 + 0.5; // Wave pattern
    
    return baseHeight + (normalizedVolume * maxAdditionalHeight * waveOffset);
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Mic className="h-4 w-4 mr-2" />
          Live Transcription
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Live Transcription</h1>
        <p className="text-gray-600 mt-2">Real-time speech-to-text conversion with advanced features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Recording Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice Recording
              </CardTitle>
              <CardDescription>
                Click the microphone to start real-time transcription
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <Button
                    onClick={isRecording ? (isPaused ? resumeRecording : pauseRecording) : startRecording}
                    size="lg"
                    className={`w-24 h-24 rounded-full ${
                      isRecording 
                        ? (isPaused 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : 'bg-red-500 hover:bg-red-600 animate-pulse') 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    }`}
                  >
                    {isRecording ? (
                      isPaused ? (
                        <Play className="h-8 w-8" />
                      ) : (
                        <Pause className="h-8 w-8" />
                      )
                    ) : (
                      <Mic className="h-8 w-8" />
                    )}
                  </Button>
                  
                  {/* Microphone volume indicator */}
                  {isRecording && !isPaused && (
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex items-end gap-0.5 h-6">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div 
                          key={i}
                          className="w-1 bg-green-500 rounded-full transition-all duration-100"
                          style={{ height: `${getVolumeBarHeight(i)}px` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                
                {isRecording && (
                  <div className="mt-8 flex flex-col items-center">
                    <div className="text-2xl font-bold text-red-500 mb-2">
                      {formatTime(recordingTime)}
                    </div>
                    <Badge variant={isPaused ? "outline" : "default"} className={isPaused ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                      {isPaused ? "Paused" : "Recording"}
                    </Badge>
                  </div>
                )}
                
                {isRecording && (
                  <Button 
                    variant="outline" 
                    onClick={stopRecording}
                    className="mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                {!isRecording && micPermission === false && (
                  <Alert className="mt-4 bg-red-50 border-red-200">
                    <AlertDescription className="text-red-800">
                      Microphone access denied. Please check your browser permissions and reload the page.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {isRecording && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-sm text-blue-800">
                    🎤 Listening... Speak clearly into your microphone. Your speech will be transcribed in real-time.
                  </p>
                </div>
              )}
              
              {audioUrl && !isRecording && (
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-medium">Recorded Audio</h3>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={togglePlayback}
                        className="h-8 w-8 p-0"
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={downloadAudio}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full"
                    controls
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Transcription Settings
              </CardTitle>
              <CardDescription>
                Configure your transcription preferences
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
              
              <Separator />
              
              <div className="space-y-4">
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
                    <Label htmlFor="speaker-identification">Speaker Identification</Label>
                    <p className="text-xs text-gray-500">Identify different speakers</p>
                  </div>
                  <Switch
                    id="speaker-identification"
                    checked={speakerIdentification}
                    onCheckedChange={setSpeakerIdentification}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profanity-filter">Profanity Filter</Label>
                    <p className="text-xs text-gray-500">Censor explicit language</p>
                  </div>
                  <Switch
                    id="profanity-filter"
                    checked={profanityFilter}
                    onCheckedChange={setProfanityFilter}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto-Save Transcript</Label>
                    <p className="text-xs text-gray-500">Save transcript when recording stops</p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Transcript */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="min-h-[400px] flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Live Transcript
                </CardTitle>
                {isRecording && !isPaused && (
                  <Badge className="bg-red-100 text-red-800 animate-pulse">
                    Recording
                  </Badge>
                )}
              </div>
              <CardDescription>
                Your speech is being converted to text in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="bg-gray-50 p-4 rounded-lg min-h-[300px] max-h-[500px] overflow-y-auto">
                {transcript || liveText ? (
                  <p className="whitespace-pre-wrap">
                    {transcript}
                    {liveText && (
                      <span className="text-gray-500 italic">{liveText}</span>
                    )}
                  </p>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <Mic className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">
                      {isRecording 
                        ? "Start speaking to see your transcript appear here..." 
                        : "Click the microphone button to start recording"}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <div className="w-full space-y-4">
                {transcript && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={copyTranscript}
                        className="flex-1"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-green-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Clipboard className="h-4 w-4 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearTranscript}
                        className="flex-1"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Clear
                      </Button>
                      
                      <Select value={transcriptFormat} onValueChange={setTranscriptFormat}>
                        <SelectTrigger className="w-24 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="txt">TXT</SelectItem>
                          <SelectItem value="docx">DOCX</SelectItem>
                          <SelectItem value="srt">SRT</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={downloadTranscript}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Transcript title (optional)"
                        value={transcriptTitle}
                        onChange={(e) => setTranscriptTitle(e.target.value)}
                        className="flex-1 h-9 text-sm"
                      />
                      <Button variant="ghost" size="sm" className="h-9">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-9">
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Transcription Features</CardTitle>
              <CardDescription>
                Our real-time transcription offers powerful capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <h3 className="font-medium">Real-Time</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    See your speech converted to text instantly as you speak
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Globe className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Multi-Language</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Support for 50+ languages with accurate transcription
                  </p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Download className="h-5 w-5 text-purple-600" />
                    </div>
                    <h3 className="font-medium">Export Options</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Download your transcript in multiple formats
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

// Add missing Globe component
function Globe(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export default LiveTranscriptionPage;