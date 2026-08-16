import React, { useState } from 'react';
import {
  Languages, Globe, Sparkles, Copy, Check, Download,
  Volume2, AlertCircle, RefreshCw
} from 'lucide-react';
import { Modal, Button, Textarea } from '../ui';
import { getAiService } from '../../services/ai';
import { downloadFile } from '../../lib/exportImport';

interface ScriptTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scriptText: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'es', name: 'Spanish (Español)' },
  { code: 'hi', name: 'Hindi (हिंदी)' },
  { code: 'fr', name: 'French (Français)' },
  { code: 'pt', name: 'Portuguese (Português)' },
  { code: 'de', name: 'German (Deutsch)' },
  { code: 'ja', name: 'Japanese (日本語)' },
  { code: 'zh', name: 'Mandarin Chinese (中文)' },
  { code: 'ar', name: 'Arabic (العربية)' },
  { code: 'it', name: 'Italian (Italiano)' },
  { code: 'ru', name: 'Russian (Русский)' },
];

export function ScriptTranslatorModal({
  isOpen,
  onClose,
  title,
  scriptText,
}: ScriptTranslatorModalProps) {
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [customLang, setCustomLang] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTranslate = async () => {
    if (!scriptText.trim()) return;
    setIsLoading(true);
    setError(null);

    const target = customLang.trim() || selectedLang.name;

    try {
      const ai = getAiService();
      if (ai.translateScript) {
        const res = await ai.translateScript({
          scriptText,
          targetLanguage: target,
          languageCode: selectedLang.code,
        });
        setTranslatedText(res.translatedText);
        if (res.pronunciationNotes) setNotes(res.pronunciationNotes);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to translate script.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (translatedText) {
      downloadFile(
        translatedText,
        `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${selectedLang.code}.txt`,
        'text/plain'
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Multi-Language Audio Dubbing & Subtitle Translator" size="lg">
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Language Selection Row */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Select Target Language for Voiceover
              </span>
            </div>

            <Button
              size="sm"
              onClick={handleTranslate}
              disabled={isLoading || !scriptText.trim()}
              isLoading={isLoading}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Translate for Dubbing
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  setSelectedLang(lang);
                  setCustomLang('');
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left truncate ${
                  selectedLang.code === lang.code && !customLang
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>

        {/* Translation Output Box */}
        {translatedText ? (
          <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-600" /> Spoken {selectedLang.name} Script
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .TXT</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-900 leading-relaxed font-sans whitespace-pre-wrap max-h-60 overflow-y-auto">
              {translatedText}
            </div>

            {notes && (
              <p className="text-[11px] text-gray-500 italic bg-blue-50/50 p-2.5 rounded-lg border border-blue-100">
                💡 <strong>Dubbing Notes:</strong> {notes}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-gray-400">
            Select a target language above and click "Translate for Dubbing" to generate natural spoken translations.
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
