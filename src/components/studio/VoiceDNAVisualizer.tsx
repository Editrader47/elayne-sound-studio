import { motion } from 'framer-motion';

interface VoiceDNAVisualizerProps {
  active: boolean;
  quality: number;
}

export function VoiceDNAVisualizer({ active, quality }: VoiceDNAVisualizerProps) {
  if (!active) return null;

  const bars = 24;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3 py-4"
    >
      {/* DNA Helix Bars */}
      <div className="flex items-center justify-center gap-[3px] h-16">
        {Array.from({ length: bars }).map((_, i) => {
          const delay = i * 0.08;
          const isLeft = i % 2 === 0;
          return (
            <motion.div
              key={i}
              className="w-[3px] rounded-full"
              style={{
                background: isLeft
                  ? 'hsl(var(--juno))'
                  : 'hsl(var(--accent))',
                height: '100%',
              }}
              animate={{
                scaleY: [0.3, 1, 0.3],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 1.2,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>

      {/* Quality Meter */}
      <div className="w-full space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-muted-foreground">Calidad de Clonación</span>
          <span className="text-[hsl(var(--juno))] font-bold">{Math.round(quality)}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary/60 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--juno)))',
            }}
            initial={{ width: '0%' }}
            animate={{ width: `${quality}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}
