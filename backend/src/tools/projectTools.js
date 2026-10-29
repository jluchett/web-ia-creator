import { CapabilitiesSchema, DynamicContentSchema } from '@webcreator/shared';

/**
 * Declaración de herramienta setSiteCapabilities para Function Calling en @google/genai.
 * Configura los módulos interactivos ("Superpoderes") del Nivel 2.
 */
export const setSiteCapabilitiesTool = {
  type: 'function',
  name: 'setSiteCapabilities',
  description: 'Configura las capacidades interactivas y superpoderes del sitio web (Nivel 2: carrito, WhatsApp checkout, reservas, formulario, FAQs).',
  parameters: {
    type: 'object',
    properties: {
      has_cart: {
        type: 'boolean',
        description: 'Activa o desactiva el carrito de compras'
      },
      has_whatsapp_checkout: {
        type: 'boolean',
        description: 'Activa o desactiva la compra directa hacia WhatsApp'
      },
      has_booking: {
        type: 'boolean',
        description: 'Activa o desactiva la agenda de reservas'
      },
      has_custom_form: {
        type: 'boolean',
        description: 'Activa o desactiva el formulario de contacto o cotización'
      },
      has_faq_accordion: {
        type: 'boolean',
        description: 'Activa o desactiva la sección de preguntas frecuentes'
      }
    },
    required: [
      'has_cart',
      'has_whatsapp_checkout',
      'has_booking',
      'has_custom_form',
      'has_faq_accordion'
    ]
  }
};

/**
 * Declaración de herramienta setDynamicContent para Function Calling en @google/genai.
 * Configura los contenidos dinámicos del Nivel 3 (Hero, Catálogo y FAQs).
 * Requiere palabras clave descriptivas en inglés (prohíbe URLs directas).
 */
export const setDynamicContentTool = {
  type: 'function',
  name: 'setDynamicContent',
  description: 'Define el contenido dinámico del sitio (Nivel 3: Hero, Catálogo de productos y FAQs). Requiere keywords en inglés para imágenes.',
  parameters: {
    type: 'object',
    properties: {
      hero: {
        type: 'object',
        properties: {
          headline: { type: 'string', description: 'Titular principal de alto impacto' },
          subheadline: { type: 'string', description: 'Subtítulo persuasivo del negocio' },
          cta_text: { type: 'string', description: 'Llamado a la acción (ej. Pedir Ahora)' },
          hero_image_keyword: {
            type: 'string',
            description: 'Palabra clave descriptiva en inglés para buscar la imagen (PROHIBIDO usar URLs directas)'
          }
        },
        required: ['headline', 'subheadline', 'cta_text', 'hero_image_keyword']
      },
      products: {
        type: 'array',
        description: 'Catálogo inicial de productos o servicios',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Identificador único (ej. prod_1)' },
            name: { type: 'string', description: 'Nombre comercial del producto' },
            description: { type: 'string', description: 'Descripción de valor del producto' },
            price: { type: 'number', description: 'Precio numérico mayor o igual a cero' },
            currency: { type: 'string', description: 'Moneda (ej. USD, COP, EUR)' },
            image_keyword: {
              type: 'string',
              description: 'Palabra clave en inglés para resolver la imagen (PROHIBIDO usar URLs directas)'
            }
          },
          required: ['id', 'name', 'description', 'price', 'currency', 'image_keyword']
        }
      },
      faqs: {
        type: 'array',
        description: 'Lista de preguntas frecuentes y respuestas',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'Pregunta frecuente' },
            answer: { type: 'string', description: 'Respuesta clara y concisa' }
          },
          required: ['question', 'answer']
        }
      }
    },
    required: ['hero', 'products', 'faqs']
  }
};

/**
 * Valida los argumentos de la tool setSiteCapabilities contra CapabilitiesSchema.
 * @param {object} args
 * @returns {object} Capacidades validadas
 */
export function validateSiteCapabilitiesArgs(args) {
  const payload = args?.capabilities || args;
  return CapabilitiesSchema.parse(payload);
}

/**
 * Valida los argumentos de la tool setDynamicContent contra DynamicContentSchema.
 * Lanza ZodError si hay campos faltantes o si se intentó infiltrar una URL directa en image_keyword.
 * @param {object} args
 * @returns {object} Contenido dinámico validado
 */
export function validateDynamicContentArgs(args) {
  const payload = args?.dynamic_content || args;
  return DynamicContentSchema.parse(payload);
}
