import { Track } from './audio-store';

const TITLE_WORDS = [
  ['Crystal', 'Velvet', 'Cosmic', 'Digital', 'Lunar', 'Ember', 'Quantum', 'Shadow'],
  ['Pulse', 'Dreams', 'Echoes', 'Flames', 'Waves', 'Storm', 'Bloom', 'Drift'],
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
  // Simulate AI generation delay
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
  };
}
