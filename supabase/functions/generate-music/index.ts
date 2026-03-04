import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const MUSICGEN_VERSION = "671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb";

// Genre translation map: Spanish keywords → rich English descriptors for MusicGen
const GENRE_TRANSLATIONS: Record<string, string> = {
  cumbia: "90s Latin cumbia, tropical percussion, accordion melodies, steady cumbia rhythm, bright digital synthesizers, 110 BPM, high quality audio, tropical dance music",
  tecnocumbia: "90s Latin technocumbia, sonidero style, bright digital synthesizers, Korg M1 piano sounds, electronic güira, steady cumbia percussion, 132 BPM, high quality audio, tropical dance music",
  sonidera: "90s Latin technocumbia, sonidero style, bright digital synthesizers, Korg M1 piano sounds, electronic güira, steady cumbia percussion, 132 BPM, high quality audio, tropical dance music",
  reggaeton: "modern reggaeton, dembow rhythm, heavy 808 bass, hi-hat rolls, Latin trap influence, 95 BPM, polished mix, dancehall energy, high quality audio",
  trap: "Latin trap, heavy 808 sub bass, dark hi-hats, snare rolls, atmospheric pads, 140 BPM, high quality audio",
  "hip-hop": "hip-hop boom bap, vinyl crackle, jazzy samples, punchy drums, deep bass, 90 BPM, high quality audio",
  "lo-fi": "lo-fi hip-hop, warm vinyl crackle, mellow jazz chords, soft drums, relaxing atmosphere, 75 BPM, high quality audio",
  pop: "modern pop, catchy melodies, polished production, bright synths, driving beat, 120 BPM, radio-ready, high quality audio",
  rock: "energetic rock, electric guitars, driving drums, bass guitar, powerful energy, 130 BPM, high quality audio",
  edm: "electronic dance music, big room synths, four-on-the-floor kick, build-ups and drops, 128 BPM, festival energy, high quality audio",
  synthwave: "synthwave retro 80s, analog synthesizers, pulsing arpeggios, neon atmosphere, 110 BPM, cinematic, high quality audio",
};

const NEGATIVE_PROMPT = "low quality, distorted, heavy metal, ambient noise, slow, sad, monotone, muddy mix";

/**
 * Translates a Spanish genre input into a rich English prompt for MusicGen.
 * Checks if any known keyword appears in the genre string.
 */
function enhancePrompt(genre: string, description: string): string {
  const genreLower = genre.toLowerCase().trim();

  // Find matching translation
  let englishGenre = "";
  for (const [keyword, translation] of Object.entries(GENRE_TRANSLATIONS)) {
    if (genreLower.includes(keyword)) {
      englishGenre = translation;
      break;
    }
  }

  // Build the enhanced prompt
  const parts: string[] = [];

  if (englishGenre) {
    parts.push(englishGenre);
  } else {
    // Pass the genre as-is if no translation found
    parts.push(genre);
  }

  // Add user description
  parts.push(description);

  // Add negative guidance
  parts.push(`no ${NEGATIVE_PROMPT}`);

  return parts.join(". ");
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
          temperature: 1.0,
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
