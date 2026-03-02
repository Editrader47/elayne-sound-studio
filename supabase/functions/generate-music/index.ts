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

    const { prompt, genre, instrumental, highQuality, engine, lyrics } = await req.json();

    if (!prompt || !genre) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios: prompt y género." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!REPLICATE_TOKEN) {
      return new Response(
        JSON.stringify({ error: "REPLICATE_API_TOKEN no configurado. Añade tu token en los secrets del proyecto." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the full prompt
    const fullPrompt = `${genre} style: ${prompt}${!instrumental && lyrics ? `. Lyrics: ${lyrics.substring(0, 200)}` : ""}`;

    // Create prediction
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait",
      },
      body: JSON.stringify({
        version: "671ac645ce5e552cc63a54a2bbff63fcf798043055f2a99f02cd694f32c0e3b0",
        input: {
          model_version: "stereo-melody-large",
          prompt: fullPrompt,
          duration: highQuality ? 15 : 8,
          output_format: "mp3",
          normalization_strategy: "peak",
        },
      }),
    });

    if (!createRes.ok) {
      const errText = await createRes.text();
      console.error(`Replicate create error [${createRes.status}]:`, errText);

      if (createRes.status === 401 || createRes.status === 403) {
        return new Response(
          JSON.stringify({ error: "Token de Replicate inválido. Verifica tu API Token." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (createRes.status === 402 || errText.includes("billing") || errText.includes("payment")) {
        return new Response(
          JSON.stringify({ error: "Sin créditos en Replicate. Recarga tu cuenta en replicate.com." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Error al conectar con Replicate. Inténtalo de nuevo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prediction = await createRes.json();
    console.log("Prediction created:", prediction.id, prediction.status);

    // Poll until completed (the "Prefer: wait" header should handle most cases,
    // but we poll as fallback if status is not terminal)
    const MAX_POLLS = 60; // ~3 minutes max
    let polls = 0;

    while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
      if (polls >= MAX_POLLS) {
        return new Response(
          JSON.stringify({ error: "La generación tardó demasiado. Inténtalo de nuevo con un prompt más corto." }),
          { status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await new Promise((r) => setTimeout(r, 3000));
      polls++;

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Bearer ${REPLICATE_TOKEN}` },
      });
      prediction = await pollRes.json();
      console.log(`Poll ${polls}: status=${prediction.status}`);
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("Prediction failed:", prediction.error);
      return new Response(
        JSON.stringify({ error: prediction.error || "La generación falló. Inténtalo con otro prompt." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract audio URL from output
    const audioUrl = typeof prediction.output === "string"
      ? prediction.output
      : Array.isArray(prediction.output)
        ? prediction.output[0]
        : null;

    if (!audioUrl) {
      console.error("No audio URL in output:", prediction.output);
      return new Response(
        JSON.stringify({ error: "No se recibió audio del modelo. Inténtalo de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        audio_url: audioUrl,
        title: null,
        duration: highQuality ? 15 : 8,
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
