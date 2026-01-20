
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Sidebar from './components/Sidebar.tsx';
import PreviewStage from './components/PreviewStage.tsx';
import { AppState, ElementTransform, ExportSettings, VisualConfig, SequenceConfig, VisibilityConfig } from './types.ts';
import { Menu, X } from 'lucide-react';

const HISTORY_LIMIT = 50;

// Default initial state for the countdown application
const INITIAL_STATE: AppState = {
  sequence: { start: 10, end: 0, duration: 10 },
  visuals: {
    theme: 'dark',
    accentColor: '#007AFF',
    ringColor: '#007AFF',
    font: "'Plus Jakarta Sans', sans-serif",
    glow: true,
    sound: true,
    backgroundStyle: 'solid',
    motivationalText: 'GET READY',
    startText: 'PREPARE',
    endText: 'GO!',
    customText: 'STAY FOCUSED',
    ringThickness: 4,
  },
  visibility: {
    showRing: true,
    showCountdown: true,
    showStatus: true,
    showCustom: false,
    showPercentage: true,
    isPrime: false,
  },
  transforms: {
    ring: { x: 0, y: 0, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
    countdown: { x: 0, y: -20, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
    status: { x: 0, y: 140, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
    custom: { x: 0, y: -180, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
    percentage: { x: 0, y: 240, scale: 1, opacity: 1, crop: { top: 0, right: 0, bottom: 0, left: 0 } },
  },
  canvas: {
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
  },
  exportSettings: {
    format: 'mp4',
    resolution: '1080p',
    fps: 30,
    quality: 0.9,
  },
  selectedElement: null,
  isExporting: false,
  isPreviewing: false,
  progress: 0,
  currentCount: 10,
};

// Main App component implementation with state management and history support
const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [history, setHistory] = useState<AppState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const previewTimerRef = useRef<number | null>(null);

  // Helper to manage undo/redo history
  const pushToHistory = useCallback((newState: AppState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      if (newHistory.length > HISTORY_LIMIT) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, HISTORY_LIMIT - 1));
  }, [historyIndex]);

  // Handle visual configuration updates
  const onUpdateVisuals = (updates: Partial<VisualConfig>) => {
    const newState = { ...state, visuals: { ...state.visuals, ...updates } };
    setState(newState);
    pushToHistory(newState);
  };

  // Handle countdown sequence updates
  const onUpdateSequence = (updates: Partial<SequenceConfig>) => {
    const newState = { 
      ...state, 
      sequence: { ...state.sequence, ...updates },
      currentCount: updates.start !== undefined ? updates.start : state.sequence.start
    };
    setState(newState);
    pushToHistory(newState);
  };

  // Handle element visibility toggles
  const onUpdateVisibility = (updates: Partial<VisibilityConfig>) => {
    const newState = { ...state, visibility: { ...state.visibility, ...updates } };
    setState(newState);
    pushToHistory(newState);
  };

  // Handle canvas resolution and aspect ratio updates
  const onUpdateCanvas = (updates: Partial<AppState['canvas']>) => {
    const newState = { ...state, canvas: { ...state.canvas, ...updates } };
    setState(newState);
    pushToHistory(newState);
  };

  // Handle video export settings updates
  const onUpdateExportSettings = (updates: Partial<ExportSettings>) => {
    const newState = { ...state, exportSettings: { ...state.exportSettings, ...updates } };
    setState(newState);
    pushToHistory(newState);
  };

  // Handle element position, scale and crop updates
  const onUpdateTransform = (id: keyof AppState['transforms'], updates: Partial<ElementTransform>) => {
    const newState = {
      ...state,
      transforms: {
        ...state.transforms,
        [id]: { ...state.transforms[id], ...updates }
      }
    };
    setState(newState);
    pushToHistory(newState);
  };

  // Select an element for manipulation in the stage
  const onSelectElement = (id: AppState['selectedElement']) => {
    setState(prev => ({ ...prev, selectedElement: id }));
  };

  // Undo the last state change
  const onUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setState(history[prevIndex]);
    }
  };

  // Redo a previously undone state change
  const onRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setState(history[nextIndex]);
    }
  };

  // Start or stop the real-time preview of the countdown
  const onPreview = () => {
    if (state.isPreviewing) {
      if (previewTimerRef.current) clearInterval(previewTimerRef.current);
      setState(prev => ({ ...prev, isPreviewing: false, progress: 0, currentCount: prev.sequence.start }));
      return;
    }

    setState(prev => ({ ...prev, isPreviewing: true, progress: 0, currentCount: prev.sequence.start }));
    
    const startTime = Date.now();
    const duration = state.sequence.duration * 1000;
    const startVal = state.sequence.start;
    const endVal = state.sequence.end;

    previewTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentCount = Math.round(startVal + (endVal - startVal) * progress);

      setState(prev => ({ ...prev, progress, currentCount }));

      if (progress >= 1) {
        if (previewTimerRef.current) clearInterval(previewTimerRef.current);
        setTimeout(() => setState(prev => ({ ...prev, isPreviewing: false })), 1000);
      }
    }, 16);
  };

  // Placeholder for export functionality
  const onExport = async () => {
    setState(prev => ({ ...prev, isExporting: true }));
    await new Promise(resolve => setTimeout(resolve, 3000));
    setState(prev => ({ ...prev, isExporting: false }));
    alert("Signal extraction complete. Your motion asset is ready.");
  };

  // Apply dark/light theme classes to document element
  useEffect(() => {
    if (state.visuals.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.visuals.theme]);

  return (
    <div className="flex h-screen w-full bg-[#FAFAFA] dark:bg-[#0A0A0A] overflow-hidden font-sans transition-colors duration-500">
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 p-4 bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800"
      >
        {isSidebarOpen ? <X size={20} className="dark:text-white" /> : <Menu size={20} className="dark:text-white" />}
      </button>

      <div className={`fixed inset-0 lg:relative lg:flex overflow-hidden transition-all duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100 lg:w-0'}`}>
        <Sidebar 
          state={state}
          onUpdateVisuals={onUpdateVisuals}
          onUpdateSequence={onUpdateSequence}
          onUpdateVisibility={onUpdateVisibility}
          onUpdateCanvas={onUpdateCanvas}
          onUpdateExportSettings={onUpdateExportSettings}
          onUpdateTransform={onUpdateTransform}
          onSelectElement={onSelectElement}
          onPreview={onPreview}
          onExport={onExport}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          onUndo={onUndo}
          onRedo={onRedo}
        />
      </div>
      
      <main className="flex-1 relative overflow-hidden">
        <PreviewStage 
          state={state} 
          onSelectElement={onSelectElement} 
        />
      </main>
    </div>
  );
};

// Fixed the "no default export" error by exporting the App component
export default App;
