import type { Track, EngineMode } from './audio-store';

/**
 * Mock service disabled — real AI generation is required.
 */
export async function generateTrack(_params: {
  prompt: string;
  genre: string;
  instrumental: boolean;
  highQuality: boolean;
  engine: EngineMode;
  lyrics?: string;
}): Promise<Track> {
  throw new Error('Motor de IA no disponible en modo demo. Configura tu API Token para generar música real.');
}
