import { Mic } from 'lucide-react';
import { VoiceUploadPanel } from '@/components/studio/VoiceUploadPanel';
import { useState } from 'react';

const VoicesPage = () => {
  const [voiceFile, setVoiceFile] = useState<File | null>(null);

  return (
    <div className="space-y-8 animate-slide-up">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight font-display">
          Mis Voces
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Administra tus perfiles de voz para clonación
        </p>
      </div>

      <VoiceUploadPanel voiceFile={voiceFile} setVoiceFile={setVoiceFile} />

      <div className="glass-card p-8 flex flex-col items-center justify-center text-center gap-3">
        <Mic className="w-10 h-10 text-muted-foreground/30" />
        <p className="text-sm text-muted-foreground/50">
          Aún no tienes perfiles de voz guardados.
        </p>
        <p className="text-xs text-muted-foreground/30 font-mono">
          Sube tu primer audio para comenzar
        </p>
      </div>
    </div>
  );
};

export default VoicesPage;
