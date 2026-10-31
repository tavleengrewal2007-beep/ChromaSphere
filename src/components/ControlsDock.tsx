import React, { useState } from 'react';
import {
  Heart,
  Flower2,
  Globe2,
  Sparkles,
  Flame,
  Infinity as InfinityIcon,
  Disc3,
  Boxes,
  Dna,
  Box,
  Gem,
  Orbit,
  Palette,
  MousePointer2,
  Sliders,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Radio,
  Share2,
  Wind,
  Magnet,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ShapeType,
  ColorPalette,
  MouseInteractionMode,
  ParticleTextureType,
  ParticleConfig,
} from '../types.ts';

interface ControlsDockProps {
  config: ParticleConfig;
  onChange: (patch: Partial<ParticleConfig>) => void;
  isCinemaMode: boolean;
  onToggleCinemaMode: () => void;
}

const SHAPES: Array<{ id: ShapeType; label: string; icon: React.ReactNode }> = [
  { id: 'hearts', label: 'Hearts', icon: <Heart className="w-4 h-4" /> },
  { id: 'flowers', label: 'Flowers', icon: <Flower2 className="w-4 h-4" /> },
  { id: 'saturn', label: 'Saturn', icon: <Globe2 className="w-4 h-4" /> },
  { id: 'buddha', label: 'Buddha', icon: <Boxes className="w-4 h-4" /> },
  { id: 'fireworks', label: 'Fireworks', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'torusKnot', label: 'Torus Knot', icon: <InfinityIcon className="w-4 h-4" /> },
  { id: 'galaxy', label: 'Galaxy', icon: <Disc3 className="w-4 h-4" /> },
  { id: 'merkaba', label: 'Merkaba', icon: <Box className="w-4 h-4" /> },
  { id: 'dnaHelix', label: 'DNA Helix', icon: <Dna className="w-4 h-4" /> },
  { id: 'tesseract', label: 'Tesseract', icon: <Boxes className="w-4 h-4" /> },
  { id: 'diamond', label: 'Diamond', icon: <Gem className="w-4 h-4" /> },
  { id: 'blackhole', label: 'Black Hole', icon: <Orbit className="w-4 h-4" /> },
];

const PALETTES: Array<{ id: ColorPalette; label: string; previewGradient: string }> = [
  {
    id: 'neon',
    label: 'Cyber Neon',
    previewGradient: 'from-cyan-400 via-fuchsia-500 to-purple-600',
  },
  {
    id: 'rainbow',
    label: 'Rainbow',
    previewGradient: 'from-red-500 via-yellow-400 to-blue-500',
  },
  {
    id: 'aurora',
    label: 'Cosmic Aurora',
    previewGradient: 'from-emerald-400 via-teal-400 to-indigo-500',
  },
  {
    id: 'solar',
    label: 'Solar Flare',
    previewGradient: 'from-yellow-300 via-amber-500 to-red-600',
  },
  {
    id: 'opal',
    label: 'Opal Shimmer',
    previewGradient: 'from-rose-300 via-cyan-200 to-purple-300',
  },
  {
    id: 'starlight',
    label: 'Starlight',
    previewGradient: 'from-white via-sky-100 to-slate-400',
  },
  {
    id: 'custom',
    label: 'Custom Dual',
    previewGradient: 'from-emerald-400 to-rose-500',
  },
];

const MOUSE_MODES: Array<{
  id: MouseInteractionMode;
  label: string;
  icon: React.ReactNode;
  desc: string;
}> = [
  { id: 'vortex', label: 'Vortex Swirl', icon: <Wind className="w-4 h-4" />, desc: 'Swirls particles in dynamic Keplerian orbit' },
  { id: 'repel', label: 'Shock Repel', icon: <Radio className="w-4 h-4" />, desc: 'Explosive kinetic force pushing particles away' },
  { id: 'attract', label: 'Gravity Well', icon: <Magnet className="w-4 h-4" />, desc: 'Black hole pull drawing particles to cursor' },
  { id: 'plexus', label: 'Constellation', icon: <Share2 className="w-4 h-4" />, desc: 'Glowing energy plexus lines connect nearby particles' },
  { id: 'wave', label: 'Cosmic Wave', icon: <Activity className="w-4 h-4" />, desc: 'Sinusoidal harmonic ripples emanate from pointer' },
];

const TEXTURE_MODES: Array<{ id: ParticleTextureType; label: string }> = [
  { id: 'glow', label: 'Radiant Orb' },
  { id: 'star', label: 'Starlight Cross' },
  { id: 'crystal', label: 'Faceted Diamond' },
  { id: 'ring', label: 'Halo Ring' },
];

export const ControlsDock: React.FC<ControlsDockProps> = ({
  config,
  onChange,
  isCinemaMode,
  onToggleCinemaMode,
}) => {
  const [activeTab, setActiveTab] = useState<'shapes' | 'colors' | 'mouse' | 'physics'>('shapes');

  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94vw] max-w-[920px] transition-all duration-300 ${
        isCinemaMode ? 'translate-y-[calc(100%-2.25rem)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Toggle Button */}
      <div className="flex justify-center -mb-px">
        <button
          onClick={onToggleCinemaMode}
          className="flex items-center gap-1.5 px-4 py-1 rounded-t-xl bg-zinc-900/90 text-zinc-300 hover:text-white border-t border-x border-white/10 text-xs font-medium backdrop-blur-md shadow-lg transition-colors cursor-pointer"
        >
          {isCinemaMode ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Show Controls (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
              <span>Cinema Mode / Hide (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl p-4 flex flex-col gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('shapes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'shapes'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" />
              <span>Shapes ({SHAPES.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'colors'
                  ? 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Colors & Shaders</span>
            </button>

            <button
              onClick={() => setActiveTab('mouse')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'mouse'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MousePointer2 className="w-3.5 h-3.5" />
              <span>Mouse Interaction</span>
            </button>

            <button
              onClick={() => setActiveTab('physics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'physics'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Physics & Solids</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-400">
            <span>Click canvas for shockwave pulse</span>
          </div>
        </div>

        {/* Tab 1: Shapes */}
        {activeTab === 'shapes' && (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-[140px] overflow-y-auto pr-1">
            {SHAPES.map((item) => {
              const isActive = config.shape === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onChange({ shape: item.id })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer border ${
                    isActive
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,255,204,0.2)]'
                      : 'bg-white/[0.04] border-white/5 text-zinc-300 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-zinc-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Colors & Shaders */}
        {activeTab === 'colors' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {PALETTES.map((pal) => {
                const isActive = config.colorPalette === pal.id;
                return (
                  <button
                    key={pal.id}
                    onClick={() => onChange({ colorPalette: pal.id })}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'border-fuchsia-400 bg-fuchsia-500/15 text-white shadow-[0_0_12px_rgba(255,0,127,0.25)]'
                        : 'border-white/5 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div
                      className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${pal.previewGradient} shrink-0`}
                    />
                    <span className="truncate">{pal.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-white/5 text-xs">
              {/* Particle Texture Style */}
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 text-[11px] uppercase tracking-wider">
                  Particle Shard:
                </span>
                <div className="flex items-center gap-1">
                  {TEXTURE_MODES.map((tex) => (
                    <button
                      key={tex.id}
                      onClick={() => onChange({ particleTexture: tex.id })}
                      className={`px-2.5 py-1 rounded-lg text-xs cursor-pointer transition-all ${
                        config.particleTexture === tex.id
                          ? 'bg-white/20 text-white font-semibold'
                          : 'bg-white/5 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {tex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom dual pickers */}
              {config.colorPalette === 'custom' && (
                <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-zinc-400 text-[11px]">Primary:</span>
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={(e) => onChange({ primaryColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <span className="text-zinc-400 text-[11px]">Secondary:</span>
                    <input
                      type="color"
                      value={config.secondaryColor}
                      onChange={(e) => onChange({ secondaryColor: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Mouse Dynamics */}
        {activeTab === 'mouse' && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
              {MOUSE_MODES.map((mode) => {
                const isActive = config.mouseMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => onChange({ mouseMode: mode.id })}
                    className={`flex flex-col gap-1 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                        : 'border-white/5 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={isActive ? 'text-emerald-400' : 'text-zinc-400'}>
                        {mode.icon}
                      </span>
                      <span className="text-xs font-semibold truncate">{mode.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {mode.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mouse force slider */}
            <div className="flex items-center gap-4 pt-1 border-t border-white/5">
              <span className="text-xs text-zinc-400 whitespace-nowrap">
                Field Force: <strong className="text-zinc-200">{config.mouseForce.toFixed(1)}x</strong>
              </span>
              <input
                type="range"
                min="0.3"
                max="2.5"
                step="0.1"
                value={config.mouseForce}
                onChange={(e) => onChange({ mouseForce: parseFloat(e.target.value) })}
                className="w-full accent-emerald-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Physics & Floating Solids */}
        {activeTab === 'physics' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {/* Particle Size */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Particle Size</span>
                <span className="text-white font-medium">{config.particleSize.toFixed(1)} px</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.2"
                value={config.particleSize}
                onChange={(e) => onChange({ particleSize: parseFloat(e.target.value) })}
                className="accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Morph Speed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Morph Transition Speed</span>
                <span className="text-white font-medium">{config.morphSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="3.0"
                step="0.1"
                value={config.morphSpeed}
                onChange={(e) => onChange({ morphSpeed: parseFloat(e.target.value) })}
                className="accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Rotation Speed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-zinc-400">
                <span>Auto-Rotation Speed</span>
                <span className="text-white font-medium">{config.rotationSpeed.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="3.0"
                step="0.2"
                value={config.rotationSpeed}
                onChange={(e) => onChange({ rotationSpeed: parseFloat(e.target.value) })}
                className="accent-amber-400 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Floating Geometric Solids Toggle */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-200 font-medium">Floating 3D Solids</span>
              </div>
              <button
                onClick={() => onChange({ showFloatingSolids: !config.showFloatingSolids })}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  config.showFloatingSolids ? 'bg-amber-400' : 'bg-zinc-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${
                    config.showFloatingSolids ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
