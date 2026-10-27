import { GoogleGenAI } from '@google/genai';
import { z, ProjectMetaSchema, BrandingSchema } from '@webcreator/shared';

/**
 * Esquema Zod para validar la invocación de la herramienta setBrandIdentity (SDD estricto).
 */
export const BrandIdentityToolArgsSchema = z.object({
  project_meta: ProjectMetaSchema,
  branding: BrandingSchema
});

/**
 * Declaración de herramienta para la Interactions API de @google/genai
 */
export const setBrandIdentityTool = {
  type: 'function',
  name: 'setBrandIdentity',
  description: 'Define o actualiza la identidad de marca (metadatos, colores hex y tipografía) del Nivel 1.',
  parameters: {
    type: 'object',
    properties: {
      project_meta: {
        type: 'object',
        properties: {
          business_name: { type: 'string', description: 'Nombre comercial del negocio' },
          sector: { type: 'string', description: 'Industria o nicho del negocio' },
          target_audience: { type: 'string', description: 'Público objetivo' },
          tone_of_voice: { type: 'string', description: 'Personalidad y tono de comunicación' },
          project_type: {
            type: 'string',
            enum: ['e_commerce_light', 'landing_services', 'booking', 'portfolio'],
            description: 'Tipo de arquitectura del proyecto'
          },
          primary_action: { type: 'string', description: 'Acción principal esperada del usuario' }
        },
        required: [
          'business_name',
          'sector',
          'target_audience',
          'tone_of_voice',
          'project_type',
          'primary_action'
        ]
      },
      branding: {
        type: 'object',
        properties: {
          colors: {
            type: 'object',
            properties: {
              primary: { type: 'string', description: 'Hex color ej. #4A2E1B' },
              secondary: { type: 'string', description: 'Hex color ej. #D4A373' },
              accent: { type: 'string', description: 'Hex color ej. #FAEDCD' },
              background: { type: 'string', description: 'Hex color ej. #FEFAE0' },
              text: { type: 'string', description: 'Hex color ej. #283618' }
            },
            required: ['primary', 'secondary', 'accent', 'background', 'text']
          },
          typography: {
            type: 'object',
            properties: {
              headings: { type: 'string', description: 'Nombre de Google Fonts para títulos' },
              body: { type: 'string', description: 'Nombre de Google Fonts para cuerpo' }
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

/**
 * Valida los argumentos de la tool contra los esquemas SDD de @webcreator/shared.
 * @param {object} args
 * @returns {object} Datos validados
 * @throws {z.ZodError} Si la validación falla
 */
export function validateBrandIdentityArgs(args) {
  return BrandIdentityToolArgsSchema.parse(args);
}

/**
 * Generador de 3 conceptos y opciones de logotipo usando gemini-nano-banana-2.1.
 * @param {object} params
 * @param {string} params.businessName
 * @param {string} params.sector
 * @param {string} params.primaryColor
 * @returns {Promise<Array<{ id: string, concept: string, style: string, preview_url: string }>>}
 */
export async function generateLogoOptions({ businessName, sector, primaryColor }) {
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = `Genera exactamente 3 propuestas de conceptos de logotipo y diseño para el negocio "${businessName}" en el sector "${sector}". Color principal de marca: ${primaryColor}.
Devuelve estrictamente un array JSON con objetos que tengan las propiedades "id", "concept", "style" y "preview_url".`;

  const response = await client.models.generateContent({
    model: 'gemini-nano-banana-2.1',
    contents: prompt
  });

  try {
    const parsed = typeof response.text === 'string' ? JSON.parse(response.text) : response.text;
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    // Si la respuesta no es un JSON crudo directo, se usa fallback estructurado
  }

  // Fallback estructurado en caso de formato no JSON
  return [
    {
      id: 'logo_opt_1',
      concept: `Emblema minimalista para ${businessName}`,
      style: 'Monoline Vector',
      preview_url: 'https://cdn.webcreator.ai/logos/default_logo_1.webp'
    },
    {
      id: 'logo_opt_2',
      concept: `Tipografía artesanal con isotipo de ${sector}`,
      style: 'Handcrafted Serif',
      preview_url: 'https://cdn.webcreator.ai/logos/default_logo_2.webp'
    },
    {
      id: 'logo_opt_3',
      concept: `Sello insignia moderno en tono ${primaryColor}`,
      style: 'Vintage Modern Badge',
      preview_url: 'https://cdn.webcreator.ai/logos/default_logo_3.webp'
    }
  ];
}
