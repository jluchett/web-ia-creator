# WebCreator AI - Reglas Globales (SDD + TDD)
Plataforma conversacional y gamificada de prototipado web con interfaz de dos paneles (Chat Izquierdo / Live Canvas Derecho).

## Metodología de Trabajo Obligatoria
1. **Spec-Driven (SDD):** Ningún endpoint o componente se crea sin validar primero su contrato en `/shared/masterJson.schema.js`.
2. **Test-Driven (TDD):** Para toda lógica nueva, escribe primero el test en `*.test.js`, verifica que falle (Fase RED), implementa el código mínimo para que pase (Fase GREEN) y refactoriza.
3. **Stack Estricto:** Frontend en React + Vite + CSS Modules (sin Tailwind en la plataforma). Prototipo aislado en `<iframe sandbox="allow-scripts">`. Backend en Node.js + MongoDB Atlas + SDK `@google/genai` (`gemini-3.8-flash`, `gemini-4-argon`, `gemini-nano-banana-2.1`).