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
  bpm?: number;
  energy?: number;
  complexity?: number;
  clarity?: number;
}

export interface VoiceProfile {
  id: string;
  name: string;
  fileName: string;
  quality: number;
  createdAt: Date;
}

interface AudioState {
  tracks: Track[];
  addTrack: (track: Track) => void;

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

  isGenerating: boolean;
  setIsGenerating: (gen: boolean) => void;

  engine: EngineMode;
  setEngine: (engine: EngineMode) => void;

  aliencoins: number;
  setAliencoins: (coins: number) => void;
  spendCoins: (amount: number) => boolean;
  addCoins: (amount: number) => void;

  voiceProfiles: VoiceProfile[];
  addVoiceProfile: (profile: VoiceProfile) => void;

  studioPrompt: string;
  setStudioPrompt: (prompt: string) => void;
  studioGenre: string;
  setStudioGenre: (genre: string) => void;
  studioLyrics: string;
  setStudioLyrics: (lyrics: string) => void;
  studioLyricsEnabled: boolean;
  setStudioLyricsEnabled: (enabled: boolean) => void;

  // URB controls
  studioEnergy: number;
  setStudioEnergy: (energy: number) => void;
  studioBpm: number;
  setStudioBpm: (bpm: number) => void;
  studioDuration: number;
  setStudioDuration: (duration: number) => void;
  studioComplexity: number;
  setStudioComplexity: (complexity: number) => void;

  // Clarity System (ELAYNE Signature)
  studioClarity: number;
  setStudioClarity: (clarity: number) => void;

  // Atmosphere
  studioAtmosphere: string;
  setStudioAtmosphere: (atmosphere: string) => void;

  // Latin Signature toggle
  applyLatinSignature: boolean;
  setApplyLatinSignature: (apply: boolean) => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  tracks: [],
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
  setAliencoins: (aliencoins) => set({ aliencoins }),
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
  studioGenre: 'Reggaeton',
  setStudioGenre: (studioGenre) => set({ studioGenre }),
  studioLyrics: '',
  setStudioLyrics: (studioLyrics) => set({ studioLyrics }),
  studioLyricsEnabled: false,
  setStudioLyricsEnabled: (studioLyricsEnabled) => set({ studioLyricsEnabled }),

  // URB defaults
  studioEnergy: 3,
  setStudioEnergy: (studioEnergy) => set({ studioEnergy }),
  studioBpm: 0,
  setStudioBpm: (studioBpm) => set({ studioBpm }),
  studioDuration: 15,
  setStudioDuration: (studioDuration) => set({ studioDuration }),
  studioComplexity: 3,
  setStudioComplexity: (studioComplexity) => set({ studioComplexity }),

  // Clarity (ELAYNE Signature — "Ray of Light")
  studioClarity: 65,
  setStudioClarity: (studioClarity) => set({ studioClarity }),

  // Atmosphere
  studioAtmosphere: 'balanced',
  setStudioAtmosphere: (studioAtmosphere) => set({ studioAtmosphere }),

  // Latin Signature
  applyLatinSignature: false,
  setApplyLatinSignature: (applyLatinSignature) => set({ applyLatinSignature }),
}));
