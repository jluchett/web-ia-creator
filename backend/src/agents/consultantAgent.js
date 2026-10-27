import { GoogleGenAI } from '@google/genai';
import { setBrandIdentityTool, validateBrandIdentityArgs } from '../tools/brandTools.js';

/**
 * Agente 1: Consultor de Marca (gemini-3.8-flash).
 * Interactúa con el usuario y ejecuta Function Calling para definir la identidad de marca (Nivel 1).
 *
 * @param {object} params
 * @param {string} params.message Mensaje del usuario
 * @param {object} params.currentMasterJson Estado actual del JSON Maestro del proyecto
 * @returns {Promise<{ reply: string, tool_executed: string|null, validated_data: object|null }>}
 */
export async function runConsultantAgent({ message, currentMasterJson = {} }) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemContext = `Eres el Agente 1: Consultor de Marca de WebCreator AI. Tu misión es guiar al usuario en el Nivel 1 (ADN & Marca).
Cuando tengas suficiente información sobre el negocio (nombre, sector, audiencia, tono, colores y tipografía), invoca la herramienta 'setBrandIdentity' con valores hexadecimales válidos (#RRGGBB).`;

  const inputPrompt = `${systemContext}\n\nEstado actual del proyecto:\n${JSON.stringify(currentMasterJson)}\n\nUsuario: ${message}`;

  const interaction = await client.interactions.create({
    model: 'gemini-3.8-flash',
    input: inputPrompt,
    tools: [setBrandIdentityTool]
  });

  let toolExecuted = null;
  let validatedData = null;
  let reply = interaction.text || '';

  for (const step of interaction.steps || []) {
    if (step.type === 'function_call' && step.name === 'setBrandIdentity') {
      toolExecuted = 'setBrandIdentity';
      // Validación perimetral SDD estricta (Zod)
      // Si el LLM alucinó un formato inválido, lanzará ZodError aquí para evitar corrupción de BD
      validatedData = validateBrandIdentityArgs(step.arguments);
    }
  }

  if (!reply) {
    reply = toolExecuted
      ? '¡Excelente! He definido la identidad visual y los fundamentos de tu marca.'
      : 'Cuéntame más sobre tu negocio para definir la identidad de marca ideal.';
  }

  return {
    reply,
    tool_executed: toolExecuted,
    validated_data: validatedData
  };
}
