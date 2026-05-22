import { useRef, useState, useEffect } from 'react';

export default function SignaturePad({ onSign, darkMode }) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = darkMode ? '#F8FAFC' : '#1a1a2e';
  }, [darkMode]);

  const startDraw = (e) => {
    setDrawing(true);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    const [x, y] = getPos(e);
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = canvasRef.current.getContext('2d');
    const [x, y] = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDraw = () => {
    if (drawing) {
      setDrawing(false);
    }
  };

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return [clientX - rect.left, clientY - rect.top];
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const confirm = () => {
    if (!hasSignature) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSign(dataUrl);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          width={450}
          height={180}
          style={{
            border: `2px dashed ${darkMode ? '#334155' : '#CBD5E1'}`,
            borderRadius: 12,
            touchAction: 'none',
            background: darkMode ? '#0F172A' : '#F8FAFC',
            cursor: 'crosshair',
            width: '100%',
            height: 'auto'
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={stopDraw}
          onMouseLeave={stopDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={stopDraw}
        />
        {!hasSignature && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            color: darkMode ? '#475569' : '#94A3B8',
            fontSize: 14,
            fontWeight: 500
          }}>
            Signez ici
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button 
          type="button"
          onClick={clear}
          style={{
            padding: '8px 16px',
            background: 'transparent',
            border: `1px solid ${darkMode ? '#334155' : '#E2E8F0'}`,
            color: darkMode ? '#CBD5E1' : '#64748B',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Effacer
        </button>
        <button 
          type="button"
          onClick={confirm}
          disabled={!hasSignature}
          style={{
            padding: '8px 16px',
            background: hasSignature ? '#6366F1' : (darkMode ? '#1E293B' : '#F1F5F9'),
            border: 'none',
            color: hasSignature ? '#FFFFFF' : (darkMode ? '#475569' : '#94A3B8'),
            borderRadius: 8,
            cursor: hasSignature ? 'pointer' : 'not-allowed',
            fontSize: 13,
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Confirmer la signature
        </button>
      </div>
    </div>
  );
}
