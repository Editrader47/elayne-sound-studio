import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const MUSICGEN_VERSION = "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";

// ──────────────────────────────────────────────
// ELAYNE — Latin Pro Creative Engine
// Genre Database with Structural Musical DNA
// ──────────────────────────────────────────────

interface GenreProfile {
  bpmRange: [number, number];
  percussion: string;
  rhythm: string;
  instruments: string;
  spectralFx: string;
  baseEnergy: number;
  structure: string;
  bassStyle: string;
  harmonicStyle: string;
  energyCurve: string;
  instrumentDensity: string;
}

const GENRE_DB: Record<string, GenreProfile> = {
  // ── LATIN CORE ENGINE (PRIMARY) ──
  reggaeton: {
    bpmRange: [90, 95],
    percussion: "clean punchy kick, tight snare on beat 3, crisp hi-hats with precision",
    rhythm: "clean dembow pattern, polished rhythmic grid, no clutter",
    instruments: "808 warm sub-bass with optional glide, atmospheric synth layers, digital brass stabs, polished modern pads",
    spectralFx: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
    bassStyle: "warm 808 sub-bass with controlled glide, deep but defined low-end",
    harmonicStyle: "minor commercial chord progressions, modern urban harmony",
    energyCurve: "steady build with controlled dynamic peaks",
    instrumentDensity: "medium density, polished modern mix",
    baseEnergy: 4,
    structure: "atmospheric intro, groove drop, intensifying verses, powerful climax",
  },
  urbano: {
    bpmRange: [88, 95],
    percussion: "punchy kick drum, latin snare, crisp hi-hats, rim shots",
    rhythm: "dembow syncopated pattern with modern urban twist",
    instruments: "heavy 808 sub-bass, atmospheric pads, digital brass, vocal chops",
    spectralFx: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
    bassStyle: "aggressive 808 with pitch slides",
    harmonicStyle: "dark minor progressions with trap influence",
    energyCurve: "moody intro building to hard-hitting drops",
    instrumentDensity: "medium-high, layered urban production",
    baseEnergy: 4,
    structure: "moody intro, groove build, hard-hitting drop, intense climax",
  },
  "trap latino": {
    bpmRange: [130, 150],
    percussion: "808 kick with glide, hi-hats 1/16 with roll variation, dry snare",
    rhythm: "trap bounce with hi-hat triplet patterns and roll automation",
    instruments: "808 glide bass, dark melodic pads, minimal percussion, eerie synth leads, bell melodies",
    spectralFx: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
    bassStyle: "808 glide enabled, aggressive pitch-bending sub-bass",
    harmonicStyle: "dark minor keys, minimal harmonic movement",
    energyCurve: "tension build with structural drops",
    instrumentDensity: "minimal percussion, dense atmosphere",
    baseEnergy: 4,
    structure: "dark atmospheric intro, building tension, heavy drop, aggressive climax",
  },
  trap: {
    bpmRange: [130, 150],
    percussion: "booming 808 kick, dry snare, rapid hi-hat triplets, snare rolls",
    rhythm: "trap bounce with hi-hat triplet patterns",
    instruments: "deep 808 sub-bass, dark atmospheric pads, eerie synth leads, bell melodies",
    spectralFx: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
    bassStyle: "deep 808 with pitch slides and distortion",
    harmonicStyle: "dark minor, chromatic tension",
    energyCurve: "aggressive buildup with hard drops",
    instrumentDensity: "layered but dark, trap density",
    baseEnergy: 4,
    structure: "dark atmospheric intro, building tension, heavy drop, aggressive climax",
  },
  tecnocumbia: {
    bpmRange: [95, 105],
    percussion: "electronic cumbia percussion, digital cowbell, crisp güira, layered tropical hits",
    rhythm: "electronic cumbia rhythm base with syncopated groove, dance-focused",
    instruments: "analog synthesizer leads, syncopated electronic bassline, bright digital synthesizers, Korg M1 piano sounds, latin percussive layers",
    spectralFx: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
    bassStyle: "syncopated electronic bassline, rhythmic bass movement",
    harmonicStyle: "major/minor mix, clear melodic hooks, dance-oriented harmony",
    energyCurve: "steady dance groove with progressive builds",
    instrumentDensity: "medium-high, hybrid acoustic + electronic layers",
    baseEnergy: 4,
    structure: "synth intro, tropical groove, electronic bridge, high-energy climax",
  },
  dembow: {
    bpmRange: [95, 100],
    percussion: "heavy kick, aggressive snare, metallic hi-hats, rim shots",
    rhythm: "dembow riddim pattern, heavy rhythmic drive, repetitive hook structure",
    instruments: "massive 808 bass, brass stabs, synth hooks, vocal chants",
    spectralFx: "aggressive spatial energy, bass-heavy atmosphere",
    bassStyle: "heavy 808 with aggressive presence",
    harmonicStyle: "simple repetitive hooks, minor key",
    energyCurve: "high energy throughout, relentless drive",
    instrumentDensity: "high percussion density, hook-focused",
    baseEnergy: 5,
    structure: "hook intro, heavy groove, relentless energy, massive drop",
  },
  "cumbia electronica": {
    bpmRange: [128, 136],
    percussion: "electronic + acoustic hybrid percussion, digital cowbell, congas, güira",
    rhythm: "cumbia shuffle with electronic layers, hybrid groove",
    instruments: "analog synth leads, layered percussion, rhythmic bass, accordion samples, tropical melodic identity",
    spectralFx: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
    bassStyle: "rhythmic bass movement, syncopated electronic bassline",
    harmonicStyle: "tropical melodic identity, major key hooks",
    energyCurve: "dance groove with layered builds",
    instrumentDensity: "hybrid acoustic + electronic, medium-high",
    baseEnergy: 3,
    structure: "melodic intro, rhythmic groove, instrumental bridge, energetic finale",
  },
  cumbia: {
    bpmRange: [128, 136],
    percussion: "iconic 90s digital cowbell, crisp güira, high-energy tropical percussion, congas",
    rhythm: "cumbia shuffle with syncopated bass pattern",
    instruments: "analog synthesizer leads, syncopated electronic bass, bright accordion melodies, maracas",
    spectralFx: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
    bassStyle: "syncopated electronic bass, rhythmic pulse",
    harmonicStyle: "tropical major key, accordion-driven melody",
    energyCurve: "festive steady groove",
    instrumentDensity: "medium, traditional layering",
    baseEnergy: 3,
    structure: "melodic intro, rhythmic groove, instrumental bridge, energetic finale",
  },
  sonidera: {
    bpmRange: [130, 138],
    percussion: "iconic 90s digital cowbell, crisp güira, high-energy tropical percussion",
    rhythm: "cumbia sonidera shuffle, sonidero bounce",
    instruments: "analog synthesizer leads, Korg M1 piano sounds, syncopated electronic bass, bright digital synths",
    spectralFx: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
    bassStyle: "electronic bass with cumbia groove",
    harmonicStyle: "sonidero melody style, bright major key",
    energyCurve: "euphoric dance energy",
    instrumentDensity: "medium-high, synth-heavy",
    baseEnergy: 4,
    structure: "synth intro, sonidero groove, melodic bridge, euphoric climax",
  },
  salsa: {
    bpmRange: [160, 200],
    percussion: "syncopated congas, timbales, bongos, claves, cowbell",
    rhythm: "clave-based salsa rhythm (son clave 3-2 or 2-3)",
    instruments: "authentic piano montuno, sharp brass section (trumpets/trombones), upright bass, string arrangements",
    spectralFx: "warm hall reverb, brass shimmer, percussive spatial imaging",
    bassStyle: "walking upright bass with rhythmic drive",
    harmonicStyle: "montuno-based harmony, brass-led melodic lines",
    energyCurve: "escalating energy from groove to mambo",
    instrumentDensity: "high, full ensemble",
    baseEnergy: 5,
    structure: "brass intro, montuno groove, solo section, energetic mambo climax",
  },
  bachata: {
    bpmRange: [125, 140],
    percussion: "bongo patterns, güira, tambora",
    rhythm: "bachata derecho pattern with syncopated güira",
    instruments: "nylon string guitar requinto, bass guitar, romantic piano, soft brass accents",
    spectralFx: "warm intimate reverb, guitar shimmer, romantic ambience",
    bassStyle: "melodic bass guitar with romantic pulse",
    harmonicStyle: "romantic chord progressions, guitar-led",
    energyCurve: "intimate and emotional, gentle builds",
    instrumentDensity: "medium, guitar-focused",
    baseEnergy: 2,
    structure: "guitar intro, romantic groove, emotional bridge, passionate climax",
  },
  merengue: {
    bpmRange: [140, 180],
    percussion: "tambora, güira patterns, congas",
    rhythm: "merengue 2/4 pattern with driving güira",
    instruments: "accordion leads, saxophone, brass section, synth bass, piano montuno",
    spectralFx: "festive reverb, brass brightness, dance floor energy",
    bassStyle: "driving synth bass with merengue pulse",
    harmonicStyle: "festive major key, accordion-led",
    energyCurve: "high energy from start, relentless dance drive",
    instrumentDensity: "high, full dance band",
    baseEnergy: 5,
    structure: "brass fanfare intro, merengue groove, instrumental solo, high-energy finale",
  },
  corrido: {
    bpmRange: [100, 130],
    percussion: "tuba bass, bajo sexto strums, snare drum",
    rhythm: "polka/waltz corrido pattern with tuba bass",
    instruments: "bajo sexto, tuba, accordion, brass band, requinto guitar",
    spectralFx: "open-air reverb, acoustic warmth, live band ambience",
    bassStyle: "tuba bass with rhythmic pulse",
    harmonicStyle: "traditional folk harmony, narrative style",
    energyCurve: "steady narrative drive",
    instrumentDensity: "medium, traditional ensemble",
    baseEnergy: 3,
    structure: "bajo sexto intro, narrative groove, instrumental bridge, powerful finale",
  },
  "corrido tumbado": {
    bpmRange: [75, 95],
    percussion: "trap hi-hats, 808 kick, bajo sexto strums",
    rhythm: "corrido meets trap: hybrid folk-urban pattern",
    instruments: "bajo sexto, tuba with 808 sub-bass, requinto guitar, trap hi-hats, modern production",
    spectralFx: "dark atmospheric layers, urban reverb, modern spatial processing",
    bassStyle: "hybrid tuba + 808 sub-bass",
    harmonicStyle: "traditional corrido harmony with urban twist",
    energyCurve: "slow burn with urban intensity",
    instrumentDensity: "medium, hybrid layering",
    baseEnergy: 3,
    structure: "hybrid intro, tumbado groove, trap-influenced build, powerful drop",
  },
  banda: {
    bpmRange: [110, 145],
    percussion: "tarola (snare), bass drum, cymbals, tambora",
    rhythm: "banda sinaloense pattern with brass-driven pulse",
    instruments: "full brass band (clarinets, trumpets, trombones, tubas), tarola, tambora",
    spectralFx: "open-air live reverb, brass ensemble warmth, festive spatial imaging",
    bassStyle: "tuba bass foundation",
    harmonicStyle: "brass-led harmonies, festive progressions",
    energyCurve: "festive and triumphant",
    instrumentDensity: "very high, full brass ensemble",
    baseEnergy: 4,
    structure: "brass fanfare intro, banda groove, solo section, triumphant finale",
  },
  norteña: {
    bpmRange: [110, 140],
    percussion: "polka bass drum, snare accents",
    rhythm: "norteño polka pattern with accordion lead",
    instruments: "button accordion, bajo sexto, bass, drums, saxophone accents",
    spectralFx: "acoustic warmth, open-air ambience, live band reverb",
    bassStyle: "bass guitar with polka rhythm",
    harmonicStyle: "accordion-led folk harmony",
    energyCurve: "lively and festive",
    instrumentDensity: "medium, traditional combo",
    baseEnergy: 3,
    structure: "accordion intro, norteño groove, instrumental bridge, energetic finale",
  },

  // ── UNIVERSAL MODE ENGINE (SECONDARY) ──
  tropical: {
    bpmRange: [150, 190],
    percussion: "syncopated congas, timbales, guiro, claves",
    rhythm: "tropical cumbia/salsa hybrid pattern",
    instruments: "piano montuno, brass section, marimba, Caribbean bass",
    spectralFx: "warm hall reverb, tropical shimmer, percussive spatial imaging",
    bassStyle: "Caribbean bass with rhythmic groove",
    harmonicStyle: "tropical harmony, brass and piano-led",
    energyCurve: "festive and escalating",
    instrumentDensity: "high, full tropical ensemble",
    baseEnergy: 4,
    structure: "rhythmic intro, tropical groove, brass bridge, festive climax",
  },
  rock: {
    bpmRange: [110, 140],
    percussion: "multi-layered drum kit, crash cymbals, floor toms, ride cymbal",
    rhythm: "straight 4/4 rock beat with powerful fills",
    instruments: "overdriven electric guitars, thick bass guitar, stadium reverb, power chords",
    spectralFx: "stadium reverb tails, guitar feedback textures, massive room ambience",
    bassStyle: "thick bass guitar with rock drive",
    harmonicStyle: "power chord progressions, rock harmony",
    energyCurve: "explosive chorus builds",
    instrumentDensity: "high, full rock band",
    baseEnergy: 4,
    structure: "guitar riff intro, verse groove, pre-chorus build, explosive chorus",
  },
  pop: {
    bpmRange: [110, 130],
    percussion: "tight kick and snare, crisp hi-hats, claps, finger snaps",
    rhythm: "four-on-the-floor pop beat with syncopated elements",
    instruments: "catchy synth melodies, polished production, bright piano, layered vocals, driving bassline",
    spectralFx: "glossy reverb, wide stereo chorus, bright presence",
    bassStyle: "driving pop bassline, melodic",
    harmonicStyle: "major/minor pop progressions, catchy hooks",
    energyCurve: "lift and drop, euphoric choruses",
    instrumentDensity: "medium-high, polished pop",
    baseEnergy: 3,
    structure: "catchy intro hook, verse groove, pre-chorus lift, euphoric chorus",
  },
  edm: {
    bpmRange: [124, 132],
    percussion: "heavy four-on-the-floor kick, open hi-hats, claps, white noise risers",
    rhythm: "four-on-the-floor with sidechain compression feel",
    instruments: "big room synths, supersaw leads, pluck melodies, sub-bass, festival stabs",
    spectralFx: "massive reverb tails, sidechain pumping, white noise sweeps, impact FX",
    bassStyle: "massive sidechain sub-bass",
    harmonicStyle: "supersaw progressions, festival energy",
    energyCurve: "tension-release cycle with massive drops",
    instrumentDensity: "very high at drops, minimal at breakdowns",
    baseEnergy: 5,
    structure: "atmospheric intro, building tension, massive drop, euphoric climax",
  },
  techno: {
    bpmRange: [125, 135],
    percussion: "constant 4/4 kick, metallic hi-hats, rimshot, industrial claps",
    rhythm: "relentless 4/4 techno pulse with hypnotic repetition",
    instruments: "repetitive bassline, industrial synths, acid squelch (303), dark textures, mechanical sounds",
    spectralFx: "industrial reverb, metallic delays, dark spatial atmospheres",
    bassStyle: "repetitive hypnotic bassline",
    harmonicStyle: "minimal harmonic movement, textural",
    energyCurve: "hypnotic escalation",
    instrumentDensity: "medium, hypnotic layering",
    baseEnergy: 4,
    structure: "minimal intro, hypnotic groove build, industrial breakdown, relentless climax",
  },
  "lo-fi": {
    bpmRange: [70, 90],
    percussion: "soft boom-bap drums, subtle hi-hats, vinyl crackle",
    rhythm: "laid-back swing with off-kilter groove",
    instruments: "warm vinyl crackle, mellow jazz chords, Rhodes piano, soft pads, tape saturation",
    spectralFx: "warm tape delay, vinyl hiss, cozy room ambience, soft filtering",
    bassStyle: "warm mellow bass, soft presence",
    harmonicStyle: "jazz-influenced chords, warm and nostalgic",
    energyCurve: "calm and steady, subtle variations",
    instrumentDensity: "low, minimal and cozy",
    baseEnergy: 1,
    structure: "gentle intro, mellow groove, subtle variation, peaceful fade",
  },
  "hip-hop": {
    bpmRange: [85, 100],
    percussion: "boom bap drums, punchy kick, snappy snare, chopped breaks",
    rhythm: "boom bap swing with head-nod groove",
    instruments: "vinyl crackle, jazzy samples, deep bass, scratching, piano loops",
    spectralFx: "dusty vinyl ambience, warm reverb, analog saturation",
    bassStyle: "deep boom-bap bass, punchy",
    harmonicStyle: "sample-based harmony, jazz influence",
    energyCurve: "head-nod groove with dynamic breaks",
    instrumentDensity: "medium, sample-driven",
    baseEnergy: 3,
    structure: "sample-based intro, boom bap groove, breakdown, hard-hitting finale",
  },
  synthwave: {
    bpmRange: [100, 120],
    percussion: "electronic drums, gated reverb snare, 80s drum machine, claps",
    rhythm: "driving 4/4 with retro 80s feel",
    instruments: "analog synthesizers, pulsing arpeggios, neon atmosphere, cinematic retro 80s pads, Juno-style chords",
    spectralFx: "vast neon-lit reverb, analog chorus, retro-futuristic delays",
    bassStyle: "pulsing synth bass, retro analog",
    harmonicStyle: "80s synth progressions, nostalgic",
    energyCurve: "cinematic build with soaring leads",
    instrumentDensity: "medium, synth-focused",
    baseEnergy: 3,
    structure: "cinematic synth intro, arpeggiated build, soaring lead, retro climax",
  },
  worship: {
    bpmRange: [68, 85],
    percussion: "soft kick, gentle snare, subtle hi-hats, tambourine",
    rhythm: "gentle flowing rhythm, worship sway",
    instruments: "atmospheric pads, emotive piano, ambient guitars, string swells, crescendo layers",
    spectralFx: "cathedral reverb, heavenly pads, ascending harmonic shimmer",
    bassStyle: "gentle pad bass, ethereal",
    harmonicStyle: "ascending emotional progressions, worship harmony",
    energyCurve: "intimate to powerful crescendo",
    instrumentDensity: "low to high, progressive build",
    baseEnergy: 2,
    structure: "intimate piano intro, gentle build, emotional crescendo, powerful climax",
  },
  afrobeat: {
    bpmRange: [100, 130],
    percussion: "complex polyrhythmic drums, shekere, talking drum, djembe, bell pattern",
    rhythm: "polyrhythmic West African groove with cross-rhythms",
    instruments: "Fela-style horn section, rhythmic guitar, funky bass, organ stabs, afro percussion ensemble",
    spectralFx: "earthy reverb, warm analog warmth, rhythmic spatial movement",
    bassStyle: "funky afrobeat bass with rhythmic drive",
    harmonicStyle: "afro harmony, horn-led melodies",
    energyCurve: "polyrhythmic escalation",
    instrumentDensity: "high, full ensemble",
    baseEnergy: 4,
    structure: "polyrhythmic intro, groove lock, horn melody, rhythmic climax",
  },
  drill: {
    bpmRange: [138, 145],
    percussion: "sliding 808 bass, sharp snares, rapid hi-hat patterns",
    rhythm: "UK/NY drill bounce with sliding bass patterns",
    instruments: "dark piano melodies, eerie string samples, aggressive 808 slides, haunting bells",
    spectralFx: "dark cavernous reverb, ominous atmospheric layers, menacing echoes",
    bassStyle: "aggressive sliding 808",
    harmonicStyle: "dark minor, eerie melodic patterns",
    energyCurve: "menacing and relentless",
    instrumentDensity: "medium-dark, atmospheric",
    baseEnergy: 4,
    structure: "ominous intro, dark groove, aggressive build, menacing drop",
  },
  cinematic: {
    bpmRange: [70, 110],
    percussion: "epic taiko drums, deep impacts, cinematic risers, tension percussion",
    rhythm: "epic film score rhythm with tension and release",
    instruments: "massive orchestral swells, deep brass, ethereal choirs, hybrid synth-orchestra layers, trailer impacts",
    spectralFx: "enormous hall reverb, sub-harmonic rumble, cinematic spatial depth",
    bassStyle: "sub-harmonic orchestral bass",
    harmonicStyle: "cinematic harmony, epic progressions",
    energyCurve: "tension to epic resolution",
    instrumentDensity: "very high at climax, minimal at openings",
    baseEnergy: 5,
    structure: "quiet tension intro, building intensity, massive crescendo, epic resolution",
  },
  orchestral: {
    bpmRange: [60, 120],
    percussion: "timpani, orchestral snare, cymbals, bass drum",
    rhythm: "conducted orchestral timing with dynamic swells",
    instruments: "full symphony orchestra, soaring strings, powerful brass, delicate woodwinds, harp glissandos",
    spectralFx: "concert hall reverb, lush string resonance, epic spatial imaging",
    bassStyle: "contrabass and cello foundation",
    harmonicStyle: "classical orchestral harmony",
    energyCurve: "thematic development with dramatic peaks",
    instrumentDensity: "very high, full orchestra",
    baseEnergy: 4,
    structure: "quiet string intro, thematic development, dramatic build, triumphant climax",
  },
  reggae: {
    bpmRange: [66, 90],
    percussion: "one-drop kick-snare, hi-hats, rim clicks",
    rhythm: "one-drop reggae pattern with offbeat skank",
    instruments: "offbeat rhythm guitar skank, deep bass guitar, organ bubble, horn stabs",
    spectralFx: "dub delay, spring reverb, spacious bass echoes",
    bassStyle: "deep reggae bass with dub character",
    harmonicStyle: "roots harmony, offbeat guitar",
    energyCurve: "steady groove with dub variations",
    instrumentDensity: "medium, rhythm-section focused",
    baseEnergy: 2,
    structure: "offbeat intro, roots groove, dub breakdown, uplifting outro",
  },
  dancehall: {
    bpmRange: [95, 110],
    percussion: "digital dancehall drums, snare rolls, claps",
    rhythm: "dancehall riddim with aggressive bounce",
    instruments: "digital synth bass, dancehall stabs, air horns, vocal chants",
    spectralFx: "bright digital reverb, aggressive spatial energy, siren FX",
    bassStyle: "digital dancehall bass, heavy",
    harmonicStyle: "simple riddim harmony",
    energyCurve: "high energy dance drive",
    instrumentDensity: "medium, riddim-focused",
    baseEnergy: 4,
    structure: "riddim intro, dancehall bounce, horn build, massive drop",
  },
  "drum and bass": {
    bpmRange: [170, 180],
    percussion: "breakbeat drums, rapid snares, hi-hats, ride cymbal",
    rhythm: "broken beat pattern at high BPM with syncopation",
    instruments: "massive reese bass, atmospheric pads, vocal chops, amen break variations",
    spectralFx: "cavernous reverb, bass modulation, dark spatial depth",
    bassStyle: "massive reese bass with modulation",
    harmonicStyle: "dark atmospheric, bass-driven",
    energyCurve: "relentless high energy",
    instrumentDensity: "medium-high, bass-focused",
    baseEnergy: 5,
    structure: "atmospheric intro, building tension, breakbeat drop, relentless energy",
  },
  house: {
    bpmRange: [120, 130],
    percussion: "four-on-the-floor kick, open hi-hats, claps, shakers",
    rhythm: "four-on-the-floor house groove with offbeat hi-hats",
    instruments: "warm bass, classic house piano chords, vocal samples, disco strings, synth stabs",
    spectralFx: "warm club reverb, disco shimmer, house groove spatial feel",
    bassStyle: "warm house bass, groovy",
    harmonicStyle: "classic house piano chords, uplifting",
    energyCurve: "feel-good escalation",
    instrumentDensity: "medium, groove-focused",
    baseEnergy: 3,
    structure: "filtered intro, groove build, piano break, feel-good drop",
  },
  "r&b": {
    bpmRange: [60, 80],
    percussion: "soft kick, finger snaps, brushed snare, hi-hats",
    rhythm: "smooth R&B groove with laid-back swing",
    instruments: "silky synth pads, Rhodes electric piano, smooth bass, lush vocal harmonies, guitar licks",
    spectralFx: "warm intimate reverb, silky smooth presence, romantic ambience",
    bassStyle: "smooth R&B bass, melodic",
    harmonicStyle: "silky R&B harmony, neo-soul influence",
    energyCurve: "intimate and smooth",
    instrumentDensity: "medium, vocal-focused",
    baseEnergy: 2,
    structure: "smooth intro, R&B groove, emotional bridge, sultry climax",
  },
  jazz: {
    bpmRange: [100, 160],
    percussion: "ride cymbal, brushed snare, kick accents, hi-hat splash",
    rhythm: "swing feel with improvised rhythmic variations",
    instruments: "upright bass walking lines, piano comping, saxophone melody, trumpet solo, vibraphone",
    spectralFx: "smoky club reverb, warm analog saturation, intimate spatial imaging",
    bassStyle: "upright bass walking lines",
    harmonicStyle: "jazz harmony, extended chords, improvisation",
    energyCurve: "dynamic improvised flow",
    instrumentDensity: "medium, combo-focused",
    baseEnergy: 3,
    structure: "theme statement, improvised solo, comping variations, theme return",
  },
  country: {
    bpmRange: [100, 140],
    percussion: "brush snare, kick drum, shaker",
    rhythm: "country two-step or shuffle pattern",
    instruments: "acoustic guitar fingerpicking, steel guitar, fiddle, banjo, upright bass",
    spectralFx: "open-air reverb, acoustic warmth, Nashville studio ambience",
    bassStyle: "upright bass with country rhythm",
    harmonicStyle: "country progressions, folk harmony",
    energyCurve: "story-driven dynamic",
    instrumentDensity: "medium, acoustic ensemble",
    baseEnergy: 3,
    structure: "acoustic intro, country groove, fiddle break, sing-along chorus",
  },
  metal: {
    bpmRange: [120, 180],
    percussion: "double bass kick drums, blast beats, aggressive snare, china cymbal",
    rhythm: "aggressive double kick pattern with blast beat sections",
    instruments: "heavily distorted guitars, palm-muted riffs, growling bass, shredding solos, breakdown chug",
    spectralFx: "massive wall of sound, dark cavernous reverb, aggressive saturation",
    bassStyle: "aggressive distorted bass",
    harmonicStyle: "heavy metal harmony, power chords, chromatic",
    energyCurve: "relentless aggression",
    instrumentDensity: "very high, wall of sound",
    baseEnergy: 5,
    structure: "aggressive riff intro, verse assault, breakdown, explosive solo climax",
  },
  bossa: {
    bpmRange: [120, 145],
    percussion: "soft brushes, shaker, subtle kick",
    rhythm: "bossa nova rhythm with gentle syncopation",
    instruments: "nylon string guitar, soft piano, flute, upright bass, light percussion",
    spectralFx: "warm intimate reverb, Brazilian warmth, gentle spatial imaging",
    bassStyle: "soft upright bass, melodic",
    harmonicStyle: "bossa nova harmony, jazz-influenced chords",
    energyCurve: "gentle and peaceful",
    instrumentDensity: "low, intimate",
    baseEnergy: 1,
    structure: "gentle guitar intro, bossa groove, flute melody, peaceful resolution",
  },
  flamenco: {
    bpmRange: [80, 200],
    percussion: "palmas (handclaps), cajón, zapateado (footwork)",
    rhythm: "compás flamenco pattern (bulerías, soleá, or tangos)",
    instruments: "flamenco guitar (rasgueado, picado), cajón, palmas, passionate vocals, violin accents",
    spectralFx: "intimate room reverb, guitar resonance, passionate spatial energy",
    bassStyle: "guitar bass notes, rhythmic",
    harmonicStyle: "Phrygian mode, flamenco harmony",
    energyCurve: "passionate dramatic arc",
    instrumentDensity: "medium, guitar-focused",
    baseEnergy: 4,
    structure: "guitar falseta intro, rhythmic build, passionate climax, dramatic resolution",
  },
  ambient: {
    bpmRange: [60, 90],
    percussion: "no percussion or very subtle textures",
    rhythm: "free-flowing ambient pulse, no strict beat",
    instruments: "vast synthesizer pads, granular textures, field recordings, gentle drones, bell tones",
    spectralFx: "infinite reverb, granular spatial processing, evolving atmospheric layers",
    bassStyle: "drone bass, sub-harmonic",
    harmonicStyle: "ambient harmony, evolving textures",
    energyCurve: "slow evolution, meditative",
    instrumentDensity: "very low, textural",
    baseEnergy: 1,
    structure: "evolving texture intro, ambient landscape, subtle transformation, ethereal fade",
  },
  // Jingles / Promo
  jingle: {
    bpmRange: [110, 130],
    percussion: "tight pop drums, claps, snaps",
    rhythm: "catchy pop rhythm, upbeat and memorable",
    instruments: "bright piano, catchy synth hooks, clean guitar, bass, cheerful brass",
    spectralFx: "bright reverb, clean presence, commercial polish",
    bassStyle: "pop bass, driving and clean",
    harmonicStyle: "major key, uplifting, commercial",
    energyCurve: "upbeat and attention-grabbing",
    instrumentDensity: "medium, polished commercial",
    baseEnergy: 3,
    structure: "catchy hook intro, verse, memorable chorus, tag ending",
  },
  promo: {
    bpmRange: [100, 125],
    percussion: "cinematic percussion, risers, impacts",
    rhythm: "corporate/motivational rhythm, driving but polished",
    instruments: "uplifting synths, piano, motivational strings, clean bass, inspirational pads",
    spectralFx: "polished reverb, motivational atmosphere, clean spatial imaging",
    bassStyle: "clean motivational bass",
    harmonicStyle: "uplifting major progressions",
    energyCurve: "inspirational build to peak",
    instrumentDensity: "medium, polished",
    baseEnergy: 3,
    structure: "gentle intro, motivational build, inspiring peak, resolved ending",
  },
};

// ──────────────────────────────────────────────
// ELAYNE — Prompt Builder with Clarity & Evolution
// ──────────────────────────────────────────────

const SPECTRAL_BASE = "spectral soundscapes, wide stereo imaging, immersive spatial audio, ethereal pads, high-frequency clarity, deep ambient resonance, phase-shifted textures";
const NEGATIVE_PROMPT = "low quality, distorted, muffled, mono, static, white noise, out of tune, weak drums, amateur recording, chaotic layering, random noise";

// Evolution System: micro-variation seeds for non-repetitive generation
const VARIATION_SEEDS = [
  "with subtle ghost notes and micro-timing humanization",
  "with dynamic velocity changes across sections",
  "with syncopated ghost hits and evolving rhythmic density",
  "with polyrhythmic accents shifting every 4 bars",
  "with displaced snare accents and progressive hi-hat evolution",
  "with micro-rhythmic swing variations and humanized timing",
  "with controlled randomness in percussion fills",
  "with evolving filter sweeps across arrangement",
  "with dynamic energy shifts between sections",
  "with progressive instrumental introduction and layering",
];

function getVariationSeed(): string {
  // Pick 2 seeds for more variation
  const seeds = [...VARIATION_SEEDS].sort(() => Math.random() - 0.5);
  return seeds.slice(0, 2).join(", ");
}

function pickBPM(range: [number, number], manualBpm?: number): number {
  if (manualBpm && manualBpm >= 40 && manualBpm <= 300) return manualBpm;
  return Math.floor(range[0] + Math.random() * (range[1] - range[0]));
}

function energyDescriptor(level: number): string {
  const map: Record<number, string> = {
    1: "calm, gentle, minimal energy, soft dynamics, intimate feel",
    2: "relaxed, moderate dynamics, smooth flow, gentle presence",
    3: "balanced energy, steady dynamics, engaging groove, medium intensity",
    4: "high energy, powerful dynamics, driving intensity, commanding presence",
    5: "maximum energy, explosive dynamics, relentless power, peak intensity, all-out performance",
  };
  return map[Math.max(1, Math.min(5, level))] || map[3];
}

function complexityDescriptor(level: number): string {
  const map: Record<number, string> = {
    1: "simple patterns, minimal layering, clean arrangement, intentional simplicity",
    2: "moderate complexity, tasteful layering, balanced arrangement",
    3: "rich complexity, multiple interlocking layers, detailed arrangement",
    4: "highly complex, dense polyrhythmic layers, intricate arrangement with countermelodies",
    5: "maximum complexity, virtuosic patterns, orchestral density, every frequency range filled",
  };
  return map[Math.max(1, Math.min(5, level))] || map[3];
}

// ── Clarity System (ELAYNE Signature: "Ray of Light") ──
function clarityDescriptor(level: number): string {
  // 0-100 scale
  if (level >= 80) return "extremely clean and open mix, wide stereo separation, generous harmonic spacing, minimal instrument density, crystal-clear frequency balance, pristine arrangement with breathing room";
  if (level >= 60) return "clean professional mix, good stereo width, balanced harmonic spacing, moderate instrument density, clear frequency separation";
  if (level >= 40) return "balanced mix density, moderate stereo width, standard harmonic spacing, medium instrument layering";
  if (level >= 20) return "dense mix, narrow stereo field, thick harmonic layers, heavy instrument density, packed arrangement";
  return "maximum density mix, compressed stereo field, heavy saturated layers, wall-of-sound production, minimal frequency separation";
}

// ── Evolution System ──
function buildStructurePrompt(duration: number, structure: string): string {
  if (duration <= 15) {
    return `Song structure with evolution: intro with tension build (0-3s), main groove with establishing rhythm (3-8s), dynamic intensification (8-12s), climax with full energy (12-15s). Music must evolve — no static loops.`;
  }
  if (duration <= 30) {
    return `Song structure with progressive evolution: atmospheric intro (0-5s), establishing groove with micro-variations every 4 bars (5-15s), intensification with new layers and energy shift (15-22s), climax/drop with full arrangement (22-30s). Structural transitions must be intentional. No repetitive loops.`;
  }
  return `Song structure with full evolution: ${structure}. Complete arrangement with intro, verse development, hook/chorus with maximum energy, bridge with dynamic shift, and resolution over ${duration} seconds. Micro-variations every 4-8 bars, dynamic energy shifts, controlled randomness in fills and transitions. Music evolves intentionally — never loops statically.`;
}

interface URBParams {
  genre: string;
  description: string;
  energy?: number;
  bpm?: number;
  instrumental?: boolean;
  duration?: number;
  complexity?: number;
  clarity?: number;
  atmosphere?: string;
  grooveIntensity?: number;
  swing?: number;
  percussionDensity?: number;
  bassAggression?: number;
  humanization?: number;
  applyLatinSignature?: boolean;
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
      bassStyle: "adaptive bass for the style",
      harmonicStyle: "genre-appropriate harmony",
      energyCurve: "balanced dynamic arc",
      instrumentDensity: "medium, adaptive",
    };
  }

  const energy = params.energy ?? profile.baseEnergy;
  const complexity = params.complexity ?? 3;
  const clarity = params.clarity ?? 65;
  const bpm = pickBPM(profile.bpmRange, params.bpm);
  const duration = params.duration ?? 15;
  const variationSeed = getVariationSeed();

  // Build atmosphere descriptor
  let atmosphereDesc = "";
  if (params.atmosphere === "dark") atmosphereDesc = "Dark, moody atmosphere with shadow textures";
  else if (params.atmosphere === "bright") atmosphereDesc = "Bright, uplifting atmosphere with luminous textures";
  else atmosphereDesc = "Balanced atmosphere with professional depth";

  // Latin Production Signature (optional for universal genres)
  let latinSignature = "";
  if (params.applyLatinSignature) {
    latinSignature = "Latin production signature: subtle clave influence, warm analog character, rhythmic latin percussion undertones, tropical harmonic color";
  }

  const parts = [
    `A professional ${params.genre} studio recording at ${bpm} BPM`,
    `Features: ${params.description}`,
    `Percussion: ${profile.percussion} ${variationSeed}`,
    `Rhythm: ${profile.rhythm}`,
    `Instrumentation: ${profile.instruments}`,
    `Bass: ${profile.bassStyle}`,
    `Harmony: ${profile.harmonicStyle}`,
    `Energy: ${energyDescriptor(energy)}`,
    `Energy curve: ${profile.energyCurve}`,
    `Rhythmic complexity: ${complexityDescriptor(complexity)}`,
    `Mix clarity: ${clarityDescriptor(clarity)}`,
    `Instrument density: ${profile.instrumentDensity}`,
    atmosphereDesc,
    params.instrumental ? "Purely instrumental, no vocals" : "With melodic vocal presence",
    buildStructurePrompt(duration, profile.structure),
    `Atmosphere: ${SPECTRAL_BASE}`,
    profile.spectralFx ? `Effects: ${profile.spectralFx}` : null,
    latinSignature || null,
    "High-fidelity audio, 44.1kHz, master quality, rich textures, perfectly balanced mix, dynamic range, clear percussion, defined bassline, atmospheric depth",
    "ELAYNE does not generate randomly — it composes with intention. Clean elegant sound, intentional groove, professional quality structure, emotional and dance capability",
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
    const { prompt, genre, instrumental, energy, bpm, duration, complexity, clarity, atmosphere, applyLatinSignature } = body;

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
      clarity: clarity ?? 65,
      atmosphere: atmosphere ?? "balanced",
      applyLatinSignature: applyLatinSignature ?? false,
    });

    console.log("ELAYNE Prompt:", urb.prompt);
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
  } catch (error: unknown) {
    console.error("Edge function error:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido.";
    return new Response(
      JSON.stringify({ error: `[INTERNAL] ${msg}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
