
import React from 'react';
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
  Video,
  Monitor,
  Activity,
  Droplet
} from 'lucide-react';
import { AppState, FontOption, VisualConfig, SequenceConfig, VisibilityConfig, ElementTransform, ExportSettings } from '../types';

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
    <aside className="w-full lg:w-[420px] h-screen bg-white lg:border-r border-zinc-100 flex flex-col overflow-y-auto z-30 llumina-reveal">
      <div className="p-8 space-y-10 flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-black rounded-full" />
            <span className="font-bold text-xl tracking-tighter">llumina</span>
          </div>
          <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-xl">
            <button onClick={onUndo} disabled={!canUndo} className={`p-2 rounded-lg transition-all ${canUndo ? 'text-black hover:bg-white hover:shadow-sm' : 'text-zinc-300'}`}><Undo2 size={16} /></button>
            <button onClick={onRedo} disabled={!canRedo} className={`p-2 rounded-lg transition-all ${canRedo ? 'text-black hover:bg-white hover:shadow-sm' : 'text-zinc-300'}`}><Redo2 size={16} /></button>
          </div>
        </div>

        {/* Visuals Card */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Signal Configuration</label>
          <div className="bg-white border border-zinc-100 rounded-[32px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.03)] space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Accent Color</label>
              <div className="flex flex-wrap gap-2.5">
                {LLUMINA_COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => onUpdateVisuals({ accentColor: color, ringColor: color })} 
                    style={{ backgroundColor: color }} 
                    className={`w-7 h-7 rounded-full border transition-all ${state.visuals.accentColor === color ? 'border-black scale-110 shadow-lg ring-4 ring-zinc-50' : 'border-zinc-100'}`} 
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Typography Engine</label>
              <select 
                value={state.visuals.font} 
                onChange={(e) => onUpdateVisuals({ font: e.target.value as FontOption })}
                className="w-full bg-[#f8f8f8] border border-zinc-100 rounded-[18px] px-5 py-4 text-sm font-medium outline-none focus:border-black transition-all appearance-none"
              >
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* Timeline Configuration */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Temporal Sequence</label>
          <div className="bg-[#f8f8f8] border border-zinc-100 rounded-[32px] p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Origin</label>
                <input type="number" value={state.sequence.start} onChange={(e) => onUpdateSequence({ start: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Target</label>
                <input type="number" value={state.sequence.end} onChange={(e) => onUpdateSequence({ end: parseInt(e.target.value) || 0 })} className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-3 text-sm font-bold" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Duration (sec)</label>
              <input type="number" step="0.5" value={state.sequence.duration} onChange={(e) => onUpdateSequence({ duration: parseFloat(e.target.value) || 1 })} className="w-full bg-white border border-zinc-100 rounded-xl px-4 py-3 text-sm font-black text-black" />
            </div>
          </div>
        </section>

        {/* Layers Section */}
        <section className="space-y-6">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Component Layers</label>
          <div className="grid grid-cols-5 gap-3">
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
                className={`flex flex-col items-center gap-3 p-3.5 rounded-2xl border transition-all ${selected === el.id ? 'bg-black border-black text-white shadow-xl -translate-y-1' : 'bg-white border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
              >
                <el.icon size={18} />
                <span className="text-[8px] font-black uppercase tracking-[0.2em]">{el.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Editor Modal Style Card */}
        {selected && currentTransform && (
          <section className="bg-white border border-zinc-200 rounded-[32px] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Settings2 size={14} className="text-black" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{selected}</span>
              </div>
              <button 
                onClick={() => onUpdateVisibility({ [`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig]: !state.visibility[`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig] })} 
                className={`text-[9px] font-bold uppercase transition-colors px-3 py-1 rounded-full ${state.visibility[`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig] ? 'bg-zinc-100 text-zinc-500' : 'bg-black text-white'}`}
              >
                {state.visibility[`show${selected.charAt(0).toUpperCase() + selected.slice(1)}` as keyof VisibilityConfig] ? 'Visible' : 'Hidden'}
              </button>
            </div>
            
            <div className="space-y-8">
              {selected === 'ring' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Ring Stroke</label>
                    <span className="text-[10px] font-mono font-bold">{state.visuals.ringThickness}px</span>
                  </div>
                  <input type="range" min="1" max="40" step="1" value={state.visuals.ringThickness} onChange={(e) => onUpdateVisuals({ ringThickness: parseInt(e.target.value) })} className="w-full" />
                  <div className="flex gap-1.5 mt-2">
                    {LLUMINA_COLORS.map(color => (
                      <button 
                        key={color} 
                        onClick={() => onUpdateVisuals({ ringColor: color })} 
                        style={{ backgroundColor: color }} 
                        className={`w-5 h-5 rounded-full border transition-all ${state.visuals.ringColor === color ? 'border-black scale-110 shadow-sm' : 'border-zinc-200'}`} 
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Scale Factor</label>
                  <span className="text-[10px] font-mono font-bold">{Math.round(currentTransform.scale * 100)}%</span>
                </div>
                <input type="range" min="0.1" max="5" step="0.01" value={currentTransform.scale} onChange={(e) => onUpdateTransform(selected, { scale: parseFloat(e.target.value) })} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.3em]">X Offset</label>
                  <input type="number" value={currentTransform.x} onChange={(e) => onUpdateTransform(selected, { x: parseInt(e.target.value) || 0 })} className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-xs font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Y Offset</label>
                  <input type="number" value={currentTransform.y} onChange={(e) => onUpdateTransform(selected, { y: parseInt(e.target.value) || 0 })} className="w-full bg-[#f8f8f8] rounded-xl px-4 py-3 text-xs font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex gap-1">
                  <button onClick={() => handleAlign('h', 'start')} className="flex-1 py-3 bg-zinc-50 rounded-xl flex justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all"><AlignLeft size={16} /></button>
                  <button onClick={() => handleAlign('h', 'center')} className="flex-1 py-3 bg-zinc-50 rounded-xl flex justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all"><AlignCenter size={16} /></button>
                  <button onClick={() => handleAlign('h', 'end')} className="flex-1 py-3 bg-zinc-50 rounded-xl flex justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all"><AlignRight size={16} /></button>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleAlign('v', 'start')} className="flex-1 py-3 bg-zinc-50 rounded-xl flex justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all"><AlignStartVertical size={16} /></button>
                  <button onClick={() => handleAlign('v', 'center')} className="flex-1 py-3 bg-zinc-50 rounded-xl flex justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all"><AlignCenterVertical size={16} /></button>
                  <button onClick={() => handleAlign('v', 'end')} className="flex-1 py-3 bg-zinc-50 rounded-xl flex justify-center text-zinc-400 hover:text-black hover:bg-zinc-100 transition-all"><AlignEndVertical size={16} /></button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Global Actions Bar */}
      <div className="p-8 bg-white border-t border-zinc-100 space-y-4">
        <button 
          onClick={onPreview} 
          disabled={state.isExporting}
          className="w-full bg-zinc-50 hover:bg-zinc-100 text-black font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 text-[10px] uppercase tracking-[0.4em] border border-zinc-100"
        >
          <Play size={16} fill="black" /> Preview Sequence
        </button>
        <button 
          onClick={onExport} 
          disabled={state.isExporting}
          className="w-full bg-black text-white font-bold py-6 rounded-2xl flex items-center justify-center gap-4 shadow-xl hover:bg-zinc-900 transition-all active:scale-95 text-[11px] uppercase tracking-[0.4em]"
        >
          {state.isExporting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Download size={18} />} 
          {state.isExporting ? 'Capturing' : 'Finalize Export'}
        </button>
        <div className="text-center pt-2">
          <p className="text-[9px] text-zinc-400 font-medium tracking-[0.2em] uppercase">© llumina 2026. Signal, not noise.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
