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

- [ ] **Checkboxes** para activar/desactivar: números, símbolos, mayúsculas, minúsculas
- [ ] **Slider o input numérico** para longitud (rango 4–128)
- [ ] **Exclusión de caracteres ambiguos** (0/O, 1/l/I, etc.)
- [ ] Validación: mostrar error si longitud es insuficiente para tipos seleccionados
- [ ] Almacenar preferencias en `localStorage`

---

## Fase 4 — Modo Passphrase (diccionario)

- [ ] Cargar diccionario de palabras en español/inglés
- [ ] Input para elegir cantidad de palabras (2–12)
- [ ] Opción de separador (guión, espacio, punto, etc.)
- [ ] Opción de capitalizar primera letra de cada palabra
- [ ] Opción de agregar número aleatorio al final
- [ ] Mostrar passphrase generada en mismo formato que contraseña normal

---

## Fase 5 — Botones de Acción

- [ ] Botón **"Generar"**: regenera contraseña con configuración actual
- [ ] Botón **"Copiar"**: copia al portapapeles con `navigator.clipboard.writeText()`
- [ ] Feedback visual al copiar (tooltip "Copiado!" o animación)
- [ ] Atajo de teclado (Ctrl+G para generar, Ctrl+C para copiar)
- [ ] Botón **"Regenerar"** automático al cambiar opciones (opcional, toggle)

---

## Fase 6 — Temas Claro/Oscuro + Historial

- [ ] Implementar theme switcher (claro / oscuro / sistema)
- [ ] Usar variables CSS para colores
- [ ] Persistir preferencia de tema en `localStorage`
- [ ] **Historial local** de contraseñas generadas:
  - Guardar en `localStorage` (máximo 50 entradas)
  - Mostrar lista con: contraseña (enmascarada), fecha, configuración usada
  - Botón para limpiar historial
  - Opción de copiar desde el historial

---

## Fase 7 — Efecto Revelar + Asteriscos

- [ ] Alternar vista de la contraseña entre texto plano y asteriscos (`●`)
- [ ] Animación de "revelado" (transición suave)
- [ ] Botón "ojo" (👁) para mostrar/ocultar
- [ ] Misma funcionalidad para el historial
- [ ] Auto-ocultar después de X segundos (opcional)
- [ ] Toggle en ajustes: "Ocultar contraseñas por defecto"

---

## Bonus (post-MVP)

- [ ] Indicador visual de entropía / fortaleza
- [ ] Exportar historial a CSV/JSON
- [ ] Generar múltiples contraseñas a la vez
- [ ] PWA para uso offline
