
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const LiveTranscriptionPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [liveText, setLiveText] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

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

        setTranscript(prev => prev + finalTranscript);
        setLiveText(interimTranscript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast.error("Speech recognition error. Please try again.");
        setIsRecording(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success("Recording started. Start speaking...");
      } else {
        toast.error("Speech recognition not supported in this browser");
      }
    } catch (error) {
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setLiveText("");
    toast.success("Recording stopped");
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `live-transcript-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearTranscript = () => {
    setTranscript("");
    setLiveText("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Live Transcription</h1>
        <p className="text-gray-600 mt-2">Real-time speech-to-text transcription</p>
      </div>

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
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`w-24 h-24 rounded-full ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? (
                <MicOff className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
            <p className="mt-4 text-sm text-gray-600">
              {isRecording ? "Recording... Click to stop" : "Click to start recording"}
            </p>
          </div>

          {isRecording && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-sm text-blue-800">
                🎤 Listening... Speak clearly into your microphone
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Transcript</CardTitle>
          <CardDescription>
            Your speech is being converted to text in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg min-h-32 max-h-64 overflow-y-auto">
            <p className="whitespace-pre-wrap">
              {transcript}
              {liveText && (
                <span className="text-gray-500 italic">{liveText}</span>
              )}
            </p>
            {!transcript && !liveText && (
              <p className="text-gray-400 italic">Your transcript will appear here...</p>
            )}
          </div>

          {transcript && (
            <div className="flex gap-2">
              <Button onClick={downloadTranscript}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigator.clipboard.writeText(transcript)}
              >
                Copy Text
              </Button>
              <Button variant="outline" onClick={clearTranscript}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveTranscriptionPage;
