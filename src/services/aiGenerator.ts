import { supabase } from '@/integrations/supabase/client';
import { generateTrack as mockGenerateTrack } from '@/lib/mock-ai-service';
import type { Track, EngineMode } from '@/lib/audio-store';

export interface GenerateParams {
  prompt: string;
  genre: string;
  instrumental: boolean;
  highQuality: boolean;
  engine: EngineMode;
  lyrics?: string;
}

/**
 * Calls the backend function to generate music via an external AI API.
 * Falls back to mock generation if the API key is not configured or the call fails.
 */
export async function generateMusic(params: GenerateParams): Promise<Track> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-music', {
      body: params,
    });

    if (error) {
      console.warn('Backend function error, falling back to demo:', error.message);
      return mockGenerateTrack(params);
    }

    // Backend signals no API key configured → use mock
    if (data?.fallback) {
      console.info(data.message);
      return mockGenerateTrack(params);
    }

    // Backend returned an error message
    if (data?.error) {
      throw new Error(data.error);
    }

    // Build track from real AI response
    const titleWords = [
      ['Crystal', 'Velvet', 'Cosmic', 'Digital', 'Lunar', 'Ember', 'Quantum'],
      ['Pulse', 'Dreams', 'Echoes', 'Flames', 'Waves', 'Storm', 'Bloom'],
    ];
    const fallbackTitle =
      titleWords[0][Math.floor(Math.random() * titleWords[0].length)] +
      ' ' +
      titleWords[1][Math.floor(Math.random() * titleWords[1].length)];

    return {
      id: crypto.randomUUID(),
      title: data.title || fallbackTitle,
      genre: params.genre,
      duration: data.duration || Math.floor(120 + Math.random() * 180),
      createdAt: new Date(),
      prompt: params.prompt,
      instrumental: params.instrumental,
      highQuality: params.highQuality,
      audioUrl: data.audio_url || undefined,
      engine: params.engine,
      lyrics: params.lyrics,
    };
  } catch (err: any) {
    // If it's a known AI error, re-throw so the UI can show it
    if (err?.message?.includes('motor de IA') || err?.message?.includes('créditos')) {
      throw err;
    }
    // Otherwise fall back to mock
    console.warn('AI generation failed, using demo mode:', err);
    return mockGenerateTrack(params);
  }
}

