import { z } from 'zod';

/**
 * Esquema de validación para códigos de color hexadecimales (#RGB, #RRGGBB, #RRGGBBAA).
 */
export const HexColorSchema = z
  .string()
  .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/, {
    message: 'Debe ser un código de color hexadecimal válido (ej. #4A2E1B)'
  });

/**
 * Esquema para palabras clave de búsqueda de imágenes.
 * Prohíbe explícitamente URLs directas según las reglas arquitectónicas de WebCreator AI.
 */
export const ImageKeywordSchema = z
  .string()
  .min(1, 'El término de búsqueda de imagen no puede estar vacío')
  .refine((val) => !/^https?:\/\//i.test(val), {
    message: 'Debe ser una palabra clave descriptiva en texto, no una URL directa'
  });

/**
 * Metadatos generales del proyecto y negocio.
 */
export const ProjectMetaSchema = z.object({
  business_name: z.string().min(1, 'El nombre del negocio es obligatorio'),
  sector: z.string().min(1, 'El sector es obligatorio'),
  target_audience: z.string().min(1, 'La audiencia objetivo es obligatoria'),
  tone_of_voice: z.string().min(1, 'El tono de voz es obligatorio'),
  project_type: z.enum([
    'e_commerce_light',
    'landing_services',
    'booking',
    'portfolio'
  ]),
  primary_action: z.string().min(1, 'La acción principal es obligatoria')
});

/**
 * Identidad visual y de marca (colores, fuentes tipográficas y logo).
 */
export const BrandingSchema = z.object({
  colors: z.object({
    primary: HexColorSchema,
    secondary: HexColorSchema,
    accent: HexColorSchema,
    background: HexColorSchema,
    text: HexColorSchema
  }),
  typography: z.object({
    headings: z.string().min(1, 'La fuente para encabezados es obligatoria'),
    body: z.string().min(1, 'La fuente para cuerpo de texto es obligatoria')
  }),
  logo_url: z.string().url().optional().nullable().or(z.literal(''))
});

/**
 * Módulos y capacidades interactivas del sitio ("Superpoderes").
 */
export const CapabilitiesSchema = z.object({
  has_cart: z.boolean(),
  has_whatsapp_checkout: z.boolean(),
  has_booking: z.boolean(),
  has_custom_form: z.boolean(),
  has_faq_accordion: z.boolean()
});

/**
 * Sección principal Hero.
 */
export const HeroSchema = z.object({
  headline: z.string().min(1, 'El titular es obligatorio'),
  subheadline: z.string().min(1, 'El subtítulo es obligatorio'),
  cta_text: z.string().min(1, 'El texto del CTA es obligatorio'),
  hero_image_keyword: ImageKeywordSchema,
  hero_image_url: z.string().url().optional()
});

/**
 * Elemento de producto o servicio en catálogo.
 */
export const ProductSchema = z.object({
  id: z.string().min(1, 'El identificador del producto es obligatorio'),
  name: z.string().min(1, 'El nombre del producto es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  price: z.number().nonnegative('El precio debe ser un número mayor o igual a cero'),
  currency: z.string().min(1, 'La moneda es obligatoria'),
  image_keyword: ImageKeywordSchema,
  resolved_image_url: z.string().url().optional()
});

/**
 * Pregunta frecuente (FAQ).
 */
export const FaqSchema = z.object({
  question: z.string().min(1, 'La pregunta es obligatoria'),
  answer: z.string().min(1, 'La respuesta es obligatoria')
});

/**
 * Contenido dinámico del sitio (Hero, Catálogo de productos/servicios y FAQs).
 */
export const DynamicContentSchema = z.object({
  hero: HeroSchema,
  products: z.array(ProductSchema).default([]),
  faqs: z.array(FaqSchema).default([])
});

/**
 * Contrato Maestro del JSON de WebCreator AI.
 */
export const MasterJsonSchema = z.object({
  project_meta: ProjectMetaSchema,
  capabilities: CapabilitiesSchema,
  branding: BrandingSchema,
  dynamic_content: DynamicContentSchema
});
