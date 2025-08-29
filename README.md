# Reloj + Clima — SPA React + Vite + TS + Tailwind v4

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=061a23&labelColor=061a23)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=061a23&labelColor=061a23)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=061a23&labelColor=061a23)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38BDF8?logo=tailwindcss&logoColor=061a23&labelColor=061a23)

SPA que muestra **hora/fecha**, **ubicación** (vía GPS del dispositivo) y **clima** (Open-Meteo), con un **fondo Canvas animado** (gradiente + blobs) que cambia de color según el “mood” (hora del día/condición/estación) o una **paleta** elegible por el usuario.

## ✨ Features
- ⏰ Reloj en tiempo real (hook `useClock`)
- 📍 Ubicación por GPS (hook `useGeolocation`, respetando permisos)
- 🌦️ Clima actual con **Open-Meteo** (`useWeather` con cache + dedupe)
- 🎨 Paletas: **Auto (clima)** + **Cálido / Frío / Neutro / Locos / Pastel**
- 🖼️ Fondo **Canvas** animado con control de velocidad y **FPS cap**
- ♿ Accesible (combobox ARIA, respeta `prefers-reduced-motion`)
- 📱 Responsive + UI consistente (Panel reusable)

## 🧱 Stack & convenciones
- **React** + **Vite** + **TypeScript**
- **TailwindCSS v4** con **@tailwindcss/postcss** (nuevo pipeline)
- Fuentes: **Sora** (títulos) + **Inter** (texto)
- Estructura:
src/
components/ # UI (Panel, Clock, WeatherPanel, etc.)
lib/ # hooks y lógica (useClock, useGeolocation, useWeather, mood, palettes)
styles/ # CSS utilitario (skeletons, etc.)

shell
Copiar código

## 🚀 Arranque rápido
```bash
# 1) Instalar deps
npm i

# 2) Dev server
npm run dev

# 3) Build
npm run build
Requisitos: Node 18+.

🧩 Scripts útiles
npm run dev — entorno de desarrollo

npm run build — build de producción

npm run preview — sirve el build localmente

🔐 Permisos
La app solicita ubicación para mostrar el clima. Podés permitirla desde el prompt del navegador o cambiarlo desde el candado del sitio.

🧭 Notas técnicas
useWeather evita fetches duplicados para la misma coordenada (mem cache + promesas en curso).

El Canvas se adapta a DPR y limita FPS para rendimiento.

Si el usuario prefiere reducir movimiento, el fondo queda estático (gradiente).

MIT © 2025



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
