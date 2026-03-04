import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const REPLICATE_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");

    if (!REPLICATE_TOKEN) {
      console.error("Token faltante: REPLICATE_API_TOKEN no configurado.");
      return new Response(
        JSON.stringify({ error: "Token faltante: REPLICATE_API_TOKEN no configurado en Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, genre, instrumental, highQuality, lyrics } = await req.json();

    if (!prompt || !genre) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios: prompt y género." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPrompt = `${genre} style: ${prompt}${!instrumental && lyrics ? `. Lyrics: ${lyrics.substring(0, 200)}` : ""}`;
    const duration = highQuality ? 15 : 8;

    console.log("Iniciando generación...", { genre, duration });

    // Create prediction using official model
    const createRes = await fetch("https://api.replicate.com/v1/models/meta/musicgen/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: {
          model_version: "medium",
          prompt: fullPrompt,
          duration,
          output_format: "mp3",
          normalization_strategy: "peak",
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error(`Replicate error [${createRes.status}]:`, errText);

      if (createRes.status === 401 || createRes.status === 403) {
        return new Response(
          JSON.stringify({ error: "Token de API inválido o mal copiado. Verifica REPLICATE_API_TOKEN." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (createRes.status === 402 || errText.includes("billing") || errText.includes("payment")) {
        return new Response(
          JSON.stringify({ error: "Saldo insuficiente en Replicate. Recarga en replicate.com/account/billing." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (createRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Demasiadas solicitudes. Espera unos segundos e inténtalo de nuevo." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Error al conectar con Replicate. Inténtalo de nuevo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prediction = await createRes.json();

    // Poll every 4s, max 20 attempts (80s total)
    const MAX_POLLS = 20;
    const POLL_INTERVAL = 4000;

    for (let i = 0; i < MAX_POLLS; i++) {
      if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") {
        break;
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Bearer ${REPLICATE_TOKEN}` },
      });
      prediction = await pollRes.json();
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("Prediction failed:", prediction.error);
      return new Response(
        JSON.stringify({ error: "La generación falló en Replicate. Inténtalo de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prediction.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "Tiempo de espera agotado. Inténtalo de nuevo." }),
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
        JSON.stringify({ error: "No se recibió audio. Revisa tu cuenta en Replicate." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Audio recibido:", audioUrl);

    return new Response(
      JSON.stringify({ audio_url: audioUrl, title: null, duration }),
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
