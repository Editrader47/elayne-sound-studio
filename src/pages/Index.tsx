import { StudioPanel } from '@/components/studio/StudioPanel';
import { LibraryGrid } from '@/components/library/LibraryGrid';

const Index = () => {
  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
          Estudio
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Crea música con inteligencia artificial en segundos
        </p>
      </div>

      <StudioPanel />

      <LibraryGrid limit={6} />
    </div>
  );
};

export default Index;
