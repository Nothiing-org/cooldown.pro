
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import PreviewStage from './components/PreviewStage';
import { AppState, ElementTransform, ExportSettings } from './types';
import { Menu, X } from 'lucide-react';

const HISTORY_LIMIT = 50;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    sequence: {
      start: 10,
      end: 0,
      duration: 5,
    },
    visuals: {
      theme: 'light',
      accentColor: '#007AFF',
      ringColor: '#007AFF',
      font: "'Plus Jakarta Sans', sans-serif", 
      glow: true,
      sound: true,
      backgroundStyle: 'solid',
      motivationalText: 'SIGNAL',
      startText: 'PREPARING',
      endText: 'FINISHED',
      customText: '2026',
      ringThickness: 6,
    },
    visibility: {
      showRing: true,
      showCountdown: true,
      showStatus: true,
      showCustom: true,
      showPercentage: true,
      isPrime: true,
    },
    transforms: {
      ring: { x: 0, y: 0, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
      countdown: { x: 0, y: 0, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
      status: { x: 0, y: 100, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
      custom: { x: 0, y: 180, scale: 0.5, opacity: 0.4, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
      percentage: { x: 0, y: -90, scale: 0.4, opacity: 0.3, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
    },
    canvas: {
      width: 360,
      height: 640,
      aspectRatio: '9:16',
    },
    exportSettings: {
      format: 'webm',
      resolution: '1080p',
      fps: 30,
      quality: 1,
    },
    selectedElement: 'countdown',
    isExporting: false,
    isPreviewing: false,
    progress: 0,
    currentCount: 10,
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [past, setPast] = useState<AppState[]>([]);
  const [future, setFuture] = useState<AppState[]>([]);

  const timerRef = useRef<number | null>(null);
  const audioCtx = useRef<AudioContext | null>(null);

  const pushHistory = useCallback((newState: AppState) => {
    setPast(prev => [...prev, state].slice(-HISTORY_LIMIT));
    setFuture([]);
  }, [state]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture(prev => [state, ...prev]);
    setPast(past.slice(0, past.length - 1));
    setState(previous);
  }, [past, state]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setPast(prev => [...prev, state]);
    setFuture(future.slice(1));
    setState(next);
  }, [future, state]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        if (e.shiftKey) redo(); else undo();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const playTick = () => {
    if (!state.visuals.sound) return;
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtx.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(850, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  };

  const runSequence = async (isExport: boolean = false) => {
    if (state.isPreviewing || state.isExporting) return;
    const { start, end, duration } = state.sequence;
    setState(prev => ({ ...prev, isPreviewing: !isExport, isExporting: isExport, currentCount: start, progress: 0 }));
    if (!isExport) setIsSidebarOpen(false);

    return new Promise<void>((resolve) => {
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const totalDuration = duration * 1000;
        const progress = Math.min(elapsed / totalDuration, 1);
        const currentVal = start + (end - start) * progress;
        const nextCount = start > end ? Math.ceil(currentVal) : Math.floor(currentVal);
        const finalCount = progress === 1 ? end : nextCount;
        setState(prev => {
          if (prev.currentCount !== finalCount) playTick();
          return { ...prev, currentCount: finalCount, progress: progress };
        });
        if (progress < 1) {
          timerRef.current = requestAnimationFrame(tick);
        } else {
          setState(prev => ({ ...prev, isPreviewing: false, isExporting: false, progress: 1, currentCount: end }));
          resolve();
        }
      };
      timerRef.current = requestAnimationFrame(tick);
    });
  };

  const handleExport = async () => {
    const { format, resolution, fps } = state.exportSettings;
    setState(s => ({ ...s, isExporting: true }));
    const target = document.getElementById('export-target');
    if (!target) return;

    if (format === 'png') {
      await runSequence(true);
      // @ts-ignore
      const canvas = await html2canvas(target, { backgroundColor: '#000', scale: 2 });
      const link = document.createElement('a');
      link.download = `llumina-frame-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setState(s => ({ ...s, isExporting: false }));
      return;
    }

    const canvasEl = document.createElement('canvas');
    const ctx = canvasEl.getContext('2d');
    const resScale = resolution === '4k' ? 4 : resolution === '1080p' ? 3 : 2;
    canvasEl.width = state.canvas.width * resScale;
    canvasEl.height = state.canvas.height * resScale;

    const stream = canvasEl.captureStream(fps);
    const recorder = new MediaRecorder(stream, {
      mimeType: MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : 'video/webm',
      videoBitsPerSecond: resolution === '4k' ? 20000000 : 10000000
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `llumina-motion-${Date.now()}.${format === 'mp4' ? 'mp4' : 'webm'}`;
      a.click();
      setState(s => ({ ...s, isExporting: false }));
    };

    recorder.start();
    let isRecording = true;
    const captureFrame = async () => {
      if (!isRecording) return;
      // @ts-ignore
      const snap = await html2canvas(target, { backgroundColor: '#000', scale: resScale, logging: false, useCORS: true });
      if (ctx) {
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.drawImage(snap, 0, 0);
      }
      if (isRecording) requestAnimationFrame(captureFrame);
    };

    captureFrame();
    await runSequence(true);
    setTimeout(() => { isRecording = false; recorder.stop(); }, 500);
  };

  const updateTransform = (id: 'ring' | 'countdown' | 'status' | 'custom' | 'percentage', updates: Partial<ElementTransform>) => {
    const nextState = { ...state, transforms: { ...state.transforms, [id]: { ...state.transforms[id], ...updates } } };
    pushHistory(nextState);
    setState(nextState);
  };

  return (
    <div className={`flex flex-col lg:flex-row h-[100dvh] w-screen overflow-hidden transition-colors duration-500 ${state.visuals.theme === 'dark' ? 'dark bg-black text-white' : 'bg-white text-black'} relative`}>
      <div className="lg:hidden flex items-center justify-between px-6 h-20 bg-white dark:bg-black border-b border-[#F0F0F0] dark:border-[#262626] z-50">
        <div className="flex items-center">
          <div className="w-2.5 h-2.5 bg-black dark:bg-white rounded-full mr-2" />
          <span className="font-bold text-lg tracking-tighter">llumina</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-12 w-12 flex items-center justify-center bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-2xl active:scale-95 transition-all"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className={`fixed inset-0 lg:relative lg:inset-auto z-40 transform transition-transform duration-500 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar 
          state={state} 
          onUpdateVisuals={(u) => setState(s => ({ ...s, visuals: { ...s.visuals, ...u } }))}
          onUpdateSequence={(u) => setState(s => ({ ...s, sequence: { ...s.sequence, ...u } }))}
          onUpdateVisibility={(u) => setState(s => ({ ...s, visibility: { ...s.visibility, ...u } }))}
          onUpdateCanvas={(u) => setState(s => ({ ...s, canvas: { ...s.canvas, ...u } }))}
          onUpdateExportSettings={(u) => setState(s => ({ ...s, exportSettings: { ...s.exportSettings, ...u } }))}
          onUpdateTransform={updateTransform}
          onSelectElement={(id) => setState(s => ({ ...s, selectedElement: id }))}
          onPreview={() => runSequence(false)}
          onExport={handleExport}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
          onUndo={undo}
          onRedo={redo}
        />
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute inset-0 bg-black/5 dark:bg-white/5 backdrop-blur-sm -z-10 pointer-events-auto"
          style={{ width: '100vw', transform: 'translateX(420px)' }}
        />
      </div>

      <main className="flex-1 relative bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-hidden">
        <PreviewStage state={state} onSelectElement={(id) => setState(s => ({ ...s, selectedElement: id }))} />
      </main>
    </div>
  );
};

export default App;
