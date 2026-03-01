import { Button } from '@/components/ui/button';

const TAGS = ['[Intro]', '[Verso]', '[Estribillo]', '[Puente]', '[Outro]'];

interface QuickTagsProps {
  onInsert: (tag: string) => void;
}

export function QuickTags({ onInsert }: QuickTagsProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {TAGS.map((tag) => (
        <Button
          key={tag}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onInsert(tag)}
          className="h-7 text-[11px] font-mono border-[hsl(var(--juno)/0.4)] text-[hsl(var(--juno))] hover:bg-[hsl(var(--juno)/0.15)] hover:border-[hsl(var(--juno)/0.6)] transition-all"
        >
          {tag}
        </Button>
      ))}
    </div>
  );
}
