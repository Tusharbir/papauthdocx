import { useState, useRef, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
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
      ctx.font = 'bold 14px sans-serif';
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
      ctx.font = 'bold 14px sans-serif';
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
    
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setStartPoint({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !startPoint) return;
    
    const rect = overlayCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
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
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">3. Select ROI (Optional - Enhanced Security)</h3>
      <p className="text-sm text-slate-400 mb-4">
        For enhanced verification, select signature and stamp regions. This adds two additional cryptographic hashes.
      </p>
      
      <div className="mb-4 flex gap-3">
        <Button
          type="button"
          onClick={() => setSelectionMode('signature')}
          className={`text-sm ${selectionMode === 'signature' ? 'bg-green-500' : ''}`}
          disabled={!!signatureBox}
        >
          {signatureBox ? '✓ Signature Selected' : 'Select Signature Region'}
        </Button>
        <Button
          type="button"
          onClick={() => setSelectionMode('stamp')}
          className={`text-sm ${selectionMode === 'stamp' ? 'bg-blue-500' : ''}`}
          disabled={!!stampBox}
        >
          {stampBox ? '✓ Stamp Selected' : 'Select Stamp Region'}
        </Button>
        {(signatureBox || stampBox) && (
          <Button
            type="button"
            onClick={() => {
              setSignatureBox(null);
              setStampBox(null);
            }}
            className="text-sm bg-rose-500"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {selectionMode && (
        <div className="mb-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-400">
            Click and drag to select the {selectionMode} region on the document below
          </p>
        </div>
      )}
      
      <div className="relative border border-white/10 rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{ display: 'block' }}
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 max-w-full h-auto cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      
      {(signatureBox || stampBox) && (
        <div className="mt-4">
          <Button type="button" onClick={handleComplete} className="w-full">
            Continue with Selected ROIs
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ROISelector;
