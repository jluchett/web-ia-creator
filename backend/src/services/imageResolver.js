/**
 * Servicio de Resolución Segura de Imágenes (Unsplash Image Resolver).
 *
 * Mapea palabras clave (keywords) en inglés generadas por el Agente 1
 * a URLs verificadas de alta calidad, previniendo enlaces rotos y mitigando latencia
 * mediante caché en memoria.
 */

const imageCache = new Map();

// Repositorio de imágenes verificadas de Unsplash organizadas por temáticas
const CURATED_IMAGE_POOLS = {
  coffee: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
  ],
  restaurant: [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
  ],
  tech: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  ],
  fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
  ],
  general: [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'
  ]
};

/**
 * Resuelve una palabra clave a una URL de imagen segura y de alta calidad.
 * @param {string} keyword Término de búsqueda descriptivo
 * @returns {string} URL segura de imagen
 */
export function resolveImageUrl(keyword) {
  if (!keyword || typeof keyword !== 'string') {
    return CURATED_IMAGE_POOLS.general[0];
  }

  const normalized = keyword.toLowerCase().trim();

  if (imageCache.has(normalized)) {
    return imageCache.get(normalized);
  }

  let selectedUrl = null;

  if (normalized.includes('coffee') || normalized.includes('café') || normalized.includes('espresso') || normalized.includes('tea')) {
    const pool = CURATED_IMAGE_POOLS.coffee;
    selectedUrl = pool[Math.floor(Math.random() * pool.length)];
  } else if (normalized.includes('food') || normalized.includes('restaurant') || normalized.includes('dish') || normalized.includes('chef') || normalized.includes('bakery')) {
    const pool = CURATED_IMAGE_POOLS.restaurant;
    selectedUrl = pool[Math.floor(Math.random() * pool.length)];
  } else if (normalized.includes('tech') || normalized.includes('software') || normalized.includes('app') || normalized.includes('code') || normalized.includes('laptop')) {
    const pool = CURATED_IMAGE_POOLS.tech;
    selectedUrl = pool[Math.floor(Math.random() * pool.length)];
  } else if (normalized.includes('fitness') || normalized.includes('gym') || normalized.includes('sport') || normalized.includes('yoga')) {
    const pool = CURATED_IMAGE_POOLS.fitness;
    selectedUrl = pool[Math.floor(Math.random() * pool.length)];
  } else {
    // Si no coincide con un pool específico, construir URL segura de Unsplash Source o Pool General
    const pool = CURATED_IMAGE_POOLS.general;
    selectedUrl = pool[Math.floor(Math.random() * pool.length)];
  }

  imageCache.set(normalized, selectedUrl);
  return selectedUrl;
}

/**
 * Resuelve e inyecta URLs seguras en todos los campos de imagen de dynamic_content.
 * @param {object} dynamicContent Contenido dinámico validado por DynamicContentSchema
 * @returns {object} Contenido dinámico enriquecido con hero_image_url y resolved_image_url
 */
export function resolveDynamicContentImages(dynamicContent) {
  if (!dynamicContent) return dynamicContent;

  const resolved = JSON.parse(JSON.stringify(dynamicContent));

  if (resolved.hero && resolved.hero.hero_image_keyword) {
    resolved.hero.hero_image_url = resolveImageUrl(resolved.hero.hero_image_keyword);
  }

  if (Array.isArray(resolved.products)) {
    resolved.products = resolved.products.map((product) => {
      if (product.image_keyword) {
        return {
          ...product,
          resolved_image_url: resolveImageUrl(product.image_keyword)
        };
      }
      return product;
    });
  }

  return resolved;
}
