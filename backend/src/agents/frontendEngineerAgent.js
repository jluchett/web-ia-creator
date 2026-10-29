import dns from 'node:dns';
import { GoogleGenAI, Type } from '@google/genai';
import { PrototypeOutputSchema } from '@webcreator/shared';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignorar en entornos donde no se permita override de DNS
}

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const FRONTEND_ENGINEER_SYSTEM_PROMPT = `
Eres un Ingeniero Frontend Senior especialista en UI/UX, arquitectura web y diseño de conversión.
Recibirás un master_json completo con la especificación visual y estructural de un negocio.
Tu misión es generar un prototipo web interactivo de una sola página (SPA simulada) de altísima calidad visual.

REGLAS ARQUITECTÓNICAS ESTRICTAS:
1. Estilos con Tailwind CSS y Variables de Marca:
   El entorno de ejecución ya incluye Tailwind CSS vía CDN y tiene preconfiguradas las siguientes clases utilitarias conectadas a CSS Variables (:root):
   - 'bg-brand-primary', 'text-brand-primary'
   - 'bg-brand-secondary', 'text-brand-secondary'
   - 'bg-brand-accent', 'text-brand-accent'
   - 'bg-brand-bg', 'text-brand-bg'
   - 'text-brand-text'
   - 'font-heading', 'font-body'
   Úsalas extensivamente para que el prototipo reaccione instantáneamente al selector de marca.

2. Cero Imágenes Rotas:
   Usa exclusivamente las URLs ya provistas en el master_json:
   - dynamic_content.hero.hero_image_url
   - dynamic_content.products[].resolved_image_url
   - branding.logo_url
   PROHIBIDO inventar dominios o URLs de imágenes no existentes.

3. Interactividad Realista en Vanilla JS:
   - Si capabilities.has_cart es true, implementa un drawer lateral de carrito en memoria que sume productos, calcule subtotales y permita vaciar o simular checkout.
   - Si capabilities.has_whatsapp_checkout es true, el botón de checkout debe generar un enlace o modal simulado con el resumen de la orden listo para enviar a WhatsApp.
   - Si capabilities.has_booking o has_custom_form son true, el formulario debe prevenir recarga (e.preventDefault()) y mostrar un modal de confirmación elegante.
   - Si capabilities.has_faq_accordion es true, implementa comportamiento interactivo de acordeón (abrir/cerrar respuesta al hacer click).

4. Formato de Salida Estructurado:
   - html_body: Solo el contenido interno del <body> (no incluyas <!DOCTYPE>, <html>, <head> o <body> tags).
   - custom_css: Reglas CSS complementarias mínimas únicamente para animaciones clave, scrollbars estilizados o transiciones del drawer.
   - vanilla_js: Código JavaScript sin librerías externas que orquesta la interactividad completa del DOM.
`.trim();

/**
 * Invoca al Agente 2 (Ingeniero Frontend) para compilar el prototipo web.
 * Utiliza Structured Outputs de @google/genai con gemini-3.8-flash (o gemini-4-argon).
 * 
 * @param {Object} params
 * @param {Object} params.masterJson - Especificación completa del proyecto
 * @param {boolean} [params.useFlagshipModel=false] - Si es true, usa gemini-4-argon
 * @returns {Promise<{ html_body: string, custom_css: string, vanilla_js: string, model_used: string }>}
 */
export async function generatePrototypeCode({ masterJson, useFlagshipModel = false }) {
  const targetModel = useFlagshipModel ? 'gemini-4-argon' : 'gemini-3.8-flash';

  const promptContents = `Genera el prototipo web interactivo completo para el siguiente JSON Maestro:\n${JSON.stringify(masterJson, null, 2)}`;

  const generateConfig = {
    systemInstruction: FRONTEND_ENGINEER_SYSTEM_PROMPT,
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        html_body: {
          type: Type.STRING,
          description: 'Código HTML interno del <body> con clases utilitarias de Tailwind y las URLs de imágenes reales.'
        },
        custom_css: {
          type: Type.STRING,
          description: 'Reglas CSS complementarias únicamente para animaciones y transiciones.'
        },
        vanilla_js: {
          type: Type.STRING,
          description: 'Código JavaScript Vanilla funcional para carritos, modales, acordeones y checkout.'
        }
      },
      required: ['html_body', 'custom_css', 'vanilla_js']
    }
  };

  let response;
  let finalModel = targetModel;
  try {
    response = await client.models.generateContent({
      model: targetModel,
      contents: promptContents,
      config: generateConfig
    });
  } catch (err) {
    if (err.status === 503 || err.message?.includes('demand') || err.message?.includes('503')) {
      finalModel = 'gemini-3.5-flash';
      response = await client.models.generateContent({
        model: finalModel,
        contents: promptContents,
        config: generateConfig
      });
    } else {
      throw err;
    }
  }

  let rawJson;
  try {
    rawJson = typeof response.text === 'string' ? JSON.parse(response.text) : response.text;
  } catch (parseError) {
    throw new Error(`Respuesta no parseable de Gemini: ${parseError.message}`);
  }

  // Validación estricta con SDD
  const validatedOutput = PrototypeOutputSchema.parse(rawJson);

  return {
    ...validatedOutput,
    model_used: finalModel
  };
}
