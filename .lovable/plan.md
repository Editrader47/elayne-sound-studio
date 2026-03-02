

## Plan: Integrar Replicate MusicGen para generación real de audio

### Contexto
Actualmente la app usa URLs de SoundHelix como placeholders y un servicio mock. El usuario quiere conectar Replicate (modelo `facebook/musicgen`) para generar audio real. No existe un secret `REPLICATE_API_TOKEN` configurado aún.

### Paso 1: Solicitar el API Token de Replicate
- Usar la herramienta `add_secret` para pedir al usuario su `REPLICATE_API_TOKEN` (se obtiene en replicate.com/account/api-tokens).
- **No se puede avanzar con la implementación hasta que el usuario ingrese el secret.**

### Paso 2: Eliminar muestras SoundHelix
- **`src/lib/audio-store.ts`**: Vaciar el array `MOCK_TRACKS` (líneas 74-120). Inicializar `tracks: []`.
- **`src/lib/mock-ai-service.ts`**: Eliminar las URLs de SoundHelix. En vez de devolver audio fake, lanzar un error indicando que el motor de IA no está disponible en modo demo.

### Paso 3: Actualizar Edge Function para Replicate
- **`supabase/functions/generate-music/index.ts`**: Reemplazar la llamada genérica a `api.example.com` con la API de Replicate:
  1. Crear una predicción via `POST https://api.replicate.com/v1/predictions` usando el modelo `facebook/musicgen`.
  2. Implementar **polling** (cada 2-3 segundos) contra `GET /predictions/{id}` hasta que el estado sea `succeeded` o `failed`.
  3. Usar el secret `REPLICATE_API_TOKEN` via `Deno.env.get()`.
  4. Devolver `{ audio_url, title, duration }` al frontend.
  5. Manejar errores (créditos agotados, timeout) con mensajes en español.

### Paso 4: Actualizar servicio frontend
- **`src/services/aiGenerator.ts`**: Ajustar para que si no hay `audio_url` en la respuesta, lance error en vez de crear un track sin audio. Eliminar el fallback a mock.

### Paso 5: Actualizar mensajes de carga
- **`src/components/studio/StudioPanel.tsx`**: Cambiar los mensajes rotativos para incluir "ELAYNE está componiendo tu música original..." como mensaje principal.

### Paso 6: Guardar audio real en DB
- Ya está implementado en `StudioPanel.tsx` via `saveSongToDB()`. Solo hay que confirmar que el `audio_url` real de Replicate se pasa correctamente al track.

### Detalle técnico: Flujo Replicate

```text
Frontend                    Edge Function                Replicate API
   |                            |                            |
   |-- invoke(generate-music) ->|                            |
   |                            |-- POST /predictions ------>|
   |                            |<-- { id, status } ---------|
   |                            |                            |
   |                            |-- GET /predictions/{id} -->|  (poll)
   |                            |<-- { status: processing } -|
   |                            |   ... repeat every 3s ...  |
   |                            |<-- { status: succeeded,    |
   |                            |      output: audio_url } --|
   |                            |                            |
   |<-- { audio_url, title } ---|                            |
```

### Nota sobre `VITE_AI_API_KEY`
El usuario menciona esta variable, pero los secrets del frontend (`VITE_*`) son públicos. El token de Replicate es privado y debe vivir solo en el Edge Function como `REPLICATE_API_TOKEN`. Se le explicará esto al usuario.

