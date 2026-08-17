import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  PenTool, Eraser, RotateCcw, RotateCw, Trash2, Sparkles,
  Check, Edit3, AlertCircle, Eye
} from 'lucide-react';
import { getAiService } from '../../../services/ai';

const PEN_COLORS = [
  { name: 'Black', color: '#111827' },
  { name: 'Navy Blue', color: '#1d4ed8' },
  { name: 'Emerald', color: '#047857' },
  { name: 'Purple', color: '#7e22ce' },
  { name: 'Crimson', color: '#be123c' },
];

export function DrawingNode(props: NodeViewProps) {
  const isNormalView = Boolean(props.node.attrs.isNormalView);
  const dataUrl = props.node.attrs.dataUrl || '';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#111827');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);

  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load saved drawing
  useEffect(() => {
    if (isNormalView) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 640;
    const height = 240;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Initial background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (dataUrl) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const currentData = canvas.toDataURL('image/png');
        setHistory([currentData]);
        setHistoryStep(0);
      };
      img.src = dataUrl;
    } else {
      const currentData = canvas.toDataURL('image/png');
      setHistory([currentData]);
      setHistoryStep(0);
    }
  }, [isNormalView]);

  const saveCanvasToNode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const currentData = canvas.toDataURL('image/png');
    props.updateAttributes({ dataUrl: currentData });

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(currentData);
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
      const prevDataUrl = history[prevStep];
      const img = new window.Image();
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 640;
      const height = 240;

      img.onload = () => {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        ctx.drawImage(img, 0, 0, width, height);
        setHistoryStep(prevStep);
        props.updateAttributes({ dataUrl: prevDataUrl });
      };
      img.src = prevDataUrl;
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

    saveCanvasToNode();
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
    ctx.lineWidth = isEraser ? strokeWidth * 4 : strokeWidth;
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
    saveCanvasToNode();
  };

  const handleFinishAndKeepNormal = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const currentData = canvas.toDataURL('image/png');
      props.updateAttributes({ dataUrl: currentData, isNormalView: true });
    } else {
      props.updateAttributes({ isNormalView: true });
    }
  };

  // Convert to Text via Gemini AI and replace this block
  const handleConvertToText = async () => {
    const sourceData = dataUrl || (canvasRef.current ? canvasRef.current.toDataURL('image/png') : '');
    if (!sourceData) return;

    setIsConverting(true);
    setError(null);

    try {
      const ai = getAiService();
      if (ai.convertHandwritingToText) {
        const res = await ai.convertHandwritingToText({ imageBase64: sourceData });
        const text = res.recognizedText;

        if (text && text.trim()) {
          const pos = props.getPos();
          if (typeof pos === 'number') {
            const html = `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;
            props.editor
              .chain()
              .focus()
              .deleteRange({ from: pos, to: pos + props.node.nodeSize })
              .insertContentAt(pos, html)
              .run();
          }
        } else {
          setError('No text detected in drawing. Try writing more clearly.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to convert handwriting to text.');
    } finally {
      setIsConverting(false);
    }
  };

  // NORMAL VIEW MODE (Box removed, looks like seamless handwritten script on page)
  if (isNormalView) {
    return (
      <NodeViewWrapper
        className="my-3 relative group select-none"
        contentEditable={false}
        draggable={false}
        onClick={(e: any) => e.stopPropagation()}
      >
        <div className="relative rounded-xl overflow-hidden py-1">
          {dataUrl ? (
            <img
              src={dataUrl}
              alt="Handwritten script note"
              className="w-full max-h-72 object-contain bg-transparent block"
              draggable={false}
            />
          ) : (
            <div className="p-4 text-xs text-gray-400 italic text-center border border-dashed border-gray-200 rounded-xl">
              Empty handwritten note. Click below to edit.
            </div>
          )}

          {/* Floating Action Controls on Hover */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg p-1 flex items-center gap-1">
            <button
              type="button"
              onClick={() => props.updateAttributes({ isNormalView: false })}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Edit handwriting"
            >
              <Edit3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edit Drawing</span>
            </button>

            <button
              type="button"
              onClick={handleConvertToText}
              disabled={isConverting}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
              title="Convert to typed text with AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{isConverting ? 'Reading...' : 'Convert to Text'}</span>
            </button>

            <button
              type="button"
              onClick={props.deleteNode}
              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  // DRAWING / EDITING MODE (With canvas & drawing tools)
  return (
    <NodeViewWrapper
      className="my-4 select-none"
      contentEditable={false}
      draggable={false}
      data-drag-handle="false"
      onDragStart={(e: any) => e.preventDefault()}
      onClick={(e: any) => e.stopPropagation()}
    >
      <div className="border-2 border-dashed border-purple-200 hover:border-purple-300 rounded-2xl overflow-hidden bg-white shadow-sm transition-colors select-none">
        {/* Inline Toolbar Header */}
        <div className="p-2 bg-purple-50/70 border-b border-purple-100 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5 text-purple-600" />
              <span>Handwriting Pad</span>
            </span>

            <div className="h-4 w-[1px] bg-purple-200 mx-0.5" />

            {/* Pen vs Eraser */}
            <button
              type="button"
              onClick={() => setIsEraser(false)}
              className={`p-1 rounded-md ${!isEraser ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-purple-100'}`}
              title="Pen"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsEraser(true)}
              className={`p-1 rounded-md ${isEraser ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-purple-100'}`}
              title="Eraser"
            >
              <Eraser className="w-3.5 h-3.5" />
            </button>

            {/* Colors */}
            {!isEraser && (
              <div className="flex items-center gap-1 ml-1">
                {PEN_COLORS.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setPenColor(c.color)}
                    className={`w-4 h-4 rounded-full transition-transform ${penColor === c.color ? 'scale-125 ring-2 ring-purple-400' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleUndo}
              disabled={historyStep <= 0}
              className="p-1 text-gray-500 hover:text-gray-900 disabled:opacity-30 ml-1"
              title="Undo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-red-500 hover:text-red-700 ml-1"
              title="Clear"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Convert to Text via AI */}
            <button
              type="button"
              onClick={handleConvertToText}
              disabled={isConverting}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-white border border-purple-200 hover:bg-purple-100 rounded-lg transition-colors"
              title="Convert this handwriting to editable text using AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{isConverting ? 'Reading...' : 'Convert to Text'}</span>
            </button>

            {/* Finish & Keep Normal (Removes box) */}
            <button
              type="button"
              onClick={handleFinishAndKeepNormal}
              className="flex items-center gap-1 px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-2xs"
              title="Keep handwritten note as normal script (removes box and tools)"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Keep as Normal Script</span>
            </button>

            {/* Delete Node */}
            <button
              type="button"
              onClick={props.deleteNode}
              className="p-1 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50"
              title="Delete handwriting block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-2 bg-red-50 text-[11px] text-red-700 flex items-center gap-1.5 border-b border-red-100">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-60 touch-none select-none block bg-white cursor-crosshair"
          style={{ width: '100%', height: '240px' }}
        />
      </div>
    </NodeViewWrapper>
  );
}
