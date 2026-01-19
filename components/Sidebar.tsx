
import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  Clock,
  Type as TypeIcon,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  Undo2,
  Redo2,
  ALargeSmall,
  Percent,
  Settings2,
  Sun,
  Moon,
  Sparkles,
  Loader2
} from 'lucide-react';
import { AppState, FontOption, VisualConfig, SequenceConfig, VisibilityConfig, ElementTransform, ExportSettings } from '../types';
import { generateThemeFromVibe } from '../services/gemini';

interface SidebarProps {
  state: AppState;
  onUpdateVisuals: (updates: Partial<VisualConfig>) => void;
  onUpdateSequence: (updates: Partial<SequenceConfig>) => void;
  onUpdateVisibility: (updates: Partial<VisibilityConfig>) => void;
  onUpdateCanvas: (updates: Partial<AppState['canvas']>) => void;
  onUpdateExportSettings: (updates: Partial<ExportSettings>) => void;
  onUpdateTransform: (id: 'ring' | 'countdown' | 'status' | 'custom' | 'percentage', updates: Partial<ElementTransform>) => void;
  onSelectElement: (id: AppState['selectedElement']) => void;
  onPreview: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const LLUMINA_COLORS = ["#000000", "#71717A", "#007AFF", "#32D74B", "#FF3B30", "#FF9500", "#5856D6", "#AF52DE"];
const FONTS: { label: string; value: FontOption }[] = [
  { label: 'Jakarta', value: "'Plus Jakarta Sans', sans-serif" as any },
  { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { label: 'Oswald', value: "'Oswald', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Roboto Mono', value: "'Roboto Mono', monospace" },
];

const Sidebar: React.FC<SidebarProps> = ({ 
  state, 
  onUpdateVisuals, 
  onUpdateSequence, 
  onUpdateVisibility, 
  onUpdateCanvas, 
  onUpdateExportSettings,
  onUpdateTransform, 
  onSelectElement, 
  onPreview, 
  onExport,
  canUndo,
  canRedo,
  onUndo,
  onRedo
}) => {
  const selected = state.selectedElement;
  const currentTransform = selected ? state.transforms[selected] : null;
  const isDark = state.visuals.theme === 'dark';
  
  const [vibeInput, setVibeInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAIGenerate = async () => {
    if (!vibeInput.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const suggestion = await generateThemeFromVibe(vibeInput);
      onUpdateVisuals({
        accentColor: suggestion.accentColor,
        ringColor: suggestion.accentColor,
        font: suggestion.font,
        backgroundStyle: suggestion.backgroundStyle,
        motivationalText: suggestion.motivationalText
      });
      setVibeInput('');
    } catch (err) {
      console.error(err);
      alert("AI Generation failed. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAlign = (axis: 'h' | 'v', alignment: 'start' | 'center' | 'end') => {
    if (!selected || !currentTransform) return;
    const estimates = { 
      ring: { w: 300, h: 300 }, 
      countdown: { w: 200, h: 120 }, 
      status: { w: 240, h: 80 },
      custom: { w: 240, h: 80 },
      percentage: { w: 180, h: 60 }
    };
    const size = estimates[selected];
    const canvas = state.canvas;
    const scale = currentTransform.scale;
    const margin = 20;

    if (axis === 'h') {
      let x = 0;
      if (alignment === 'start') x = -(canvas.width / 2) + (size.w * scale / 2) + margin;
      else if (alignment === 'end') x = (canvas.width / 2) - (size.w * scale / 2) - margin;
      onUpdateTransform(selected, { x: Math.round(x) });
    } else {
      let y = 0;
      if (alignment === 'start') y = -(canvas.height / 2) + (size.h * scale / 2) + margin;
      else if (alignment === 'end') y = (canvas.height / 2) - (size.h * scale / 2) - margin;
      onUpdateTransform(selected, { y: Math.round(y) });
    }
  };

  return (
    <aside className="w-full lg:w-[420px] h-full bg-white dark:bg-black lg:border-r border-[#F0F0F0] dark:border-[#1A1A1A] flex flex-col z-30 llumina-reveal overflow-hidden transition-colors duration-500">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto momentum-scroll p-6 lg:p-8 space-y-10 pb-40 no-scrollbar">
        {/* Header with Undo/Redo & Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-black dark:bg-white rounded-full" />
            <span className="font-bold text-xl tracking-tighter dark:text-white">llumina</span>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1 bg-[#F8F8F8] dark:bg-[#1A1A1A] p-1.5 rounded-2xl">
              <button onClick={onUndo} disabled={!canUndo} className={`p-2.5 rounded-xl transition-all active:scale-95 ${canUndo ? 'text-black dark:text-white hover:bg-white dark:hover:bg-black' : 'text-zinc-300 dark:text-zinc-700'}`}><Undo2 size={18} /></button>
              <button onClick={onRedo} disabled={!canRedo} className={`p-2.5 rounded-xl transition-all active:scale-95 ${canRedo ? 'text-black dark:text-white hover:bg-white dark:hover:bg-black' : 'text-zinc-300 dark:text-zinc-700'}`}><Redo2 size={18} /></button>
            </div>
            <button 
              onClick={() => onUpdateVisuals({ theme: isDark ? 'light' : 'dark' })}
              className="h-12 w-12 flex items-center justify-center bg-[#F8F8F8] dark:bg-[#1A1A1A] rounded-2xl active:scale-90 transition-all border border-[#F0F0F0] dark:border-[#262626]"
            >
              {isDark ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-black" />}
            </button>
          </div>
        </div>

        {/* AI Vibe Section */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Intelligence Engine</label>
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-[#0D0D0D] dark:to-black border border-indigo-100 dark:border-[#1A1A1A] rounded-[40px] p-8 shadow-sm space-y-6">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-indigo-400 dark:text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Sparkles size={14} /> Style by Vibe
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={vibeInput}
                  onChange={(e) => setVibeInput(e.target.value)}
                  placeholder="e.g. 'Cyberpunk 2077' or 'Cozy Minimalist'"
                  className="flex-1 h-[56px] bg-white dark:bg-[#1A1A1A] border border-indigo-50 dark:border-[#262626] rounded-2xl px-5 text-sm outline-none focus:border-indigo-400 dark:focus:border-white transition-all dark:text-white placeholder:text-zinc-300"
                />
                <button 
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !vibeInput.trim()}
                  className="h-[56px] w-[56px] flex items-center justify-center bg-black dark:bg-white rounded-2xl active:scale-90 transition-all disabled:opacity-30"
                >
                  {isGenerating ? <Loader2 size={20} className="animate-spin text-white dark:text-black" /> : <Sparkles size={20} className="text-white dark:text-black" />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration Sections */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Signal Configuration</label>
          <div className="bg-white dark:bg-[#0D0D0D] border border-[#F0F0F0] dark:border-[#1A1A1A] rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-10 transition-colors duration-500">
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Accent Palette</label>
              <div className="flex flex-wrap gap-3">
                {LLUMINA_COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => onUpdateVisuals({ accentColor: color, ringColor: color })} 
                    style={{ backgroundColor: color }} 
                    className={`w-9 h-9 rounded-full border-2 transition-all active:scale-90 ${state.visuals.accentColor === color ? 'border-black dark:border-white ring-4 ring-zinc-50 dark:ring-zinc-900' : 'border-zinc-100 dark:border-[#262626]'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Typography Engine</label>
              <div className="relative">
                <select 
                  value={state.visuals.font} 
                  onChange={(e) => onUpdateVisuals({ font: e.target.value as FontOption })}
                  className="w-full h-[56px] bg-[#F8F8F8] dark:bg-[#1A1A1A] border border-[#F0F0F0] dark:border-[#262626] rounded-2xl px-6 text-base font-semibold outline-none focus:border-black dark:focus:border-white transition-all appearance-none dark:text-white"
                >
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 dark:text-white">
                  <ALargeSmall size={18} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Temporal Card */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Temporal Metrics</label>
          <div className="bg-[#F8F8F8] dark:bg-[#141414] border border-[#F0F0F0] dark:border-[#262626] rounded-[40px] p-8 space-y-8 transition-colors duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Origin</label>
                <input type="number" value={state.sequence.start} onChange={(e) => onUpdateSequence({ start: parseInt(e.target.value) || 0 })} className="w-full h-[56px] bg-white dark:bg-[#0A0A0A] border border-[#F0F0F0] dark:border-[#262626] rounded-2xl px-6 text-base font-bold text-center dark:text-white" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Target</label>
                <input type="number" value={state.sequence.end} onChange={(e) => onUpdateSequence({ end: parseInt(e.target.value) || 0 })} className="w-full h-[56px] bg-white dark:bg-[#0A0A0A] border border-[#F0F0F0] dark:border-[#262626] rounded-2xl px-6 text-base font-bold text-center dark:text-white" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Duration Seconds</label>
              <input type="number" step="0.5" value={state.sequence.duration} onChange={(e) => onUpdateSequence({ duration: parseFloat(e.target.value) || 1 })} className="w-full h-[56px] bg-white dark:bg-[#0A0A0A] border border-[#F0F0F0] dark:border-[#262626] rounded-2xl px-6 text-base font-black text-black dark:text-white text-center" />
            </div>
          </div>
        </section>

        {/* Layer Selector */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em]">Active Components</label>
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 no-scrollbar">
            {[ 
              { id: 'ring', icon: Maximize2, label: 'Ring' }, 
              { id: 'countdown', icon: TypeIcon, label: 'Digits' }, 
              { id: 'status', icon: Clock, label: 'State' },
              { id: 'custom', icon: ALargeSmall, label: 'Text' },
              { id: 'percentage', icon: Percent, label: '%' }
            ].map(el => (
              <button
                key={el.id}
                onClick={() => onSelectElement(el.id as any)}
                className={`flex-shrink-0 flex flex-col items-center justify-center gap-3 w-20 h-24 rounded-[28px] border transition-all active:scale-95 ${selected === el.id ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black shadow-xl' : 'bg-white dark:bg-[#0D0D0D] border-[#F0F0F0] dark:border-[#262626] text-zinc-400'}`}
              >
                <el.icon size={22} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{el.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Contextual Editor */}
        {selected && currentTransform && (
          <section className="bg-white dark:bg-[#0D0D0D] border border-[#F0F0F0] dark:border-[#1A1A1A] rounded-[40px] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Settings2 size={16} className="text-black dark:text-white" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em] leading-[0.9] dark:text-white">{selected}</span>
              </div>
              <button 
                onClick={() => onUpdateVisibility({ [`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig]: !state.visibility[`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig] })} 
                className={`h-10 px-5 rounded-full text-[10px] font-bold uppercase transition-all active:scale-95 ${state.visibility[`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig] ? 'bg-[#F8F8F8] dark:bg-[#1A1A1A] text-zinc-500 dark:text-zinc-400' : 'bg-black dark:bg-white text-white dark:text-black'}`}
              >
                {state.visibility[`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig] ? 'Visible' : 'Hidden'}
              </button>
            </div>
            
            <div className="space-y-10">
              {selected === 'ring' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Ring Stroke</label>
                    <span className="text-[11px] font-mono font-bold dark:text-white">{state.visuals.ringThickness}px</span>
                  </div>
                  <input type="range" min="1" max="40" step="1" value={state.visuals.ringThickness} onChange={(e) => onUpdateVisuals({ ringThickness: parseInt(e.target.value) })} className="w-full" />
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Spatial Scale</label>
                  <span className="text-[11px] font-mono font-bold dark:text-white">{Math.round(currentTransform.scale * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="5" step="0.01" value={currentTransform.scale} onChange={(e) => onUpdateTransform(selected, { scale: parseFloat(e.target.value) })} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">X Point</label>
                  <input type="number" value={currentTransform.x} onChange={(e) => onUpdateTransform(selected, { x: parseInt(e.target.value) || 0 })} className="w-full h-[56px] bg-[#F8F8F8] dark:bg-[#1A1A1A] border border-[#F0F0F0] dark:border-[#262626] rounded-2xl px-5 text-base font-bold text-center dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Y Point</label>
                  <input type="number" value={currentTransform.y} onChange={(e) => onUpdateTransform(selected, { y: parseInt(e.target.value) || 0 })} className="w-full h-[56px] bg-[#F8F8F8] dark:bg-[#1A1A1A] border border-[#F0F0F0] dark:border-[#262626] rounded-2xl px-5 text-base font-bold text-center dark:text-white" />
                </div>
              </div>

              {/* Alignment Buttons */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Alignment Tools</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex bg-[#F8F8F8] dark:bg-[#1A1A1A] p-1.5 rounded-2xl">
                    <button onClick={() => handleAlign('h', 'start')} className="flex-1 h-12 flex justify-center items-center text-zinc-400 hover:text-black dark:hover:text-white active:scale-95 transition-all"><AlignLeft size={20} /></button>
                    <button onClick={() => handleAlign('h', 'center')} className="flex-1 h-12 flex justify-center items-center text-zinc-400 hover:text-black dark:hover:text-white active:scale-95 transition-all"><AlignCenter size={20} /></button>
                    <button onClick={() => handleAlign('h', 'end')} className="flex-1 h-12 flex justify-center items-center text-zinc-400 hover:text-black dark:hover:text-white active:scale-95 transition-all"><AlignRight size={20} /></button>
                  </div>
                  <div className="flex bg-[#F8F8F8] dark:bg-[#1A1A1A] p-1.5 rounded-2xl">
                    <button onClick={() => handleAlign('v', 'start')} className="flex-1 h-12 flex justify-center items-center text-zinc-400 hover:text-black dark:hover:text-white active:scale-95 transition-all"><AlignStartVertical size={20} /></button>
                    <button onClick={() => handleAlign('v', 'center')} className="flex-1 h-12 flex justify-center items-center text-zinc-400 hover:text-black dark:hover:text-white active:scale-95 transition-all"><AlignCenterVertical size={20} /></button>
                    <button onClick={() => handleAlign('v', 'end')} className="flex-1 h-12 flex justify-center items-center text-zinc-400 hover:text-black dark:hover:text-white active:scale-95 transition-all"><AlignEndVertical size={20} /></button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Primary Bottom Actions - Ergonomic Sticky Bar */}
      <div className="fixed bottom-0 left-0 lg:absolute w-full p-6 lg:p-8 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-[#F0F0F0] dark:border-[#1A1A1A] space-y-4 z-40">
        <div className="flex gap-4">
          <button 
            onClick={onPreview} 
            disabled={state.isExporting}
            className="flex-1 h-[56px] lg:h-[64px] bg-[#F8F8F8] dark:bg-[#1A1A1A] hover:bg-zinc-100 dark:hover:bg-[#262626] text-black dark:text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[11px] uppercase tracking-[0.4em] border border-[#F0F0F0] dark:border-[#262626]"
          >
            <Play size={18} fill={isDark ? "white" : "black"} /> Preview
          </button>
          <button 
            onClick={onExport} 
            disabled={state.isExporting}
            className="flex-[2] h-[56px] lg:h-[64px] bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:bg-zinc-900 dark:hover:bg-zinc-100 transition-all active:scale-95 text-[12px] uppercase tracking-[0.4em]"
          >
            {state.isExporting ? <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : <Download size={20} />} 
            {state.isExporting ? 'Extracting' : 'Export Motion'}
          </button>
        </div>
        <div className="text-center pt-2">
          <p className="text-[10px] text-zinc-400 font-bold tracking-[0.2em] uppercase">© llumina 2026</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
