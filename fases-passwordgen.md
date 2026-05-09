# Planning: Generador de Contraseñas Seguras

**Stack:** Vue 3 + Vite  
**Path:** `/home/maximo/proyecto_opencode`  
**Repo:** `maxiteyo/proyecto_opencode`

---

## Fase 1 — Estructura + Auto-deploy

- [x] Inicializar proyecto con `npm create vite@latest` (Vue 3 + TypeScript)
- [x] Configurar linter (ESLint + Prettier)
- [x] Estructura de carpetas:
  - `src/components/`
  - `src/composables/`
  - `src/stores/`
  - `src/assets/`
  - `src/types/`
- [x] Configurar auto-deploy con GitHub Pages (`.github/workflows/deploy.yml`)
- [x] README con instrucciones de desarrollo y link a demo

---

## Fase 2 — Generador de Contraseñas (estilo BitWarden)

- [x] Implementar núcleo de generación usando `crypto.getRandomValues()` (CSPRNG)
- [x] Lógica de selección de caracteres:
  - Mayúsculas (A-Z)
  - Minúsculas (a-z)
  - Números (0-9)
  - Símbolos (!@#$%^&*()_+-=[]{}|;:',.<>?/~`)
- [x] Garantizar al menos un carácter de cada tipo seleccionado
- [x] Mostrar contraseña generada en pantalla
- [x] Componente de vista previa tipo BitWarden (input con icono de candado)

---

## Fase 3 — Opciones de Personalización

- [x] **Checkboxes** para activar/desactivar: números, símbolos, mayúsculas, minúsculas
- [x] **Slider o input numérico** para longitud (rango 4–128)
- [x] **Exclusión de caracteres ambiguos** (0/O, 1/l/I, etc.)
- [x] Validación: mostrar error si longitud es insuficiente para tipos seleccionados
- [x] Almacenar preferencias en `localStorage`

---

## Fase 4 — Modo Passphrase (diccionario)

- [x] Cargar diccionario de palabras en español/inglés
- [x] Input para elegir cantidad de palabras (2–12)
- [x] Opción de separador (guión, espacio, punto, etc.)
- [x] Opción de capitalizar primera letra de cada palabra
- [x] Opción de agregar número aleatorio al final
- [x] Mostrar passphrase generada en mismo formato que contraseña normal

---

## Fase 5 — Botones de Acción

- [x] Botón **"Generar"**: regenera contraseña con configuración actual
- [x] Botón **"Copiar"**: copia al portapapeles con `navigator.clipboard.writeText()`
- [x] Feedback visual al copiar (tooltip "Copiado!" o animación)
- [x] Atajo de teclado (Ctrl+G para generar, Ctrl+C para copiar)
- [x] Botón **"Regenerar"** automático al cambiar opciones (opcional, toggle)

---

## Fase 6 — Temas Claro/Oscuro + Historial

- [x] Implementar theme switcher (claro / oscuro / sistema)
- [x] Usar variables CSS para colores
- [x] Persistir preferencia de tema en `localStorage`
- [x] **Historial local** de contraseñas generadas:
  - Guardar en `localStorage` (máximo 50 entradas)
  - Mostrar lista con: contraseña (enmascarada), fecha, configuración usada
  - Botón para limpiar historial
  - Opción de copiar desde el historial

---

## Fase 7 — Efecto Revelar + Asteriscos

- [x] Animación de "revelado" (transición suave)

---

## Bonus (post-MVP)

- [ ] Indicador visual de entropía / fortaleza
- [ ] Exportar historial a CSV/JSON
- [ ] Generar múltiples contraseñas a la vez
- [ ] PWA para uso offline
