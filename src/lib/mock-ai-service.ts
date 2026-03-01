import { Track } from './audio-store';

const TITLE_WORDS = [
  ['Crystal', 'Velvet', 'Cosmic', 'Digital', 'Lunar', 'Ember', 'Quantum', 'Shadow'],
  ['Pulse', 'Dreams', 'Echoes', 'Flames', 'Waves', 'Storm', 'Bloom', 'Drift'],
];

const SAMPLE_AUDIO_URLS = [
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
];

function randomTitle(): string {
  const a = TITLE_WORDS[0][Math.floor(Math.random() * TITLE_WORDS[0].length)];
  const b = TITLE_WORDS[1][Math.floor(Math.random() * TITLE_WORDS[1].length)];
  return `${a} ${b}`;
}

export async function generateTrack(params: {
  prompt: string;
  genre: string;
  instrumental: boolean;
  highQuality: boolean;
}): Promise<Track> {
  await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2000));

  return {
    id: crypto.randomUUID(),
    title: randomTitle(),
    genre: params.genre,
    duration: Math.floor(120 + Math.random() * 180),
    createdAt: new Date(),
    prompt: params.prompt,
    instrumental: params.instrumental,
    highQuality: params.highQuality,
    audioUrl: SAMPLE_AUDIO_URLS[Math.floor(Math.random() * SAMPLE_AUDIO_URLS.length)],
  };
}
