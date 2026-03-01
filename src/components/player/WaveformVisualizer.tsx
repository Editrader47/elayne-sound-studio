import { useEffect, useRef } from 'react';
import { useAudioStore } from '@/lib/audio-store';

interface WaveformVisualizerProps {
  onSeek?: (pct: number) => void;
  duration?: number;
}

export function WaveformVisualizer({ onSeek, duration: durationProp }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
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

      bars.forEach((h, i) => {
        const x = i * barWidth;
        const barH = h * height * 0.8;

        const isPast = i / barCount < progress;
        // Cyberpunk colors: neon cyan played, muted for unplayed
        ctx.fillStyle = isPast
          ? 'hsl(330, 90%, 60%)'
          : 'hsl(222, 30%, 22%)';

        // Stronger animation when playing
        const scale = isPlaying
          ? 1 + Math.sin(Date.now() * 0.008 + i * 0.5) * 0.25
          : 1;

        const scaledH = barH * scale;
        const scaledY = (height - scaledH) / 2;

        ctx.beginPath();
        ctx.roundRect(x + gap / 2, scaledY, barWidth - gap, scaledH, 2);
        ctx.fill();
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
