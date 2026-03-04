import { supabase } from '@/integrations/supabase/client';
import type { Track, EngineMode } from '@/lib/audio-store';

export interface GenerateParams {
  prompt: string;
  genre: string;
  instrumental: boolean;
  highQuality: boolean;
  engine: EngineMode;
  lyrics?: string;
  energy?: number;
  bpm?: number;
  duration?: number;
  complexity?: number;
  clarity?: number;
  atmosphere?: string;
  applyLatinSignature?: boolean;
}

const TITLE_WORDS = [
  ['Crystal', 'Velvet', 'Cosmic', 'Digital', 'Lunar', 'Ember', 'Quantum'],
  ['Pulse', 'Dreams', 'Echoes', 'Flames', 'Waves', 'Storm', 'Bloom'],
];

function randomTitle(): string {
  const a = TITLE_WORDS[0][Math.floor(Math.random() * TITLE_WORDS[0].length)];
  const b = TITLE_WORDS[1][Math.floor(Math.random() * TITLE_WORDS[1].length)];
  return `${a} ${b}`;
}

export async function generateMusic(params: GenerateParams): Promise<Track> {
  const { data, error } = await supabase.functions.invoke('generate-music', {
    body: {
      prompt: params.prompt,
      genre: params.genre,
      instrumental: params.instrumental,
      energy: params.energy,
      bpm: params.bpm && params.bpm > 0 ? params.bpm : undefined,
      duration: params.duration || 15,
      complexity: params.complexity,
      clarity: params.clarity,
      atmosphere: params.atmosphere,
      applyLatinSignature: params.applyLatinSignature,
    },
  });

  if (error) {
    const msg = (error as any)?.context?.body?.error || (error as any)?.message || 'Error de conexión con el motor de IA.';
    throw new Error(msg);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.audio_url) {
    throw new Error('No se recibió audio del motor de IA.');
  }

  return {
    id: crypto.randomUUID(),
    title: data.title || randomTitle(),
    genre: params.genre,
    duration: data.duration || params.duration || 15,
    createdAt: new Date(),
    prompt: params.prompt,
    instrumental: params.instrumental,
    highQuality: params.highQuality,
    audioUrl: data.audio_url,
    engine: params.engine,
    lyrics: params.lyrics,
    bpm: data.bpm,
    energy: params.energy,
    complexity: params.complexity,
    clarity: params.clarity,
  };
}
