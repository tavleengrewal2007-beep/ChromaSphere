import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Camera,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
} from 'lucide-react';
import { ParticleConfig } from '../types.ts';

interface TopBarProps {
  config: ParticleConfig;
  fps: number;
  onToggleSound: () => void;
  onToggleCamera: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  config,
  fps,
  onToggleSound,
  onToggleCamera,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const captureScreenshot = () => {
    setIsCapturing(true);
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const link = document.createElement('a');
        link.download = `chromasphere-${config.shape}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
      setIsCapturing(false);
    }, 100);
  };

  return (
    <header className="fixed top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
      {/* Brand & Active Status Badge */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-xl">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-400 via-fuchsia-500 to-indigo-500 flex items-center justify-center shadow-[0_0_12px_rgba(0,255,204,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wider uppercase text-white font-mono flex items-center gap-1.5">
              ChromaSphere
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                3D WebGL
              </span>
            </h1>
            <div className="text-[10px] text-zinc-400 flex items-center gap-2">
              <span className="capitalize text-zinc-300 font-medium">{config.shape}</span>
              <span>•</span>
              <span className="capitalize text-emerald-400">{config.mouseMode}</span>
            </div>
          </div>
        </div>

        {/* Real-time Performance HUD */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950/60 border border-white/5 backdrop-blur-md text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-500">FPS:</span>
          <span className={`font-semibold ${fps < 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {fps || 60}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-500">PTS:</span>
          <span className="text-cyan-300">{config.particleCount.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex items-center gap-1.5 pointer-events-auto">
        {/* Webcam Tracking Toggle */}
        <button
          onClick={onToggleCamera}
          className={`p-2 rounded-xl border backdrop-blur-xl transition-all cursor-pointer ${
            config.cameraActive
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_12px_rgba(0,255,204,0.25)]'
              : 'bg-zinc-950/70 border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900'
          }`}
          title={config.cameraActive ? 'Disable hand tracking camera' : 'Enable hand tracking camera'}
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Audio Toggle */}
        <button
          onClick={onToggleSound}
          className={`p-2 rounded-xl border backdrop-blur-xl transition-all cursor-pointer ${
            config.soundEnabled
              ? 'bg-zinc-950/70 border-white/10 text-cyan-300 hover:text-white hover:bg-zinc-900'
              : 'bg-zinc-950/70 border-white/10 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
          }`}
          title={config.soundEnabled ? 'Mute audio' : 'Unmute audio'}
        >
          {config.soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </button>

        {/* Screenshot snapshot export */}
        <button
          onClick={captureScreenshot}
          disabled={isCapturing}
          className="p-2 rounded-xl bg-zinc-950/70 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900 backdrop-blur-xl transition-all cursor-pointer"
          title="Save screenshot snapshot"
        >
          <Download className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-xl bg-zinc-950/70 border border-white/10 text-zinc-400 hover:text-white hover:bg-zinc-900 backdrop-blur-xl transition-all cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </button>
      </div>
    </header>
  );
};
