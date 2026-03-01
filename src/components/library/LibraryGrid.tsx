import { useAudioStore } from '@/lib/audio-store';
import { TrackCard } from './TrackCard';
import { Music } from 'lucide-react';
import { motion } from 'framer-motion';

export function LibraryGrid({ limit }: { limit?: number }) {
  const tracks = useAudioStore((s) => s.tracks);
  const displayed = limit ? tracks.slice(0, limit) : tracks;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <Music className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">
          {limit ? 'Recent Creations' : 'Your Library'}
        </h2>
        <span className="text-xs font-mono text-muted-foreground/60">{tracks.length} tracks</span>
      </div>

      {displayed.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground/50 text-sm">No tracks yet. Generate your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
