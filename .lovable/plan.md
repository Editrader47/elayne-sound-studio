

## Plan: Motor de Prompts de Ingeniería Musical + UI Dinámica

### Cambios en `supabase/functions/generate-music/index.ts`

**1. Nuevo diccionario de instrumentación** — Reemplazar `GENRE_TRANSLATIONS` con mapeo más rico:
- **Cumbia/Tecnocumbia/Sonidera**: "analog synthesizer leads, iconic 90s digital cowbell, syncopated electronic bass, crisp güira, high-energy tropical percussion, 132 BPM"
- **Reggaeton/Urbano**: "aggressive dembow riddim, punchy kick drum, heavy sub-bass (808), crisp snares, modern club atmosphere, 90-95 BPM"
- **Salsa/Tropical**: "authentic piano montuno, sharp brass section (trumpets/trombones), syncopated congas and timbales, energetic clave rhythm, 180 BPM"
- **Rock**: "overdriven electric guitars, multi-layered drum kit, thick bass guitar, stadium reverb"
- Mantener los demás géneros existentes (Trap, Hip-Hop, Lo-fi, Pop, EDM, Synthwave)

**2. Nueva función `enhancePrompt`** — Estructura de productor:
```
"A professional [GENRE] studio recording. Features: [DESCRIPTION]. [INSTRUMENTATION]. 
High-fidelity audio, 44.1kHz, master quality, rich textures, perfectly balanced mix, 
dynamic range. Clear percussion, defined bassline, atmospheric depth. 
No: low quality, distorted, muffled, mono, static, white noise, out of tune, weak drums, amateur recording"
```

**3. Nuevo parámetro Replicate**: Añadir `classifier_free_guidance: 5.0` al input JSON (junto con los existentes `top_k: 250`, `temperature: 1.0`).

**4. Negative prompt actualizado**: "low quality, distorted, muffled, mono, static, white noise, out of tune, weak drums, amateur recording"

### Cambios en `src/components/studio/StudioPanel.tsx`

**5. Mensaje dinámico de loading**: Cambiar el primer mensaje a `"Analizando estructura rítmica para ${studioGenre}..."` usando el género actual del usuario. Mantener los demás mensajes rotativos.

### Despliegue
- Redesplegar la Edge Function `generate-music`.

No hay cambios en base de datos ni en frontend service layer.

