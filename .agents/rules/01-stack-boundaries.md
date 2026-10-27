---
trigger: always_on
description: Restricciones críticas de librerías y arquitectura
---
- PROHIBIDO usar `@google/generative-ai` o modelos antiguos (`gemini-1.5-pro`, `gemini-2.0-flash`). Usa siempre `@google/genai`.
- PROHIBIDO que el LLM genere URLs directas de Unsplash en el JSON Maestro; debe usar keywords en inglés (`image_keyword`).