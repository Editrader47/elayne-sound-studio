import { useRef, useState } from 'react';
import { Sparkles, Loader2, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAudioStore } from '@/lib/audio-store';
import { generateMusic } from '@/services/aiGenerator';
import { saveSongToDB, updateAliencoins } from '@/lib/db-service';
import { useAuth } from '@/hooks/use-auth';
import { motion, AnimatePresence } from 'framer-motion';
import { LyricsPanel } from './LyricsPanel';
import { VoiceUploadPanel } from './VoiceUploadPanel';
import { EngineToggle } from './EngineToggle';
import { QuickTags } from './QuickTags';
import { toast } from '@/hooks/use-toast';

const GENRE_TAGS = ['Reggaeton', 'Rock', 'Lo-fi', 'Trap', 'Pop', 'Hip-Hop', 'EDM', 'Cumbia', 'Synthwave'];

export function StudioPanel() {
  const {
    engine, isGenerating, setIsGenerating, addTrack, setCurrentTrack, spendCoins, aliencoins,
    studioPrompt, setStudioPrompt, studioGenre, setStudioGenre,
    studioLyrics, setStudioLyrics, studioLyricsEnabled, setStudioLyricsEnabled,
  } = useAudioStore();
  const { user } = useAuth();

  const [instrumental, setInstrumental] = useState(false);
  const [highQuality, setHighQuality] = useState(true);
  const [syncLyrics, setSyncLyrics] = useState(true);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

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
        description: 'Motor de generación activado.',
      });

    setIsGenerating(true);
    setLoadingMessage('Conectando con el satélite musical...');

    // Rotate loading messages
    const messages = [
      'ELAYNE está componiendo tu música original...',
      'Conectando con el satélite musical...',
      'Generando audio con IA...',
      'Procesando ondas sonoras...',
      'Casi listo, afinando frecuencias...',
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % messages.length;
      setLoadingMessage(messages[msgIdx]);
    }, 2500);

    try {
      const track = await generateMusic({
        prompt: studioPrompt,
        genre: studioGenre,
        instrumental,
        highQuality,
        engine,
        lyrics: studioLyricsEnabled ? studioLyrics : undefined,
      });
      addTrack(track);
      setCurrentTrack(track);
      
      // Save to database
      if (user) {
        const newBalance = aliencoins - cost;
        await saveSongToDB(track, user.id);
        await updateAliencoins(user.id, newBalance);
      }
      
      setStudioPrompt('');
    } catch (err: any) {
      toast({
        title: '❌ Error de generación',
        description: err?.message || 'Error de conexión con el motor de IA. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      clearInterval(msgInterval);
      setLoadingMessage('');
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
            Panel de Generación
          </h2>
          <p className="text-xs text-muted-foreground">
            Configura y genera tu próxima creación musical
          </p>
        </div>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Descripción de la Canción</Label>
        <Textarea
          value={studioPrompt}
          onChange={(e) => setStudioPrompt(e.target.value)}
          placeholder="Describe tu ritmo aquí... Ej: Beat de tecnocumbia sonidera con sintetizadores brillantes y bajo pesado"
          className="min-h-[120px] bg-secondary/50 border-border/40 text-foreground placeholder:text-muted-foreground/40 resize-none focus:border-primary/50 focus:ring-primary/20 text-sm"
        />
      </div>

      {/* Genre - Free text */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Estilo Musical</Label>
        <Input
          type="text"
          value={studioGenre}
          onChange={(e) => setStudioGenre(e.target.value)}
          placeholder="Ej: Tecnocumbia sonidera, Reggaeton, Synthwave 130 BPM..."
          className="bg-secondary/50 border-border/40 text-foreground placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-primary/20 text-sm"
        />
        <div className="flex flex-wrap gap-1.5">
          {GENRE_TAGS.map((tag) => (
            <Button
              key={tag}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStudioGenre(tag)}
              className="h-7 text-[11px] border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-all"
            >
              {tag}
            </Button>
          ))}
        </div>
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
              <div className="w-6 h-6 rounded-md bg-accent/15 flex items-center justify-center">
                <FileText className="w-3.5 h-3.5 text-accent" />
              </div>
              <Label className="text-sm font-semibold text-foreground">Editor Avanzado de Letras</Label>
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
            {loadingMessage || 'Generando...'}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generar Magia · {isJuno ? '10' : '5'} AC
          </span>
        )}
      </Button>
    </motion.div>
  );
}
