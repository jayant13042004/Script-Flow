import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, X, Type, FastForward } from 'lucide-react';

interface TeleprompterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  plainText: string;
}

export const TeleprompterModal: React.FC<TeleprompterModalProps> = ({
  isOpen,
  onClose,
  title,
  plainText,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(150);
  const [fontSize, setFontSize] = useState(40);
  const [fontFamily, setFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [flipHorizontal, setFlipHorizontal] = useState(false);
  const [flipVertical, setFlipVertical] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setWpm((prev) => Math.min(300, prev + 10));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setWpm((prev) => Math.max(60, prev - 10));
      } else if (e.code === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      lastTimeRef.current = null;
      return;
    }

    const scrollStep = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      if (containerRef.current) {
        // Calculate scroll speed based on WPM
        // Average 5 chars per word -> (wpm * 5) chars / minute
        const pxPerSec = (wpm / 60) * (fontSize * 0.6);
        containerRef.current.scrollTop += (pxPerSec * elapsed) / 1000;
      }

      animFrameRef.current = requestAnimationFrame(scrollStep);
    };

    animFrameRef.current = requestAnimationFrame(scrollStep);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, wpm, fontSize]);

  const resetScroll = () => {
    setIsPlaying(false);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  };

  if (!isOpen) return null;

  const fontClass =
    fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  const transformStyle = `
    ${flipHorizontal ? 'scaleX(-1)' : ''}
    ${flipVertical ? 'scaleY(-1)' : ''}
  `.trim();

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col no-print select-none">
      {/* Top Controls Bar */}
      <div className="h-16 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? 'Pause (Space)' : 'Start (Space)'}</span>
          </button>

          <button
            onClick={resetScroll}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to Top"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed & Size Settings */}
        <div className="flex items-center gap-6">
          {/* WPM Speed */}
          <div className="flex items-center gap-2">
            <FastForward className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">Speed:</span>
            <span className="text-sm font-bold font-mono text-emerald-400 w-16">{wpm} WPM</span>
            <input
              type="range"
              min="60"
              max="300"
              step="10"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="w-24 accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Font Size */}
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-slate-400">Size:</span>
            <span className="text-sm font-bold font-mono text-blue-400 w-10">{fontSize}px</span>
            <input
              type="range"
              min="24"
              max="72"
              step="4"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 accent-blue-500 cursor-pointer"
            />
          </div>

          {/* Mirror Flipping */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setFlipHorizontal(!flipHorizontal)}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                flipHorizontal ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Horizontal Mirror Flip (Glass Rig)"
            >
              Flip H
            </button>
            <button
              onClick={() => setFlipVertical(!flipVertical)}
              className={`px-2 py-1 text-xs rounded font-medium transition-colors ${
                flipVertical ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Vertical Mirror Flip"
            >
              Flip V
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="Close Teleprompter"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Focus Line Indicator */}
      <div className="absolute top-1/2 left-0 right-0 h-20 -translate-y-1/2 border-y-2 border-emerald-500/30 bg-emerald-500/5 pointer-events-none z-20 flex items-center justify-between px-4">
        <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400/60">
          Reading Focus Line
        </span>
      </div>

      {/* Scrollable Teleprompter Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-12 py-64 scrollbar-none transition-transform duration-200"
        style={{ transform: transformStyle || undefined }}
      >
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center pb-12 border-b border-slate-800">
            <h1 className="text-2xl font-bold text-slate-500 mb-2 uppercase tracking-widest">
              {title || 'Untitled Script'}
            </h1>
            <p className="text-sm text-slate-600">ScriptFlow Teleprompter Studio</p>
          </div>

          <div
            className={`${fontClass} leading-relaxed text-slate-100 font-medium`}
            style={{ fontSize: `${fontSize}px` }}
          >
            {(plainText || 'Start writing your script to view it in the teleprompter.')
              .split('\n\n')
              .map((paragraph, idx) => (
                <p key={idx} className="mb-12">
                  {paragraph}
                </p>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
