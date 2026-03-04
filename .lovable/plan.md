

## Diagnóstico

El error de los logs es claro:

```
"version is required"
"Additional property model is not allowed"
```

El endpoint `/v1/predictions` **no acepta** el campo `model`. Requiere el campo `version` con el hash del modelo. El código actual envía `model: "meta/musicgen"` lo cual es rechazado con 422.

## Plan: Reescribir Edge Function desde cero

Un solo cambio en `supabase/functions/generate-music/index.ts` — reemplazar el body del request:

**Antes (incorrecto):**
```json
{
  "model": "meta/musicgen",
  "input": { "model_version": "medium", "prompt": "...", "duration": 15, "output_format": "mp3" }
}
```

**Después (correcto para `/v1/predictions`):**
```json
{
  "version": "b05b1b3142ab1fceeecc2e1365e1c348ede5f3f0b0e528e9004c7e0689f8d66e",
  "input": { "model_version": "medium", "prompt": "...", "duration": 15, "output_format": "mp3" }
}
```

El version hash `b05b1b3142ab1fceeecc2e1365e1c348ede5f3f0b0e528e9004c7e0689f8d66e` es el oficial de `meta/musicgen` medium en Replicate.

### Cambios específicos

1. **`supabase/functions/generate-music/index.ts`** — Reescribir completo:
   - Quitar `model: "meta/musicgen"`, usar `version: "b05b1b3142ab1fceeecc2e1365e1c348ede5f3f0b0e528e9004c7e0689f8d66e"`
   - Quitar header `Prefer: wait=60` (puede causar timeouts en edge functions)
   - Mantener polling de 5s × 20 intentos
   - Mantener validación de token `r8_`
   - Mantener manejo de errores 401/402 con mensajes claros
   - Mantener CORS headers

2. **Redesplegar** la Edge Function tras el cambio.

No hay cambios en frontend — el problema es exclusivamente el formato del request a Replicate.

