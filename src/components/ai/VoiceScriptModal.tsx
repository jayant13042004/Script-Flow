import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Sparkles, FileText, Check, AlertCircle } from 'lucide-react';
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
  const [transcript, setTranscript] = useState('');
  const [structuredScript, setStructuredScript] = useState('');
  const [isStructuring, setIsStructuring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
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
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setError(`Microphone error: ${event.error}`);
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    setError(null);
    if (!recognitionRef.current) {
      setError('Web Speech API is not supported in this browser. You can type or paste your spoken thoughts below.');
      return;
    }

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
        setError('Could not start recording. Please check microphone permissions.');
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
        instruction: 'Turn this raw spoken transcript/rambling into a clean, well-structured YouTube video script with Hook, Core Points, Visual Notes, and Call to Action.',
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
    <Modal isOpen={isOpen} onClose={onClose} title="Voice Mode Dictation" size="lg">
      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dictation Button */}
        <div className="flex flex-col items-center justify-center p-6 bg-purple-50/50 rounded-xl border border-purple-100">
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
          <p className="mt-3 text-sm font-medium text-gray-700">
            {isRecording ? 'Listening... Speak your ideas out loud naturally' : 'Click to start speaking your script'}
          </p>
        </div>

        {/* Raw Transcript */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Spoken Transcript
          </label>
          <Textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Your spoken words will appear here in real time... Or type/paste thoughts here."
            rows={3}
          />
        </div>

        {/* AI Structuring Output */}
        {structuredScript && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
            <label className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Structured Script Preview
            </label>
            <div className="text-sm text-gray-800 font-serif whitespace-pre-wrap max-h-48 overflow-y-auto pr-2">
              {structuredScript}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
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
