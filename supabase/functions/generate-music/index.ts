import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AI_API_KEY = Deno.env.get("AI_MUSIC_API_KEY");

    const { prompt, genre, instrumental, highQuality, engine, lyrics } = await req.json();

    if (!prompt || !genre) {
      return new Response(
        JSON.stringify({ error: "Faltan campos obligatorios: prompt y género." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no API key is configured, return a flag so the client falls back to mock
    if (!AI_API_KEY) {
      console.log("AI_MUSIC_API_KEY not configured – returning mock fallback signal");
      return new Response(
        JSON.stringify({ fallback: true, message: "Motor de IA no configurado. Usando modo demo." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── REAL AI API CALL ───────────────────────────────────────
    // Replace this block with your chosen AI music API (Replicate, Suno, Udio, etc.)
    // The structure below is a template for a generic REST API call.
    //
    // Example for Replicate:
    //   const response = await fetch("https://api.replicate.com/v1/predictions", { ... })
    //
    // Example for Suno:
    //   const response = await fetch("https://api.suno.ai/v1/generate", { ... })
    //
    // Adapt the request body and response parsing to match your provider's spec.
    // ────────────────────────────────────────────────────────────

    const apiResponse = await fetch("https://api.example.com/generate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        genre,
        instrumental,
        high_quality: highQuality,
        engine,
        lyrics: lyrics || undefined,
      }),
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error(`AI API error [${apiResponse.status}]:`, errorBody);

      // Handle common errors
      if (apiResponse.status === 402 || errorBody.includes("credits")) {
        return new Response(
          JSON.stringify({ error: "Sin créditos en el motor de IA. Recarga tu plan del proveedor." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Error de conexión con el motor de IA. Inténtalo de nuevo." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await apiResponse.json();

    // Adapt these fields to match your AI provider's response format
    return new Response(
      JSON.stringify({
        audio_url: result.audio_url || result.output?.audio_url || null,
        title: result.title || null,
        duration: result.duration || null,
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
