import { useState, useRef, useEffect } from "react";
import { Upload, Download, Play, Pause, SkipBack, SkipForward, Scissors, Save, Music, Loader2, CheckCircle, AlertCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import WaveSurfer from 'wavesurfer.js';

interface TrimmedAudio {
  name: string;
  url: string;
  duration: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const AudioTrimmerPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState([75]);
  const [isMuted, setIsMuted] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [trimmedAudio, setTrimmedAudio] = useState<TrimmedAudio | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize WaveSurfer when component mounts
  useEffect(() => {
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);
  
  // Update audio element when volume or mute changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
      audioRef.current.muted = isMuted;
    }
    
    if (wavesurferRef.current) {
      wavesurferRef.current.setVolume(isMuted ? 0 : volume[0] / 100);
    }
  }, [volume, isMuted]);
  
  // Initialize end time when duration changes
  useEffect(() => {
    if (duration > 0 && endTime === 0) {
      setEndTime(duration);
    }
  }, [duration, endTime]);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    const selectedFile = selectedFiles[0];
    const validTypes = ['audio/mp3', 'audio/wav', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Please select a valid audio file (MP3, WAV, OGG, WEBM)");
      return;
    }
    
    // Clean up previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    // Clean up previous WaveSurfer instance
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }
    
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setAudioUrl(url);
    setTrimmedAudio(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setStartTime(0);
    setEndTime(0);
    
    // Create audio element to get duration
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      setDuration(audio.duration);
      setEndTime(audio.duration);
    };
    
    // Initialize WaveSurfer
    if (waveformRef.current) {
      const wavesurfer = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4f46e5',
        progressColor: '#818cf8',
        cursorColor: '#4338ca',
        barWidth: 2,
        barGap: 1,
        barRadius: 3,
        height: 100,
        normalize: true,
        responsive: true
      });
      
      wavesurfer.load(url);
      
      wavesurfer.on('ready', () => {
        wavesurferRef.current = wavesurfer;
        setDuration(wavesurfer.getDuration());
        setEndTime(wavesurfer.getDuration());
      });
      
      wavesurfer.on('audioprocess', () => {
        setCurrentTime(wavesurfer.getCurrentTime());
        
        // Stop playback if we reach the end time
        if (wavesurfer.getCurrentTime() >= endTime) {
          wavesurfer.pause();
          wavesurfer.seekTo(startTime / duration);
          setIsPlaying(false);
        }
      });
      
      wavesurfer.on('seek', () => {
        const currentTime = wavesurfer.getCurrentTime();
        setCurrentTime(currentTime);
        
        // If seeking outside the trim range, adjust to the range
        if (currentTime < startTime) {
          wavesurfer.seekTo(startTime / duration);
        } else if (currentTime > endTime) {
          wavesurfer.seekTo(endTime / duration);
        }
      });
    }
    
    toast.success(`Audio file "${selectedFile.name}" loaded successfully`);
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
    handleFileSelect(e.dataTransfer.files);
  };

  const togglePlayPause = () => {
    if (!wavesurferRef.current) return;
    
    if (isPlaying) {
      wavesurferRef.current.pause();
    } else {
      // If current time is outside trim range, seek to start
      if (currentTime < startTime || currentTime > endTime) {
        wavesurferRef.current.seekTo(startTime / duration);
      }
      wavesurferRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleStartTimeChange = (value: number[]) => {
    const newStartTime = value[0];
    if (newStartTime < endTime) {
      setStartTime(newStartTime);
      
      // Update waveform position if needed
      if (wavesurferRef.current && currentTime < newStartTime) {
        wavesurferRef.current.seekTo(newStartTime / duration);
      }
    }
  };

  const handleEndTimeChange = (value: number[]) => {
    const newEndTime = value[0];
    if (newEndTime > startTime) {
      setEndTime(newEndTime);
      
      // Update waveform position if needed
      if (wavesurferRef.current && currentTime > newEndTime) {
        wavesurferRef.current.seekTo(newEndTime / duration);
      }
    }
  };

  const trimAudio = async () => {
    if (!file || !audioUrl) {
      toast.error("Please select an audio file");
      return;
    }

    if (startTime >= endTime) {
      toast.error("Invalid trim range. End time must be greater than start time.");
      return;
    }

    setProcessing(true);
    setProgress(0);
    
    try {
      // Create an audio context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Fetch the audio file
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Calculate the trim points in samples
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const trimLength = endSample - startSample;
      
      // Create a new buffer for the trimmed audio
      const trimmedBuffer = audioContextRef.current.createBuffer(
        audioBuffer.numberOfChannels,
        trimLength,
        sampleRate
      );
      
      // Copy the trimmed portion of audio
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = new Float32Array(trimLength);
        audioBuffer.copyFromChannel(channelData, channel, startSample);
        trimmedBuffer.copyToChannel(channelData, channel, 0);
        
        // Update progress for each channel
        setProgress((channel + 1) / audioBuffer.numberOfChannels * 100);
      }
      
      // Convert the trimmed buffer to WAV format
      const offlineContext = new OfflineAudioContext(
        trimmedBuffer.numberOfChannels,
        trimmedBuffer.length,
        trimmedBuffer.sampleRate
      );
      
      const source = offlineContext.createBufferSource();
      source.buffer = trimmedBuffer;
      source.connect(offlineContext.destination);
      source.start();
      
      const renderedBuffer = await offlineContext.startRendering();
      
      // Convert to WAV
      const wavBlob = bufferToWave(renderedBuffer, 0, renderedBuffer.length);
      
      // Create a URL for the trimmed audio
      const trimmedUrl = URL.createObjectURL(wavBlob);
      
      // Set the trimmed audio
      setTrimmedAudio({
        name: `trimmed-${file.name}`,
        url: trimmedUrl,
        duration: trimmedBuffer.duration
      });
      
      toast.success("Audio trimmed successfully!");
    } catch (error) {
      console.error('Error trimming audio:', error);
      toast.error("Failed to trim audio. Please try again.");
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  };

  // Function to convert AudioBuffer to WAV Blob
  const bufferToWave = (abuffer: AudioBuffer, offset: number, len: number) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = len * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    const channels = [];
    let i, sample;
    let pos = 0;
    
    // Write WAVE header
    setUint32(view, pos, 0x46464952); // "RIFF"
    pos += 4;
    setUint32(view, pos, length - 8); // file length - 8
    pos += 4;
    setUint32(view, pos, 0x45564157); // "WAVE"
    pos += 4;
    setUint32(view, pos, 0x20746d66); // "fmt " chunk
    pos += 4;
    setUint32(view, pos, 16); // length = 16
    pos += 4;
    setUint16(view, pos, 1); // PCM (uncompressed)
    pos += 2;
    setUint16(view, pos, numOfChan);
    pos += 2;
    setUint32(view, pos, abuffer.sampleRate);
    pos += 4;
    setUint32(view, pos, abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    pos += 4;
    setUint16(view, pos, numOfChan * 2); // block-align
    pos += 2;
    setUint16(view, pos, 16); // 16-bit
    pos += 2;
    setUint32(view, pos, 0x61746164); // "data" - chunk
    pos += 4;
    setUint32(view, pos, len * numOfChan * 2); // chunk length
    pos += 4;
    
    // Write interleaved data
    for (i = 0; i < numOfChan; i++) {
      channels.push(abuffer.getChannelData(i));
    }
    
    while (pos < length) {
      for (i = 0; i < numOfChan; i++) {
        // Clamp the value to the 16-bit range
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        // Scale to 16-bit range
        sample = (sample < 0) ? sample * 32768 : sample * 32767;
        // Convert to int
        sample = Math.floor(sample);
        setInt16(view, pos, sample);
        pos += 2;
      }
      offset++;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  // Helper functions for writing data to DataView
  const setUint16 = (view: DataView, pos: number, val: number) => {
    view.setUint16(pos, val, true);
  };
  
  const setUint32 = (view: DataView, pos: number, val: number) => {
    view.setUint32(pos, val, true);
  };
  
  const setInt16 = (view: DataView, pos: number, val: number) => {
    view.setInt16(pos, val, true);
  };

  const downloadTrimmed = () => {
    if (!trimmedAudio) return;
    
    const link = document.createElement('a');
    link.href = trimmedAudio.url;
    link.download = trimmedAudio.name;
    link.click();
    toast.success(`Downloaded ${trimmedAudio.name}`);
  };

  const seekToStart = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.seekTo(startTime / duration);
    setCurrentTime(startTime);
  };

  const seekToEnd = () => {
    if (!wavesurferRef.current) return;
    wavesurferRef.current.seekTo(endTime / duration);
    setCurrentTime(endTime);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
          <Music className="h-4 w-4 mr-2" />
          Audio Trimmer
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Audio Trimmer</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Trim your audio files with precision using our waveform visualization tool
        </p>
      </div>

      {/* Upload Area */}
      {!file && (
        <Card className="border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-all duration-300">
          <CardContent className="p-8">
            <div
              className={`text-center transition-all duration-300 cursor-pointer ${
                dragOver ? 'scale-105 bg-indigo-50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mb-4 shadow-lg">
                  <Upload className="h-10 w-10 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Drop audio file here or click to browse
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                Select an audio file to trim (MP3, WAV, OGG, WEBM)
              </p>
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Upload className="h-5 w-5 mr-2" />
                Choose Audio File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audio Trimmer Interface */}
      {file && audioUrl && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Audio Waveform
                </CardTitle>
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
              </div>
              <CardDescription>
                Visualize and trim your audio file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg">
                  <Music className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 truncate">{file.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatTime(duration)}</span>
                    <span>•</span>
                    <span>{file.type.split('/')[1].toUpperCase()}</span>
                  </div>
                </div>
              </div>
              
              {/* Waveform */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div ref={waveformRef} className="w-full"></div>
                
                {/* Time indicators */}
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>0:00</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
              
              {/* Playback controls */}
              <div className="flex items-center justify-center gap-4">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={seekToStart}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                <Button 
                  variant="default" 
                  size="icon"
                  onClick={togglePlayPause}
                  className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={seekToEnd}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Trim controls */}
              <div className="space-y-6 border-t pt-6">
                <h3 className="font-medium text-lg flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-indigo-600" />
                  Trim Audio
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Start Time: {formatTime(startTime)}</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setStartTime(currentTime)}
                        className="h-6 text-xs"
                      >
                        Set to Current
                      </Button>
                    </div>
                    <Slider
                      value={[startTime]}
                      onValueChange={handleStartTimeChange}
                      max={duration}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>End Time: {formatTime(endTime)}</Label>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEndTime(currentTime)}
                        className="h-6 text-xs"
                      >
                        Set to Current
                      </Button>
                    </div>
                    <Slider
                      value={[endTime]}
                      onValueChange={handleEndTimeChange}
                      max={duration}
                      step={0.1}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="font-medium">Selected Duration:</span> {formatTime(endTime - startTime)}
                    </div>
                    <Button 
                      onClick={trimAudio}
                      disabled={processing || startTime >= endTime}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Scissors className="h-4 w-4 mr-2" />
                          Trim Audio
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Hidden audio element for playback */}
              <audio
                ref={audioRef}
                src={audioUrl}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Processing Progress */}
          {processing && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                    <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Processing Audio</h3>
                  <p className="text-gray-600 mb-4">
                    Trimming your audio file...
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={progress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trimmed Audio */}
          {trimmedAudio && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Trimmed Audio
                </CardTitle>
                <CardDescription>
                  Your audio has been trimmed successfully
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{trimmedAudio.name}</h4>
                      <p className="text-sm text-gray-500">Duration: {formatTime(trimmedAudio.duration)}</p>
                    </div>
                    <audio controls src={trimmedAudio.url} className="max-w-xs" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={downloadTrimmed}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Trimmed Audio
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}

      {/* Help Section */}
      {!file && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to trim audio:</strong> Upload an audio file, then use the waveform visualization to select the start and end points of the section you want to keep. You can play the audio to find the exact points, then click "Trim Audio" to create a new audio file with just the selected portion.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default AudioTrimmerPage;