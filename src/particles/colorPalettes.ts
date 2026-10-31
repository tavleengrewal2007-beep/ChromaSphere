import * as THREE from 'three';
import { ColorPalette } from '../types.ts';

const tempColor = new THREE.Color();

export function generateParticleColors(
  palette: ColorPalette,
  count: number,
  positions: Float32Array,
  primaryHex: string = '#00ffcc',
  secondaryHex: string = '#ff007f'
): Float32Array {
  const colors = new Float32Array(count * 3);
  const primaryCol = new THREE.Color(primaryHex);
  const secondaryCol = new THREE.Color(secondaryHex);

  for (let i = 0; i < count; i++) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];
    const dist = Math.sqrt(x * x + y * y + z * z);
    const normalizedDist = Math.min(1, dist / 120);
    const angle = Math.atan2(z, x);

    switch (palette) {
      case 'neon': {
        // Vibrant cyberpunk: Electric cyan, neon magenta, deep violet
        const t = (Math.sin(angle * 2) + Math.cos(y * 0.05) + 2) / 4;
        if (t < 0.33) {
          tempColor.setRGB(0.0, 0.95, 1.0); // Cyan
        } else if (t < 0.66) {
          tempColor.setRGB(1.0, 0.05, 0.55); // Magenta
        } else {
          tempColor.setRGB(0.55, 0.1, 1.0); // Deep Violet
        }
        // Add brightness modulation
        tempColor.offsetHSL(0, 0, (Math.random() - 0.5) * 0.15);
        break;
      }

      case 'rainbow': {
        // Continuous chromatic spectral wheel
        const hue = ((angle / (Math.PI * 2) + 0.5 + y * 0.003 + normalizedDist * 0.3) % 1 + 1) % 1;
        tempColor.setHSL(hue, 0.95, 0.55 + (Math.random() - 0.5) * 0.1);
        break;
      }

      case 'aurora': {
        // Polar aurora: emerald green, teal, violet, electric blue
        const t = (Math.sin(y * 0.04) + 1) * 0.5;
        if (t < 0.4) {
          tempColor.setRGB(0.05, 0.95, 0.55); // Emerald Green
        } else if (t < 0.7) {
          tempColor.setRGB(0.0, 0.8, 0.95); // Teal Blue
        } else {
          tempColor.setRGB(0.6, 0.2, 0.95); // Celestial Violet
        }
        break;
      }

      case 'solar': {
        // Molten solar flare: Gold, tangerine, crimson, sun white
        const t = (y + 80) / 160;
        if (normalizedDist < 0.25) {
          tempColor.setRGB(1.0, 0.95, 0.8); // White-hot core
        } else if (t < 0.5) {
          tempColor.setRGB(1.0, 0.7, 0.05); // Solar Gold
        } else {
          tempColor.setRGB(1.0, 0.18, 0.1); // Crimson flare
        }
        break;
      }

      case 'opal': {
        // Iridescent pastel opal shimmer
        const hue = (angle / (Math.PI * 2) + 0.5) * 0.4 + 0.5; // Cyan to rose
        const lightness = 0.65 + (Math.sin(dist * 0.1) * 0.15);
        tempColor.setHSL(hue % 1, 0.75, lightness);
        break;
      }

      case 'starlight': {
        // Diamond starlight monochrome with icy cyan tint
        const shine = Math.random();
        if (shine > 0.85) {
          tempColor.setRGB(1.0, 1.0, 1.0); // Pure white sparkle
        } else if (shine > 0.4) {
          tempColor.setRGB(0.85, 0.92, 1.0); // Ice diamond
        } else {
          tempColor.setRGB(0.55, 0.65, 0.85); // Silver twilight
        }
        break;
      }

      case 'custom':
      default: {
        // Blend between user selected primary and secondary colors
        const alpha = Math.min(1, Math.max(0, (y + 70) / 140));
        tempColor.copy(primaryCol).lerp(secondaryCol, alpha);
        break;
      }
    }

    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }

  return colors;
}
