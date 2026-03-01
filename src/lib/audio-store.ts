import { create } from 'zustand';

export interface Track {
  id: string;
  title: string;
  genre: string;
  duration: number; // seconds
  createdAt: Date;
  prompt: string;
  instrumental: boolean;
  highQuality: boolean;
  audioUrl?: string;
}

interface AudioState {
  // Library
  tracks: Track[];
  addTrack: (track: Track) => void;

  // Player
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  speed: number;
  setCurrentTrack: (track: Track) => void;
  togglePlay: () => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setVolume: (vol: number) => void;
  setSpeed: (speed: number) => void;

  // Generation
  isGenerating: boolean;
  setIsGenerating: (gen: boolean) => void;
}

const MOCK_TRACKS: Track[] = [
  {
    id: '1',
    title: 'Neon Horizons',
    genre: 'Lo-fi',
    duration: 192,
    createdAt: new Date('2026-02-28'),
    prompt: 'Chill lo-fi beats with rain sounds and warm piano',
    instrumental: true,
    highQuality: true,
  },
  {
    id: '2',
    title: 'Midnight Flow',
    genre: 'Trap',
    duration: 214,
    createdAt: new Date('2026-02-27'),
    prompt: 'Dark trap beat with 808s and haunting melody',
    instrumental: true,
    highQuality: false,
  },
  {
    id: '3',
    title: 'Solar Waves',
    genre: 'Reggaeton',
    duration: 178,
    createdAt: new Date('2026-02-26'),
    prompt: 'Summer reggaeton vibes with tropical percussion',
    instrumental: false,
    highQuality: true,
  },
  {
    id: '4',
    title: 'Electric Dreams',
    genre: 'Synthwave',
    duration: 245,
    createdAt: new Date('2026-02-25'),
    prompt: 'Retro synthwave with driving arpeggios and analog warmth',
    instrumental: true,
    highQuality: true,
  },
];

export const useAudioStore = create<AudioState>((set) => ({
  tracks: MOCK_TRACKS,
  addTrack: (track) => set((s) => ({ tracks: [track, ...s.tracks] })),

  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  volume: 0.8,
  speed: 1,
  setCurrentTrack: (track) => set({ currentTrack: track, currentTime: 0, isPlaying: true }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setVolume: (volume) => set({ volume }),
  setSpeed: (speed) => set({ speed }),

  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));
