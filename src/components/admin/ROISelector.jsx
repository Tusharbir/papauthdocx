import { useState, useRef, useEffect, useCallback } from 'react';
import Button from '../ui/Button';

/**
 * ROI Selection Component
 * Allows users to select regions of interest (signature/stamp) from a rendered PDF canvas
 */
const ROISelector = ({ canvas, onSignatureSelect, onStampSelect, onComplete }) => {
  const [selectionMode, setSelectionMode] = useState(null); // 'signature' | 'stamp' | null
  const [signatureBox, setSignatureBox] = useState(null);
  const [stampBox, setStampBox] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState(null);
  const [currentBox, setCurrentBox] = useState(null);

  
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (canvas && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      canvasRef.current.width = canvas.width;
      canvasRef.current.height = canvas.height;
      ctx.drawImage(canvas, 0, 0);
    }
  }, [canvas]);

  const drawOverlay = useCallback(() => {
    if (!overlayCanvasRef.current || !canvasRef.current) return;
    
    const ctx = overlayCanvasRef.current.getContext('2d');
    overlayCanvasRef.current.width = canvasRef.current.width;
    overlayCanvasRef.current.height = canvasRef.current.height;
    
    ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
    
    // Draw signature box
    if (signatureBox) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.strokeRect(signatureBox.x, signatureBox.y, signatureBox.width, signatureBox.height);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(signatureBox.x, signatureBox.y, signatureBox.width, signatureBox.height);
      
      // Label
      ctx.fillStyle = '#10b981';
      ctx.font = `bold 14px sans-serif`;
      ctx.fillText('SIGNATURE', signatureBox.x + 5, signatureBox.y - 5);
    }
    
    // Draw stamp box
    if (stampBox) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(stampBox.x, stampBox.y, stampBox.width, stampBox.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(stampBox.x, stampBox.y, stampBox.width, stampBox.height);
      
      // Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = `bold 14px sans-serif`;
      ctx.fillText('STAMP', stampBox.x + 5, stampBox.y - 5);
    }
    
    // Draw current selection
    if (currentBox) {
      ctx.strokeStyle = selectionMode === 'signature' ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.setLineDash([]);
    }
  }, [signatureBox, stampBox, currentBox, selectionMode]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const handleMouseDown = (e) => {
    if (!selectionMode) return;
    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate scaling between CSS size and canvas buffer size
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const width = x - startPoint.x;
    const height = y - startPoint.y;
    setCurrentBox({
      x: width > 0 ? startPoint.x : x,
      y: height > 0 ? startPoint.y : y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox) return;
    
    if (currentBox.width > 10 && currentBox.height > 10) {
      if (selectionMode === 'signature') {
        setSignatureBox(currentBox);
        onSignatureSelect?.(currentBox);
      } else if (selectionMode === 'stamp') {
        setStampBox(currentBox);
        onStampSelect?.(currentBox);
      }
    }
    
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentBox(null);
    setSelectionMode(null);
  };


  if (!canvas) return null;

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-slate-900">
      {/* Compact Header and Controls - visually separated from background */}
      <div className="w-full bg-slate-900 border-b border-white/10 px-4 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2 shadow-lg shadow-slate-900/40 flex-shrink-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
          <Button
            type="button"
            onClick={() => setSelectionMode('signature')}
            className={`!px-4 !py-1 ${selectionMode === 'signature' ? 'bg-green-500' : ''}`}
            disabled={!!signatureBox}
          >
            {signatureBox ? '✓ Signature' : 'Select Signature'}
          </Button>
          <Button
            type="button"
            onClick={() => setSelectionMode('stamp')}
            className={`!px-4 !py-1 ${selectionMode === 'stamp' ? 'bg-blue-500' : ''}`}
            disabled={!!stampBox}
          >
            {stampBox ? '✓ Stamp' : 'Select Stamp'}
          </Button>
          {(signatureBox || stampBox) && (
            <Button
              type="button"
              onClick={() => {
                setSignatureBox(null);
                setStampBox(null);
              }}
              className="!px-4 !py-1 bg-rose-500"
            >
              Clear
            </Button>
          )}
        </div>
        {/* Zoom controls removed as per request */}
      </div>
      
      {/* Guide for user */}
      <div className="w-full px-4 py-2 bg-slate-900 text-slate-300 text-sm border-b border-white/5 flex items-center">
        <span>
          Click <b>'Select Signature'</b> or <b>'Select Stamp'</b>, then drag to draw a box on the document.
        </span>
      </div>
      {/* Only render the PDF canvas and overlay here */}
      <div
        ref={containerRef}
        className="flex-1 flex items-start justify-center overflow-auto bg-slate-100 dark:bg-slate-800"
        style={{ minHeight: 0, minWidth: 0 }}
      >
        <div className="flex items-start justify-center w-full h-full overflow-y-auto">
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 flex items-start justify-center" style={{ overflow: 'hidden', width: '100%', height: 'auto' }}>
            <canvas
              ref={canvasRef}
              className="block w-full"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                zIndex: 1
              }}
            />
            <canvas
              ref={overlayCanvasRef}
              className="absolute top-0 left-0 w-full h-full cursor-crosshair pointer-events-auto"
              style={{
                width: '100%',
                height: '100%',
                zIndex: 10,
                pointerEvents: 'auto'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default ROISelector