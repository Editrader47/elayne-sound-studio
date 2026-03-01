import { useRef } from 'react';
import { Sparkles, Loader2, Music, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAudioStore } from '@/lib/audio-store';
import { generateTrack } from '@/lib/mock-ai-service';
import { motion, AnimatePresence } from 'framer-motion';
import { LyricsPanel } from './LyricsPanel';
import { VoiceUploadPanel } from './VoiceUploadPanel';
import { EngineToggle } from './EngineToggle';
import { QuickTags } from './QuickTags';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';

const GENRES = [
  'Reggaeton', 'Rock', 'Lo-fi', 'Trap', 'Pop', 'Hip-Hop',
  'EDM', 'Jazz', 'Clásica', 'Synthwave', 'R&B', 'Ambient',
];

export function StudioPanel() {
  const {
    engine, isGenerating, setIsGenerating, addTrack, setCurrentTrack, spendCoins,
    studioPrompt, setStudioPrompt, studioGenre, setStudioGenre,
    studioLyrics, setStudioLyrics, studioLyricsEnabled, setStudioLyricsEnabled,
  } = useAudioStore();

  const [instrumental, setInstrumental] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [syncLyrics, setSyncLyrics] = useState(true);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  const lyricsRef = useRef<HTMLTextAreaElement>(null);

  const isSuno = engine === 'suno';
  const isJuno = engine === 'juno';

  const handleInsertTag = (tag: string) => {
    const ta = lyricsRef.current;
    if (!ta) {
      setStudioLyrics(studioLyrics + '\n' + tag + '\n');
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = studioLyrics;
    const newText = text.substring(0, start) + tag + '\n' + text.substring(end);
    setStudioLyrics(newText);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + tag.length + 1;
    }, 0);
  };

  const handleGenerate = async () => {
    if (!studioPrompt.trim() || isGenerating) return;

    const cost = isJuno ? 10 : 5;
    const success = spendCoins(cost);
    if (!success) {
      toast({
        title: '⚡ Aliencoins insuficientes',
        description: `Necesitas ${cost} AC. Recarga tu balance.`,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: `⚡ -${cost} Aliencoins usados`,
      description: `Motor ${engine.toUpperCase()} activado.`,
    });

    setIsGenerating(true);
    try {
      const track = await generateTrack({
        prompt: studioPrompt,
        genre: studioGenre,
        instrumental,
        highQuality,
        engine,
        lyrics: studioLyricsEnabled ? studioLyrics : undefined,
      });
      addTrack(track);
      setCurrentTrack(track);
      setStudioPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  const engineColor = isSuno ? 'var(--suno)' : 'var(--juno)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 md:p-8 space-y-6"
    >
      {/* Engine Toggle */}
      <EngineToggle />

      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `hsl(${engineColor} / 0.15)` }}
        >
          <Zap className="w-5 h-5" style={{ color: `hsl(${engineColor})` }} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Panel de Generación · <span style={{ color: `hsl(${engineColor})` }}>{engine.toUpperCase()}</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            {isSuno ? 'Generación rápida con prompt simple.' : 'Fidelidad pro con editor avanzado de letras.'}
          </p>
        </div>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Descripción de la Canción</Label>
        <Textarea
          value={studioPrompt}
          onChange={(e) => setStudioPrompt(e.target.value)}
          placeholder="Un beat lo-fi soñador con acordes cálidos de piano, suave crujido de vinilo y lluvia de fondo..."
          className="min-h-[120px] bg-secondary/50 border-border/40 text-foreground placeholder:text-muted-foreground/40 resize-none focus:border-primary/50 focus:ring-primary/20 text-sm"
        />
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Género Musical</Label>
        <Select value={studioGenre} onValueChange={setStudioGenre}>
          <SelectTrigger className="bg-secondary/50 border-border/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>
                <span className="flex items-center gap-2">
                  <Music className="w-3 h-3 text-primary/60" />
                  {g}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-3">
          <Switch checked={instrumental} onCheckedChange={setInstrumental} />
          <Label className="text-sm text-foreground/80">Instrumental</Label>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={highQuality} onCheckedChange={setHighQuality} />
          <Label className="text-sm text-foreground/80">Render Alta Calidad</Label>
        </div>
      </div>

      <Separator className="bg-border/30" />

      {/* Juno Pro Lyrics Editor */}
      <AnimatePresence>
        {isJuno && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-[hsl(var(--juno)/0.15)] flex items-center justify-center">
                <span className="text-xs font-bold text-[hsl(var(--juno))]">J</span>
              </div>
              <Label className="text-sm font-semibold text-foreground">Editor de Letras Pro</Label>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[hsl(var(--juno)/0.15)] text-[hsl(var(--juno))]">JUNO</span>
            </div>

            <QuickTags onInsert={handleInsertTag} />

            <Textarea
              ref={lyricsRef}
              value={studioLyrics}
              onChange={(e) => setStudioLyrics(e.target.value)}
              placeholder={"[Intro]\n(melodía suave)\n\n[Verso 1]\nBajo las luces de neón\ncamino sin dirección...\n\n[Estribillo]\nEsta noche es nuestra..."}
              className="min-h-[200px] bg-secondary/50 border-[hsl(var(--juno)/0.3)] text-foreground placeholder:text-muted-foreground/40 resize-none focus:border-[hsl(var(--juno)/0.5)] focus:ring-[hsl(var(--juno)/0.2)] text-sm font-mono"
            />

            <Separator className="bg-border/30" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suno mode: simple lyrics toggle */}
      {isSuno && (
        <>
          <LyricsPanel
            lyrics={studioLyrics}
            setLyrics={setStudioLyrics}
            syncLyrics={syncLyrics}
            setSyncLyrics={setSyncLyrics}
            enabled={studioLyricsEnabled}
            setEnabled={setStudioLyricsEnabled}
          />
          <Separator className="bg-border/30" />
        </>
      )}

      {/* Voice Upload */}
      <VoiceUploadPanel voiceFile={voiceFile} setVoiceFile={setVoiceFile} />

      {/* Generate */}
      <Button
        onClick={handleGenerate}
        disabled={!studioPrompt.trim() || isGenerating}
        className={`w-full h-12 text-base font-semibold rounded-xl ${
          isSuno ? 'glow-button-suno' : 'glow-button-juno'
        } ${isGenerating ? 'pulse-glow' : ''}`}
        size="lg"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            {isJuno ? 'Procesando Fidelidad Pro...' : 'Generando Magia...'}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generar {isJuno ? 'Pro' : 'Magia'} · {isJuno ? '10' : '5'} AC
          </span>
        )}
      </Button>
    </motion.div>
  );
}
