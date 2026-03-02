import { useState, useCallback, useRef, useEffect } from 'react';
import { FlaskConical, Upload, Mic, CheckCircle2, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { VoiceDNAVisualizer } from '@/components/studio/VoiceDNAVisualizer';
import { useAudioStore } from '@/lib/audio-store';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import elayneLogoImg from '@/assets/elayne-logo.png';

const VoiceLabPage = () => {
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [profileName, setProfileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [quality, setQuality] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { voiceProfiles, addVoiceProfile } = useAudioStore();

  const handleFile = useCallback((file: File) => {
    try {
      const valid = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
      if (!valid.some((t) => file.type.includes(t.split('/')[1]))) {
        toast({ title: '⚠️ Formato no válido', description: 'Solo WAV o MP3.', variant: 'destructive' });
        return;
      }
      setVoiceFile(file);
      setAnalyzing(true);
      setDone(false);
      setProgress(0);
      setQuality(0);
    } catch (error) {
      console.error('Error processing voice file:', error);
      toast({ title: '❌ Error al procesar', description: 'Intenta de nuevo.', variant: 'destructive' });
    }
  }, []);

  useEffect(() => {
    if (!analyzing) return;
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 12 + 3;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        const finalQuality = 70 + Math.random() * 28;
        setQuality(finalQuality);
        setTimeout(() => {
          setAnalyzing(false);
          setDone(true);
        }, 600);
      }
      setProgress(Math.min(p, 100));
    }, 400);
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
      toast({ title: '❌ Error', description: 'No se pudo cargar el archivo.', variant: 'destructive' });
    }
  }, [handleFile]);

  const handleSaveProfile = () => {
    if (!voiceFile || !done || !profileName.trim()) return;
    addVoiceProfile({
      id: crypto.randomUUID(),
      name: profileName,
      fileName: voiceFile.name,
      quality,
      createdAt: new Date(),
    });
    toast({ title: '✅ Perfil de voz guardado', description: profileName });
    setVoiceFile(null);
    setProfileName('');
    setDone(false);
    setProgress(0);
    setQuality(0);
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-display">
          Laboratorio de Voz
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Clona y entrena tu perfil vocal con IA avanzada
        </p>
      </div>

      <div className="glass-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--juno)/0.15)] flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-[hsl(var(--juno))]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">Entrenamiento Avanzado</h3>
            <p className="text-[11px] text-muted-foreground">Sube audio limpio para el mejor resultado</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[240px] text-xs bg-card border-border">
              Para mejores resultados: audio limpio sin ruido de fondo, mínimo 30s, formato WAV o MP3. Habla o canta de forma natural.
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300
            ${isDragging
              ? 'border-[hsl(var(--juno))] bg-[hsl(var(--juno)/0.1)] shadow-[0_0_30px_-5px_hsl(var(--juno)/0.3)]'
              : 'border-border/40 hover:border-[hsl(var(--juno)/0.4)] hover:bg-secondary/30'
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
          <img src={elayneLogoImg} alt="" className="w-16 h-16 object-contain opacity-60" />
          <div className="text-center">
            <p className="text-sm text-foreground/80 font-medium">
              <Upload className="w-4 h-4 inline mr-1.5 text-[hsl(var(--juno))]" />
              Arrastra o selecciona tu audio
            </p>
            <p className="text-[10px] text-muted-foreground mt-1 font-mono">WAV / MP3 · Mínimo 30s · Sin ruido de fondo</p>
          </div>
        </div>

        {/* DNA Visualizer */}
        <VoiceDNAVisualizer active={analyzing || done} quality={quality} />

        {/* Analysis progress */}
        <AnimatePresence>
          {(analyzing || done) && voiceFile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-mono truncate max-w-[200px]">{voiceFile.name}</span>
                {done ? (
                  <span className="flex items-center gap-1 text-[hsl(var(--juno))]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Análisis Completo
                  </span>
                ) : (
                  <span className="text-[hsl(var(--juno))] font-mono">{Math.round(progress)}%</span>
                )}
              </div>
              <Progress value={progress} className="h-1.5" />

              {done && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2 items-end"
                >
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Nombre del Perfil</Label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Mi voz principal"
                      className="bg-secondary/50 border-border/40"
                    />
                  </div>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={!profileName.trim()}
                    className="glow-button-juno h-10"
                  >
                    Guardar Perfil
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Saved profiles */}
      {voiceProfiles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Mic className="w-4 h-4 text-[hsl(var(--juno))]" />
            Perfiles Guardados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {voiceProfiles.map((profile) => (
              <div key={profile.id} className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">{profile.name}</h3>
                  <span className="text-[10px] font-mono text-[hsl(var(--juno))]">{Math.round(profile.quality)}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">{profile.fileName}</p>
                <div className="w-full h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${profile.quality}%`,
                      background: 'linear-gradient(90deg, hsl(var(--accent)), hsl(var(--juno)))',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceLabPage;
