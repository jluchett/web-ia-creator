---
trigger: glob
globs: ["frontend/**"]
description: Reglas exclusivas para el Sub-Agente de Frontend (React + Vite + CSS Modules)
---
# Reglas de Frontend (Plataforma Principal)
- **Estilos:** Usa exclusivamente **CSS Modules** (`*.module.css`). PROHIBIDO instalar o usar Tailwind CSS en la interfaz de la plataforma (Tailwind solo se inyectará vía CDN dentro del iframe en el Módulo 4).
- **Layout:** Diseño responsive desktop-first dividido en 2 paneles: Panel Izquierdo (`ChatPanel`) y Panel Derecho (`LiveCanvas`)[cite: 1].
- **TDD en Frontend:** Todo componente estructural debe tener su test unitario en Vitest + `@testing-library/react` verificando que renderiza los estados del `master_json`[cite: 1].