import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
const MUSICGEN_VERSION = "b05b1b3142ab1fceeecc2e1365e1c348ede5f3f0b0e528e9004c7e0689f8d66e";

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

    const fullPrompt = `${genre}: ${prompt}`;
    console.log("Iniciando generación...", { genre, prompt: fullPrompt, duration: 15 });

    const createRes = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: MUSICGEN_VERSION,
        input: {
          model_version: "medium",
          prompt: fullPrompt,
          duration: 15,
          output_format: "mp3",
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
