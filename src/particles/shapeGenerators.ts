import * as THREE from 'three';
import { ShapeType } from '../types.ts';

export interface ParticlePosition {
  x: number;
  y: number;
  z: number;
}

// 1. 3D Heart Cardioid
function getHeartPosition(): ParticlePosition {
  const t = Math.random() * Math.PI * 2;
  const hx = 16 * Math.pow(Math.sin(t), 3);
  const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  
  // Fill volume with depth falloff
  const thickness = Math.sqrt(Math.max(0, 1 - (hy / 18) * (hy / 18))) * 24;
  const z = (Math.random() - 0.5) * thickness;
  const spread = 4.2 + (Math.random() - 0.5) * 0.4;
  
  return {
    x: hx * spread + (Math.random() - 0.5) * 6,
    y: hy * spread + (Math.random() - 0.5) * 6,
    z: z + (Math.random() - 0.5) * 6,
  };
}

// 2. 3D Layered Floral Blossom
function getFlowerPosition(): ParticlePosition {
  const petals = 6;
  const theta = Math.random() * Math.PI * 2;
  const phi = (Math.random() - 0.5) * 0.5;
  const rBase = 80 * Math.sin(petals * theta * 0.5);
  const r = Math.abs(rBase) + Math.random() * 15;
  
  const zCurvature = -Math.pow(r / 70, 2) * 25 + Math.sin(theta * 6) * 10;
  
  // Also add central stamen spiraling
  if (Math.random() < 0.2) {
    const coreR = Math.random() * 22;
    const coreTheta = Math.random() * Math.PI * 2;
    return {
      x: coreR * Math.cos(coreTheta),
      y: coreR * Math.sin(coreTheta),
      z: (Math.random() - 0.5) * 15 + 10,
    };
  }

  return {
    x: r * Math.cos(theta),
    y: r * Math.sin(theta),
    z: zCurvature + phi * 20,
  };
}

// 3. Saturn Planet & Concentric Rings with Cassini Division
function getSaturnPosition(): ParticlePosition {
  const isRing = Math.random() > 0.32;
  if (isRing) {
    const angle = Math.random() * Math.PI * 2;
    // Cassini division between 108 and 115
    let radius: number;
    if (Math.random() > 0.4) {
      radius = 70 + Math.random() * 38; // Inner A/B ring
    } else {
      radius = 115 + Math.random() * 30; // Outer C ring
    }
    // Tilted ring plane (around X and Z axis)
    const tilt = 0.45;
    const rx = radius * Math.cos(angle);
    const rz = radius * Math.sin(angle);
    const ry = (Math.random() - 0.5) * 3;

    // Rotate by tilt
    const x = rx;
    const y = ry * Math.cos(tilt) - rz * Math.sin(tilt);
    const z = ry * Math.sin(tilt) + rz * Math.cos(tilt);
    return { x, y, z };
  } else {
    // Gas giant core sphere
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 45 * Math.cbrt(Math.random());
    const sinPhi = Math.sin(phi);
    // Slight oblate flattening at poles
    return {
      x: r * sinPhi * Math.cos(theta),
      y: r * sinPhi * Math.sin(theta) * 0.9,
      z: r * Math.cos(phi),
    };
  }
}

// 4. Buddha Meditative Silhouette with Halo Aura
function getBuddhaPosition(): ParticlePosition {
  // If random < 0.25, render radiant halo / aura ring behind head
  if (Math.random() < 0.25) {
    const angle = Math.random() * Math.PI * 2;
    const haloR = 40 + Math.random() * 8;
    return {
      x: Math.cos(angle) * haloR,
      y: 65 + Math.sin(angle) * haloR,
      z: -12 + (Math.random() - 0.5) * 6,
    };
  }

  let attempts = 0;
  while (attempts < 60) {
    const x = (Math.random() - 0.5) * 160;
    const y = (Math.random() - 0.5) * 220;
    const z = (Math.random() - 0.5) * 80;

    const isHead = Math.pow(x, 2) + Math.pow(y - 65, 2) + Math.pow(z, 2) < 24 * 24;
    const isChest = Math.pow(x / 1.3, 2) + Math.pow((y - 10) / 1.1, 2) + Math.pow(z / 0.9, 2) < 42 * 42;
    const isCrossedLegs = Math.pow(x / 2.2, 2) + Math.pow((y + 55) / 0.6, 2) + Math.pow(z / 1.4, 2) < 38 * 38;

    if (isHead || isChest || isCrossedLegs) {
      if (Math.random() > 0.35) {
        return { x, y, z };
      }
    }
    attempts++;
  }
  return { x: 0, y: 0, z: 0 };
}

// 5. Multi-Core Fireworks Shells
function getFireworksPosition(): ParticlePosition {
  const centers = [
    { cx: 0, cy: 15, cz: 0, radius: 65 },
    { cx: 70, cy: 60, cz: -30, radius: 45 },
    { cx: -75, cy: 50, cz: 25, radius: 48 },
    { cx: 45, cy: -50, cz: -35, radius: 42 },
    { cx: -55, cy: -55, cz: 35, radius: 44 },
  ];

  const center = centers[Math.floor(Math.random() * centers.length)];
  const u = Math.random();
  const v = Math.random();
  const theta = u * 2.0 * Math.PI;
  const phi = Math.acos(2.0 * v - 1.0);

  // Shell explosion distribution with streamer tails
  const rFactor = Math.pow(Math.random(), 0.35);
  const r = rFactor * center.radius;
  const sinPhi = Math.sin(phi);

  return {
    x: center.cx + r * sinPhi * Math.cos(theta),
    y: center.cy + r * sinPhi * Math.sin(theta) - (1 - rFactor) * 12,
    z: center.cz + r * Math.cos(phi),
  };
}

// 6. Torus Knot (Trefoil p=2, q=3) with helical particle cloud
function getTorusKnotPosition(): ParticlePosition {
  const p = 2;
  const q = 3;
  const u = Math.random() * Math.PI * 2;
  const r = 58 + 20 * Math.cos(q * u);
  
  const cx = r * Math.cos(p * u);
  const cy = r * Math.sin(p * u);
  const cz = -26 * Math.sin(q * u);

  // Cross section tube radius
  const tubeAngle = Math.random() * Math.PI * 2;
  const tubeRadius = Math.random() * 14;

  return {
    x: cx + Math.cos(tubeAngle) * tubeRadius,
    y: cy + Math.sin(tubeAngle) * tubeRadius,
    z: cz + (Math.random() - 0.5) * tubeRadius * 1.5,
  };
}

// 7. Spiral Galaxy with Bulge, Dust Lanes & Star Arms
function getGalaxyPosition(): ParticlePosition {
  const isBulge = Math.random() < 0.22;
  if (isBulge) {
    // Dense spherical core bulge
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2 * Math.PI;
    const phi = Math.acos(2 * v - 1);
    const r = 24 * Math.cbrt(Math.random());
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta) * 0.7,
      z: r * Math.cos(phi),
    };
  }

  // 2 main spiral arms + minor armlets
  const arm = Math.floor(Math.random() * 2);
  const armOffset = arm * Math.PI;
  const dist = Math.pow(Math.random(), 0.8) * 110 + 12;
  const angle = dist * 0.045 + armOffset + (Math.random() - 0.5) * 0.45;

  const height = (1 - dist / 130) * 18 * (Math.random() - 0.5);

  return {
    x: Math.cos(angle) * dist + (Math.random() - 0.5) * 8,
    y: height,
    z: Math.sin(angle) * dist + (Math.random() - 0.5) * 8,
  };
}

// 8. Merkaba (Sacred Geometry Star Tetrahedron)
function getMerkabaPosition(): ParticlePosition {
  // Vertices of two dual tetrahedrons
  const scale = 72;
  // Tetrahedron 1: (1,1,1), (1,-1,-1), (-1,1,-1), (-1,-1,1)
  // Tetrahedron 2: (-1,-1,-1), (-1,1,1), (1,-1,1), (1,1,-1)
  const isTet1 = Math.random() > 0.5;
  const tet1Verts = [
    new THREE.Vector3(1, 1, 1).normalize().multiplyScalar(scale),
    new THREE.Vector3(1, -1, -1).normalize().multiplyScalar(scale),
    new THREE.Vector3(-1, 1, -1).normalize().multiplyScalar(scale),
    new THREE.Vector3(-1, -1, 1).normalize().multiplyScalar(scale),
  ];
  const tet2Verts = [
    new THREE.Vector3(-1, -1, -1).normalize().multiplyScalar(scale),
    new THREE.Vector3(-1, 1, 1).normalize().multiplyScalar(scale),
    new THREE.Vector3(1, -1, 1).normalize().multiplyScalar(scale),
    new THREE.Vector3(1, 1, -1).normalize().multiplyScalar(scale),
  ];

  const verts = isTet1 ? tet1Verts : tet2Verts;
  // Choose random edge or face
  if (Math.random() < 0.6) {
    // Edge sampling
    const i = Math.floor(Math.random() * 4);
    let j = Math.floor(Math.random() * 4);
    while (j === i) j = Math.floor(Math.random() * 4);
    const alpha = Math.random();
    const p = new THREE.Vector3().lerpVectors(verts[i], verts[j], alpha);
    return {
      x: p.x + (Math.random() - 0.5) * 4,
      y: p.y + (Math.random() - 0.5) * 4,
      z: p.z + (Math.random() - 0.5) * 4,
    };
  } else {
    // Face sampling
    const i1 = Math.floor(Math.random() * 4);
    const i2 = (i1 + 1) % 4;
    const i3 = (i1 + 2) % 4;
    let r1 = Math.random();
    let r2 = Math.random();
    if (r1 + r2 > 1) {
      r1 = 1 - r1;
      r2 = 1 - r2;
    }
    const p = new THREE.Vector3()
      .addScaledVector(verts[i1], 1 - r1 - r2)
      .addScaledVector(verts[i2], r1)
      .addScaledVector(verts[i3], r2);
    return {
      x: p.x + (Math.random() - 0.5) * 3,
      y: p.y + (Math.random() - 0.5) * 3,
      z: p.z + (Math.random() - 0.5) * 3,
    };
  }
}

// 9. DNA Double Helix with Base Pair Cross-Rungs
function getDnaHelixPosition(): ParticlePosition {
  const height = 180;
  const y = (Math.random() - 0.5) * height;
  const angle = y * 0.08;
  const radius = 42;

  // Strand 1, Strand 2, or base-pair rung
  const choice = Math.random();
  if (choice < 0.4) {
    // Strand A
    return {
      x: Math.cos(angle) * radius + (Math.random() - 0.5) * 5,
      y: y + (Math.random() - 0.5) * 2,
      z: Math.sin(angle) * radius + (Math.random() - 0.5) * 5,
    };
  } else if (choice < 0.8) {
    // Strand B (opposite phase PI)
    return {
      x: Math.cos(angle + Math.PI) * radius + (Math.random() - 0.5) * 5,
      y: y + (Math.random() - 0.5) * 2,
      z: Math.sin(angle + Math.PI) * radius + (Math.random() - 0.5) * 5,
    };
  } else {
    // Connecting base-pair rung
    const alpha = (Math.random() - 0.5) * 2; // -1 to 1
    const rungAngle = Math.floor(y / 12) * 12 * 0.08; // quantized rungs
    return {
      x: Math.cos(rungAngle) * (radius * alpha) + (Math.random() - 0.5) * 3,
      y: Math.floor(y / 12) * 12 + (Math.random() - 0.5) * 2,
      z: Math.sin(rungAngle) * (radius * alpha) + (Math.random() - 0.5) * 3,
    };
  }
}

// 10. 4D Cosmic Tesseract (Hypercube)
function getTesseractPosition(): ParticlePosition {
  // Inner cube (size 40) and outer cube (size 80)
  const isOuter = Math.random() < 0.45;
  const isInner = !isOuter && Math.random() < 0.8;
  const size = isOuter ? 75 : 36;

  if (isOuter || isInner) {
    // Points along cube edges
    const axis = Math.floor(Math.random() * 3);
    const coord1 = Math.random() > 0.5 ? size : -size;
    const coord2 = Math.random() > 0.5 ? size : -size;
    const t = (Math.random() - 0.5) * 2 * size;

    let x = 0, y = 0, z = 0;
    if (axis === 0) { x = t; y = coord1; z = coord2; }
    else if (axis === 1) { x = coord1; y = t; z = coord2; }
    else { x = coord1; y = coord2; z = t; }

    return {
      x: x + (Math.random() - 0.5) * 4,
      y: y + (Math.random() - 0.5) * 4,
      z: z + (Math.random() - 0.5) * 4,
    };
  } else {
    // 8 diagonal struts connecting inner and outer vertices
    const sx = Math.random() > 0.5 ? 1 : -1;
    const sy = Math.random() > 0.5 ? 1 : -1;
    const sz = Math.random() > 0.5 ? 1 : -1;
    const alpha = Math.random();
    const currentSize = THREE.MathUtils.lerp(36, 75, alpha);
    return {
      x: sx * currentSize + (Math.random() - 0.5) * 4,
      y: sy * currentSize + (Math.random() - 0.5) * 4,
      z: sz * currentSize + (Math.random() - 0.5) * 4,
    };
  }
}

// 11. Diamond Crystal Polyhedron
function getDiamondPosition(): ParticlePosition {
  const isCrown = Math.random() < 0.55;
  if (isCrown) {
    // Upper faceted crown
    const y = Math.random() * 30 + 10;
    const factor = (40 - y) / 30;
    const angle = Math.floor(Math.random() * 8) * (Math.PI / 4) + (Math.random() - 0.5) * 0.2;
    const r = factor * 70 + (Math.random() - 0.5) * 10;
    return {
      x: Math.cos(angle) * r,
      y: y,
      z: Math.sin(angle) * r,
    };
  } else {
    // Lower conical pavilion
    const y = -Math.random() * 70 + 10;
    const factor = (y + 60) / 70;
    const angle = Math.floor(Math.random() * 8) * (Math.PI / 4) + (Math.random() - 0.5) * 0.2;
    const r = Math.max(2, factor * 70) + (Math.random() - 0.5) * 8;
    return {
      x: Math.cos(angle) * r,
      y: y,
      z: Math.sin(angle) * r,
    };
  }
}

// 12. Black Hole Singularity & Accretion Swirl with Relativistic Jets
function getBlackHolePosition(): ParticlePosition {
  const choice = Math.random();
  if (choice < 0.15) {
    // Event horizon sphere (dark void border)
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2 * Math.PI;
    const phi = Math.acos(2 * v - 1);
    const r = 26 + Math.random() * 4;
    return {
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    };
  } else if (choice < 0.8) {
    // Accretion disk with Doppler warping
    const r = 32 + Math.pow(Math.random(), 0.5) * 85;
    const angle = Math.random() * Math.PI * 2;
    // Disk thickness increases outward
    const thickness = (r / 100) * 8;
    return {
      x: Math.cos(angle) * r,
      y: (Math.random() - 0.5) * thickness,
      z: Math.sin(angle) * r,
    };
  } else {
    // Polar relativistic particle jets
    const sign = Math.random() > 0.5 ? 1 : -1;
    const distY = Math.random() * 100 + 20;
    const spread = (distY / 100) * 16;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * spread;
    return {
      x: Math.cos(angle) * r,
      y: sign * distY,
      z: Math.sin(angle) * r,
    };
  }
}

export function generateShapePositions(
  shape: ShapeType,
  count: number
): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    let pos: ParticlePosition;
    switch (shape) {
      case 'hearts':
        pos = getHeartPosition();
        break;
      case 'flowers':
        pos = getFlowerPosition();
        break;
      case 'saturn':
        pos = getSaturnPosition();
        break;
      case 'buddha':
        pos = getBuddhaPosition();
        break;
      case 'fireworks':
        pos = getFireworksPosition();
        break;
      case 'torusKnot':
        pos = getTorusKnotPosition();
        break;
      case 'galaxy':
        pos = getGalaxyPosition();
        break;
      case 'merkaba':
        pos = getMerkabaPosition();
        break;
      case 'dnaHelix':
        pos = getDnaHelixPosition();
        break;
      case 'tesseract':
        pos = getTesseractPosition();
        break;
      case 'diamond':
        pos = getDiamondPosition();
        break;
      case 'blackhole':
        pos = getBlackHolePosition();
        break;
      default:
        pos = getHeartPosition();
    }

    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;
  }

  return positions;
}
