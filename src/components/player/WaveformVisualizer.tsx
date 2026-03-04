import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/lib/audio-store';

interface WaveformVisualizerProps {
  onSeek?: (pct: number) => void;
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function WaveformVisualizer({ onSeek, duration: durationProp }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const { isPlaying, currentTrack, currentTime } = useAudioStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const barCount = 80;
    const bars = Array.from({ length: barCount }, (_, i) => {
      const seed = currentTrack ? currentTrack.id.charCodeAt(i % currentTrack.id.length) : i;
      return 0.2 + (Math.sin(seed * 0.7 + i * 0.3) * 0.5 + 0.5) * 0.8;
    });

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * 2;
      canvas.height = height * 2;
      ctx.scale(2, 2);
      ctx.clearRect(0, 0, width, height);

      const barWidth = width / barCount;
      const gap = 2;
      const dur = durationProp || (currentTrack ? currentTrack.duration : 1);
      const progress = currentTrack ? currentTime / dur : 0;

      // Draw particles behind bars when playing
      if (isPlaying) {
        // Spawn new particles
        if (Math.random() < 0.4) {
          const progressX = progress * width;
          particlesRef.current.push({
            x: progressX + (Math.random() - 0.5) * 40,
            y: height * 0.5 + (Math.random() - 0.5) * height * 0.6,
            vx: (Math.random() - 0.5) * 0.8,
            vy: -Math.random() * 0.5 - 0.2,
            life: 0,
            maxLife: 40 + Math.random() * 40,
            size: Math.random() * 2 + 0.5,
          });
        }
        // Cap particles
        if (particlesRef.current.length > 60) {
          particlesRef.current = particlesRef.current.slice(-60);
        }
      }

      // Update & draw particles
      particlesRef.current = particlesRef.current.filter(p => {
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        if (p.life >= p.maxLife) return false;
        const alpha = 1 - p.life / p.maxLife;
        const hue = Math.random() > 0.5 ? 180 : 300; // cyan or magenta
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${alpha * 0.6})`;
        ctx.fill();
        return true;
      });

      // Draw bars with neon glow
      bars.forEach((h, i) => {
        const x = i * barWidth;
        const barH = h * height * 0.8;
        const isPast = i / barCount < progress;

        // Animation pulse
        const scale = isPlaying
          ? 1 + Math.sin(Date.now() * 0.008 + i * 0.5) * 0.25
          : 1;

        const scaledH = barH * scale;
        const scaledY = (height - scaledH) / 2;

        if (isPast) {
          // Neon gradient: cyan → magenta
          const gradient = ctx.createLinearGradient(x, scaledY, x, scaledY + scaledH);
          gradient.addColorStop(0, 'hsl(180, 100%, 55%)');   // Electric Cyan
          gradient.addColorStop(1, 'hsl(300, 100%, 60%)');   // Deep Magenta
          ctx.fillStyle = gradient;

          // Glow effect
          if (isPlaying) {
            ctx.shadowColor = 'hsl(180, 100%, 50%)';
            ctx.shadowBlur = 8;
          }
        } else {
          ctx.fillStyle = 'hsl(222, 30%, 15%)';
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.roundRect(x + gap / 2, scaledY, barWidth - gap, scaledH, 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, currentTrack, currentTime, durationProp]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-12 md:h-16 cursor-pointer"
      onClick={(e) => {
        if (!currentTrack) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        if (onSeek) {
          onSeek(pct);
        } else {
          useAudioStore.getState().setCurrentTime(pct * currentTrack.duration);
        }
      }}
    />
  );
}
