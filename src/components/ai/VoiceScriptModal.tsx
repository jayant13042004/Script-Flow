import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Square, Sparkles, FileText, Check, AlertCircle,
  Wand2, AlignLeft, RefreshCw, Copy, Flame, Volume2
} from 'lucide-react';
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
  const [isListening, setIsListening] = useState(false);
  const [listeningSeconds, setListeningSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  
  // Output tabs / versions
  const [activeTab, setActiveTab] = useState<'raw' | 'structured' | 'converted'>('raw');
  const [structuredText, setStructuredText] = useState('');
  const [convertedScript, setConvertedScript] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processType, setProcessType] = useState<'structure' | 'convert' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const transcriptRef = useRef<string>('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync ref
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = () => {
    setError(null);
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Live speech recognition is not supported in this browser. You can type or paste your spoken thoughts below.');
      return;
    }

    isListeningRef.current = true;
    setIsListening(true);
    setListeningSeconds(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setListeningSeconds((prev) => prev + 1);
    }, 1000);

    const initRecognition = () => {
      if (!isListeningRef.current) return;

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let sessionPrefix = transcriptRef.current ? transcriptRef.current.trim() + ' ' : '';

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = 0; i < event.results.length; i++) {
            currentSessionText += event.results[i][0].transcript + ' ';
          }
          const fullText = (sessionPrefix + currentSessionText).trim();
          setTranscript(fullText);
          transcriptRef.current = fullText;
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event notice:', event.error);
          if (event.error === 'not-allowed') {
            setError('Microphone access was denied. Please allow microphone permissions in your browser.');
            stopListening();
          }
        };

        recognition.onend = () => {
          // If the user hasn't explicitly clicked stop, auto-restart to keep listening continuously
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch (e) {
              // Retry on minor engine reset
              setTimeout(() => {
                if (isListeningRef.current) initRecognition();
              }, 200);
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err: any) {
        console.error('Speech recognition start error:', err);
        setError('Could not start microphone. You can type your thoughts directly.');
        stopListening();
      }
    };

    initRecognition();
  };

  const stopListening = () => {
    isListeningRef.current = false;
    setIsListening(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
  };

  // Option 1: Structure with Gemini (Keeps exact words, only formats into clean readable structure)
  const handleStructureWithGemini = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setProcessType('structure');
    setError(null);

    try {
      const aiService = getAiService();
      const response = await aiService.improveText({
        selectedText: transcript,
        instruction:
          'Format and structure this spoken transcript with proper punctuation, clean paragraph breaks, bold headings, and bullet points. IMPORTANT: DO NOT rewrite or change the creator’s words or ideas. Only improve formatting and readability.',
        fullScriptContext: '',
      });
      setStructuredText(response.result);
      setActiveTab('structured');
    } catch (err: any) {
      setError(err.message || 'Failed to structure with AI.');
    } finally {
      setIsProcessing(false);
      setProcessType(null);
    }
  };

  // Option 2: Convert to Script with Gemini (Polishes, rewrites, and crafts into a high-retention video script)
  const handleConvertWithGemini = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);
    setProcessType('convert');
    setError(null);

    try {
      const aiService = getAiService();
      const response = await aiService.improveText({
        selectedText: transcript,
        instruction:
          'Transform these raw spoken thoughts into a high-retention, engaging video script. Include an irresistible opening hook, clear value delivery with visual cues, and a strong call-to-action.',
        fullScriptContext: '',
      });
      setConvertedScript(response.result);
      setActiveTab('converted');
    } catch (err: any) {
      setError(err.message || 'Failed to convert to script with AI.');
    } finally {
      setIsProcessing(false);
      setProcessType(null);
    }
  };

  const handleCopy = async (text: string) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCurrentText = () => {
    if (activeTab === 'structured') return structuredText;
    if (activeTab === 'converted') return convertedScript;
    return transcript;
  };

  const handleInsert = () => {
    const textToInsert = getCurrentText();
    if (textToInsert.trim()) {
      onInsert(textToInsert);
      stopListening();
      onClose();
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={() => { stopListening(); onClose(); }} title="Voice Dictation Studio" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Recording Control Box */}
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-3.5 rounded-2xl flex items-center justify-center shadow-md transition-all duration-200 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse scale-105'
                  : 'bg-purple-600 hover:bg-purple-700 text-white hover:scale-105'
              }`}
              title={isListening ? 'Stop Listening' : 'Start Speaking'}
            >
              {isListening ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
            </button>
            <div>
              <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {isListening ? (
                  <span className="flex items-center gap-1.5 text-red-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    Listening continuously... ({formatSeconds(listeningSeconds)})
                  </span>
                ) : (
                  <span>Normal Voice Dictation</span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {isListening
                  ? 'Speak freely. Recognition stays active without pausing.'
                  : 'Click the mic to speak or edit your transcript below.'}
              </p>
            </div>
          </div>

          {transcript && (
            <button
              type="button"
              onClick={() => {
                setTranscript('');
                setStructuredText('');
                setConvertedScript('');
                setActiveTab('raw');
              }}
              className="text-xs text-gray-400 hover:text-red-600 transition-colors"
            >
              Clear Transcript
            </button>
          )}
        </div>

        {/* Tab Selection if AI structures are generated */}
        {(structuredText || convertedScript) && (
          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('raw')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'raw'
                  ? 'bg-white text-gray-900 shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎤 Raw Transcript
            </button>
            {structuredText && (
              <button
                type="button"
                onClick={() => setActiveTab('structured')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'structured'
                    ? 'bg-purple-600 text-white shadow-2xs'
                    : 'text-purple-700 hover:bg-purple-50'
                }`}
              >
                ✨ Structured ({structuredText.split(/\s+/).filter(Boolean).length} words)
              </button>
            )}
            {convertedScript && (
              <button
                type="button"
                onClick={() => setActiveTab('converted')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'converted'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                ⚡ Video Script ({convertedScript.split(/\s+/).filter(Boolean).length} words)
              </button>
            )}
          </div>
        )}

        {/* Transcript Text Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {activeTab === 'raw' && 'Spoken Transcript'}
              {activeTab === 'structured' && 'Structured Transcript (Preserves Your Words)'}
              {activeTab === 'converted' && 'AI-Crafted Video Script'}
            </label>
            {getCurrentText() && (
              <button
                type="button"
                onClick={() => handleCopy(getCurrentText())}
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>

          <textarea
            value={getCurrentText()}
            onChange={(e) => {
              if (activeTab === 'raw') setTranscript(e.target.value);
              if (activeTab === 'structured') setStructuredText(e.target.value);
              if (activeTab === 'converted') setConvertedScript(e.target.value);
            }}
            placeholder="Your spoken words appear here... You can also type or paste your spoken ideas directly."
            rows={7}
            className="w-full p-3.5 text-sm bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent leading-relaxed"
          />
        </div>

        {/* AI Action Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Option 1: Structure with Gemini */}
          <button
            type="button"
            onClick={handleStructureWithGemini}
            disabled={!transcript.trim() || isProcessing}
            className={`p-3 text-left rounded-xl border transition-all ${
              activeTab === 'structured'
                ? 'border-purple-500 bg-purple-50/70 ring-1 ring-purple-500'
                : 'border-purple-200 bg-purple-50/30 hover:bg-purple-50 hover:border-purple-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-purple-900 mb-1">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Structure with Gemini</span>
            </div>
            <p className="text-[11px] text-purple-700 leading-snug">
              Cleans punctuation, headers & format <strong>without changing your words</strong>.
            </p>
          </button>

          {/* Option 2: Convert to Script with Gemini */}
          <button
            type="button"
            onClick={handleConvertWithGemini}
            disabled={!transcript.trim() || isProcessing}
            className={`p-3 text-left rounded-xl border transition-all ${
              activeTab === 'converted'
                ? 'border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500'
                : 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50 hover:border-emerald-300'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 mb-1">
              <Flame className="w-4 h-4 text-emerald-600" />
              <span>Convert to Script with Gemini</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-snug">
              Transforms rambling thoughts into a polished, high-converting video script.
            </p>
          </button>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button variant="ghost" size="sm" onClick={() => { stopListening(); onClose(); }}>
            Cancel
          </Button>

          <Button
            size="sm"
            onClick={handleInsert}
            disabled={!getCurrentText().trim()}
            icon={<Check className="w-4 h-4" />}
          >
            Insert {activeTab === 'raw' ? 'Transcript' : activeTab === 'structured' ? 'Structured Script' : 'Video Script'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
