<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/🔐_Password_Generator-6366f1?style=for-the-badge">
    <img alt="Password Generator" src="https://img.shields.io/badge/🔐_Password_Generator-6366f1?style=for-the-badge">
  </picture>
</p>

<p align="center">
  Generador de contraseñas seguras y passphrases con interfaz estilo BitWarden.<br>
  Construido con <strong>Vue 3 + TypeScript + Vite</strong>.
</p>

<p align="center">
  <a href="https://maxiteyo.github.io/proyecto_opencode/">🌐 Demo en vivo</a>
  &nbsp;·&nbsp;
  <img src="https://img.shields.io/badge/Vue_3-4FC08D?logo=vue.js&logoColor=fff" alt="Vue 3">
  &nbsp;
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript">
  &nbsp;
  <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff" alt="Vite">
  &nbsp;
  <img src="https://img.shields.io/badge/GitHub_Pages-222?logo=github" alt="GitHub Pages">
</p>

---

## ✨ Funcionalidades

| Característica | Descripción |
|---|---|
| **Modo Contraseña** | Generación CSPRNG con `crypto.getRandomValues()`, selección de mayúsculas, minúsculas, números y símbolos |
| **Modo Passphrase** | Frases memorables de 2 a 12 palabras con diccionario bilingüe (ES/EN), separador configurable, capitalización y número aleatorio |
| **Personalización** | Slider de longitud (4–128), exclusión de caracteres ambiguos, regeneración automática al cambiar opciones |
| **Indicador de fortaleza** | Barra de entropía con escala visual: Débil → Regular → Buena → Fuerte → Muy fuerte |
| **Copiado rápido** | Botón con feedback visual + atajos de teclado (`Ctrl+G` generar, `Ctrl+C` copiar) |
| **Historial local** | Últimas 50 contraseñas con máscara, fecha, configuración; paginación, revelar, copiar y eliminar individualmente |
| **Exportación** | Descarga del historial completo en formato CSV o JSON |
| **Temas** | Claro / Oscuro / Sistema, con persistencia en `localStorage` |
| **Animaciones** | Transiciones suaves en revelado de contraseñas del historial |

---

## 🚀 Demo

👉 **[https://maxiteyo.github.io/proyecto_opencode/](https://maxiteyo.github.io/proyecto_opencode/)**

---

## 🛠️ Stack

- **Framework:** Vue 3 (Composition API + `<script setup>`)
- **Lenguaje:** TypeScript
- **Build:** Vite
- **Linter:** ESLint + Prettier
- **Despliegue:** GitHub Pages (auto-deploy via GitHub Actions en push a `main`)
- **CSPRNG:** `crypto.getRandomValues()` nativo del navegador

---

## 📦 Instalación y uso

```bash
# Clonar el repositorio
git clone git@github.com:maxiteyo/proyecto_opencode.git
cd proyecto_opencode

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) en el navegador.

---

## 📜 Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo con HMR |
| `npm run build` | Compilación TypeScript + build de producción |
| `npm run preview` | Vista previa del build de producción |
| `npm run lint` | Análisis estático con ESLint |
| `npm run format` | Formateo automático con Prettier |

---

## 🗂️ Estructura del proyecto

```
src/
├── components/
│   └── PasswordGenerator.vue    # Componente principal
├── composables/
│   ├── usePasswordGenerator.ts  # Lógica de generación de contraseñas
│   ├── usePassphraseGenerator.ts # Lógica de generación de passphrases
│   ├── useTheme.ts              # Gestión de temas claro/oscuro
│   └── usePasswordHistory.ts    # Historial con localStorage
├── data/
│   └── words.ts                 # Diccionario de palabras (ES/EN)
├── types/
│   ├── password.ts              # Tipos para opciones de contraseña
│   └── history.ts               # Tipos para entradas del historial
├── assets/
├── style.css                    # Variables CSS globales y temas
├── main.ts                      # Punto de entrada
└── App.vue                      # Componente raíz
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abrí un *issue* para discutir cambios importantes antes de enviar un PR.

---

## 📄 Licencia

[MIT](LICENSE)
