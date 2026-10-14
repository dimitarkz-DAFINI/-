import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, PenTool } from 'lucide-react';

interface SignatureCanvasProps {
  onSignatureChange?: (hasSignature: boolean) => void;
  width?: number;
  height?: number;
}

export interface SignatureCanvasRef {
  clear: () => void;
  isEmpty: () => boolean;
  toDataURL: () => string;
}

export const SignatureCanvas = React.forwardRef<SignatureCanvasRef, SignatureCanvasProps>(
  ({ onSignatureChange, width = 450, height = 180 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasStrokes, setHasStrokes] = useState(false);

    // Инициализация на Canvas с висока резолюция за чист подпис
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.strokeStyle = '#1e1b4b'; // тъмно синьо/черно за реалистично мастило
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }, [width, height]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };

      const rect = canvas.getBoundingClientRect();
      if ('touches' in e) {
        const touch = e.touches[0];
        return {
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        };
      } else {
        return {
          x: (e as React.MouseEvent).clientX - rect.left,
          y: (e as React.MouseEvent).clientY - rect.top
        };
      }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      e.preventDefault();

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { x, y } = getCoordinates(e);
      ctx.lineTo(x, y);
      ctx.stroke();

      if (!hasStrokes) {
        setHasStrokes(true);
        if (onSignatureChange) onSignatureChange(true);
      }
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasStrokes(false);
      if (onSignatureChange) onSignatureChange(false);
    };

    // Експортиране на реф за външен достъп
    React.useImperativeHandle(ref, () => ({
      clear: clearCanvas,
      isEmpty: () => !hasStrokes,
      toDataURL: () => {
        const canvas = canvasRef.current;
        if (!canvas) return '';
        return canvas.toDataURL('image/png');
      }
    }));

    return (
      <div className="space-y-2">
        <div className="relative border-2 border-dashed border-[#762685]/60 rounded-2xl overflow-hidden bg-white shadow-inner">
          <canvas
            ref={canvasRef}
            style={{ width: '100%', height: `${height}px`, touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="cursor-crosshair block"
          />

          {!hasStrokes && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 gap-2">
              <PenTool size={18} className="text-slate-400" />
              <span className="text-xs font-semibold">
                Подпишете се тук с пръст или стилус
              </span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
            <button
              type="button"
              onClick={clearCanvas}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-300 flex items-center gap-1 transition-all active:scale-95 shadow-sm"
            >
              <RotateCcw size={12} />
              <span>Изчисти</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);
