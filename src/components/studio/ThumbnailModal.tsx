import React, { useState, useEffect } from 'react';
import {
  Image, Sparkles, Copy, Check, RefreshCw, Eye, Palette,
  Type, Smile, AlertCircle
} from 'lucide-react';
import { Modal, Button } from '../ui';
import { getAiService } from '../../services/ai';
import type { ThumbnailConcept } from '../../types/ai';

interface ThumbnailModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scriptContext: string;
}

export function ThumbnailModal({
  isOpen,
  onClose,
  title,
  scriptContext,
}: ThumbnailModalProps) {
  const [concepts, setConcepts] = useState<ThumbnailConcept[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchConcepts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = getAiService();
      if (ai.generateThumbnailConcepts) {
        const res = await ai.generateThumbnailConcepts({
          title,
          scriptContext,
        });
        setConcepts(res.concepts || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate thumbnail concepts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && concepts.length === 0) {
      fetchConcepts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Thumbnail Concepts & Visual Packaging" size="lg">
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Video Title Header Card */}
        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-0.5">
              Target Video
            </span>
            <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{title}</h4>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={fetchConcepts}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Regenerate
          </Button>
        </div>

        {/* Concepts List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Designing 3 viral thumbnail concepts...</p>
            <p className="text-[11px] text-gray-400">Optimizing face emotion, contrast & bold text overlays</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {concepts.map((concept, index) => (
              <div
                key={concept.id || index}
                className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-purple-300 hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                      #{index + 1}
                    </span>
                    <h4 className="text-xs font-bold text-gray-900">{concept.visualTitle}</h4>
                  </div>

                  <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full font-black text-xs tracking-wider border border-yellow-200">
                    "{concept.textOverlay}"
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Scene Layout & Composition
                    </span>
                    <p className="text-gray-800 leading-relaxed">{concept.sceneDescription}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                        <Smile className="w-3 h-3" /> Face & Emotion
                      </span>
                      <p className="text-gray-800 font-medium">{concept.subjectEmotion}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                        <Palette className="w-3 h-3" /> Color Contrast
                      </span>
                      <p className="text-purple-700 font-semibold">{concept.colorContrast}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-1">
                  <button
                    onClick={() =>
                      handleCopy(
                        concept.id || String(index),
                        `[Thumbnail Concept #${index + 1}]:\n• Title: ${concept.visualTitle}\n• Text on Thumbnail: "${concept.textOverlay}"\n• Scene Layout: ${concept.sceneDescription}\n• Subject Emotion: ${concept.subjectEmotion}\n• Color Contrast: ${concept.colorContrast}`
                      )
                    }
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copiedId === (concept.id || String(index)) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedId === (concept.id || String(index)) ? 'Copied Prompt' : 'Copy Concept'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
