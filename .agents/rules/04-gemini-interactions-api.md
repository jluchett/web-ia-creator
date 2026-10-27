---
trigger: glob
globs: ["backend/**"]
description: Sintaxis exacta del SDK @google/genai e Interactions API para Agente 1
---
# Patrón Oficial de @google/genai (Interactions API)

Usa siempre este patrón para el Agente 1 (`gemini-3.8-flash`):

```javascript
import { GoogleGenAI } from '@google/genai';

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Declaración de herramienta para Function Calling
const setBrandIdentityTool = {
  type: 'function',
  name: 'setBrandIdentity',
  description: 'Define o actualiza la identidad de marca (metadatos, colores hex y tipografía) del Nivel 1.',
  parameters: {
    type: 'object',
    properties: {
      project_meta: {
        type: 'object',
        properties: {
          business_name: { type: 'string' },
          sector: { type: 'string' },
          target_audience: { type: 'string' },
          tone_of_voice: { type: 'string' },
          project_type: { type: 'string', enum: ['e_commerce_light', 'landing_services', 'booking', 'portfolio'] },
          primary_action: { type: 'string' }
        },
        required: ['business_name', 'sector', 'target_audience', 'tone_of_voice', 'project_type', 'primary_action']
      },
      branding: {
        type: 'object',
        properties: {
          colors: {
            type: 'object',
            properties: {
              primary: { type: 'string', description: 'Hex color ej. #4A2E1B' },
              secondary: { type: 'string' },
              accent: { type: 'string' },
              background: { type: 'string' },
              text: { type: 'string' }
            },
            required: ['primary', 'secondary', 'accent', 'background', 'text']
          },
          typography: {
            type: 'object',
            properties: {
              headings: { type: 'string' },
              body: { type: 'string' }
            },
            required: ['headings', 'body']
          }
        },
        required: ['colors', 'typography']
      }
    },
    required: ['project_meta', 'branding']
  }
};

// Llamada a la API e inspección de steps
const interaction = await client.interactions.create({
  model: 'gemini-3.8-flash',
  input: userMessage,
  tools: [setBrandIdentityTool]
});

for (const step of interaction.steps || []) {
  if (step.type === 'function_call') {
    // step.name y step.arguments contienen la invocación
  }
}