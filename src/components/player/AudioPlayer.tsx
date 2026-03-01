import { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAudioStore } from '@/lib/audio-store';
import { WaveformVisualizer } from './WaveformVisualizer';

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer() {
  const {
    currentTrack, isPlaying, currentTime, volume, speed,
    togglePlay, setCurrentTime, setVolume, setSpeed, setIsPlaying,
  } = useAudioStore();

  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying || !currentTrack) return;
    const interval = setInterval(() => {
      const store = useAudioStore.getState();
      const next = store.currentTime + 0.1 * store.speed;
      if (next >= currentTrack.duration) {
        store.setIsPlaying(false);
        store.setCurrentTime(0);
      } else {
        store.setCurrentTime(next);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  if (!currentTrack) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 h-20 bg-[hsl(var(--player-bg))] border-t border-border/30 flex items-center justify-center">
        <p className="text-muted-foreground/50 text-sm font-mono">No track selected</p>
      </div>
    );
  }

  const nextSpeed = () => {
    const idx = SPEEDS.indexOf(speed);
    setSpeed(SPEEDS[(idx + 1) % SPEEDS.length]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[hsl(var(--player-bg))]/95 backdrop-blur-xl border-t border-border/30">
      {/* Waveform */}
      <div className="px-4 pt-2">
        <WaveformVisualizer />
      </div>

      <div className="px-4 pb-3 pt-1 flex items-center gap-4">
        {/* Track info */}
        <div className="min-w-0 flex-shrink-0 w-36 md:w-48">
          <p className="text-sm font-semibold text-foreground truncate">{currentTrack.title}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{currentTrack.genre}</p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
            <SkipBack className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary/15 text-primary hover:bg-primary/25"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-muted-foreground hover:text-foreground">
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        {/* Time */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Speed */}
        <Button
          variant="ghost"
          size="sm"
          onClick={nextSpeed}
          className="hidden md:flex text-[11px] font-mono text-muted-foreground hover:text-foreground h-7 px-2"
        >
          {speed}x
        </Button>

        {/* Volume */}
        <div className="hidden md:flex items-center gap-2 w-28">
          <Button
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground"
            onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          >
            {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v / 100)}
            className="w-20"
          />
        </div>
      </div>
    </div>
  );
}
