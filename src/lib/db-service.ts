import { supabase } from '@/integrations/supabase/client';
import type { Track } from './audio-store';

export async function saveSongToDB(track: Track, userId: string) {
  const { error } = await supabase.from('songs').insert({
    user_id: userId,
    title: track.title,
    genre: track.genre,
    lyrics: track.lyrics || null,
    prompt: track.prompt,
    audio_url: track.audioUrl || null,
    engine: track.engine,
    duration: track.duration,
    instrumental: track.instrumental,
    high_quality: track.highQuality,
  });
  if (error) console.error('Error saving song:', error);
  return !error;
}

export async function updateAliencoins(userId: string, newBalance: number) {
  const { error } = await supabase
    .from('profiles')
    .update({ aliencoins: newBalance })
    .eq('user_id', userId);
  if (error) console.error('Error updating aliencoins:', error);
}

export async function fetchUserSongs(userId: string) {
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) console.error('Error fetching songs:', error);
  return data || [];
}
