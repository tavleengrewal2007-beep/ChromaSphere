import React, { useState, useEffect, useCallback } from 'react';
import { ParticleCanvas } from './components/ParticleCanvas.tsx';
import { ControlsDock } from './components/ControlsDock.tsx';
import { TopBar } from './components/TopBar.tsx';
import { CameraPip } from './components/CameraPip.tsx';
import { ParticleConfig, ShapeType } from './types.ts';
import { soundEngine } from './audio/synth.ts';

const DEFAULT_CONFIG: ParticleConfig = {
  particleCount: 14000,
  shape: 'hearts',
  colorPalette: 'neon',
  primaryColor: '#00ffcc',
  secondaryColor: '#ff007f',
  particleSize: 3.2,
  particleTexture: 'glow',
  mouseMode: 'vortex',
  mouseForce: 1.2,
  morphSpeed: 1.2,
  rotationSpeed: 1.0,
  showFloatingSolids: true,
  soundEnabled: false,
  cameraActive: false,
};

const SHAPE_LIST: ShapeType[] = [
  'hearts',
  'flowers',
  'saturn',
  'buddha',
  'fireworks',
  'torusKnot',
  'galaxy',
  'merkaba',
  'dnaHelix',
  'tesseract',
  'diamond',
  'blackhole',
];

export default function App() {
  const [config, setConfig] = useState<ParticleConfig>(DEFAULT_CONFIG);
  const [handTension, setHandTension] = useState<number>(1.0);
  const [fps, setFps] = useState<number>(60);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [showWelcomeTip, setShowWelcomeTip] = useState<boolean>(true);

  // Sync audio mute
  useEffect(() => {
    soundEngine.setMuted(!config.soundEnabled);
  }, [config.soundEnabled]);

  // Patch config helper
  const handleConfigChange = useCallback((patch: Partial<ParticleConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === 'h' || e.key === 'H') {
        setIsCinemaMode((prev) => !prev);
      } else if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1;
        if (index < SHAPE_LIST.length) {
          handleConfigChange({ shape: SHAPE_LIST[index] });
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleConfigChange({ soundEnabled: !config.soundEnabled });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.soundEnabled, handleConfigChange]);

  // Auto-hide welcome tip after 7 seconds or on first click
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeTip(false);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#050508] select-none text-white font-sans"
      onPointerDown={() => setShowWelcomeTip(false)}
    >
      {/* 3D WebGL Particle System */}
      <ParticleCanvas
        config={config}
        handTension={handTension}
        onFpsUpdate={setFps}
      />

      {/* Top Navigation & Status HUD */}
      <TopBar
        config={config}
        fps={fps}
        onToggleSound={() => handleConfigChange({ soundEnabled: !config.soundEnabled })}
        onToggleCamera={() => handleConfigChange({ cameraActive: !config.cameraActive })}
      />

      {/* MediaPipe Camera Picture-in-Picture */}
      <CameraPip
        active={config.cameraActive}
        onTensionChange={setHandTension}
        onToggleActive={() => handleConfigChange({ cameraActive: !config.cameraActive })}
      />

      {/* Consolidated Collapsible Bottom Dock (Zero Viewport Occlusion) */}
      <ControlsDock
        config={config}
        onChange={handleConfigChange}
        isCinemaMode={isCinemaMode}
        onToggleCinemaMode={() => setIsCinemaMode(!isCinemaMode)}
      />

      {/* Floating Interactive Guide Pill */}
      {showWelcomeTip && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-10 px-4 py-2 rounded-full bg-zinc-950/80 border border-white/10 text-xs text-zinc-300 backdrop-blur-md shadow-2xl flex items-center gap-3 animate-fade-in pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
          <span>
            <strong>Move mouse</strong> to swirl particles • <strong>Click</strong> for cosmic shockwave • <strong>Drag</strong> to rotate
          </span>
          <button
            onClick={() => setShowWelcomeTip(false)}
            className="text-zinc-500 hover:text-white pointer-events-auto ml-1"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
