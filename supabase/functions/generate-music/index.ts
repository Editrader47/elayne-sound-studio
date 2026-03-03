import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callReplicate(token: string, fullPrompt: string, duration: number) {
  console.log("Enviando prompt a Replicate:", fullPrompt, "| Duración:", duration);

  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "Prefer": "wait",
    },
    body: JSON.stringify({
      version: "671ac645ce5e552cc63a54a2bbff63fcf798043055f2a99f02cd694f32c0e3b0",
      input: {
        model_version: "stereo-melody-large",
        prompt: fullPrompt,
        duration,
        output_format: "mp3",
        normalization_strategy: "peak",
      },
    }),
  });

  console.log("Respuesta de Replicate status:", createRes.status);

  if (!createRes.ok) {
    const errText = await createRes.text();
    console.error(`Replicate create error [${createRes.status}]:`, errText);
    return { ok: false, status: createRes.status, errText };
  }

  let prediction = await createRes.json();
  console.log("Prediction created:", prediction.id, prediction.status);

  // Poll until completed
  const MAX_POLLS = 60;
  let polls = 0;

  while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
    if (polls >= MAX_POLLS) {
      return { ok: false, status: 504, errText: "timeout" };
    }
    await new Promise((r) => setTimeout(r, 3000));
    polls++;

    const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    prediction = await pollRes.json();
    console.log(`Poll ${polls}: status=${prediction.status}`);
  }

  if (prediction.status === "failed" || prediction.status === "canceled") {
    console.error("Prediction failed:", prediction.error);
    return { ok: false, status: 500, errText: prediction.error || "failed" };
  }

  const audioUrl = typeof prediction.output === "string"
    ? prediction.output
    : Array.isArray(prediction.output) && prediction.output.length > 0
      ? prediction.output[0]
      : null;

  return { ok: true, audioUrl, prediction };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");

    const { prompt, genre, instrumental, highQuality, engine, lyrics } = await req.json();

    if (!prompt || !genre) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios: prompt y género." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!REPLICATE_TOKEN) {
      console.error("REPLICATE_API_TOKEN no encontrado en secrets");
      return new Response(
        JSON.stringify({ error: "⚠️ CONFIGURA TU TOKEN EN SECRETS: REPLICATE_API_TOKEN no configurado." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPrompt = `${genre} style: ${prompt}${!instrumental && lyrics ? `. Lyrics: ${lyrics.substring(0, 200)}` : ""}`;
    const primaryDuration = highQuality ? 15 : 8;

    // First attempt
    let result = await callReplicate(REPLICATE_TOKEN, fullPrompt, primaryDuration);

    // Retry with shorter duration on failure (not auth/billing errors)
    if (!result.ok && result.status !== 401 && result.status !== 402 && result.status !== 403) {
      console.log("Primer intento falló, reintentando con duración 8s...");
      result = await callReplicate(REPLICATE_TOKEN, fullPrompt, 8);
    }

    if (!result.ok) {
      const s = result.status;
      if (s === 401 || s === 403) {
        return new Response(
          JSON.stringify({ error: "Token de Replicate inválido. Verifica tu API Token en Secrets." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (s === 402 || (result.errText && (result.errText.includes("billing") || result.errText.includes("payment")))) {
        return new Response(
          JSON.stringify({ error: "Sin créditos en Replicate. Recarga tu cuenta en replicate.com." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Error al conectar con Replicate tras 2 intentos. Inténtalo de nuevo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!result.audioUrl) {
      console.error("No audio URL in output:", result.prediction?.output);
      return new Response(
        JSON.stringify({ error: "IA ocupada o Token inválido. Revisa la consola de desarrollador." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        audio_url: result.audioUrl,
        title: null,
        duration: primaryDuration,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor. Inténtalo de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
