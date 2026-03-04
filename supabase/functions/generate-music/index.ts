import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const MUSICGEN_VERSION = "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";

// ──────────────────────────────────────────────
// UNIVERSAL RHYTHM BRAIN (URB) — Genre Database
// ──────────────────────────────────────────────

interface GenreProfile {
  bpmRange: [number, number];
  percussion: string;
  rhythm: string;
  instruments: string;
  spectralFx: string;
  baseEnergy: number; // 1-5
  structure: string;
}

const GENRE_DB: Record<string, GenreProfile> = {
  reggaeton: {
    bpmRange: [90, 100],
    percussion: "punchy kick drum, latin snare, crisp hi-hats",
    rhythm: "dembow syncopated pattern, caribbean bounce",
    instruments: "heavy sub-bass (808), urban bassline, atmospheric synth layers, digital brass stabs",
    spectralFx: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
    baseEnergy: 4,
    structure: "atmospheric intro, groove drop, intensifying verses, powerful climax",
  },
  urbano: {
    bpmRange: [88, 100],
    percussion: "punchy kick drum, latin snare, crisp hi-hats, rim shots",
    rhythm: "dembow syncopated pattern with modern urban twist",
    instruments: "heavy 808 sub-bass, atmospheric pads, digital brass, vocal chops",
    spectralFx: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
    baseEnergy: 4,
    structure: "moody intro, groove build, hard-hitting drop, intense climax",
  },
  trap: {
    bpmRange: [130, 150],
    percussion: "booming 808 kick, dry snare, rapid hi-hat triplets, snare rolls",
    rhythm: "trap bounce with hi-hat triplet patterns",
    instruments: "deep 808 sub-bass, dark atmospheric pads, eerie synth leads, bell melodies",
    spectralFx: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
    baseEnergy: 4,
    structure: "dark atmospheric intro, building tension, heavy drop, aggressive climax",
  },
  cumbia: {
    bpmRange: [128, 136],
    percussion: "iconic 90s digital cowbell, crisp güira, high-energy tropical percussion, congas",
    rhythm: "cumbia shuffle with syncopated bass pattern",
    instruments: "analog synthesizer leads, syncopated electronic bass, bright accordion melodies, maracas",
    spectralFx: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
    baseEnergy: 3,
    structure: "melodic intro, rhythmic groove, instrumental bridge, energetic finale",
  },
  tecnocumbia: {
    bpmRange: [130, 138],
    percussion: "iconic 90s digital cowbell, crisp güira, high-energy tropical percussion",
    rhythm: "cumbia shuffle with electronic syncopation, sonidero style",
    instruments: "analog synthesizer leads, syncopated electronic bass, bright digital synthesizers, Korg M1 piano sounds",
    spectralFx: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
    baseEnergy: 4,
    structure: "synth intro, tropical groove, electronic bridge, high-energy climax",
  },
  sonidera: {
    bpmRange: [130, 138],
    percussion: "iconic 90s digital cowbell, crisp güira, high-energy tropical percussion",
    rhythm: "cumbia sonidera shuffle, sonidero bounce",
    instruments: "analog synthesizer leads, Korg M1 piano sounds, syncopated electronic bass, bright digital synths",
    spectralFx: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
    baseEnergy: 4,
    structure: "synth intro, sonidero groove, melodic bridge, euphoric climax",
  },
  salsa: {
    bpmRange: [160, 200],
    percussion: "syncopated congas, timbales, bongos, claves, cowbell",
    rhythm: "clave-based salsa rhythm (son clave 3-2 or 2-3)",
    instruments: "authentic piano montuno, sharp brass section (trumpets/trombones), upright bass, string arrangements",
    spectralFx: "warm hall reverb, brass shimmer, percussive spatial imaging",
    baseEnergy: 5,
    structure: "brass intro, montuno groove, solo section, energetic mambo climax",
  },
  tropical: {
    bpmRange: [150, 190],
    percussion: "syncopated congas, timbales, guiro, claves",
    rhythm: "tropical cumbia/salsa hybrid pattern",
    instruments: "piano montuno, brass section, marimba, Caribbean bass",
    spectralFx: "warm hall reverb, tropical shimmer, percussive spatial imaging",
    baseEnergy: 4,
    structure: "rhythmic intro, tropical groove, brass bridge, festive climax",
  },
  rock: {
    bpmRange: [110, 140],
    percussion: "multi-layered drum kit, crash cymbals, floor toms, ride cymbal",
    rhythm: "straight 4/4 rock beat with powerful fills",
    instruments: "overdriven electric guitars, thick bass guitar, stadium reverb, power chords",
    spectralFx: "stadium reverb tails, guitar feedback textures, massive room ambience",
    baseEnergy: 4,
    structure: "guitar riff intro, verse groove, pre-chorus build, explosive chorus",
  },
  pop: {
    bpmRange: [110, 130],
    percussion: "tight kick and snare, crisp hi-hats, claps, finger snaps",
    rhythm: "four-on-the-floor pop beat with syncopated elements",
    instruments: "catchy synth melodies, polished production, bright piano, layered vocals, driving bassline",
    spectralFx: "glossy reverb, wide stereo chorus, bright presence",
    baseEnergy: 3,
    structure: "catchy intro hook, verse groove, pre-chorus lift, euphoric chorus",
  },
  edm: {
    bpmRange: [124, 132],
    percussion: "heavy four-on-the-floor kick, open hi-hats, claps, white noise risers",
    rhythm: "four-on-the-floor with sidechain compression feel",
    instruments: "big room synths, supersaw leads, pluck melodies, sub-bass, festival stabs",
    spectralFx: "massive reverb tails, sidechain pumping, white noise sweeps, impact FX",
    baseEnergy: 5,
    structure: "atmospheric intro, building tension, massive drop, euphoric climax",
  },
  techno: {
    bpmRange: [125, 135],
    percussion: "constant 4/4 kick, metallic hi-hats, rimshot, industrial claps",
    rhythm: "relentless 4/4 techno pulse with hypnotic repetition",
    instruments: "repetitive bassline, industrial synths, acid squelch (303), dark textures, mechanical sounds",
    spectralFx: "industrial reverb, metallic delays, dark spatial atmospheres",
    baseEnergy: 4,
    structure: "minimal intro, hypnotic groove build, industrial breakdown, relentless climax",
  },
  "lo-fi": {
    bpmRange: [70, 90],
    percussion: "soft boom-bap drums, subtle hi-hats, vinyl crackle",
    rhythm: "laid-back swing with off-kilter groove",
    instruments: "warm vinyl crackle, mellow jazz chords, Rhodes piano, soft pads, tape saturation",
    spectralFx: "warm tape delay, vinyl hiss, cozy room ambience, soft filtering",
    baseEnergy: 1,
    structure: "gentle intro, mellow groove, subtle variation, peaceful fade",
  },
  "hip-hop": {
    bpmRange: [85, 100],
    percussion: "boom bap drums, punchy kick, snappy snare, chopped breaks",
    rhythm: "boom bap swing with head-nod groove",
    instruments: "vinyl crackle, jazzy samples, deep bass, scratching, piano loops",
    spectralFx: "dusty vinyl ambience, warm reverb, analog saturation",
    baseEnergy: 3,
    structure: "sample-based intro, boom bap groove, breakdown, hard-hitting finale",
  },
  synthwave: {
    bpmRange: [100, 120],
    percussion: "electronic drums, gated reverb snare, 80s drum machine, claps",
    rhythm: "driving 4/4 with retro 80s feel",
    instruments: "analog synthesizers, pulsing arpeggios, neon atmosphere, cinematic retro 80s pads, Juno-style chords",
    spectralFx: "vast neon-lit reverb, analog chorus, retro-futuristic delays",
    baseEnergy: 3,
    structure: "cinematic synth intro, arpeggiated build, soaring lead, retro climax",
  },
  worship: {
    bpmRange: [68, 85],
    percussion: "soft kick, gentle snare, subtle hi-hats, tambourine",
    rhythm: "gentle flowing rhythm, worship sway",
    instruments: "atmospheric pads, emotive piano, ambient guitars, string swells, crescendo layers",
    spectralFx: "cathedral reverb, heavenly pads, ascending harmonic shimmer",
    baseEnergy: 2,
    structure: "intimate piano intro, gentle build, emotional crescendo, powerful climax",
  },
  afrobeat: {
    bpmRange: [100, 130],
    percussion: "complex polyrhythmic drums, shekere, talking drum, djembe, bell pattern",
    rhythm: "polyrhythmic West African groove with cross-rhythms",
    instruments: "Fela-style horn section, rhythmic guitar, funky bass, organ stabs, afro percussion ensemble",
    spectralFx: "earthy reverb, warm analog warmth, rhythmic spatial movement",
    baseEnergy: 4,
    structure: "polyrhythmic intro, groove lock, horn melody, rhythmic climax",
  },
  drill: {
    bpmRange: [138, 145],
    percussion: "sliding 808 bass, sharp snares, rapid hi-hat patterns, gunshot FX",
    rhythm: "UK/NY drill bounce with sliding bass patterns",
    instruments: "dark piano melodies, eerie string samples, aggressive 808 slides, haunting bells",
    spectralFx: "dark cavernous reverb, ominous atmospheric layers, menacing echoes",
    baseEnergy: 4,
    structure: "ominous intro, dark groove, aggressive build, menacing drop",
  },
  orchestral: {
    bpmRange: [60, 120],
    percussion: "timpani, orchestral snare, cymbals, bass drum",
    rhythm: "conducted orchestral timing with dynamic swells",
    instruments: "full symphony orchestra, soaring strings, powerful brass, delicate woodwinds, harp glissandos",
    spectralFx: "concert hall reverb, lush string resonance, epic spatial imaging",
    baseEnergy: 4,
    structure: "quiet string intro, thematic development, dramatic build, triumphant climax",
  },
  cinematic: {
    bpmRange: [70, 110],
    percussion: "epic taiko drums, deep impacts, cinematic risers, tension percussion",
    rhythm: "epic film score rhythm with tension and release",
    instruments: "massive orchestral swells, deep brass, ethereal choirs, hybrid synth-orchestra layers, trailer impacts",
    spectralFx: "enormous hall reverb, sub-harmonic rumble, cinematic spatial depth",
    baseEnergy: 5,
    structure: "quiet tension intro, building intensity, massive crescendo, epic resolution",
  },
  bachata: {
    bpmRange: [125, 140],
    percussion: "bongo patterns, güira, tambora",
    rhythm: "bachata derecho pattern with syncopated güira",
    instruments: "nylon string guitar requinto, bass guitar, romantic piano, soft brass accents",
    spectralFx: "warm intimate reverb, guitar shimmer, romantic ambience",
    baseEnergy: 2,
    structure: "guitar intro, romantic groove, emotional bridge, passionate climax",
  },
  merengue: {
    bpmRange: [140, 180],
    percussion: "tambora, güira patterns, congas",
    rhythm: "merengue 2/4 pattern with driving güira",
    instruments: "accordion leads, saxophone, brass section, synth bass, piano montuno",
    spectralFx: "festive reverb, brass brightness, dance floor energy",
    baseEnergy: 5,
    structure: "brass fanfare intro, merengue groove, instrumental solo, high-energy finale",
  },
  corrido: {
    bpmRange: [100, 130],
    percussion: "tuba bass, bajo sexto strums, snare drum",
    rhythm: "polka/waltz corrido pattern with tuba bass",
    instruments: "bajo sexto, tuba, accordion, brass band, requinto guitar",
    spectralFx: "open-air reverb, acoustic warmth, live band ambience",
    baseEnergy: 3,
    structure: "bajo sexto intro, narrative groove, instrumental bridge, powerful finale",
  },
  "corrido tumbado": {
    bpmRange: [75, 95],
    percussion: "trap hi-hats, 808 kick, bajo sexto strums",
    rhythm: "corrido meets trap: hybrid folk-urban pattern",
    instruments: "bajo sexto, tuba with 808 sub-bass, requinto guitar, trap hi-hats, modern production",
    spectralFx: "dark atmospheric layers, urban reverb, modern spatial processing",
    baseEnergy: 3,
    structure: "hybrid intro, tumbado groove, trap-influenced build, powerful drop",
  },
  banda: {
    bpmRange: [110, 145],
    percussion: "tarola (snare), bass drum, cymbals, tambora",
    rhythm: "banda sinaloense pattern with brass-driven pulse",
    instruments: "full brass band (clarinets, trumpets, trombones, tubas), tarola, tambora",
    spectralFx: "open-air live reverb, brass ensemble warmth, festive spatial imaging",
    baseEnergy: 4,
    structure: "brass fanfare intro, banda groove, solo section, triumphant finale",
  },
  norteña: {
    bpmRange: [110, 140],
    percussion: "polka bass drum, snare accents",
    rhythm: "norteño polka pattern with accordion lead",
    instruments: "button accordion, bajo sexto, bass, drums, saxophone accents",
    spectralFx: "acoustic warmth, open-air ambience, live band reverb",
    baseEnergy: 3,
    structure: "accordion intro, norteño groove, instrumental bridge, energetic finale",
  },
  reggae: {
    bpmRange: [66, 90],
    percussion: "one-drop kick-snare, hi-hats, rim clicks",
    rhythm: "one-drop reggae pattern with offbeat skank",
    instruments: "offbeat rhythm guitar skank, deep bass guitar, organ bubble, horn stabs",
    spectralFx: "dub delay, spring reverb, spacious bass echoes",
    baseEnergy: 2,
    structure: "offbeat intro, roots groove, dub breakdown, uplifting outro",
  },
  dancehall: {
    bpmRange: [95, 110],
    percussion: "digital dancehall drums, snare rolls, claps",
    rhythm: "dancehall riddim with aggressive bounce",
    instruments: "digital synth bass, dancehall stabs, air horns, vocal chants",
    spectralFx: "bright digital reverb, aggressive spatial energy, siren FX",
    baseEnergy: 4,
    structure: "riddim intro, dancehall bounce, horn build, massive drop",
  },
  "drum and bass": {
    bpmRange: [170, 180],
    percussion: "breakbeat drums, rapid snares, hi-hats, ride cymbal",
    rhythm: "broken beat pattern at high BPM with syncopation",
    instruments: "massive reese bass, atmospheric pads, vocal chops, amen break variations",
    spectralFx: "cavernous reverb, bass modulation, dark spatial depth",
    baseEnergy: 5,
    structure: "atmospheric intro, building tension, breakbeat drop, relentless energy",
  },
  house: {
    bpmRange: [120, 130],
    percussion: "four-on-the-floor kick, open hi-hats, claps, shakers",
    rhythm: "four-on-the-floor house groove with offbeat hi-hats",
    instruments: "warm bass, classic house piano chords, vocal samples, disco strings, synth stabs",
    spectralFx: "warm club reverb, disco shimmer, house groove spatial feel",
    baseEnergy: 3,
    structure: "filtered intro, groove build, piano break, feel-good drop",
  },
  "r&b": {
    bpmRange: [60, 80],
    percussion: "soft kick, finger snaps, brushed snare, hi-hats",
    rhythm: "smooth R&B groove with laid-back swing",
    instruments: "silky synth pads, Rhodes electric piano, smooth bass, lush vocal harmonies, guitar licks",
    spectralFx: "warm intimate reverb, silky smooth presence, romantic ambience",
    baseEnergy: 2,
    structure: "smooth intro, R&B groove, emotional bridge, sultry climax",
  },
  jazz: {
    bpmRange: [100, 160],
    percussion: "ride cymbal, brushed snare, kick accents, hi-hat splash",
    rhythm: "swing feel with improvised rhythmic variations",
    instruments: "upright bass walking lines, piano comping, saxophone melody, trumpet solo, vibraphone",
    spectralFx: "smoky club reverb, warm analog saturation, intimate spatial imaging",
    baseEnergy: 3,
    structure: "theme statement, improvised solo, comping variations, theme return",
  },
  country: {
    bpmRange: [100, 140],
    percussion: "brush snare, kick drum, shaker",
    rhythm: "country two-step or shuffle pattern",
    instruments: "acoustic guitar fingerpicking, steel guitar, fiddle, banjo, upright bass",
    spectralFx: "open-air reverb, acoustic warmth, Nashville studio ambience",
    baseEnergy: 3,
    structure: "acoustic intro, country groove, fiddle break, sing-along chorus",
  },
  metal: {
    bpmRange: [120, 180],
    percussion: "double bass kick drums, blast beats, aggressive snare, china cymbal",
    rhythm: "aggressive double kick pattern with blast beat sections",
    instruments: "heavily distorted guitars, palm-muted riffs, growling bass, shredding solos, breakdown chug",
    spectralFx: "massive wall of sound, dark cavernous reverb, aggressive saturation",
    baseEnergy: 5,
    structure: "aggressive riff intro, verse assault, breakdown, explosive solo climax",
  },
  bossa: {
    bpmRange: [120, 145],
    percussion: "soft brushes, shaker, subtle kick",
    rhythm: "bossa nova rhythm with gentle syncopation",
    instruments: "nylon string guitar, soft piano, flute, upright bass, light percussion",
    spectralFx: "warm intimate reverb, Brazilian warmth, gentle spatial imaging",
    baseEnergy: 1,
    structure: "gentle guitar intro, bossa groove, flute melody, peaceful resolution",
  },
  flamenco: {
    bpmRange: [80, 200],
    percussion: "palmas (handclaps), cajón, zapateado (footwork)",
    rhythm: "compás flamenco pattern (bulerías, soleá, or tangos)",
    instruments: "flamenco guitar (rasgueado, picado), cajón, palmas, passionate vocals, violin accents",
    spectralFx: "intimate room reverb, guitar resonance, passionate spatial energy",
    baseEnergy: 4,
    structure: "guitar falseta intro, rhythmic build, passionate climax, dramatic resolution",
  },
  ambient: {
    bpmRange: [60, 90],
    percussion: "no percussion or very subtle textures",
    rhythm: "free-flowing ambient pulse, no strict beat",
    instruments: "vast synthesizer pads, granular textures, field recordings, gentle drones, bell tones",
    spectralFx: "infinite reverb, granular spatial processing, evolving atmospheric layers",
    baseEnergy: 1,
    structure: "evolving texture intro, ambient landscape, subtle transformation, ethereal fade",
  },
};

// ──────────────────────────────────────────────
// URB — Prompt Builder
// ──────────────────────────────────────────────

const SPECTRAL_BASE = "spectral soundscapes, wide stereo imaging, immersive spatial audio, ethereal pads, high-frequency clarity, deep ambient resonance, phase-shifted textures";
const NEGATIVE_PROMPT = "low quality, distorted, muffled, mono, static, white noise, out of tune, weak drums, amateur recording";

// Micro-rhythmic variation seed words to avoid repetitive patterns
const VARIATION_SEEDS = [
  "with subtle ghost notes", "with micro-timing humanization", "with rhythmic swing variations",
  "with dynamic velocity changes", "with syncopated ghost hits", "with polyrhythmic accents",
  "with evolving rhythmic density", "with displaced snare accents", "with shifting hi-hat patterns",
];

function getVariationSeed(): string {
  return VARIATION_SEEDS[Math.floor(Math.random() * VARIATION_SEEDS.length)];
}

function pickBPM(range: [number, number], manualBpm?: number): number {
  if (manualBpm && manualBpm >= 40 && manualBpm <= 300) return manualBpm;
  return Math.floor(range[0] + Math.random() * (range[1] - range[0]));
}

function energyDescriptor(level: number): string {
  const map: Record<number, string> = {
    1: "calm, gentle, minimal energy, soft dynamics",
    2: "relaxed, moderate dynamics, smooth flow",
    3: "balanced energy, steady dynamics, engaging groove",
    4: "high energy, powerful dynamics, driving intensity",
    5: "maximum energy, explosive dynamics, relentless power, peak intensity",
  };
  return map[Math.max(1, Math.min(5, level))] || map[3];
}

function complexityDescriptor(level: number): string {
  const map: Record<number, string> = {
    1: "simple patterns, minimal layering, clean arrangement",
    2: "moderate complexity, tasteful layering, balanced arrangement",
    3: "rich complexity, multiple interlocking layers, detailed arrangement",
    4: "highly complex, dense polyrhythmic layers, intricate arrangement with countermelodies",
    5: "maximum complexity, virtuosic patterns, orchestral density, every frequency range filled",
  };
  return map[Math.max(1, Math.min(5, level))] || map[3];
}

function buildStructurePrompt(duration: number, structure: string): string {
  if (duration <= 15) {
    return `Song structure: intro (0-3s), main groove (3-10s), climax (10-15s)`;
  }
  if (duration <= 30) {
    return `Song structure: atmospheric intro (0-5s), main groove (5-15s), intensification (15-25s), climax/drop (25-30s)`;
  }
  return `Song structure: ${structure}. Full arrangement with intro, development, climax, and resolution over ${duration} seconds`;
}

interface URBParams {
  genre: string;
  description: string;
  energy?: number;
  bpm?: number;
  instrumental?: boolean;
  duration?: number;
  complexity?: number;
}

function buildURBPrompt(params: URBParams): { prompt: string; bpm: number } {
  const genreLower = params.genre.toLowerCase().trim();

  // Find matching genre profile
  let profile: GenreProfile | null = null;
  for (const [key, p] of Object.entries(GENRE_DB)) {
    if (genreLower.includes(key)) {
      profile = p;
      break;
    }
  }

  // Fallback for unknown genres
  if (!profile) {
    profile = {
      bpmRange: [100, 130],
      percussion: "versatile drum kit, electronic and acoustic elements",
      rhythm: `${params.genre} characteristic rhythm pattern`,
      instruments: `typical ${params.genre} instrumentation, professional arrangement`,
      spectralFx: "",
      baseEnergy: 3,
      structure: "intro, main section, development, climax, resolution",
    };
  }

  const energy = params.energy ?? profile.baseEnergy;
  const complexity = params.complexity ?? 3;
  const bpm = pickBPM(profile.bpmRange, params.bpm);
  const duration = params.duration ?? 15;
  const variationSeed = getVariationSeed();

  const parts = [
    `A professional ${params.genre} studio recording at ${bpm} BPM`,
    `Features: ${params.description}`,
    `Percussion: ${profile.percussion} ${variationSeed}`,
    `Rhythm: ${profile.rhythm}`,
    `Instrumentation: ${profile.instruments}`,
    `Energy: ${energyDescriptor(energy)}`,
    `Rhythmic complexity: ${complexityDescriptor(complexity)}`,
    params.instrumental ? "Purely instrumental, no vocals" : "With melodic vocal presence",
    buildStructurePrompt(duration, profile.structure),
    `Atmosphere: ${SPECTRAL_BASE}`,
    profile.spectralFx ? `Effects: ${profile.spectralFx}` : null,
    "High-fidelity audio, 44.1kHz, master quality, rich textures, perfectly balanced mix, dynamic range, clear percussion, defined bassline, atmospheric depth",
    `No: ${NEGATIVE_PROMPT}`,
  ].filter(Boolean);

  return { prompt: parts.join(". ") + ".", bpm };
}

// ──────────────────────────────────────────────
// Edge Function Handler
// ──────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");

    if (!REPLICATE_TOKEN) {
      return new Response(
        JSON.stringify({ error: "REPLICATE_API_TOKEN no configurado en Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!REPLICATE_TOKEN.startsWith("r8_")) {
      return new Response(
        JSON.stringify({ error: "TOKEN INVÁLIDO — debe empezar con r8_" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { prompt, genre, instrumental, energy, bpm, duration, complexity } = body;

    if (!prompt || !genre) {
      return new Response(
        JSON.stringify({ error: "Faltan campos: prompt y género." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reqDuration = Math.min(Math.max(duration || 15, 5), 60);

    const urb = buildURBPrompt({
      genre,
      description: prompt,
      energy: energy ?? undefined,
      bpm: bpm ?? undefined,
      instrumental: instrumental ?? false,
      duration: reqDuration,
      complexity: complexity ?? 3,
    });

    console.log("URB Prompt:", urb.prompt);
    console.log("BPM:", urb.bpm, "| Duration:", reqDuration);

    const createRes = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: MUSICGEN_VERSION,
        input: {
          prompt: urb.prompt,
          duration: reqDuration,
          output_format: "mp3",
          top_k: 250,
          temperature: 1.2,
          classifier_free_guidance: 5.0,
        },
      }),
    });

    if (!createRes.ok) {
      const errBody = await createRes.text();
      console.error(`Replicate error [${createRes.status}]:`, errBody);

      if (createRes.status === 401) {
        return new Response(
          JSON.stringify({ error: `[401] Token inválido o expirado.` }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (createRes.status === 402) {
        return new Response(
          JSON.stringify({ error: `[402] Saldo insuficiente en Replicate.` }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `[${createRes.status}] ${errBody.substring(0, 300)}` }),
        { status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prediction = await createRes.json();
    const predictionId = prediction.id;

    // Polling: max ~120s for longer durations
    const maxPolls = reqDuration > 30 ? 30 : 20;
    for (let i = 0; i < maxPolls; i++) {
      if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") break;
      await new Promise((r) => setTimeout(r, 5000));

      const pollRes = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
        headers: { "Authorization": `Bearer ${REPLICATE_TOKEN}` },
      });

      if (!pollRes.ok) {
        const pollErr = await pollRes.text();
        console.error(`Polling error [${pollRes.status}]:`, pollErr);
        return new Response(
          JSON.stringify({ error: `[POLL ${pollRes.status}] ${pollErr.substring(0, 200)}` }),
          { status: pollRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      prediction = await pollRes.json();
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("Prediction failed:", prediction.error);
      return new Response(
        JSON.stringify({ error: `Generación falló: ${prediction.error || "Error desconocido."}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prediction.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "Tiempo agotado. Reintenta en unos minutos." }),
        { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const audioUrl = typeof prediction.output === "string"
      ? prediction.output
      : Array.isArray(prediction.output) && prediction.output.length > 0
        ? prediction.output[0]
        : null;

    if (!audioUrl) {
      return new Response(
        JSON.stringify({ error: "Replicate no devolvió audio." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Audio generado:", audioUrl);

    return new Response(
      JSON.stringify({ audio_url: audioUrl, duration: reqDuration, bpm: urb.bpm }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: `[INTERNAL] ${error?.message || "Error desconocido."}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
