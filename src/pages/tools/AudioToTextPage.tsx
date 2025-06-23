
import { useState, useRef } from "react";
import { Upload, FileAudio, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const AudioToTextPage = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [transcript, setTranscript] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid audio file (MP3, WAV, M4A, OGG)");
        return;
      }
      setAudioFile(file);
      setTranscript("");
    }
  };

  const transcribeAudio = async () => {
    if (!audioFile) return;

    setTranscribing(true);
    setProgress(0);

    // Simulate transcription process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setProgress(i);
    }

    // Simulate transcribed text
    const sampleTranscript = `This is a sample transcription of your audio file "${audioFile.name}". In a real implementation, this would use a speech-to-text service like Whisper or similar technology to convert the audio content into text. The transcription would accurately capture the spoken words, including proper punctuation and formatting.`;
    
    setTranscript(sampleTranscript);
    setTranscribing(false);
    toast.success("Audio transcribed successfully!");
  };

  const downloadTranscript = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transcript-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const removeFile = () => {
    setAudioFile(null);
    setTranscript("");
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Audio to Text</h1>
        <p className="text-gray-600 mt-2">Convert audio files to text using AI transcription</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileAudio className="h-5 w-5" />
            Upload Audio File
          </CardTitle>
          <CardDescription>
            Supported formats: MP3, WAV, M4A, OGG
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!audioFile ? (
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Drop audio file here</h3>
              <p className="text-gray-600">or click to browse</p>
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
                  <FileAudio className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(audioFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={removeFile}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {transcribing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Transcribing audio...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              <Button 
                onClick={transcribeAudio} 
                disabled={transcribing}
                className="w-full"
              >
                {transcribing ? 'Transcribing...' : 'Start Transcription'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {transcript && (
        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Your audio has been converted to text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
              <p className="whitespace-pre-wrap">{transcript}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={downloadTranscript}>
                <Download className="h-4 w-4 mr-2" />
                Download as TXT
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigator.clipboard.writeText(transcript)}
              >
                Copy Text
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AudioToTextPage;
