

## Plan: Desbloquear inputs del Studio y renombrar motores

### Cambios en `src/components/studio/StudioPanel.tsx`

1. **Reemplazar Select de Género por Input de texto libre**
   - Eliminar el `<Select>` dropdown (líneas 170-188) y reemplazarlo con un `<Input type="text">` que permita escribir cualquier estilo (ej: "Tecnocumbia Sonidera 132 BPM").
   - Placeholder: `"Ej: Tecnocumbia sonidera, Reggaeton, Synthwave 130 BPM..."`.
   - Debajo del input, agregar quick-tag buttons con los géneros populares (Reggaeton, Rock, Lo-fi, Trap, Pop, etc.) que al hacer clic rellenen el input.
   - Mantener estilo glassmorphism: `bg-secondary/50 border-border/40`.

2. **Textarea sin restricciones**
   - Confirmar que no hay `maxLength` en el textarea de prompt (no lo hay actualmente, solo verificar).
   - Cambiar placeholder a: `"Describe tu ritmo aquí... Ej: Beat de tecnocumbia sonidera con sintetizadores brillantes y bajo pesado"`.

3. **Eliminar import de Select** ya que no se usará más.

4. **Eliminar la constante `GENRES`** (ya no necesaria como array cerrado, se convierte en quick-tags).

### Cambios en `src/components/studio/EngineToggle.tsx`

5. **Renombrar labels de motores**
   - "Rápido" → "Modo Rápido"
   - "Fidelidad Pro" → "Modo Pro"

### Cambios en `src/components/studio/StudioPanel.tsx` (botón)

6. **Renombrar texto del botón**
   - Cambiar "Generar" a "Generar Magia" en el botón.

### Sin cambios en backend
- El `generateMusic` service ya envía `genre` como string libre al Edge Function. No requiere modificación.

