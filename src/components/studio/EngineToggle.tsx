import { Zap, Crown } from 'lucide-react';
import { EngineMode, useAudioStore } from '@/lib/audio-store';
import { motion } from 'framer-motion';

export function EngineToggle() {
  const { engine, setEngine } = useAudioStore();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/60 border border-border/30">
      <EngineButton
        mode="suno"
        active={engine === 'suno'}
        onClick={() => setEngine('suno')}
        icon={<Zap className="w-3.5 h-3.5" />}
        label="Modo Rápido"
      />
      <EngineButton
        mode="juno"
        active={engine === 'juno'}
        onClick={() => setEngine('juno')}
        icon={<Crown className="w-3.5 h-3.5" />}
        label="Modo Pro"
      />
    </div>
  );
}

function EngineButton({
  mode, active, onClick, icon, label,
}: {
  mode: EngineMode;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  const isSuno = mode === 'suno';
  const activeClass = isSuno
    ? 'bg-[hsl(var(--suno))] text-[hsl(var(--suno-foreground))] shadow-[0_0_20px_-3px_hsl(var(--suno)/0.5)]'
    : 'bg-[hsl(var(--juno))] text-[hsl(var(--juno-foreground))] shadow-[0_0_20px_-3px_hsl(var(--juno)/0.5)]';

  return (
    <button
      onClick={onClick}
      className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
        active ? activeClass : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {active && (
        <motion.div
          layoutId="engine-bg"
          className="absolute inset-0 rounded-lg"
          style={{
            background: isSuno
              ? 'hsl(var(--suno))'
              : 'hsl(var(--juno))',
          }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
        />
      )}
      <span className="relative flex items-center gap-2">
        {icon}
        <span>{label}</span>
      </span>
    </button>
  );
}
