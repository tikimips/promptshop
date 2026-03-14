'use client';
import { useEffect, useRef } from 'react';

const LABELS = ['INT DEC', 'CRV TRD', 'NC', 'SIG', 'PROC', '0x4F', 'BUF', 'TX', 'RX', '∆NET', 'SYNC', 'ACK'];

interface Particle {
  x: number; y: number;
  size: number;
  color: string;
  brightness: number;
  flickerSpeed: number;
  flickerOffset: number;
}

interface Label {
  x: number; y: number;
  text: string;
  alpha: number;
  fadeDir: number;
}

export default function TerminalField({ height = 72 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let W = canvas.offsetWidth;
    let H = height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const colors = ['#34D399', '#a3e635', '#facc15', '#bbf7d0', '#86efac', '#d9f99d'];

    // Scatter particles — denser in center, sparse on edges
    const particles: Particle[] = Array.from({ length: 180 }, () => {
      const cx = W * (0.3 + Math.random() * 0.5);
      const cy = H * (0.1 + Math.random() * 0.8);
      const spread = Math.random();
      return {
        x: cx + (Math.random() - 0.5) * W * 0.7 * spread,
        y: cy + (Math.random() - 0.5) * H * 1.4 * spread,
        size: Math.random() < 0.6 ? 1 : Math.random() < 0.8 ? 1.5 : 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        brightness: 0.3 + Math.random() * 0.7,
        flickerSpeed: 0.8 + Math.random() * 3,
        flickerOffset: Math.random() * Math.PI * 2,
      };
    });

    // Text labels scattered around
    const labels: Label[] = LABELS.map((text, i) => ({
      x: 4 + Math.random() * (W * 0.85),
      y: 8 + (i / LABELS.length) * (H - 10) + (Math.random() - 0.5) * 10,
      text,
      alpha: 0.2 + Math.random() * 0.5,
      fadeDir: Math.random() > 0.5 ? 1 : -1,
    }));

    let frame = 0;
    let raf: number;

    function draw() {
      if (!ctx) return;
      W = canvas!.offsetWidth;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#060a07';
      ctx.fillRect(0, 0, W, H);

      // Subtle horizontal scanlines
      for (let y = 0; y < H; y += 3) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(0, y, W, 1);
      }

      const t = frame / 60;

      // Draw particles
      for (const p of particles) {
        const flicker = 0.5 + 0.5 * Math.sin(t * p.flickerSpeed + p.flickerOffset);
        const alpha = p.brightness * flicker;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }

      // Draw text labels
      ctx.font = '7px "DM Mono", monospace';
      for (const lbl of labels) {
        lbl.alpha += lbl.fadeDir * 0.004;
        if (lbl.alpha > 0.65) lbl.fadeDir = -1;
        if (lbl.alpha < 0.12) lbl.fadeDir = 1;
        ctx.globalAlpha = lbl.alpha;
        ctx.fillStyle = Math.random() > 0.998 ? '#facc15' : '#34D399';
        ctx.fillText(lbl.text, lbl.x, lbl.y);
      }

      // Occasional bright flash on a random particle
      if (frame % 8 === 0) {
        const p = particles[Math.floor(Math.random() * particles.length)];
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = '#facc15';
        ctx.fillRect(p.x - 0.5, p.y - 0.5, p.size + 1, p.size + 1);
      }

      ctx.globalAlpha = 1;

      // Border glow
      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0,   'rgba(52,211,153,0.18)');
      grad.addColorStop(0.5, 'rgba(168,85,247,0.08)');
      grad.addColorStop(1,   'rgba(52,211,153,0.18)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      frame++;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height, borderRadius: 6, cursor: 'default' }}
    />
  );
}
