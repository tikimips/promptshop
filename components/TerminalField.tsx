'use client';
import { useEffect, useRef } from 'react';

const CYAN   = '#00ffcc';
const PURPLE = '#9b5de5';
const PINK   = '#f72585';
const DIM    = 'rgba(0,255,204,0.18)';

export default function TerminalField({ height = 88 }: { height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const ctx = canvas.getContext('2d')!;

    const dpr = window.devicePixelRatio || 1;
    let W = canvas.offsetWidth;
    const H = height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    let raf: number;

    // Waveform history
    const wave: number[] = Array.from({ length: 40 }, () => 0.3 + Math.random() * 0.7);

    // Bar values that slowly drift
    const bars = [
      { label: 'PROC', val: 0.72, color: CYAN },
      { label: 'MEM',  val: 0.45, color: PURPLE },
      { label: 'NET',  val: 0.88, color: CYAN },
    ];

    // Status pills
    const pills = ['SYNC', 'ACK', 'TX/RX', 'NODE'];

    function drawPolygon(cx: number, cy: number, r: number, sides: number, rot: number) {
      if (!ctx) return;
      ctx.beginPath();
      for (let i = 0; i < sides; i++) {
        const a = rot + (i / sides) * Math.PI * 2;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function draw() {
      W = canvas!.offsetWidth;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, W, H);

      // Scanlines
      for (let y = 0; y < H; y += 2) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, y, W, 1);
      }

      const t = frame / 60;

      /* ── LEFT: Radar triangle ── */
      const cx = 52, cy = H / 2;
      const rot = t * 0.4;
      const pulse = 0.85 + 0.15 * Math.sin(t * 2.1);

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,204,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,204,0.08)';
      ctx.stroke();

      // Rotating outer triangle
      drawPolygon(cx, cy, 30 * pulse, 3, rot);
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Inner filled triangle (pinkish)
      drawPolygon(cx, cy, 18 * pulse, 3, rot + Math.PI);
      ctx.strokeStyle = PINK;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.8;
      ctx.stroke();
      ctx.fillStyle = 'rgba(247,37,133,0.07)';
      ctx.fill();
      ctx.globalAlpha = 1;

      // Dot at center
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fillStyle = CYAN;
      ctx.globalAlpha = 0.9;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Corner labels around triangle
      ctx.font = '7px "DM Mono", monospace';
      ctx.fillStyle = CYAN;
      ctx.globalAlpha = 0.7;
      ctx.fillText('L/SUP', cx - 14, cy - 36);
      ctx.fillText('ION',   cx - 38, cy + 20);
      ctx.fillText('PSI',   cx + 18, cy + 20);
      ctx.globalAlpha = 0.45;
      ctx.fillStyle = '#fff';
      ctx.fillText('D:' + (0.59 + Math.sin(t)*0.01).toFixed(2), cx - 44, cy - 20);
      ctx.fillText('T:2.' + ((frame % 9)+1), cx - 44, cy - 12);
      ctx.globalAlpha = 1;

      /* ── CENTER: Status pills ── */
      const pillX = 110;
      ctx.font = '8px "DM Mono", monospace';
      pills.forEach((p, i) => {
        const px = pillX;
        const py = 12 + i * 18;
        const active = (Math.floor(t * 0.7 + i) % 3) !== 0;
        ctx.strokeStyle = active ? PURPLE : 'rgba(155,93,229,0.3)';
        ctx.lineWidth = 1;
        ctx.fillStyle = active ? 'rgba(155,93,229,0.15)' : 'transparent';
        ctx.beginPath();
        ctx.roundRect(px, py, 44, 12, 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = active ? PURPLE : 'rgba(155,93,229,0.4)';
        ctx.globalAlpha = active ? 1 : 0.5;
        ctx.fillText(p, px + 6, py + 9);
        ctx.globalAlpha = 1;
      });

      /* ── CENTER-RIGHT: Progress bars ── */
      const bx = 168;
      bars.forEach((b, i) => {
        const by = 8 + i * 24;
        b.val += (Math.random() - 0.5) * 0.015;
        b.val = Math.max(0.1, Math.min(0.99, b.val));

        // Track
        ctx.fillStyle = 'rgba(255,255,255,0.05)';
        ctx.beginPath();
        ctx.roundRect(bx + 28, by + 2, W - bx - 56, 10, 2);
        ctx.fill();

        // Fill
        const fillW = (W - bx - 56) * b.val;
        const grad = ctx.createLinearGradient(bx + 28, 0, bx + 28 + fillW, 0);
        grad.addColorStop(0, b.color);
        grad.addColorStop(1, i === 1 ? PURPLE : CYAN);
        ctx.fillStyle = b.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.roundRect(bx + 28, by + 2, fillW, 10, 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label
        ctx.font = '7px "DM Mono", monospace';
        ctx.fillStyle = b.color;
        ctx.fillText(b.label, bx, by + 10);

        // Value
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText(Math.round(b.val * 100) + '%', W - bx - 22, by + 10);
      });

      /* ── RIGHT: Mini waveform ── */
      const wx = W - 48, wy = 10, ww = 42, wh = H - 20;
      ctx.strokeStyle = 'rgba(0,255,204,0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx, wy, ww, wh);

      wave.shift();
      wave.push(0.2 + Math.random() * 0.6 + 0.2 * Math.sin(t * 4));

      ctx.beginPath();
      wave.forEach((v, i) => {
        const x = wx + (i / wave.length) * ww;
        const y = wy + wh - v * wh;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Waveform fill
      ctx.lineTo(wx + ww, wy + wh);
      ctx.lineTo(wx, wy + wh);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0,255,204,0.06)';
      ctx.fill();

      // Label
      ctx.font = '6px "DM Mono", monospace';
      ctx.fillStyle = CYAN;
      ctx.globalAlpha = 0.5;
      ctx.fillText('SIG', wx + 2, wy + 8);
      ctx.globalAlpha = 1;

      /* ── Outer border glow ── */
      ctx.strokeStyle = 'rgba(0,255,204,0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

      // Corner ticks
      const tk = 8;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.5;
      [[0,0],[W,0],[0,H],[W,H]].forEach(([x,y]) => {
        ctx.beginPath();
        ctx.moveTo(x === 0 ? x : x - tk, y === 0 ? y + tk : y - tk);
        ctx.lineTo(x === 0 ? x + tk : x, y === 0 ? y : y);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      frame++;
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height, borderRadius: 4, cursor: 'default' }}
    />
  );
}
