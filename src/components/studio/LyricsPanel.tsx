import { useState } from 'react';
import { FileText, Info } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface LyricsPanelProps {
  lyrics: string;
  setLyrics: (lyrics: string) => void;
  syncLyrics: boolean;
  setSyncLyrics: (sync: boolean) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function LyricsPanel({
  lyrics, setLyrics, syncLyrics, setSyncLyrics, enabled, setEnabled,
}: LyricsPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
            <FileText className="w-4 h-4 text-accent" />
          </div>
          <Label className="text-sm font-semibold text-foreground">Letras Personalizadas</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-3.5 h-3.5 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[220px] text-xs bg-card border-border">
              Pega tus letras y la IA generará la canción siguiendo tu texto.
            </TooltipContent>
          </Tooltip>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder={"Verso 1:\nBajo las luces de neón\ncamino sin dirección...\n\nCoro:\nEsta noche es nuestra..."}
              className="min-h-[140px] bg-secondary/50 border-border/40 text-foreground placeholder:text-muted-foreground/40 resize-none focus:border-accent/50 focus:ring-accent/20 text-sm font-mono"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="sync-lyrics"
                checked={syncLyrics}
                onCheckedChange={(v) => setSyncLyrics(v === true)}
              />
              <Label htmlFor="sync-lyrics" className="text-xs text-muted-foreground cursor-pointer">
                Sincronizar letras con la melodía generada
              </Label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
