import React, { useState, useEffect } from 'react';
import {
  Video, Sparkles, Copy, Check, Clock, Tag, Hash,
  FileText, RefreshCw, AlertCircle
} from 'lucide-react';
import { Modal, Button, Textarea } from '../ui';
import { getAiService } from '../../services/ai';
import type { YoutubeMetadataResponse } from '../../types/ai';

interface YoutubeMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  scriptContext: string;
}

export function YoutubeMetadataModal({
  isOpen,
  onClose,
  title,
  scriptContext,
}: YoutubeMetadataModalProps) {
  const [data, setData] = useState<YoutubeMetadataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = getAiService();
      if (ai.generateYoutubeMetadata) {
        const res = await ai.generateYoutubeMetadata({
          title,
          scriptContext,
        });
        setData(res);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate YouTube metadata.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !data) {
      fetchMetadata();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fullChaptersText = data?.chapters?.map((c) => `${c.timestamp} ${c.title}`).join('\n') || '';
  const tagsText = data?.tags?.join(', ') || '';
  const hashtagsText = data?.hashtags?.join(' ') || '';

  const fullAllInOneText = data
    ? `${data.fullDescription}\n\nTimestamps & Chapters:\n${fullChaptersText}\n\nTags:\n${tagsText}\n\nHashtags:\n${hashtagsText}`
    : '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="YouTube SEO Metadata & Chapters Generator" size="lg">
      <div className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <Video className="w-5 h-5 text-red-600 flex-shrink-0" />
            <h4 className="text-xs font-bold text-gray-900 truncate">{title}</h4>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={fetchMetadata}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Regenerate
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-gray-700">Writing SEO description, chapters & tags...</p>
          </div>
        ) : data ? (
          <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {/* 1. Full Description */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" /> Video Description
                </span>
                <button
                  onClick={() => handleCopy('desc', data.fullDescription)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'desc' ? 'Copied' : 'Copy Description'}</span>
                </button>
              </div>
              <p className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded-xl border border-gray-100 font-sans leading-relaxed">
                {data.fullDescription}
              </p>
            </div>

            {/* 2. Chapters & Timestamps */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" /> Timestamps & Chapters
                </span>
                <button
                  onClick={() => handleCopy('chapters', fullChaptersText)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copiedKey === 'chapters' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'chapters' ? 'Copied' : 'Copy Chapters'}</span>
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 font-mono text-xs text-gray-800 space-y-1">
                {data.chapters.map((ch, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-blue-600 font-bold">{ch.timestamp}</span>
                    <span>{ch.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. SEO Tags Box */}
            <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-purple-600" /> YouTube Search Tags ({data.tags.length})
                </span>
                <button
                  onClick={() => handleCopy('tags', tagsText)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {copiedKey === 'tags' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'tags' ? 'Copied' : 'Copy Tags'}</span>
                </button>
              </div>
              <p className="text-xs font-mono text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                {tagsText}
              </p>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          {data && (
            <Button
              onClick={() => handleCopy('all', fullAllInOneText)}
              icon={copiedKey === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copiedKey === 'all' ? 'All Metadata Copied!' : 'Copy Everything for YouTube'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
