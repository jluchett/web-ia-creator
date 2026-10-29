import dns from 'node:dns';
import { GoogleGenAI } from '@google/genai';
import { setBrandIdentityTool, validateBrandIdentityArgs } from '../tools/brandTools.js';
import {
  setSiteCapabilitiesTool,
  validateSiteCapabilitiesArgs,
  setDynamicContentTool,
  validateDynamicContentArgs
} from '../tools/projectTools.js';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignorar en entornos donde no se permita override de DNS
}

function safeParseArgs(args) {
  if (typeof args === 'string') {
    try {
      return JSON.parse(args);
    } catch {
      return args;
    }
  }
  return args;
}

/**
 * Agente 1: Consultor de Marca y Arquitecto de Prototipos.
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

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  let interaction;
  try {
    interaction = await client.interactions.create({
      model: primaryModel,
      input: inputPrompt,
      tools: [setBrandIdentityTool, setSiteCapabilitiesTool, setDynamicContentTool]
    });
  } catch (err) {
    // Si el modelo principal está bajo alta demanda (503) o temporalmente no disponible, reintentar con gemini-3.5-flash
    if (primaryModel !== 'gemini-3.5-flash' && (err.status === 503 || err.message?.includes('demand') || err.message?.includes('503'))) {
      interaction = await client.interactions.create({
        model: 'gemini-3.5-flash',
        input: inputPrompt,
        tools: [setBrandIdentityTool, setSiteCapabilitiesTool, setDynamicContentTool]
      });
    } else {
      throw err;
    }
  }

  let toolExecuted = null;
  let validatedData = null;
  let reply = interaction.output_text || interaction.text || '';

  for (const step of interaction.steps || []) {
    if (step.type === 'function_call') {
      const parsedArgs = safeParseArgs(step.arguments);
      if (step.name === 'setBrandIdentity') {
        toolExecuted = 'setBrandIdentity';
        validatedData = validateBrandIdentityArgs(parsedArgs);
      } else if (step.name === 'setSiteCapabilities') {
        toolExecuted = 'setSiteCapabilities';
        validatedData = validateSiteCapabilitiesArgs(parsedArgs);
      } else if (step.name === 'setDynamicContent') {
        toolExecuted = 'setDynamicContent';
        validatedData = validateDynamicContentArgs(parsedArgs);
      }
    }
  }

  if (!reply) {
    if (toolExecuted === 'setBrandIdentity') {
      reply = `¡Excelente concepto! He definido la identidad visual y los fundamentos de tu marca para ${validatedData?.project_meta?.business_name || 'tu negocio'}.`;
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
