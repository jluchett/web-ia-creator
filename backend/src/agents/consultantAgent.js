import { GoogleGenAI } from '@google/genai';
import { setBrandIdentityTool, validateBrandIdentityArgs } from '../tools/brandTools.js';
import {
  setSiteCapabilitiesTool,
  validateSiteCapabilitiesArgs,
  setDynamicContentTool,
  validateDynamicContentArgs
} from '../tools/projectTools.js';

/**
 * Agente 1: Consultor de Marca y Arquitecto de Prototipos (gemini-3.8-flash).
 * Interactúa con el usuario y ejecuta Function Calling para definir:
 * - Nivel 1: ADN & Marca (setBrandIdentity)
 * - Nivel 2: Superpoderes & Módulos (setSiteCapabilities)
 * - Nivel 3: Contenidos, Copy & Catálogo (setDynamicContent)
 *
 * @param {object} params
 * @param {string} params.message Mensaje del usuario
 * @param {object} params.currentMasterJson Estado actual del JSON Maestro del proyecto
 * @returns {Promise<{ reply: string, tool_executed: string|null, validated_data: object|null }>}
 */
export async function runConsultantAgent({ message, currentMasterJson = {} }) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const systemContext = `Eres el Agente 1: Consultor de Marca y Arquitectura Web de WebCreator AI.
Tu misión es guiar al usuario a través de las 3 primeras misiones:
1. Nivel 1 (ADN & Marca): Invoca 'setBrandIdentity' con colores hexadecimales (#RRGGBB) y tipografía.
2. Nivel 2 (Estructura & Superpoderes): Invoca 'setSiteCapabilities' configurando booleanos para carrito, WhatsApp, reservas, formulario y FAQs.
3. Nivel 3 (Contenidos & Catálogo): Invoca 'setDynamicContent' con hero, productos y faqs. Usa palabras clave descriptivas en inglés (hero_image_keyword, image_keyword) y NUNCA enlaces o URLs directas.`;

  const inputPrompt = `${systemContext}\n\nEstado actual del proyecto:\n${JSON.stringify(currentMasterJson)}\n\nUsuario: ${message}`;

  const interaction = await client.interactions.create({
    model: 'gemini-3.8-flash',
    input: inputPrompt,
    tools: [setBrandIdentityTool, setSiteCapabilitiesTool, setDynamicContentTool]
  });

  let toolExecuted = null;
  let validatedData = null;
  let reply = interaction.text || '';

  for (const step of interaction.steps || []) {
    if (step.type === 'function_call') {
      if (step.name === 'setBrandIdentity') {
        toolExecuted = 'setBrandIdentity';
        validatedData = validateBrandIdentityArgs(step.arguments);
      } else if (step.name === 'setSiteCapabilities') {
        toolExecuted = 'setSiteCapabilities';
        validatedData = validateSiteCapabilitiesArgs(step.arguments);
      } else if (step.name === 'setDynamicContent') {
        toolExecuted = 'setDynamicContent';
        validatedData = validateDynamicContentArgs(step.arguments);
      }
    }
  }

  if (!reply) {
    if (toolExecuted === 'setBrandIdentity') {
      reply = '¡Excelente! He definido la identidad visual y los fundamentos de tu marca.';
    } else if (toolExecuted === 'setSiteCapabilities') {
      reply = '¡Superpoderes activados! Hemos configurado los módulos interactivos de tu sitio.';
    } else if (toolExecuted === 'setDynamicContent') {
      reply = '¡Contenido definido! He generado los textos y seleccionado las mejores referencias visuales para tu catálogo.';
    } else {
      reply = 'Cuéntame más sobre tu proyecto para continuar construyendo tu sitio web.';
    }
  }

  return {
    reply,
    tool_executed: toolExecuted,
    validated_data: validatedData
  };
}
