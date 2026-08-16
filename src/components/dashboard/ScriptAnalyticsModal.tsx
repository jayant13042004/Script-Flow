import React from 'react';
import {
  FileText, Clock, BarChart2, X, Calendar, CheckCircle2,
  Tv, Type, Layers, Share2, Printer, ArrowRight
} from 'lucide-react';
import { Modal, Button } from '../ui';
import { formatDuration, formatRelativeTime } from '../../lib/utils';
import { ScriptStatusBadge } from './ScriptStatusBadge';
import type { Script } from '../../types';

interface ScriptAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | null;
  onOpenScript?: (id: string) => void;
  onExportPdf?: (script: Script) => void;
}

export function ScriptAnalyticsModal({
  isOpen,
  onClose,
  script,
  onOpenScript,
  onExportPdf,
}: ScriptAnalyticsModalProps) {
  if (!isOpen || !script) return null;

  const plainText = script.plainText || '';
  const words = script.wordCount || plainText.split(/\s+/).filter(Boolean).length;
  const characters = script.characterCount || plainText.length;
  
  // Calculate sentence and paragraph counts
  const sentences = plainText.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = plainText.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const scenesCount = Array.isArray(script.productionPlan) ? script.productionPlan.length : 0;

  // Pacing calculations
  const duration130 = Math.ceil((words / 130) * 60); // Slow/Conversational
  const duration150 = Math.ceil((words / 150) * 60); // Standard speaking rate
  const duration180 = Math.ceil((words / 180) * 60); // Fast YouTube Shorts pacing

  const avgSentenceLength = sentences > 0 ? Math.round(words / sentences) : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Script Analytics & Metrics" size="lg">
      <div className="space-y-6">
        {/* Header Title Card */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 line-clamp-1">{script.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Created {new Date(script.createdAt).toLocaleDateString()} · Updated {formatRelativeTime(script.updatedAt)}
            </p>
          </div>
          <ScriptStatusBadge status={script.status || 'draft'} readOnly />
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">Words</span>
            <span className="text-2xl font-black text-blue-950">{words.toLocaleString()}</span>
          </div>

          <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-xl">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block mb-1">Characters</span>
            <span className="text-2xl font-black text-purple-950">{characters.toLocaleString()}</span>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">Estimated Time</span>
            <span className="text-2xl font-black text-emerald-950">{formatDuration(duration150)}</span>
          </div>

          <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-xl">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">B-Roll Scenes</span>
            <span className="text-2xl font-black text-amber-950">{scenesCount}</span>
          </div>
        </div>

        {/* Speaking Pacing Speeds */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-500" /> Delivery Pacing Calculator
          </h4>
          <div className="grid grid-cols-3 gap-3 pt-1 text-center">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[11px] text-gray-500 font-medium">Conversational (130 WPM)</p>
              <p className="text-base font-bold text-gray-900 mt-1">{formatDuration(duration130)}</p>
            </div>
            <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
              <p className="text-[11px] text-blue-700 font-semibold">Standard YouTube (150 WPM)</p>
              <p className="text-base font-bold text-blue-900 mt-1">{formatDuration(duration150)}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[11px] text-gray-500 font-medium">Fast / Shorts (180 WPM)</p>
              <p className="text-base font-bold text-gray-900 mt-1">{formatDuration(duration180)}</p>
            </div>
          </div>
        </div>

        {/* Structure Breakdown */}
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-gray-500" /> Script Composition
          </h4>
          <div className="grid grid-cols-3 gap-4 text-xs text-gray-600">
            <div>
              <span className="text-gray-400 block text-[11px]">Sentences</span>
              <strong className="text-sm text-gray-900 font-bold">{sentences}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Paragraphs</span>
              <strong className="text-sm text-gray-900 font-bold">{paragraphs}</strong>
            </div>
            <div>
              <span className="text-gray-400 block text-[11px]">Avg. Words / Sentence</span>
              <strong className="text-sm text-gray-900 font-bold">{avgSentenceLength} words</strong>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {onExportPdf && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onExportPdf(script)}
                icon={<Printer className="w-3.5 h-3.5" />}
              >
                Export PDF
              </Button>
            )}

            {onOpenScript && (
              <Button
                size="sm"
                onClick={() => onOpenScript(script.id)}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Open in Studio
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
