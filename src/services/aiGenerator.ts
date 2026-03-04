import { supabase } from '@/integrations/supabase/client';
import type { Track, EngineMode } from '@/lib/audio-store';

export interface GenerateParams {
  prompt: string;
  genre: string;
  instrumental: boolean;
  highQuality: boolean;
  engine: EngineMode;
  lyrics?: string;
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

/**
 * Calls the backend function to generate music via Replicate MusicGen.
 * No mock fallback — requires a configured REPLICATE_API_TOKEN secret.
 */
export async function generateMusic(params: GenerateParams): Promise<Track> {
  const { data, error } = await supabase.functions.invoke('generate-music', {
    body: params,
  });

  if (error) {
    throw new Error('Error de conexión con el motor de IA. Inténtalo de nuevo.');
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
    duration: data.duration || 15,
    createdAt: new Date(),
    prompt: params.prompt,
    instrumental: params.instrumental,
    highQuality: params.highQuality,
    audioUrl: data.audio_url,
    engine: params.engine,
    lyrics: params.lyrics,
  };
}
