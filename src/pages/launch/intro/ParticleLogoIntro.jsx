import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { AnimatePresence, motion } from 'framer-motion';

const WORDS = ['DISCOVER', 'CONNECT', 'GROW'];
const MAX_PARTICLES = 2200;

/**
 * Samples the Pairley logo into a point cloud, scatters those points in 3D
 * space, then animates them converging back into the logo shape — the
 * "particles form the logo" opening beat from the brand brief. Plain three.js
 * (no react-three-fiber) to keep this dependency-light and easy to tear down.
 */
function sampleLogoPoints(image, resolution = 110) {
  const canvas = document.createElement('canvas');
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext('2d');
  const scale = Math.min(resolution / image.width, resolution / image.height);
  const w = image.width * scale;
  const h = image.height * scale;
  ctx.drawImage(image, (resolution - w) / 2, (resolution - h) / 2, w, h);

  const { data } = ctx.getImageData(0, 0, resolution, resolution);
  const points = [];
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const alpha = data[(y * resolution + x) * 4 + 3];
      if (alpha > 120) {
        points.push({
          x: (x / resolution - 0.5) * 6,
          y: -(y / resolution - 0.5) * 6,
        });
      }
    }
  }
  // Downsample evenly if there are more points than our particle budget.
  if (points.length > MAX_PARTICLES) {
    const step = points.length / MAX_PARTICLES;
    const sampled = [];
    for (let i = 0; i < MAX_PARTICLES; i++) sampled.push(points[Math.floor(i * step)]);
    return sampled;
  }
  return points;
}

const BRAND_COLORS = [
  new THREE.Color('#A78BFA'),
  new THREE.Color('#A78BFA'),
  new THREE.Color('#22C55E'),
  new THREE.Color('#ffffff'),
];

export default function ParticleLogoIntro({ onComplete }) {
  const mountRef = useRef(null);
  const [wordIndex, setWordIndex] = useState(-1);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let renderer, scene, camera, points, frameId;
    let disposed = false;
    const tweens = [];

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 14;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const image = new Image();
    image.src = '/logo.png';
    image.onload = () => {
      if (disposed) return;
      const targets = sampleLogoPoints(image);
      const count = targets.length || 800;

      const positions = new Float32Array(count * 3);
      const startPositions = new Float32Array(count * 3);
      const targetPositions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Scatter start: random point on a large sphere shell.
        const r = 9 + Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        startPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        startPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        startPositions[i * 3 + 2] = r * Math.cos(phi);

        const t = targets[i % targets.length];
        targetPositions[i * 3] = t.x;
        targetPositions[i * 3 + 1] = t.y;
        targetPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.6;

        positions[i * 3] = startPositions[i * 3];
        positions[i * 3 + 1] = startPositions[i * 3 + 1];
        positions[i * 3 + 2] = startPositions[i * 3 + 2];

        const c = BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.075,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });

      points = new THREE.Points(geometry, material);
      scene.add(points);

      const progress = { t: 0 };
      const posAttr = geometry.attributes.position;

      const tween = gsap.to(progress, {
        t: 1,
        duration: 2.4,
        ease: 'power3.out',
        onUpdate: () => {
          for (let i = 0; i < count; i++) {
            posAttr.array[i * 3] = THREE.MathUtils.lerp(startPositions[i * 3], targetPositions[i * 3], progress.t);
            posAttr.array[i * 3 + 1] = THREE.MathUtils.lerp(startPositions[i * 3 + 1], targetPositions[i * 3 + 1], progress.t);
            posAttr.array[i * 3 + 2] = THREE.MathUtils.lerp(startPositions[i * 3 + 2], targetPositions[i * 3 + 2], progress.t);
          }
          posAttr.needsUpdate = true;
        },
        onComplete: () => {
          if (disposed) return;
          setWordIndex(0);
          const timers = [
            setTimeout(() => !disposed && setWordIndex(1), 800),
            setTimeout(() => !disposed && setWordIndex(2), 1600),
            setTimeout(() => !disposed && setFadeOut(true), 2400),
            setTimeout(() => !disposed && onComplete?.(), 2900),
          ];
          tweens.push({ kill: () => timers.forEach(clearTimeout) });
        },
      });
      tweens.push(tween);

      const camTween = gsap.to(camera.position, { z: 9.5, duration: 2.6, ease: 'power2.out' });
      tweens.push(camTween);
    };

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (points) points.rotation.y += 0.0009;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      disposed = true;
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      tweens.forEach((t) => t.kill());
      gsap.killTweensOf(camera.position);
      if (points) {
        points.geometry.dispose();
        points.material.dispose();
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [onComplete]);

  return (
    <div className={`particle-intro ${fadeOut ? 'particle-intro--fade' : ''}`}>
      <div ref={mountRef} className="particle-intro__canvas" />
      <AnimatePresence mode="wait">
        {wordIndex >= 0 && wordIndex < WORDS.length && (
          <motion.div
            key={WORDS[wordIndex]}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="launch-intro-fallback__word"
          >
            {WORDS[wordIndex]}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
