/**
 * ConfettiCanvas — lightweight canvas confetti burst.
 * No external library needed. Fires on mount, cleans up on unmount.
 */
import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'star';
  alpha: number;
  decay: number;
}

const COLORS = [
  '#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#2D6A4F', '#CC0000', '#FF8C00', '#00CED1', '#FF69B4',
];

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

interface Props {
  active: boolean;
  /** 'burst' = one-shot explosion; 'shower' = continuous rain */
  mode?: 'burst' | 'shower';
  /** 0–1 intensity multiplier */
  intensity?: number;
}

export default function ConfettiCanvas({ active, mode = 'burst', intensity = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const count = Math.floor(180 * intensity);

    function spawnBurst() {
      const cx = canvas!.width / 2;
      const cy = canvas!.height * 0.35;
      for (let i = 0; i < count; i++) {
        const angle = randomBetween(0, Math.PI * 2);
        const speed = randomBetween(4, 18) * intensity;
        particlesRef.current.push({
          x: cx + randomBetween(-60, 60),
          y: cy + randomBetween(-20, 20),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - randomBetween(2, 8),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: randomBetween(6, 14),
          rotation: randomBetween(0, Math.PI * 2),
          rotationSpeed: randomBetween(-0.15, 0.15),
          shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
          alpha: 1,
          decay: randomBetween(0.008, 0.018),
        });
      }
    }

    let showerTimer = 0;
    function spawnShower(now: number) {
      if (now - showerTimer < 80) return;
      showerTimer = now;
      for (let i = 0; i < 6; i++) {
        particlesRef.current.push({
          x: randomBetween(0, canvas!.width),
          y: -20,
          vx: randomBetween(-2, 2),
          vy: randomBetween(3, 7),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: randomBetween(6, 12),
          rotation: randomBetween(0, Math.PI * 2),
          rotationSpeed: randomBetween(-0.1, 0.1),
          shape: (['rect', 'circle'] as const)[Math.floor(Math.random() * 2)],
          alpha: 1,
          decay: randomBetween(0.004, 0.01),
        });
      }
    }

    if (mode === 'burst') spawnBurst();

    function tick(now: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      if (mode === 'shower') spawnShower(now);

      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.02);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.alpha -= p.decay;

        ctx!.save();
        ctx!.globalAlpha = Math.max(0, p.alpha);
        ctx!.fillStyle = p.color;
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rotation);

        if (p.shape === 'rect') {
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'circle') {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        } else {
          drawStar(ctx!, 0, 0, p.size / 2);
        }
        ctx!.restore();
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
    };
  }, [active, mode, intensity]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
