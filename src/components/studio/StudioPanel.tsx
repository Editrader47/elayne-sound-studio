import { useState } from 'react';
import { Sparkles, Loader2, Music, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAudioStore } from '@/lib/audio-store';
import { generateTrack } from '@/lib/mock-ai-service';
import { motion } from 'framer-motion';
import { LyricsPanel } from './LyricsPanel';
import { VoiceUploadPanel } from './VoiceUploadPanel';

const GENRES = [
  'Reggaeton', 'Rock', 'Lo-fi', 'Trap', 'Pop', 'Hip-Hop',
  'EDM', 'Jazz', 'Clásica', 'Synthwave', 'R&B', 'Ambient',
];

export function StudioPanel() {
  const [prompt, setPrompt] = useState('');
  const [genre, setGenre] = useState('Lo-fi');
  const [instrumental, setInstrumental] = useState(false);
  const [highQuality, setHighQuality] = useState(true);

  // Lyrics state
  const [lyricsEnabled, setLyricsEnabled] = useState(false);
  const [lyrics, setLyrics] = useState('');
  const [syncLyrics, setSyncLyrics] = useState(true);

  // Voice state
  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  const { isGenerating, setIsGenerating, addTrack, setCurrentTrack } = useAudioStore();

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      const track = await generateTrack({ prompt, genre, instrumental, highQuality });
      addTrack(track);
      setCurrentTrack(track);
      setPrompt('');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-6 md:p-8 space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Zap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Panel de Generación</h2>
          <p className="text-xs text-muted-foreground">Describe tu sonido. La IA hace el resto.</p>
        </div>
      </div>

      {/* Prompt */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Descripción de la Canción</Label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Un beat lo-fi soñador con acordes cálidos de piano, suave crujido de vinilo y lluvia de fondo..."
          className="min-h-[120px] bg-secondary/50 border-border/40 text-foreground placeholder:text-muted-foreground/40 resize-none focus:border-primary/50 focus:ring-primary/20 text-sm"
        />
      </div>

      {/* Genre */}
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Género Musical</Label>
        <Select value={genre} onValueChange={setGenre}>
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

      {/* Lyrics Module */}
      <LyricsPanel
        lyrics={lyrics}
        setLyrics={setLyrics}
        syncLyrics={syncLyrics}
        setSyncLyrics={setSyncLyrics}
        enabled={lyricsEnabled}
        setEnabled={setLyricsEnabled}
      />

      <Separator className="bg-border/30" />

      {/* Voice Upload */}
      <VoiceUploadPanel voiceFile={voiceFile} setVoiceFile={setVoiceFile} />

      {/* Generate */}
      <Button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className={`w-full h-12 text-base font-semibold glow-button rounded-xl ${isGenerating ? 'pulse-glow' : ''}`}
        size="lg"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando Magia...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Generar Magia
          </span>
        )}
      </Button>
    </motion.div>
  );
}
