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
      return new Response(
        JSON.stringify({ error: "[CONFIG] REPLICATE_API_TOKEN no configurado en Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { prompt, genre, instrumental, highQuality, lyrics } = await req.json();

    if (!prompt || !genre) {
      return new Response(
        JSON.stringify({ error: "[400] Faltan campos: prompt y género." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fullPrompt = `${genre} style: ${prompt}${!instrumental && lyrics ? `. Lyrics: ${lyrics.substring(0, 200)}` : ""}`;
    const duration = highQuality ? 15 : 8;

    console.log("Iniciando generación...", { genre, duration });

    // Use the stable versioned predictions endpoint
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "b05b1b3142ab1fceeecc2e1365e1c348ede5f3f0b0e528e9004c7e0689f8d66e",
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

      return new Response(
        JSON.stringify({ error: `[${createRes.status}] ${errText.substring(0, 200)}` }),
        { status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let prediction = await createRes.json();

    const MAX_POLLS = 22;
    const POLL_INTERVAL = 4000;

    for (let i = 0; i < MAX_POLLS; i++) {
      if (prediction.status === "succeeded" || prediction.status === "failed" || prediction.status === "canceled") break;
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Bearer ${REPLICATE_TOKEN}` },
      });
      prediction = await pollRes.json();
    }

    if (prediction.status === "failed" || prediction.status === "canceled") {
      console.error("Prediction failed:", prediction.error);
      return new Response(
        JSON.stringify({ error: `[FAILED] ${prediction.error || "Generación falló en Replicate."}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (prediction.status !== "succeeded") {
      return new Response(
        JSON.stringify({ error: "[TIMEOUT] Tiempo agotado tras 88s. Reintenta." }),
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
        JSON.stringify({ error: "[EMPTY] Replicate no devolvió audio. Revisa tu cuenta." }),
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
      JSON.stringify({ error: `[INTERNAL] ${error?.message || "Error desconocido."}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
