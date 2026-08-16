import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool, Eraser, RotateCcw, RotateCw, Trash2, Sparkles,
  Download, Check, Copy, AlertCircle, ArrowDownToLine, Image
} from 'lucide-react';
import { Modal, Button } from '../ui';
import { getAiService } from '../../services/ai';

interface HandwritingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string) => void;
  onInsertImage?: (dataUrl: string) => void;
}

const PEN_COLORS = [
  { name: 'Black', color: '#111827' },
  { name: 'Navy Blue', color: '#1d4ed8' },
  { name: 'Emerald', color: '#047857' },
  { name: 'Purple', color: '#7e22ce' },
  { name: 'Crimson', color: '#be123c' },
  { name: 'Amber', color: '#d97706' },
];

const STROKE_WIDTHS = [
  { name: 'Fine', width: 2 },
  { name: 'Medium', width: 4 },
  { name: 'Broad', width: 7 },
];

export function HandwritingModal({
  isOpen,
  onClose,
  onInsertText,
  onInsertImage,
}: HandwritingModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#111827');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const [isConverting, setIsConverting] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Initialize canvas
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set high DPI canvas resolution
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        ctx.scale(2, 2);

        // Fill white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Save initial state
        const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        setHistory([initialData]);
        setHistoryStep(0);
      }, 100);
    } else {
      setRecognizedText('');
      setError(null);
    }
  }, [isOpen]);

  const pushState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const prevStep = historyStep - 1;
      ctx.putImageData(history[prevStep], 0, 0);
      setHistoryStep(prevStep);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const nextStep = historyStep + 1;
      ctx.putImageData(history[nextStep], 0, 0);
      setHistoryStep(nextStep);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    pushState();
    setRecognizedText('');
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#ffffff' : penColor;
    ctx.lineWidth = isEraser ? strokeWidth * 3 : strokeWidth;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    pushState();
  };

  // Convert to Text using Vision OCR
  const handleConvertToText = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsConverting(true);
    setError(null);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const ai = getAiService();
      if (ai.convertHandwritingToText) {
        const res = await ai.convertHandwritingToText({
          imageBase64: dataUrl,
        });
        setRecognizedText(res.recognizedText || 'No text detected. Try writing more clearly.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to convert handwriting.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'handwritten_note.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleCopyText = async () => {
    if (recognizedText) {
      await navigator.clipboard.writeText(recognizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Handwriting & Sketch Pad (Pen Tool)" size="lg">
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Toolbar Controls */}
        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          {/* Tool Modes (Pen vs Eraser) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setIsEraser(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                !isEraser ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" /> Pen
            </button>
            <button
              type="button"
              onClick={() => setIsEraser(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                isEraser ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" /> Eraser
            </button>
          </div>

          {/* Pen Colors */}
          {!isEraser && (
            <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-gray-200">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.color}
                  type="button"
                  onClick={() => setPenColor(c.color)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    penColor === c.color ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          )}

          {/* Stroke Width */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
            {STROKE_WIDTHS.map((s) => (
              <button
                key={s.width}
                type="button"
                onClick={() => setStrokeWidth(s.width)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                  strokeWidth === s.width ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Undo / Redo / Clear */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyStep >= history.length - 1}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-transparent transition-colors"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drawing Canvas */}
        <div className="relative border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-72 cursor-crosshair touch-none select-none block"
            style={{ width: '100%', height: '280px' }}
          />

          <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 pointer-events-none select-none">
            ✍️ Write with finger, mouse, or stylus
          </div>
        </div>

        {/* Recognized Text Panel */}
        {recognizedText && (
          <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> Transcribed Text
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-xs font-semibold text-purple-800 hover:text-purple-950 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-purple-200 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-purple-100 text-xs sm:text-sm text-gray-900 leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto font-serif">
              {recognizedText}
            </div>

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => {
                  onInsertText(recognizedText);
                  onClose();
                }}
                icon={<ArrowDownToLine className="w-3.5 h-3.5" />}
              >
                Insert Transcribed Text at Cursor
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleDownloadImage}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Save as Image (.PNG)
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>

            <Button
              size="sm"
              onClick={handleConvertToText}
              disabled={isConverting}
              isLoading={isConverting}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Convert Handwriting to Text
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
