import React, { useState, useRef, useEffect } from 'react';
import {
  Wrench, Tv, Volume2, Image, Video, DollarSign,
  Languages, Smartphone, Share2, BarChart2, Download,
  Upload, ChevronDown, Sparkles, PenTool
} from 'lucide-react';

interface StudioToolsDropdownProps {
  onOpenTeleprompter: () => void;
  onToggleAudioRecorder: () => void;
  onOpenThumbnails: () => void;
  onOpenYoutubeMetadata: () => void;
  onOpenSponsorBlock: () => void;
  onOpenTranslator: () => void;
  onOpenShortExtractor: () => void;
  onOpenHandwriting?: () => void;
  onInsertInlineDrawing?: () => void;
  onOpenShareModal: () => void;
  onOpenAnalytics: () => void;
  onOpenExport: () => void;
  onOpenImport: () => void;
  isAudioRecordingActive?: boolean;
}

export function StudioToolsDropdown({
  onOpenTeleprompter,
  onToggleAudioRecorder,
  onOpenThumbnails,
  onOpenYoutubeMetadata,
  onOpenSponsorBlock,
  onOpenTranslator,
  onOpenShortExtractor,
  onOpenHandwriting,
  onInsertInlineDrawing,
  onOpenShareModal,
  onOpenAnalytics,
  onOpenExport,
  onOpenImport,
  isAudioRecordingActive = false,
}: StudioToolsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block z-30" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all shadow-2xs hover:border-gray-300"
        title="Studio Tools & Launch Utilities"
      >
        <Wrench className="w-3.5 h-3.5 text-indigo-600" />
        <span className="hidden sm:inline">Studio Tools</span>
        <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 ring-1 ring-black/5">
          {/* Section: Video Production */}
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Filming & Audio
          </div>

          <button
            type="button"
            onClick={() => handleAction(onOpenTeleprompter)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Tv className="w-4 h-4 text-emerald-600" />
            <span>Teleprompter Mode</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onToggleAudioRecorder)}
            className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg flex items-center gap-2.5 transition-colors font-medium ${
              isAudioRecordingActive
                ? 'bg-amber-100 text-amber-900 font-bold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
            <span>Voice / Audio Recorder</span>
          </button>

          {onInsertInlineDrawing && (
            <button
              type="button"
              onClick={() => handleAction(onInsertInlineDrawing)}
              className="w-full text-left px-2.5 py-1.5 text-xs text-purple-700 hover:bg-purple-50 rounded-lg flex items-center gap-2.5 transition-colors font-semibold"
            >
              <PenTool className="w-4 h-4 text-purple-600" />
              <span>Draw / Handwrite in Script</span>
            </button>
          )}

          {onOpenHandwriting && (
            <button
              type="button"
              onClick={() => handleAction(onOpenHandwriting)}
              className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
            >
              <PenTool className="w-4 h-4 text-gray-500" />
              <span>Standalone Handwriting Pad</span>
            </button>
          )}

          <div className="my-1.5 border-t border-gray-100" />

          {/* Section: Packaging & Growth */}
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Packaging & Growth
          </div>

          <button
            type="button"
            onClick={() => handleAction(onOpenThumbnails)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Image className="w-4 h-4 text-purple-600" />
            <span>Thumbnail Concepts</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenYoutubeMetadata)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Video className="w-4 h-4 text-red-600" />
            <span>YouTube Metadata & Chapters</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenSponsorBlock)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Sponsor Ad-Read Builder</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenShortExtractor)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Smartphone className="w-4 h-4 text-pink-600" />
            <span>Extract 60s Viral Shorts</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenTranslator)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Languages className="w-4 h-4 text-blue-600" />
            <span>Script Dubbing Translator</span>
          </button>

          <div className="my-1.5 border-t border-gray-100" />

          {/* Section: Sharing & Export */}
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Publish & Manage
          </div>

          <button
            type="button"
            onClick={() => handleAction(onOpenShareModal)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Share2 className="w-4 h-4 text-blue-600" />
            <span>Share Public Web Link</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenAnalytics)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>Script Analytics & Stats</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenExport)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Download className="w-4 h-4 text-gray-500" />
            <span>Export (PDF / Word / TXT)</span>
          </button>

          <button
            type="button"
            onClick={() => handleAction(onOpenImport)}
            className="w-full text-left px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2.5 transition-colors font-medium"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span>Import Script</span>
          </button>
        </div>
      )}
    </div>
  );
}
