
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { AppState } from '../types';

interface PreviewStageProps {
  state: AppState;
  onSelectElement: (id: AppState['selectedElement']) => void;
}

const PreviewStage: React.FC<PreviewStageProps> = ({ state, onSelectElement }) => {
  const { accentColor, ringColor, font, glow, backgroundStyle, motivationalText, startText, endText, customText, ringThickness } = state.visuals;
  const { showRing, showCountdown, showStatus, showCustom, showPercentage } = state.visibility;
  const { transforms, canvas, selectedElement, progress } = state;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [changingIndices, setChangingIndices] = useState<Set<number>>(new Set());
  const prevDigitsRef = useRef<string[]>([]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const padding = 120;
      const containerW = containerRef.current.offsetWidth - padding;
      const containerH = containerRef.current.offsetHeight - padding;
      
      const scaleW = containerW / canvas.width;
      const scaleH = containerH / canvas.height;
      const newScale = Math.min(scaleW, scaleH, 1.0);
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas.width, canvas.height]);

  const circumference = 2 * Math.PI * 110;
  const offset = useMemo(() => {
    return circumference - (progress * circumference);
  }, [progress, circumference]);

  const digits = useMemo(() => state.currentCount.toString().split(''), [state.currentCount]);

  useEffect(() => {
    const currentDigits = digits;
    const prevDigits = prevDigitsRef.current;
    
    if (prevDigits.length > 0) {
      const newChanging = new Set<number>();
      if (currentDigits.length !== prevDigits.length || state.currentCount <= 10) {
        currentDigits.forEach((_, i) => newChanging.add(i));
      } else {
        currentDigits.forEach((digit, i) => {
          if (digit !== prevDigits[i]) {
            newChanging.add(i);
          }
        });
      }

      if (newChanging.size > 0) {
        setChangingIndices(newChanging);
        const timer = setTimeout(() => {
          setChangingIndices(new Set());
        }, 350); 
        return () => clearTimeout(timer);
      }
    }

    prevDigitsRef.current = currentDigits;
  }, [digits, state.currentCount]);

  const displayMessage = useMemo(() => {
    if (progress <= 0) return startText;
    if (progress >= 1) return endText;
    return motivationalText;
  }, [progress, startText, endText, motivationalText]);

  const progressText = useMemo(() => {
    const totalSteps = Math.abs(state.sequence.start - state.sequence.end);
    const completedSteps = Math.floor(progress * totalSteps);
    const percentage = (progress * 100).toFixed(1);
    return `${completedSteps} / ${totalSteps} — ${percentage}%`;
  }, [progress, state.sequence]);

  const getElementStyle = (id: 'ring' | 'countdown' | 'status' | 'custom' | 'percentage'): React.CSSProperties => {
    const t = transforms[id];
    return {
      transform: `translate(${t.x}px, ${t.y}px) scale(${t.scale})`,
      opacity: t.opacity,
      clipPath: `inset(${t.crop.top}px ${t.crop.right}px ${t.crop.bottom}px ${t.crop.left}px)`,
      cursor: 'pointer',
      outline: selectedElement === id ? `2px solid #FFFFFF` : 'none',
      outlineOffset: '12px',
      transition: 'outline 0.3s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), clip-path 0.2s ease-out',
    };
  };

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center bg-[#FAFAFA] relative llumina-reveal">
      <div className="absolute top-10 left-10 flex flex-col gap-2 z-10">
        <div className="bg-white/80 px-4 py-2 rounded-full border border-zinc-100 shadow-sm backdrop-blur-md text-[10px] font-black text-black uppercase tracking-[0.4em]">{canvas.aspectRatio} Aspect</div>
        <div className="px-4 text-[9px] font-bold text-zinc-400 uppercase tracking-widest">llumina Studio 2026</div>
      </div>

      <div 
        style={{ 
          transform: `scale(${scale})`,
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'center center'
        }}
        className="relative shadow-[0_40px_100px_rgba(0,0,0,0.15)] rounded-[4px] overflow-hidden"
      >
        <div 
          id="export-target"
          onClick={() => onSelectElement(null)}
          className="relative bg-black overflow-hidden flex items-center justify-center"
          style={{ width: canvas.width, height: canvas.height }}
        >
          <div className="absolute inset-0 z-0 pointer-events-none">
            {backgroundStyle === 'particles' && (
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="absolute rounded-full"
                    style={{
                      width: '2px', height: '2px', backgroundColor: accentColor,
                      left: Math.random() * 100 + '%', top: Math.random() * 100 + '%',
                      opacity: 0.15,
                    }}
                  />
                ))}
              </div>
            )}
            {backgroundStyle === 'gradient' && (
              <div className="absolute inset-0 opacity-10" 
                style={{ background: `radial-gradient(circle at 50% 50%, ${accentColor} 0%, transparent 80%)` }}
              />
            )}
          </div>

          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {showRing && (
              <div 
                onClick={(e) => { e.stopPropagation(); onSelectElement('ring'); }}
                style={getElementStyle('ring')}
                className="absolute z-10"
              >
                <svg className="w-[300px] h-[300px] -rotate-90" viewBox="0 0 240 240">
                  <circle 
                    cx="120" 
                    cy="120" 
                    r="110" 
                    fill="none" 
                    style={{ stroke: `color-mix(in srgb, ${ringColor}, black 85%)` }}
                    strokeWidth={ringThickness} 
                  />
                  <circle cx="120" cy="120" r="110" fill="none" stroke={ringColor} strokeWidth={ringThickness}
                    strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
                    style={{ 
                      filter: glow ? `drop-shadow(0 0 15px ${ringColor})` : 'none',
                      transition: 'stroke-dashoffset 0.1s linear'
                    }}
                  />
                </svg>
              </div>
            )}

            {showCountdown && (
              <div 
                onClick={(e) => { e.stopPropagation(); onSelectElement('countdown'); }}
                style={getElementStyle('countdown')}
                className="absolute z-20 flex items-baseline justify-center"
              >
                {digits.map((digit, i) => {
                  const isChanging = changingIndices.has(i);
                  return (
                    <span key={`digit-${i}`}
                      className="text-[110px] leading-[0.9] transition-all duration-300 px-0.5 select-none inline-block font-black"
                      style={{ 
                        fontFamily: font,
                        color: isChanging ? accentColor : '#FFFFFF',
                        transform: isChanging ? 'scale(1.05) translateY(-4px)' : 'scale(1) translateY(0)',
                      }}
                    >
                      {digit}
                    </span>
                  );
                })}
              </div>
            )}

            {showPercentage && (
              <div 
                onClick={(e) => { e.stopPropagation(); onSelectElement('percentage'); }}
                style={getElementStyle('percentage')}
                className="absolute z-30 select-none bg-black/40 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm"
              >
                <span className="text-[10px] font-black tracking-[0.3em] text-white/60">
                  {progressText}
                </span>
              </div>
            )}

            {showStatus && (
              <div 
                onClick={(e) => { e.stopPropagation(); onSelectElement('status'); }}
                style={getElementStyle('status')}
                className="absolute z-30 text-center"
              >
                <p className="text-[10px] uppercase tracking-[0.6em] font-black text-white/20 mb-3 select-none leading-none">SIGNAL ACTIVE</p>
                <h2 className="text-2xl font-black uppercase tracking-[0.2em] transition-all duration-500 select-none"
                  style={{ 
                    color: accentColor,
                    fontFamily: font
                  }}
                >
                  {displayMessage}
                </h2>
              </div>
            )}

            {showCustom && (
              <div 
                onClick={(e) => { e.stopPropagation(); onSelectElement('custom'); }}
                style={getElementStyle('custom')}
                className="absolute z-30 text-center px-4"
              >
                <h2 className="text-4xl font-black uppercase tracking-[0.4em] transition-all duration-500 select-none"
                  style={{ 
                    fontFamily: font,
                    color: '#FFFFFF',
                  }}
                >
                  {customText}
                </h2>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white px-8 py-5 rounded-[24px] border border-zinc-100 shadow-2xl transition-all duration-700 z-50 ${state.isExporting ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <div className="w-2.5 h-2.5 bg-black rounded-full animate-pulse" />
        <span className="text-[11px] font-black text-black uppercase tracking-[0.4em]">Signal Extraction...</span>
      </div>
    </div>
  );
};

export default PreviewStage;
