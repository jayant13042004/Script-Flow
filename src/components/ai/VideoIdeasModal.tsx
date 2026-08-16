import React, { useState, useEffect } from 'react';
import {
  Sparkles, Lightbulb, ArrowRight, Copy, Check, RefreshCw,
  Target, Layers, Film, Compass, Play, Plus
} from 'lucide-react';
import { Modal, Button } from '../ui';
import { getAiService } from '../../services/ai';
import type { Script } from '../../types';
import type { VideoIdea, GenerateVideoIdeasResponse } from '../../types/ai';

interface VideoIdeasModalProps {
  isOpen: boolean;
  onClose: () => void;
  pastScripts: Script[];
  onSelectIdea: (idea: VideoIdea) => void;
}

export function VideoIdeasModal({
  isOpen,
  onClose,
  pastScripts,
  onSelectIdea,
}: VideoIdeasModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<GenerateVideoIdeasResponse | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const eligibleScripts = pastScripts.filter(
    (s) => s.plainText?.trim() || (s.title && s.title !== 'Untitled Script')
  );

  const fetchIdeas = async () => {
    if (eligibleScripts.length < 5) return;
    setIsLoading(true);

    try {
      const aiService = getAiService();
      if (aiService.generateVideoIdeas) {
        const res = await aiService.generateVideoIdeas({
          pastScripts: eligibleScripts.map((s) => ({
            title: s.title,
            plainText: s.plainText,
            contentType: s.contentType || undefined,
            platform: s.platform || undefined,
          })),
        });
        setData(res);
      }
    } catch (err) {
      console.warn('Error fetching video ideas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && (!data || data.ideas.length === 0)) {
      fetchIdeas();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Niche Video Ideas Generator"
      size="xl"
    >
      <div className="space-y-6">
        {/* Niche & Style Summary Banner */}
        {data && (
          <div className="p-4 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5" /> Niche Detected
                </span>
                <span className="text-sm font-bold text-blue-950">
                  {data.detectedNiche}
                </span>
              </div>

              <span className="text-xs text-blue-700 font-medium">
                Based on your {eligibleScripts.length} past scripts
              </span>
            </div>

            <p className="text-xs text-blue-900 leading-relaxed font-medium">
              🎨 <strong>Your Style:</strong> {data.creatorStyle}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-gray-900">
              Analyzing your {eligibleScripts.length} scripts & generating viral video ideas...
            </h4>
            <p className="text-xs text-gray-400">
              Gemini is finding high-retention angles tailored specifically to your audience.
            </p>
          </div>
        ) : data && data.ideas.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" /> {data.ideas.length} Tailored Video Ideas
              </h4>

              <button
                type="button"
                onClick={fetchIdeas}
                disabled={isLoading}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Regenerate Ideas</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[55vh] overflow-y-auto pr-1">
              {data.ideas.map((idea, index) => (
                <div
                  key={idea.id || index}
                  className="p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                        {idea.format || 'Video'}
                      </span>
                      <span className="text-[11px] font-mono text-gray-400">
                        #{index + 1}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {idea.title}
                    </h3>

                    {idea.hook && (
                      <div className="p-2.5 bg-gray-50 rounded-lg text-xs text-gray-700 italic border border-gray-100">
                        <span className="not-italic font-semibold text-gray-900 block text-[10px] uppercase mb-0.5">
                          🎣 Opening Hook:
                        </span>
                        "{idea.hook}"
                      </div>
                    )}

                    {idea.angle && (
                      <p className="text-[11px] text-gray-500 leading-normal">
                        💡 <strong>Why it works:</strong> {idea.angle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy(
                          idea.id || String(index),
                          `Title: ${idea.title}\nHook: ${idea.hook}\nAngle: ${idea.angle}`
                        )
                      }
                      className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium transition-colors"
                    >
                      {copiedId === (idea.id || String(index)) ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {copiedId === (idea.id || String(index)) ? 'Copied' : 'Copy'}
                      </span>
                    </button>

                    <Button
                      size="sm"
                      onClick={() => onSelectIdea(idea)}
                      icon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Start This Script
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600 font-medium">
              Click below to analyze your library and generate ideas.
            </p>
            <Button className="mt-4" onClick={fetchIdeas}>
              Generate Niche Video Ideas
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
