import React, { useState, useRef, useEffect } from 'react';
import {
  Mic, Square, Sparkles, FileText, Check, AlertCircle,
  Wand2, AlignLeft, RefreshCw, Copy, Flame
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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
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

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setListeningSeconds(0);
        timerRef.current = setInterval(() => {
          setListeningSeconds((prev) => prev + 1);
        }, 1000);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscript(finalTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone access was denied. Please allow microphone permissions in your browser.');
          stopListening();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err: any) {
      console.error('Speech recognition error:', err);
      setError('Could not start speech recognition. You can type your thoughts directly.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsListening(false);
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
          'Convert these spoken thoughts into a polished, high-retention video script. Include an engaging Hook, structured body points with natural conversational flow, and a compelling Call to Action.',
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

  const handleInsert = () => {
    let textToInsert = transcript.trim();
    if (activeTab === 'structured' && structuredText.trim()) {
      textToInsert = structuredText.trim();
    } else if (activeTab === 'converted' && convertedScript.trim()) {
      textToInsert = convertedScript.trim();
    }

    if (textToInsert) {
      onInsert(textToInsert);
    }
    onClose();
  };

  const handleCopyCurrent = async () => {
    let currentText = transcript;
    if (activeTab === 'structured') currentText = structuredText;
    if (activeTab === 'converted') currentText = convertedScript;

    if (currentText) {
      await navigator.clipboard.writeText(currentText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Voice Dictation Studio" size="lg">
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Live Mic Recorder Card */}
        <div className="flex items-center justify-between p-4 bg-purple-50/70 rounded-2xl border border-purple-100">
          <div className="flex items-center gap-4">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${
                isListening
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md active:scale-95'
              }`}
              title={isListening ? 'Stop Listening' : 'Start Live Dictation'}
            >
              {isListening ? (
                <Square className="w-6 h-6 fill-current" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                {isListening ? (
                  <span className="flex items-center gap-2 text-red-600">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    Listening & Transcribing ({listeningSeconds}s)...
                  </span>
                ) : (
                  'Normal Voice Dictation'
                )}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {isListening
                  ? 'Speak freely — transcribing your voice in real time.'
                  : 'Click the mic to speak or edit your transcript below.'}
              </p>
            </div>
          </div>

          {transcript && (
            <button
              onClick={() => {
                setTranscript('');
                setStructuredText('');
                setConvertedScript('');
                setActiveTab('raw');
              }}
              className="text-xs text-gray-400 hover:text-red-600 font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === 'raw'
                ? 'bg-gray-900 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Spoken Transcript</span>
          </button>

          {structuredText && (
            <button
              onClick={() => setActiveTab('structured')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'structured'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Structured Format</span>
            </button>
          )}

          {convertedScript && (
            <button
              onClick={() => setActiveTab('converted')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeTab === 'converted'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Polished Script</span>
            </button>
          )}
        </div>

        {/* Active Content Body */}
        {activeTab === 'raw' && (
          <div>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your spoken words appear here... You can also type or paste your spoken ideas directly."
              rows={6}
              className="text-sm font-sans"
            />
          </div>
        )}

        {activeTab === 'structured' && (
          <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-purple-900 font-semibold uppercase tracking-wider">
              <span>Structured & Formatted (Original Words Preserved)</span>
              <button
                onClick={handleCopyCurrent}
                className="text-purple-700 hover:text-purple-900 flex items-center gap-1 font-medium capitalize"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap max-h-56 overflow-y-auto p-3 bg-white rounded-lg border border-purple-100 font-sans leading-relaxed">
              {structuredText}
            </div>
          </div>
        )}

        {activeTab === 'converted' && (
          <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold uppercase tracking-wider">
              <span>Polished Video Script (Hook, Flow, CTA)</span>
              <button
                onClick={handleCopyCurrent}
                className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 font-medium capitalize"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap max-h-56 overflow-y-auto p-3 bg-white rounded-lg border border-emerald-100 font-serif leading-relaxed">
              {convertedScript}
            </div>
          </div>
        )}

        {/* Gemini Enhancement Options Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={handleStructureWithGemini}
            disabled={!transcript.trim() || isProcessing}
            className="p-3 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/80 disabled:opacity-50 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 bg-purple-600 text-white rounded-lg flex-shrink-0 mt-0.5">
              {isProcessing && processType === 'structure' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <AlignLeft className="w-4 h-4" />
              )}
            </div>
            <div>
              <h5 className="text-xs font-bold text-purple-950">✨ Structure with Gemini</h5>
              <p className="text-[11px] text-purple-700 mt-0.5 leading-snug">
                Cleans punctuation, headers & format without changing your words.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleConvertWithGemini}
            disabled={!transcript.trim() || isProcessing}
            className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 disabled:opacity-50 text-left transition-all flex items-start gap-3"
          >
            <div className="p-2 bg-emerald-600 text-white rounded-lg flex-shrink-0 mt-0.5">
              {isProcessing && processType === 'convert' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Flame className="w-4 h-4" />
              )}
            </div>
            <div>
              <h5 className="text-xs font-bold text-emerald-950">⚡ Convert to Script with Gemini</h5>
              <p className="text-[11px] text-emerald-700 mt-0.5 leading-snug">
                Transforms rambling thoughts into a polished, high-converting video script.
              </p>
            </div>
          </button>
        </div>

        {/* Modal Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <Button
            onClick={handleInsert}
            disabled={!transcript.trim() && !structuredText.trim() && !convertedScript.trim()}
            icon={<Check className="w-4 h-4" />}
          >
            {activeTab === 'structured'
              ? 'Insert Structured Text'
              : activeTab === 'converted'
              ? 'Insert Polished Script'
              : 'Insert Transcript'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
