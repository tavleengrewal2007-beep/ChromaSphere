import * as THREE from 'three';
import { ParticleTextureType } from '../types.ts';

const textureCache = new Map<ParticleTextureType, THREE.Texture>();

export function getParticleTexture(type: ParticleTextureType): THREE.Texture {
  if (textureCache.has(type)) {
    return textureCache.get(type)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const center = 64;

  ctx.clearRect(0, 0, 128, 128);

  switch (type) {
    case 'glow': {
      // Soft radiant orb
      const grad = ctx.createRadialGradient(center, center, 0, center, center, 60);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.15, 'rgba(255, 255, 255, 0.9)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.08)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(center, center, 60, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'star': {
      // 4-point cinematic sparkle star
      const grad = ctx.createRadialGradient(center, center, 0, center, center, 60);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
      grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);

      // Star cross beams
      const beamGradH = ctx.createLinearGradient(0, center, 128, center);
      beamGradH.addColorStop(0, 'rgba(255,255,255,0)');
      beamGradH.addColorStop(0.5, 'rgba(255,255,255,1)');
      beamGradH.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = beamGradH;
      ctx.fillRect(0, center - 3, 128, 6);

      const beamGradV = ctx.createLinearGradient(center, 0, center, 128);
      beamGradV.addColorStop(0, 'rgba(255,255,255,0)');
      beamGradV.addColorStop(0.5, 'rgba(255,255,255,1)');
      beamGradV.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = beamGradV;
      ctx.fillRect(center - 3, 0, 6, 128);
      break;
    }

    case 'crystal': {
      // Faceted diamond / hexagonal crystal particle
      ctx.save();
      ctx.translate(center, center);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * 44;
        const y = Math.sin(angle) * 44;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      
      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 50);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.7)');
      grad.addColorStop(0.9, 'rgba(255, 255, 255, 0.2)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
      break;
    }

    case 'ring': {
      // Glowing geometric ring
      ctx.beginPath();
      ctx.arc(center, center, 42, 0, Math.PI * 2);
      ctx.lineWidth = 10;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.shadowColor = 'rgba(255, 255, 255, 1)';
      ctx.shadowBlur = 12;
      ctx.stroke();

      const innerGrad = ctx.createRadialGradient(center, center, 0, center, center, 32);
      innerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = innerGrad;
      ctx.beginPath();
      ctx.arc(center, center, 32, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(type, texture);
  return texture;
}
