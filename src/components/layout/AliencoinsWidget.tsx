import { Zap, Plus } from 'lucide-react';
import { useAudioStore } from '@/lib/audio-store';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function AliencoinsWidget() {
  const { aliencoins, addCoins } = useAudioStore();

  const handleRecharge = () => {
    addCoins(50);
    toast({
      title: '⚡ +50 Aliencoins',
      description: 'Recarga completada exitosamente.',
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/60 border border-border/30">
        <Zap className="w-4 h-4 text-aliencoin" />
        <AnimatePresence mode="popLayout">
          <motion.span
            key={aliencoins}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold font-mono text-aliencoin"
          >
            {aliencoins}
          </motion.span>
        </AnimatePresence>
        <span className="text-[10px] text-muted-foreground font-mono">AC</span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRecharge}
        className="h-8 text-[11px] font-semibold border-[hsl(var(--aliencoin)/0.4)] text-aliencoin hover:bg-[hsl(var(--aliencoin)/0.1)] glow-aliencoin"
      >
        <Plus className="w-3 h-3 mr-1" />
        Recargar
      </Button>
    </div>
  );
}
