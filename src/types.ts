export type ShapeType =
  | 'hearts'
  | 'flowers'
  | 'saturn'
  | 'buddha'
  | 'fireworks'
  | 'torusKnot'
  | 'galaxy'
  | 'merkaba'
  | 'dnaHelix'
  | 'tesseract'
  | 'diamond'
  | 'blackhole';

export type ColorPalette =
  | 'neon'
  | 'rainbow'
  | 'aurora'
  | 'solar'
  | 'opal'
  | 'starlight'
  | 'custom';

export type MouseInteractionMode =
  | 'vortex'
  | 'repel'
  | 'attract'
  | 'plexus'
  | 'wave';

export type ParticleTextureType =
  | 'glow'
  | 'star'
  | 'crystal'
  | 'ring';

export interface ParticleConfig {
  particleCount: number;
  shape: ShapeType;
  colorPalette: ColorPalette;
  primaryColor: string;
  secondaryColor: string;
  particleSize: number;
  particleTexture: ParticleTextureType;
  mouseMode: MouseInteractionMode;
  mouseForce: number;
  morphSpeed: number;
  rotationSpeed: number;
  showFloatingSolids: boolean;
  soundEnabled: boolean;
  cameraActive: boolean;
}
