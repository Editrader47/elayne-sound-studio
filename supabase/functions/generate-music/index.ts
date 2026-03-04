import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const MUSICGEN_VERSION = "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";

// Instrumentation dictionary: genre keywords → rich English descriptors
const INSTRUMENTATION: Record<string, string> = {
  cumbia: "analog synthesizer leads, iconic 90s digital cowbell, syncopated electronic bass, crisp güira, high-energy tropical percussion, 132 BPM",
  tecnocumbia: "analog synthesizer leads, iconic 90s digital cowbell, syncopated electronic bass, crisp güira, high-energy tropical percussion, bright digital synthesizers, Korg M1 piano sounds, sonidero style, 132 BPM",
  sonidera: "analog synthesizer leads, iconic 90s digital cowbell, syncopated electronic bass, crisp güira, high-energy tropical percussion, bright digital synthesizers, Korg M1 piano sounds, sonidero style, 132 BPM",
  reggaeton: "aggressive dembow riddim, punchy kick drum, heavy sub-bass (808), crisp snares, modern club atmosphere, 90-95 BPM",
  urbano: "aggressive dembow riddim, punchy kick drum, heavy sub-bass (808), crisp snares, modern club atmosphere, 90-95 BPM",
  salsa: "authentic piano montuno, sharp brass section (trumpets/trombones), syncopated congas and timbales, energetic clave rhythm, 180 BPM",
  tropical: "authentic piano montuno, sharp brass section (trumpets/trombones), syncopated congas and timbales, energetic clave rhythm, 180 BPM",
  rock: "overdriven electric guitars, multi-layered drum kit, thick bass guitar, stadium reverb",
  trap: "heavy 808 sub bass, dark hi-hats, snare rolls, atmospheric pads, 140 BPM",
  "hip-hop": "boom bap drums, vinyl crackle, jazzy samples, punchy drums, deep bass, 90 BPM",
  "lo-fi": "warm vinyl crackle, mellow jazz chords, soft drums, relaxing atmosphere, 75 BPM",
  pop: "catchy melodies, polished production, bright synths, driving beat, 120 BPM",
  edm: "big room synths, four-on-the-floor kick, build-ups and drops, 128 BPM, festival energy",
  synthwave: "analog synthesizers, pulsing arpeggios, neon atmosphere, 110 BPM, cinematic retro 80s",
};

// Spectral effects by genre
const SPECTRAL_FX: Record<string, string> = {
  tecnocumbia: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
  sonidera: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
  cumbia: "spacey synthesizer echoes, cosmic reverb on cowbells, crystalline digital delays",
  urbano: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
  trap: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
  reggaeton: "haunting atmospheric textures, cinematic sub-bass, dark spectral whispers",
};

const SPECTRAL_BASE = "spectral soundscapes, wide stereo imaging, immersive spatial audio, ethereal pads, high-frequency clarity, deep ambient resonance, phase-shifted textures";

const NEGATIVE_PROMPT = "low quality, distorted, muffled, mono, static, white noise, out of tune, weak drums, amateur recording";

/**
 * Builds a professional producer-grade prompt with spectral atmosphere.
 */
function enhancePrompt(genre: string, description: string): string {
  const genreLower = genre.toLowerCase().trim();

  // Find matching instrumentation
  let instrumentation = "";
  let spectralFx = "";
  for (const [keyword, instr] of Object.entries(INSTRUMENTATION)) {
    if (genreLower.includes(keyword)) {
      instrumentation = instr;
      spectralFx = SPECTRAL_FX[keyword] || "";
      break;
    }
  }

  const parts = [
    `A professional ${genre} studio recording`,
    `Features: ${description}`,
    instrumentation ? `Instrumentation: ${instrumentation}` : null,
    `Atmosphere: ${SPECTRAL_BASE}`,
    spectralFx ? `Effects: ${spectralFx}` : null,
    "High-fidelity audio, 44.1kHz, master quality, rich textures, perfectly balanced mix, dynamic range. Clear percussion, defined bassline, atmospheric depth",
    `No: ${NEGATIVE_PROMPT}`,
  ].filter(Boolean);

  return parts.join(". ") + ".";
}

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
        JSON.stringify({ error: "TOKEN INVÁLIDO EN SETTINGS — debe empezar con r8_" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, genre } = await req.json();

    if (!prompt || !genre) {
      return new Response(
        JSON.stringify({ error: "Faltan campos: prompt y género." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const enhancedPrompt = enhancePrompt(genre, prompt);
    console.log("Prompt mejorado:", enhancedPrompt);

    const createRes = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: MUSICGEN_VERSION,
        input: {
          prompt: enhancedPrompt,
          duration: 15,
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
          JSON.stringify({ error: `[401] Token inválido o expirado. Revisa REPLICATE_API_TOKEN.` }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (createRes.status === 402) {
        return new Response(
          JSON.stringify({ error: `[402] Saldo insuficiente en Replicate. Recarga en replicate.com/account/billing` }),
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

    // Polling: 20 attempts x 5s = 100s max
    for (let i = 0; i < 20; i++) {
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
        JSON.stringify({ error: "Tiempo agotado (100s). Reintenta en unos minutos." }),
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
        JSON.stringify({ error: "Replicate no devolvió audio. Output: " + JSON.stringify(prediction.output) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Audio generado:", audioUrl);

    return new Response(
      JSON.stringify({ audio_url: audioUrl, duration: 15 }),
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
