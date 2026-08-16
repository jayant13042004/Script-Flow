import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Sparkles, FileText, Check, AlertCircle, RefreshCw, Volume2 } from 'lucide-react';
import { Modal, Button, Textarea } from '../ui';
import { getAiService } from '../../services/ai';

interface VoiceScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (scriptText: string) => void;
}

export const VoiceScriptModal: React.FC<VoiceScriptModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [mode, setMode] = useState<'speech' | 'audio'>('speech');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [structuredScript, setStructuredScript] = useState('');
  const [isStructuring, setIsStructuring] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning/error:', event.error);
          if (event.error === 'network') {
            // Graceful fallback to Local Audio Dictation
            setMode('audio');
            setInfoMessage(
              'Live speech recognition network was unavailable. Switched to Audio Dictation mode — record your spoken thoughts or type below!'
            );
            setIsRecording(false);
          } else if (event.error !== 'no-speech') {
            setError(`Microphone notice: ${event.error}. You can still type or dictate your thoughts.`);
            setIsRecording(false);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        setMode('audio');
      }
    } else {
      setMode('audio');
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      setError('Microphone access denied. Please grant microphone permissions in your browser.');
    }
  };

  const stopMediaRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (!transcript.trim()) {
        setTranscript((prev) =>
          prev ? prev : `[Recorded Voice Note (${recordingSeconds}s)]: (Type or summarize your main spoken thoughts here to structure)`
        );
      }
    }
  };

  const toggleRecording = () => {
    setError(null);

    if (mode === 'speech' && recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        setTranscript('');
        setStructuredScript('');
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (err: any) {
          // Fallback to media recorder
          setMode('audio');
          startMediaRecording();
        }
      }
    } else {
      // Audio recorder mode
      if (isRecording) {
        stopMediaRecording();
      } else {
        startMediaRecording();
      }
    }
  };

  const handleStructureScript = async () => {
    if (!transcript.trim()) return;
    setIsStructuring(true);
    setError(null);

    try {
      const aiService = getAiService();
      const response = await aiService.improveText({
        selectedText: transcript,
        instruction:
          'Turn this raw spoken transcript/rambling into a clean, well-structured YouTube video script with Hook, Core Points, Visual Notes, and Call to Action.',
        fullScriptContext: '',
      });
      setStructuredScript(response.result);
    } catch (err: any) {
      setError(err.message || 'Failed to structure script with AI.');
    } finally {
      setIsStructuring(false);
    }
  };

  const handleInsert = () => {
    const textToInsert = structuredScript.trim() || transcript.trim();
    if (textToInsert) {
      onInsert(textToInsert);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Voice Mode Scriptwriter" size="lg">
      <div className="space-y-6">
        {infoMessage && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
            <Volume2 className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>{infoMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dictation Pulsing Button */}
        <div className="flex flex-col items-center justify-center p-6 bg-purple-50/50 rounded-2xl border border-purple-100 transition-all">
          <button
            onClick={toggleRecording}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isRecording
                ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg active:scale-95'
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-8 h-8" />}
          </button>
          
          <div className="mt-3 text-center">
            <p className="text-sm font-semibold text-gray-800">
              {isRecording
                ? mode === 'speech'
                  ? 'Listening in real-time... Speak naturally'
                  : `Recording audio (${recordingSeconds}s)... Click to finish`
                : 'Click to start speaking your thoughts'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Rambling, brainstorms, and raw ideas are welcome — Gemini will format it into a script.
            </p>
          </div>
        </div>

        {/* Raw Transcript / Brainstorm Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Spoken Thoughts & Transcript
            </label>
            <span className="text-xs text-gray-400">Editable</span>
          </div>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words appear here in real time... You can also type or paste thoughts here directly."
            rows={4}
          />
        </div>

        {/* Structured Script Preview */}
        {structuredScript && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <label className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Structured Video Script
            </label>
            <div className="text-sm text-gray-800 font-serif whitespace-pre-wrap max-h-48 overflow-y-auto pr-2 bg-white/80 p-3 rounded-lg border border-emerald-100">
              {structuredScript}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button
            variant="secondary"
            onClick={handleStructureScript}
            disabled={!transcript.trim() || isStructuring}
            isLoading={isStructuring}
            icon={<Sparkles className="w-4 h-4 text-purple-600" />}
          >
            Structure with AI
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              disabled={!transcript.trim() && !structuredScript.trim()}
              icon={<Check className="w-4 h-4" />}
            >
              Insert into Editor
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
