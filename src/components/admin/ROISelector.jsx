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
  const [zoom, setZoom] = useState(0.5);
  
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
      ctx.lineWidth = 2 / zoom;
      ctx.strokeRect(signatureBox.x, signatureBox.y, signatureBox.width, signatureBox.height);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(signatureBox.x, signatureBox.y, signatureBox.width, signatureBox.height);
      
      // Label
      ctx.fillStyle = '#10b981';
      ctx.font = `bold ${14 / zoom}px sans-serif`;
      ctx.fillText('SIGNATURE', signatureBox.x + 5, signatureBox.y - 5);
    }
    
    // Draw stamp box
    if (stampBox) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2 / zoom;
      ctx.strokeRect(stampBox.x, stampBox.y, stampBox.width, stampBox.height);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.fillRect(stampBox.x, stampBox.y, stampBox.width, stampBox.height);
      
      // Label
      ctx.fillStyle = '#3b82f6';
      ctx.font = `bold ${14 / zoom}px sans-serif`;
      ctx.fillText('STAMP', stampBox.x + 5, stampBox.y - 5);
    }
    
    // Draw current selection
    if (currentBox) {
      ctx.strokeStyle = selectionMode === 'signature' ? '#10b981' : '#3b82f6';
      ctx.lineWidth = 2 / zoom;
      ctx.setLineDash([5 / zoom, 5 / zoom]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.width, currentBox.height);
      ctx.setLineDash([]);
    }
  }, [signatureBox, stampBox, currentBox, selectionMode, zoom]);

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  const handleMouseDown = (e) => {
    if (!selectionMode) return;
    
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    const x = (e.clientX - rect.left + scrollLeft) / zoom;
    const y = (e.clientY - rect.top + scrollTop) / zoom;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;
    
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    const scrollTop = containerRef.current.scrollTop;
    
    const x = (e.clientX - rect.left + scrollLeft) / zoom;
    const y = (e.clientY - rect.top + scrollTop) / zoom;
    
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

  const handleComplete = () => {
    onComplete?.({
      signature: signatureBox,
      stamp: stampBox
    });
  };

  if (!canvas) return null;

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={() => setSelectionMode('signature')}
              className={`${selectionMode === 'signature' ? 'bg-green-500' : ''}`}
              disabled={!!signatureBox}
            >
              {signatureBox ? '✓ Signature' : 'Select Signature'}
            </Button>
            <Button
              type="button"
              onClick={() => setSelectionMode('stamp')}
              className={`${selectionMode === 'stamp' ? 'bg-blue-500' : ''}`}
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
              className="bg-rose-500"
            >
              Clear
            </Button>
          )}
        </div>
        
        {/* Simple Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="px-4 py-2 bg-slate-700"
            disabled={zoom <= 0.5}
          >
            −
          </Button>
          <span className="text-sm font-medium text-white min-w-[3.5rem] text-center">{Math.round(zoom * 100)}%</span>
          <Button
            type="button"
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="px-4 py-2 bg-slate-700"
            disabled={zoom >= 3}
          >
            +
          </Button>
        </div>
      </div>
      
      {selectionMode && (
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-300">
            👉 Click and drag on the document to select the {selectionMode} area
          </p>
        </div>
      )}
      
      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative border-2 border-slate-600 rounded-lg overflow-auto bg-slate-900 flex-1 no-scrollbar"
      >
        <div className="inline-block min-w-full">
          <canvas
            ref={canvasRef}
            className="w-auto h-auto max-w-none"
            style={{ 
              display: 'block',
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              margin: '0 auto'
            }}
          />
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 w-auto h-auto max-w-none cursor-crosshair pointer-events-auto"
            style={{ 
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              marginLeft: '50%',
              translate: '-50% 0'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="sticky bottom-0 left-0 right-0 flex gap-3 bg-slate-900/70 backdrop-blur pt-4 pb-1">
        {(signatureBox || stampBox) && (
          <Button type="button" onClick={handleComplete} className="flex-1">
            ✓ Continue
          </Button>
        )}
        <Button type="button" onClick={() => handleComplete({ signature: null, stamp: null })} className="flex-1 bg-slate-600">
          Skip This Step
        </Button>
      </div>
    </div>
  );
};

export default ROISelector;
