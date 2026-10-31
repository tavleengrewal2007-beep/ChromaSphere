import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ParticleConfig } from '../types.ts';
import { generateShapePositions } from '../particles/shapeGenerators.ts';
import { generateParticleColors } from '../particles/colorPalettes.ts';
import { getParticleTexture } from '../particles/particleTextures.ts';
import { soundEngine } from '../audio/synth.ts';

interface ParticleCanvasProps {
  config: ParticleConfig;
  handTension: number;
  onFpsUpdate?: (fps: number) => void;
}

// Reusable math helpers at module scope to guarantee zero GC during render loop
const _mouseVec = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _intersectPoint = new THREE.Vector3();
const _particlePos = new THREE.Vector3();
const _forceVec = new THREE.Vector3();
const _tangentVec = new THREE.Vector3();
const _upVec = new THREE.Vector3(0, 1, 0);

interface Shockwave {
  center: THREE.Vector3;
  radius: number;
  maxRadius: number;
  strength: number;
  active: boolean;
}

interface FloatingSolid {
  mesh: THREE.Mesh;
  wireframe: THREE.LineSegments;
  basePosition: THREE.Vector3;
  velocity: THREE.Vector3;
  rotSpeed: THREE.Vector3;
  scale: number;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  config,
  handTension,
  onFpsUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(config);
  configRef.current = config;

  const handTensionRef = useRef(handTension);
  handTensionRef.current = handTension;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050508, 0.0018);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      1,
      1400
    );
    camera.position.set(0, 20, 240);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4 * configRef.current.rotationSpeed;
    controls.enablePan = false;
    controls.minDistance = 60;
    controls.maxDistance = 500;

    // Lights for 3D floating solids
    const ambientLight = new THREE.AmbientLight(0x223344, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.0);
    dirLight1.position.set(100, 150, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff007f, 1.8);
    dirLight2.position.set(-100, -120, -100);
    scene.add(dirLight2);

    // Particle buffers & arrays
    const count = configRef.current.particleCount;
    const geometry = new THREE.BufferGeometry();

    const currentPositions = new Float32Array(count * 3);
    const targetPositions = generateShapePositions(configRef.current.shape, count);
    const basePositions = new Float32Array(count * 3);
    basePositions.set(targetPositions);

    // Random initial distribution
    for (let i = 0; i < count; i++) {
      currentPositions[i * 3] = (Math.random() - 0.5) * 600;
      currentPositions[i * 3 + 1] = (Math.random() - 0.5) * 600;
      currentPositions[i * 3 + 2] = (Math.random() - 0.5) * 600;
    }

    const currentColors = generateParticleColors(
      configRef.current.colorPalette,
      count,
      targetPositions,
      configRef.current.primaryColor,
      configRef.current.secondaryColor
    );
    const targetColors = new Float32Array(currentColors);

    // Particle velocities for physical mouse impulse/spring back
    const velocities = new Float32Array(count * 3);
    const randomness = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      randomness[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(currentColors, 3));

    // Particle Material
    const material = new THREE.PointsMaterial({
      size: configRef.current.particleSize,
      vertexColors: true,
      map: getParticleTexture(configRef.current.particleTexture),
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
      opacity: 0.88,
    });

    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);

    // Dynamic Plexus Connecting Lines for Mouse Interaction
    const MAX_LINES = 120;
    const linePositions = new Float32Array(MAX_LINES * 2 * 3);
    const lineColors = new Float32Array(MAX_LINES * 2 * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Shockwave Ripples array
    const shockwaves: Shockwave[] = [];
    const triggerShockwave = (worldPos: THREE.Vector3) => {
      shockwaves.push({
        center: worldPos.clone(),
        radius: 0,
        maxRadius: 180,
        strength: 65,
        active: true,
      });
      if (configRef.current.soundEnabled) {
        soundEngine.playShockwave();
      }
    };

    // Floating 3D Geometric Polyhedra Group
    const solidsGroup = new THREE.Group();
    const floatingSolids: FloatingSolid[] = [];
    const solidGeometries = [
      new THREE.IcosahedronGeometry(10, 0),
      new THREE.OctahedronGeometry(9, 0),
      new THREE.DodecahedronGeometry(8, 0),
      new THREE.TorusGeometry(8, 2, 8, 16),
      new THREE.TetrahedronGeometry(11, 0),
    ];

    const solidCount = 18;
    for (let i = 0; i < solidCount; i++) {
      const geom = solidGeometries[i % solidGeometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL((i / solidCount) * 0.9, 0.9, 0.5),
        metalness: 0.8,
        roughness: 0.2,
        transparent: true,
        opacity: 0.65,
        wireframe: false,
      });

      const mesh = new THREE.Mesh(geom, mat);
      const wireMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.45,
      });
      const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geom), wireMat);
      mesh.add(wireframe);

      // Distribute in a spherical halo around the main shape
      const angle = (i / solidCount) * Math.PI * 2;
      const radius = 130 + Math.random() * 80;
      const y = (Math.random() - 0.5) * 140;
      const basePos = new THREE.Vector3(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );
      mesh.position.copy(basePos);

      solidsGroup.add(mesh);
      floatingSolids.push({
        mesh,
        wireframe,
        basePosition: basePos,
        velocity: new THREE.Vector3(),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
        scale: 0.6 + Math.random() * 0.8,
      });
    }
    scene.add(solidsGroup);

    // Mouse Tracking state
    let isMouseOver = false;
    let isMouseDown = false;
    let lastSoundTime = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      _mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      isMouseOver = true;

      // Update plane normal towards camera
      camera.getWorldDirection(_interactionPlane.normal);
      _interactionPlane.normal.negate();
      _interactionPlane.constant = 0;

      _raycaster.setFromCamera(_mouseVec, camera);
      _raycaster.ray.intersectPlane(_interactionPlane, _intersectPoint);

      // Gentle interactive chime occasionally when mouse moves rapidly through particles
      const now = performance.now();
      if (configRef.current.soundEnabled && now - lastSoundTime > 300) {
        lastSoundTime = now;
        soundEngine.playParticleTouch();
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      isMouseDown = true;
      const rect = container.getBoundingClientRect();
      _mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      _raycaster.setFromCamera(_mouseVec, camera);
      camera.getWorldDirection(_interactionPlane.normal);
      _interactionPlane.normal.negate();
      _raycaster.ray.intersectPlane(_interactionPlane, _intersectPoint);

      triggerShockwave(_intersectPoint);
    };

    const handlePointerUp = () => {
      isMouseDown = false;
    };

    const handlePointerLeave = () => {
      isMouseOver = false;
      isMouseDown = false;
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('mouseleave', handlePointerLeave);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Clock and loop
    const clock = new THREE.Clock();
    let frameId = 0;
    let currentTension = 1.0;
    let currentShape = configRef.current.shape;
    let currentColorPalette = configRef.current.colorPalette;
    let currentPrimary = configRef.current.primaryColor;
    let currentSecondary = configRef.current.secondaryColor;
    let currentTexture = configRef.current.particleTexture;

    // FPS calculation
    let frames = 0;
    let lastFpsCheck = performance.now();

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // FPS tracking
      frames++;
      const now = performance.now();
      if (now - lastFpsCheck >= 1000) {
        if (onFpsUpdate) onFpsUpdate(Math.round((frames * 1000) / (now - lastFpsCheck)));
        frames = 0;
        lastFpsCheck = now;
      }

      // Check for Shape change
      if (configRef.current.shape !== currentShape) {
        currentShape = configRef.current.shape;
        const newPositions = generateShapePositions(currentShape, count);
        targetPositions.set(newPositions);
        basePositions.set(newPositions);

        // Update target colors
        const newColors = generateParticleColors(
          configRef.current.colorPalette,
          count,
          targetPositions,
          configRef.current.primaryColor,
          configRef.current.secondaryColor
        );
        targetColors.set(newColors);

        if (configRef.current.soundEnabled) {
          soundEngine.playMorph();
        }
      }

      // Check for Palette or Color change
      if (
        configRef.current.colorPalette !== currentColorPalette ||
        configRef.current.primaryColor !== currentPrimary ||
        configRef.current.secondaryColor !== currentSecondary
      ) {
        currentColorPalette = configRef.current.colorPalette;
        currentPrimary = configRef.current.primaryColor;
        currentSecondary = configRef.current.secondaryColor;
        const newColors = generateParticleColors(
          currentColorPalette,
          count,
          targetPositions,
          currentPrimary,
          currentSecondary
        );
        targetColors.set(newColors);
      }

      // Check for Texture change
      if (configRef.current.particleTexture !== currentTexture) {
        currentTexture = configRef.current.particleTexture;
        material.map = getParticleTexture(currentTexture);
        material.needsUpdate = true;
      }

      // Smooth hand tension
      const targetTension = handTensionRef.current;
      currentTension += (targetTension - currentTension) * 0.08;

      // Update rotation speed & auto-rotate
      controls.autoRotateSpeed = 0.4 * configRef.current.rotationSpeed;
      controls.update();

      // Update particle material size
      material.size = configRef.current.particleSize * Math.max(0.6, currentTension);

      // Toggle Floating Solids visibility
      solidsGroup.visible = configRef.current.showFloatingSolids;

      // Update Shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 120 * delta;
        sw.strength *= 0.94;
        if (sw.radius >= sw.maxRadius || sw.strength < 0.1) {
          shockwaves.splice(s, 1);
        }
      }

      // Position & Color Buffers
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      const colAttr = geometry.attributes.color as THREE.BufferAttribute;
      const positions = posAttr.array as Float32Array;
      const colors = colAttr.array as Float32Array;

      const morphFactor = Math.min(0.2, 0.06 * configRef.current.morphSpeed);
      const mouseForceSetting = configRef.current.mouseForce;
      const mouseMode = configRef.current.mouseMode;

      // Reset Line Segments for Plexus mode
      let lineVertexIndex = 0;
      const linePositionsArr = lineGeometry.attributes.position.array as Float32Array;
      const lineColorsArr = lineGeometry.attributes.color.array as Float32Array;

      // Main Particle Loop
      for (let i = 0; i < count; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // Current coordinates
        let px = positions[ix];
        let py = positions[iy];
        let pz = positions[iz];

        // Target coordinates with hand tension scaling
        const tx = basePositions[ix] * currentTension;
        const ty = basePositions[iy] * currentTension;
        const tz = basePositions[iz] * currentTension;

        // Smooth base morph interpolation
        px += (tx - px) * morphFactor;
        py += (ty - py) * morphFactor;
        pz += (tz - pz) * morphFactor;

        // Autonomous organic oscillation
        const rand = randomness[i];
        const wobble = Math.sin(time * 2.2 + rand * 40) * 0.4 * currentTension;
        px += wobble;
        py += Math.cos(time * 2.5 + rand * 40) * 0.4 * currentTension;
        pz += Math.sin(time * 1.9 + rand * 40) * 0.4 * currentTension;

        // Color interpolation
        colors[ix] += (targetColors[ix] - colors[ix]) * 0.08;
        colors[iy] += (targetColors[iy] - colors[iy]) * 0.08;
        colors[iz] += (targetColors[iz] - colors[iz]) * 0.08;

        // Mouse Physics Interaction
        if (isMouseOver) {
          _particlePos.set(px, py, pz);
          _forceVec.subVectors(_particlePos, _intersectPoint);
          const distToMouse = _forceVec.length();
          const maxInfluence = 90 * mouseForceSetting;

          if (distToMouse < maxInfluence && distToMouse > 0.001) {
            const factor = 1 - distToMouse / maxInfluence;

            switch (mouseMode) {
              case 'vortex': {
                // Swirling vortex tangent force
                _forceVec.normalize();
                _tangentVec.crossVectors(_forceVec, _upVec).normalize();
                const vortexStrength = factor * factor * 5.5 * mouseForceSetting;
                velocities[ix] += _tangentVec.x * vortexStrength;
                velocities[iy] += _tangentVec.y * vortexStrength;
                velocities[iz] += _tangentVec.z * vortexStrength;

                // Subtle inward pull
                velocities[ix] -= _forceVec.x * factor * 1.5;
                velocities[iy] -= _forceVec.y * factor * 1.5;
                velocities[iz] -= _forceVec.z * factor * 1.5;
                break;
              }

              case 'repel': {
                // Energetic repulsion
                _forceVec.normalize();
                const repelStrength = factor * factor * 6.5 * mouseForceSetting;
                velocities[ix] += _forceVec.x * repelStrength;
                velocities[iy] += _forceVec.y * repelStrength;
                velocities[iz] += _forceVec.z * repelStrength;
                break;
              }

              case 'attract': {
                // Gravitational black-hole pull
                _forceVec.normalize();
                const attractStrength = factor * factor * 4.8 * mouseForceSetting;
                velocities[ix] -= _forceVec.x * attractStrength;
                velocities[iy] -= _forceVec.y * attractStrength;
                velocities[iz] -= _forceVec.z * attractStrength;
                break;
              }

              case 'plexus': {
                // Constellation lines to mouse cursor
                if (lineVertexIndex < MAX_LINES && distToMouse < 65) {
                  const lIdx = lineVertexIndex * 6;
                  // Vertex 1 (Particle)
                  linePositionsArr[lIdx] = px;
                  linePositionsArr[lIdx + 1] = py;
                  linePositionsArr[lIdx + 2] = pz;
                  lineColorsArr[lIdx] = colors[ix];
                  lineColorsArr[lIdx + 1] = colors[iy];
                  lineColorsArr[lIdx + 2] = colors[iz];

                  // Vertex 2 (Mouse Intersect Point)
                  linePositionsArr[lIdx + 3] = _intersectPoint.x;
                  linePositionsArr[lIdx + 4] = _intersectPoint.y;
                  linePositionsArr[lIdx + 5] = _intersectPoint.z;
                  lineColorsArr[lIdx + 3] = 1.0;
                  lineColorsArr[lIdx + 4] = 1.0;
                  lineColorsArr[lIdx + 5] = 1.0;

                  lineVertexIndex++;
                }

                // Gentle orbital floating
                velocities[ix] += Math.sin(time * 3 + rand * 10) * factor * 0.8;
                velocities[iy] += Math.cos(time * 3 + rand * 10) * factor * 0.8;
                break;
              }

              case 'wave': {
                // Undulating harmonic wave
                const wave = Math.sin(distToMouse * 0.15 - time * 6) * factor * 4 * mouseForceSetting;
                velocities[iy] += wave;
                break;
              }
            }
          }
        }

        // Apply active shockwave ripple impulses
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          _particlePos.set(px, py, pz);
          const distToShock = _particlePos.distanceTo(sw.center);
          const diff = Math.abs(distToShock - sw.radius);
          if (diff < 20) {
            const rippleFactor = (1 - diff / 20) * (sw.strength / 65);
            _forceVec.subVectors(_particlePos, sw.center).normalize();
            velocities[ix] += _forceVec.x * rippleFactor * 6;
            velocities[iy] += _forceVec.y * rippleFactor * 6;
            velocities[iz] += _forceVec.z * rippleFactor * 6;
          }
        }

        // Apply velocity with damping (spring return)
        px += velocities[ix];
        py += velocities[iy];
        pz += velocities[iz];

        velocities[ix] *= 0.90;
        velocities[iy] *= 0.90;
        velocities[iz] *= 0.90;

        positions[ix] = px;
        positions[iy] = py;
        positions[iz] = pz;
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Update Plexus lines count
      lineGeometry.setDrawRange(0, lineVertexIndex * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      // Update Floating Solids
      if (configRef.current.showFloatingSolids) {
        for (let i = 0; i < floatingSolids.length; i++) {
          const solid = floatingSolids[i];
          const mesh = solid.mesh;

          // Rotation
          mesh.rotation.x += solid.rotSpeed.x;
          mesh.rotation.y += solid.rotSpeed.y;
          mesh.rotation.z += solid.rotSpeed.z;

          // Orbit drifting
          const orbitTime = time * 0.2 + i * 0.4;
          mesh.position.x = solid.basePosition.x + Math.sin(orbitTime) * 15;
          mesh.position.y = solid.basePosition.y + Math.cos(orbitTime * 1.3) * 12;
          mesh.position.z = solid.basePosition.z + Math.sin(orbitTime * 0.8) * 15;

          // React to mouse proximity
          if (isMouseOver) {
            const dist = mesh.position.distanceTo(_intersectPoint);
            if (dist < 80) {
              const repel = (1 - dist / 80) * 15;
              mesh.position.x += (_intersectPoint.x > mesh.position.x ? -1 : 1) * repel * 0.2;
              mesh.position.y += (_intersectPoint.y > mesh.position.y ? -1 : 1) * repel * 0.2;
              mesh.rotation.x += 0.08;
              mesh.rotation.y += 0.08;
            }
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('mouseleave', handlePointerLeave);

      geometry.dispose();
      material.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      solidGeometries.forEach((g) => g.dispose());
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
};
