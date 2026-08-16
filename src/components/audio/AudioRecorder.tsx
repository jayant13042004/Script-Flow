import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Volume2, Trash2 } from 'lucide-react';
import { Button } from '../ui';

interface AudioRecorderProps {
  onSaveAudio?: (audioUrl: string, name: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onSaveAudio }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        if (onSaveAudio) {
          onSaveAudio(url, `Recording ${new Date().toLocaleTimeString()}`);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Could not access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Volume2 className="w-4 h-4 text-amber-600" />
          <span>Voice Notes & Line Readings</span>
        </div>
        {isRecording && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            REC {formatTime(recordingTime)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isRecording ? (
          <Button
            size="sm"
            onClick={startRecording}
            icon={<Mic className="w-4 h-4 text-red-500" />}
            variant="secondary"
          >
            Record Voice
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={stopRecording}
            variant="danger"
            icon={<Square className="w-4 h-4" />}
          >
            Stop ({formatTime(recordingTime)})
          </Button>
        )}

        {audioUrl && !isRecording && (
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={togglePlayback}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <a
              href={audioUrl}
              download="line_reading.webm"
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
              title="Download recording"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={() => {
                setAudioUrl(null);
                setIsPlaying(false);
              }}
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
              title="Delete recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
