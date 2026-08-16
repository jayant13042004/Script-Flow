import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Sparkles, FileText, Check, AlertCircle, Volume2, Loader2, RefreshCw } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [structuredScript, setStructuredScript] = useState('');
  const [isStructuring, setIsStructuring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    setError(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        await processAudioWithAI(audioBlob, mimeType);
      };

      recorder.start(500); // 500ms chunks
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone error:', err);
      setError('Could not access microphone. Please allow microphone access in your browser.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (timerRef.current) clearInterval(timerRef.current);
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAudioWithAI = async (audioBlob: Blob, mimeType: string) => {
    setIsTranscribing(true);
    setError(null);

    try {
      const base64 = await blobToBase64(audioBlob);
      const aiService = getAiService();

      if (aiService.transcribeAudio) {
        const response = await aiService.transcribeAudio({
          audioBase64: base64,
          mimeType,
        });

        if (response.transcript) {
          setTranscript(response.transcript);
        }
        if (response.structuredScript) {
          setStructuredScript(response.structuredScript);
        }
      } else {
        // Fallback
        setTranscript('Audio recorded successfully. Click "Structure with AI" below.');
      }
    } catch (err: any) {
      console.warn('AI transcription error:', err);
      setError('Could not transcribe audio. You can type or paste your spoken ideas directly below.');
    } finally {
      setIsTranscribing(false);
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
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Big Dictation Button */}
        <div className="flex flex-col items-center justify-center p-6 bg-purple-50/50 rounded-2xl border border-purple-100 transition-all">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isTranscribing}
            className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
              isRecording
                ? 'bg-red-600 text-white shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse'
                : isTranscribing
                ? 'bg-purple-300 text-white cursor-wait'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg active:scale-95'
            }`}
          >
            {isTranscribing ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : isRecording ? (
              <Square className="w-8 h-8 fill-current" />
            ) : (
              <Mic className="w-8 h-8" />
            )}
          </button>

          <div className="mt-3 text-center">
            <p className="text-sm font-semibold text-gray-800">
              {isTranscribing
                ? 'Transcribing & Structuring your voice with AI...'
                : isRecording
                ? `Recording voice (${recordingSeconds}s)... Click to stop & transcribe`
                : 'Click microphone to speak your thoughts'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Speak naturally — Gemini listens to your audio and types the transcript & script.
            </p>
          </div>
        </div>

        {/* Spoken Thoughts & Transcript */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" /> Spoken Transcript
            </label>
            <span className="text-xs text-gray-400">Editable</span>
          </div>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will appear here... You can also type or paste your thoughts directly."
            rows={4}
          />
        </div>

        {/* AI Structured Script Output */}
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

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button
            variant="secondary"
            onClick={handleStructureScript}
            disabled={!transcript.trim() || isStructuring || isTranscribing}
            isLoading={isStructuring}
            icon={<Sparkles className="w-4 h-4 text-purple-600" />}
          >
            Re-structure with AI
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleInsert}
              disabled={(!transcript.trim() && !structuredScript.trim()) || isTranscribing}
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
