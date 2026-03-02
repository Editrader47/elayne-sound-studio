import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, Upload, Info, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import elayneLogoImg from '@/assets/elayne-logo.png';

interface VoiceUploadPanelProps {
  voiceFile: File | null;
  setVoiceFile: (file: File | null) => void;
}

export function VoiceUploadPanel({ voiceFile, setVoiceFile }: VoiceUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    try {
      const valid = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
      if (!valid.some((t) => file.type.includes(t.split('/')[1]))) {
        toast({
          title: '⚠️ Formato no válido',
          description: 'Solo se aceptan archivos WAV o MP3.',
          variant: 'destructive',
        });
        return;
      }
      setVoiceFile(file);
      setAnalyzing(true);
      setDone(false);
      setProgress(0);
    } catch (error) {
      console.error('Error processing voice file:', error);
      toast({
        title: '❌ Error al procesar archivo',
        description: 'Ocurrió un error inesperado. Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  }, [setVoiceFile]);

  // Simulate analysis progress
  useEffect(() => {
    if (!analyzing) return;
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => {
          setAnalyzing(false);
          setDone(true);
        }, 400);
      }
      setProgress(Math.min(p, 100));
    }, 300);
    return () => clearInterval(interval);
  }, [analyzing]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    try {
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    } catch (error) {
      console.error('Error on drop:', error);
      toast({
        title: '❌ Error al cargar archivo',
        description: 'No se pudo procesar el archivo arrastrado.',
        variant: 'destructive',
      });
    }
  }, [handleFile]);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center">
          <Mic className="w-5 h-5 text-accent" />
        </div>
        <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Entrenamiento de Voz</h3>
          <p className="text-[11px] text-muted-foreground">Clona tu voz para canciones personalizadas</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground/50 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-[240px] text-xs bg-card border-border">
            Para mejores resultados, sube audio limpio sin ruido de fondo. Mínimo 30 segundos, formato WAV o MP3.
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
          ${isDragging
            ? 'border-accent bg-accent/10 shadow-[0_0_30px_-5px_hsl(var(--accent)/0.3)]'
            : 'border-border/40 hover:border-primary/40 hover:bg-secondary/30'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".wav,.mp3,audio/wav,audio/mpeg"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <img src={elayneLogoImg} alt="" className="w-12 h-12 object-contain opacity-60" />
        <div className="text-center">
          <p className="text-sm text-foreground/80 font-medium">
            <Upload className="w-4 h-4 inline mr-1.5 text-primary" />
            Arrastra o selecciona tu audio
          </p>
          <p className="text-[10px] text-muted-foreground mt-1 font-mono">WAV / MP3 · Mínimo 30s</p>
        </div>
      </div>

      {/* Analysis State */}
      <AnimatePresence>
        {(analyzing || done) && voiceFile && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-mono truncate max-w-[180px]">{voiceFile.name}</span>
              {done ? (
                <span className="flex items-center gap-1 text-accent">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Listo
                </span>
              ) : (
                <span className="text-primary font-mono">{Math.round(progress)}%</span>
              )}
            </div>
            <Progress value={progress} className="h-1.5" />
            {analyzing && (
              <p className="text-[10px] text-muted-foreground/60 font-mono animate-pulse">
                Analizando perfil vocal...
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
