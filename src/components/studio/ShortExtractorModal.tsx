import React, { useState, useEffect } from 'react';
import {
  Smartphone, Sparkles, Copy, Check, ArrowRight,
  Flame, Clock, Film, AlertCircle, RefreshCw
} from 'lucide-react';
import { Modal, Button } from '../ui';
import { getAiService } from '../../services/ai';
import { formatDuration } from '../../lib/utils';
import type { ViralShortOption } from '../../types/ai';

interface ShortExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scriptText: string;
  onCreateShortScript: (short: ViralShortOption) => void;
}

export function ShortExtractorModal({
  isOpen,
  onClose,
  title,
  scriptText,
  onCreateShortScript,
}: ShortExtractorModalProps) {
  const [shorts, setShorts] = useState<ViralShortOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchShorts = async () => {
    if (!scriptText.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const ai = getAiService();
      if (ai.extractViralShorts) {
        const res = await ai.extractViralShorts({
          longScriptTitle: title,
          longScriptText: scriptText,
        });
        setShorts(res.shorts || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to extract Shorts from script.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && shorts.length === 0) {
      fetchShorts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="1-Click YouTube Short & Reel Extractor" size="xl">
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 bg-linear-to-r from-red-50 to-pink-50 border border-pink-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Smartphone className="w-5 h-5 text-pink-600 flex-shrink-0" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block leading-none">
                Long-Form Source Video
              </span>
              <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{title}</h4>
            </div>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={fetchShorts}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Extract Again
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-14 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Finding the highest-retention 60-second moments...</p>
            <p className="text-[11px] text-gray-400">Crafting vertical hooks & rapid-fire body sections</p>
          </div>
        ) : shorts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[55vh] overflow-y-auto pr-1">
            {shorts.map((short, idx) => (
              <div
                key={short.id || idx}
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-pink-300 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 bg-pink-100 text-pink-700 font-bold text-[10px] uppercase tracking-wider rounded-md">
                      Short #{idx + 1} (~{short.estimatedDuration}s)
                    </span>
                    <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {formatDuration(short.estimatedDuration)}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{short.title}</h3>

                  <div className="p-2.5 bg-pink-50/50 rounded-xl border border-pink-100 text-xs text-pink-950 italic">
                    <strong className="not-italic font-bold block text-[10px] uppercase text-pink-700 mb-0.5">
                      🎣 Vertical Hook:
                    </strong>
                    "{short.hook}"
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-serif text-xs text-gray-800 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {short.scriptText}
                  </div>

                  {short.visualCues && (
                    <p className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      🎬 <strong>Visual / Cuts:</strong> {short.visualCues}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        short.id || String(idx),
                        `[Short: ${short.title}]\n\n[Hook]:\n${short.hook}\n\n[Script]:\n${short.scriptText}\n\n[Visual Cues]:\n${short.visualCues}`
                      )
                    }
                    className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors"
                  >
                    {copiedId === (short.id || String(idx)) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === (short.id || String(idx)) ? 'Copied' : 'Copy'}</span>
                  </button>

                  <Button
                    size="sm"
                    onClick={() => onCreateShortScript(short)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    Create Short Script
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-gray-400">
            Click "Extract Again" to analyze this script for viral standalone moments.
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
