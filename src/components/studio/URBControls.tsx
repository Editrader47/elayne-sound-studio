import { Gauge, Timer, Drum, Zap, Sun, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAudioStore } from '@/lib/audio-store';

const ENERGY_LABELS = ['', 'Calm', 'Relaxed', 'Balanced', 'High', 'Explosive'];
const COMPLEXITY_LABELS = ['', 'Simple', 'Moderate', 'Rich', 'Intricate', 'Maximum'];

function clarityLabel(v: number): string {
  if (v >= 80) return 'Crystal';
  if (v >= 60) return 'Clean';
  if (v >= 40) return 'Balanced';
  if (v >= 20) return 'Dense';
  return 'Heavy';
}

export function URBControls() {
  const {
    studioEnergy, setStudioEnergy,
    studioBpm, setStudioBpm,
    studioDuration, setStudioDuration,
    studioComplexity, setStudioComplexity,
    studioClarity, setStudioClarity,
    studioAtmosphere, setStudioAtmosphere,
    applyLatinSignature, setApplyLatinSignature,
    engine,
  } = useAudioStore();

  const isProMode = engine === 'juno';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-primary/15 flex items-center justify-center">
          <Drum className="w-3.5 h-3.5 text-primary" />
        </div>
        <Label className="text-sm font-semibold text-foreground">ELAYNE Creative Controls</Label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Energy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="w-3 h-3" /> Energía
            </Label>
            <span className="text-xs font-mono text-primary">{ENERGY_LABELS[studioEnergy]}</span>
          </div>
          <Slider
            value={[studioEnergy]}
            onValueChange={([v]) => setStudioEnergy(v)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
        </div>

        {/* Complexity */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Gauge className="w-3 h-3" /> Complejidad
            </Label>
            <span className="text-xs font-mono text-primary">{COMPLEXITY_LABELS[studioComplexity]}</span>
          </div>
          <Slider
            value={[studioComplexity]}
            onValueChange={([v]) => setStudioComplexity(v)}
            min={1}
            max={5}
            step={1}
            className="w-full"
          />
        </div>

        {/* Clarity — ELAYNE Signature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sun className="w-3 h-3" /> Claridad
            </Label>
            <span className="text-xs font-mono text-primary">{clarityLabel(studioClarity)} ({studioClarity})</span>
          </div>
          <Slider
            value={[studioClarity]}
            onValueChange={([v]) => setStudioClarity(v)}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Timer className="w-3 h-3" /> Duración
          </Label>
          <Select
            value={String(studioDuration)}
            onValueChange={(v) => setStudioDuration(Number(v))}
          >
            <SelectTrigger className="bg-secondary/50 border-border/40 text-foreground text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 segundos</SelectItem>
              <SelectItem value="30">30 segundos</SelectItem>
              <SelectItem value="60">60 segundos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* BPM (Pro mode) */}
        {isProMode && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              BPM (0 = auto)
            </Label>
            <Input
              type="number"
              value={studioBpm}
              onChange={(e) => setStudioBpm(Number(e.target.value) || 0)}
              min={0}
              max={300}
              placeholder="Auto"
              className="bg-secondary/50 border-border/40 text-foreground text-sm h-9"
            />
          </div>
        )}

        {/* Atmosphere (Pro mode) */}
        {isProMode && (
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Atmósfera
            </Label>
            <Select
              value={studioAtmosphere}
              onValueChange={setStudioAtmosphere}
            >
              <SelectTrigger className="bg-secondary/50 border-border/40 text-foreground text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="bright">Bright</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Latin Signature Toggle */}
      <div className="flex items-center gap-3 pt-1">
        <Switch checked={applyLatinSignature} onCheckedChange={setApplyLatinSignature} />
        <Label className="text-sm text-foreground/80">
          Latin Production Signature
        </Label>
        <span className="text-[10px] text-muted-foreground/60 font-mono ml-auto">Agrega color latino</span>
      </div>
    </div>
  );
}
