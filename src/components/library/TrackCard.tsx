import { useState } from 'react';
import { Play, Pause, Download, Clock, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track, useAudioStore } from '@/lib/audio-store';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export function TrackCard({ track, index }: { track: Track; index: number }) {
  const { currentTrack, isPlaying, setCurrentTrack, togglePlay } = useAudioStore();
  const isActive = currentTrack?.id === track.id;
  const isSuno = track.engine === 'suno';

  const handlePlay = () => {
    if (isActive) {
      togglePlay();
    } else {
      setCurrentTrack(track);
    }
  };

  const handleDownload = (format: 'mp3' | 'wav') => {
    const url = track.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    downloadFile(url, `${track.title}.${format}`);
  };

  const engineColor = isSuno ? 'var(--suno)' : 'var(--juno)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`glass-card-hover group p-4 space-y-3 ${isActive ? 'glow-border border-primary/30' : ''}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{track.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {track.genre}
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{
                background: `hsl(${engineColor} / 0.15)`,
                color: `hsl(${engineColor})`,
              }}
            >
              {isSuno ? 'Rápido' : 'Pro'}
            </span>
            {track.instrumental && (
              <span className="text-[10px] font-mono text-muted-foreground/60">INST</span>
            )}
            {track.highQuality && (
              <span className="text-[10px] font-mono text-muted-foreground/60">HQ</span>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePlay}
          className="w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0"
        >
          {isActive && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </Button>
      </div>

      {/* Lyrics snippet */}
      {track.lyrics && (
        <p className="text-[10px] text-muted-foreground/60 font-mono truncate italic">
          {track.lyrics.substring(0, 60)}...
        </p>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(track.duration)}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Download className="w-3 h-3" />
              Descargar
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem onClick={() => handleDownload('mp3')}>
              Descargar MP3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDownload('wav')}>
              Descargar WAV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
