import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import {
  PenTool, Eraser, RotateCcw, RotateCw, Trash2, Sparkles,
  Check, Lock, Unlock, AlertCircle
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#111827');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isEraser, setIsEraser] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const [history, setHistory] = useState<string[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize and load saved drawing
  useEffect(() => {
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

    if (props.node.attrs.dataUrl) {
      const img = new window.Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png');
        setHistory([dataUrl]);
        setHistoryStep(0);
      };
      img.src = props.node.attrs.dataUrl;
    } else {
      const dataUrl = canvas.toDataURL('image/png');
      setHistory([dataUrl]);
      setHistoryStep(0);
    }
  }, []);

  const saveCanvasToNode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    props.updateAttributes({ dataUrl });

    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(dataUrl);
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
    if (isLocked) return;
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
    if (!isDrawing || isLocked) return;
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

  // Convert to Text via Gemini AI and replace this block
  const handleConvertToText = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsConverting(true);
    setError(null);

    try {
      const dataUrl = canvas.toDataURL('image/png');
      const ai = getAiService();
      if (ai.convertHandwritingToText) {
        const res = await ai.convertHandwritingToText({ imageBase64: dataUrl });
        const text = res.recognizedText;

        if (text && text.trim()) {
          // Replace this node with paragraph text
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

  return (
    <NodeViewWrapper
      className="my-4 select-none"
      contentEditable={false}
      draggable={false}
      data-drag-handle="false"
      onDragStart={(e: any) => e.preventDefault()}
      onClick={(e: any) => e.stopPropagation()}
    >
      <div className="border-2 border-dashed border-gray-300 hover:border-purple-300 rounded-2xl overflow-hidden bg-white shadow-sm transition-colors select-none">
        {/* Inline Toolbar Header */}
        <div className="p-2 bg-gray-50/90 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2 text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 flex items-center gap-1">
              <PenTool className="w-3.5 h-3.5 text-purple-600" />
              <span>Handwriting / Sketch</span>
            </span>

            {!isLocked && (
              <>
                <div className="h-4 w-[1px] bg-gray-300 mx-0.5" />
                {/* Pen vs Eraser */}
                <button
                  type="button"
                  onClick={() => setIsEraser(false)}
                  className={`p-1 rounded-md ${!isEraser ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  title="Pen"
                >
                  <PenTool className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEraser(true)}
                  className={`p-1 rounded-md ${isEraser ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
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
                        className={`w-4 h-4 rounded-full transition-transform ${penColor === c.color ? 'scale-125 ring-2 ring-gray-400' : 'hover:scale-110'}`}
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
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Convert to Text via AI */}
            <button
              type="button"
              onClick={handleConvertToText}
              disabled={isConverting}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
              title="Convert this handwriting to editable text using AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{isConverting ? 'Reading...' : 'Convert to Text via AI'}</span>
            </button>

            {/* Lock / Toggle */}
            <button
              type="button"
              onClick={() => setIsLocked(!isLocked)}
              className={`p-1 rounded-md ${isLocked ? 'bg-amber-100 text-amber-800' : 'text-gray-500 hover:bg-gray-200'}`}
              title={isLocked ? 'Unlock to draw' : 'Lock drawing'}
            >
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
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

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-60 touch-none select-none block bg-white ${isLocked ? 'cursor-default' : 'cursor-crosshair'}`}
          style={{ width: '100%', height: '240px' }}
        />
      </div>
    </NodeViewWrapper>
  );
}
