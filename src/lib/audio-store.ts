import { create } from 'zustand';

export type EngineMode = 'suno' | 'juno';

export interface Track {
  id: string;
  title: string;
  genre: string;
  duration: number;
  createdAt: Date;
  prompt: string;
  instrumental: boolean;
  highQuality: boolean;
  audioUrl?: string;
  engine: EngineMode;
  lyrics?: string;
}

export interface VoiceProfile {
  id: string;
  name: string;
  fileName: string;
  quality: number; // 0-100
  createdAt: Date;
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

  // Engine
  engine: EngineMode;
  setEngine: (engine: EngineMode) => void;

  // Economy
  aliencoins: number;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;

  // Voice profiles
  voiceProfiles: VoiceProfile[];
  addVoiceProfile: (profile: VoiceProfile) => void;

  // Studio state persistence
  studioPrompt: string;
  setStudioPrompt: (prompt: string) => void;
  studioGenre: string;
  setStudioGenre: (genre: string) => void;
  studioLyrics: string;
  setStudioLyrics: (lyrics: string) => void;
  studioLyricsEnabled: boolean;
  setStudioLyricsEnabled: (enabled: boolean) => void;
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    engine: 'suno',
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    engine: 'suno',
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    engine: 'juno',
    lyrics: '[Verso 1]\nBajo el sol tropical\ncaminando sin parar...',
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
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    engine: 'juno',
  },
];

export const useAudioStore = create<AudioState>((set, get) => ({
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

  engine: 'suno',
  setEngine: (engine) => set({ engine }),

  aliencoins: 100,
  spendCoins: (amount) => {
    const current = get().aliencoins;
    if (current < amount) return false;
    set({ aliencoins: current - amount });
    return true;
  },
  addCoins: (amount) => set((s) => ({ aliencoins: s.aliencoins + amount })),

  voiceProfiles: [],
  addVoiceProfile: (profile) => set((s) => ({ voiceProfiles: [...s.voiceProfiles, profile] })),

  studioPrompt: '',
  setStudioPrompt: (studioPrompt) => set({ studioPrompt }),
  studioGenre: 'Lo-fi',
  setStudioGenre: (studioGenre) => set({ studioGenre }),
  studioLyrics: '',
  setStudioLyrics: (studioLyrics) => set({ studioLyrics }),
  studioLyricsEnabled: false,
  setStudioLyricsEnabled: (studioLyricsEnabled) => set({ studioLyricsEnabled }),
}));
