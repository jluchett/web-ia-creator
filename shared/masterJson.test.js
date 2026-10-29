import { describe, it, expect } from 'vitest';
import {
  MasterJsonSchema,
  BrandingSchema,
  CapabilitiesSchema,
  DynamicContentSchema,
  PrototypeOutputSchema
} from './masterJson.schema.js';

describe('Master JSON Contract & Schemas (SDD / TDD)', () => {
  const cafeDeLaBrisaFixture = {
    project_meta: {
      business_name: 'Café de la Brisa',
      sector: 'Gastronomía / Cafetería de Especialidad',
      target_audience: 'Jóvenes profesionales y amantes del café de origen',
      tone_of_voice: 'Cálido, acogedor y artesanal',
      project_type: 'e_commerce_light',
      primary_action: 'whatsapp_checkout'
    },
    capabilities: {
      has_cart: true,
      has_whatsapp_checkout: true,
      has_booking: false,
      has_custom_form: true,
      has_faq_accordion: true
    },
    branding: {
      colors: {
        primary: '#4A2E1B',
        secondary: '#D4A373',
        accent: '#FAEDCD',
        background: '#FEFAE0',
        text: '#283618'
      },
      typography: {
        headings: 'Playfair Display',
        body: 'Inter'
      },
      logo_url: 'https://cdn.tuplataforma.com/logos/nano_banana_logo_123.webp'
    },
    dynamic_content: {
      hero: {
        headline: 'Despierta tus sentidos con café de origen colombiano',
        subheadline: 'Granos seleccionados a mano en alta montaña y tostados cada semana.',
        cta_text: 'Pedir Café Recién Tostado',
        hero_image_keyword: 'artisan pour over coffee shop warm lighting',
        hero_image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80'
      },
      products: [
        {
          id: 'prod_1',
          name: 'Espresso Geisha Sierra Nevada 250g',
          description: 'Notas florales a jazmín, bergamota y acidez brillante.',
          price: 14.50,
          currency: 'USD',
          image_keyword: 'specialty coffee bag minimal packaging',
          resolved_image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80'
        }
      ],
      faqs: [
        {
          question: '¿Hacen envíos a todo el país?',
          answer: 'Sí, despachamos en menos de 24 horas tras el tueste.'
        }
      ]
    }
  };

  it('debe validar con éxito el fixture completo de "Café de la Brisa" (e_commerce_light)', () => {
    const result = MasterJsonSchema.safeParse(cafeDeLaBrisaFixture);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.project_meta.business_name).toBe('Café de la Brisa');
      expect(result.data.project_meta.project_type).toBe('e_commerce_light');
      expect(result.data.capabilities.has_cart).toBe(true);
      expect(result.data.branding.colors.primary).toBe('#4A2E1B');
      expect(result.data.dynamic_content.products).toHaveLength(1);
    }
  });

  it('debe fallar si un color hexadecimal en branding.colors es inválido (ej. "rojo")', () => {
    const invalidBranding = {
      ...cafeDeLaBrisaFixture,
      branding: {
        ...cafeDeLaBrisaFixture.branding,
        colors: {
          ...cafeDeLaBrisaFixture.branding.colors,
          primary: 'rojo'
        }
      }
    };

    const result = MasterJsonSchema.safeParse(invalidBranding);
    expect(result.success).toBe(false);
    if (!result.success) {
      const errorPaths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(errorPaths).toContain('branding.colors.primary');
    }

    // Probar validación modular directa con BrandingSchema
    const modularResult = BrandingSchema.safeParse({
      ...cafeDeLaBrisaFixture.branding,
      colors: {
        ...cafeDeLaBrisaFixture.branding.colors,
        primary: 'rojo'
      }
    });
    expect(modularResult.success).toBe(false);
  });

  it('debe fallar si un producto incluye una URL directa en lugar de image_keyword', () => {
    const invalidProduct = {
      ...cafeDeLaBrisaFixture,
      dynamic_content: {
        ...cafeDeLaBrisaFixture.dynamic_content,
        products: [
          {
            id: 'prod_1',
            name: 'Espresso Geisha Sierra Nevada 250g',
            description: 'Notas florales a jazmín, bergamota y acidez brillante.',
            price: 14.50,
            currency: 'USD',
            image_keyword: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e'
          }
        ]
      }
    };

    const result = MasterJsonSchema.safeParse(invalidProduct);
    expect(result.success).toBe(false);
    if (!result.success) {
      const productKeywordError = result.error.issues.some((issue) =>
        issue.path.join('.').includes('dynamic_content.products.0.image_keyword')
      );
      expect(productKeywordError).toBe(true);
    }
  });

  it('debe validar submódulos de manera independiente (Branding, Capabilities, DynamicContent)', () => {
    const brandingResult = BrandingSchema.safeParse(cafeDeLaBrisaFixture.branding);
    expect(brandingResult.success).toBe(true);

    const capabilitiesResult = CapabilitiesSchema.safeParse(cafeDeLaBrisaFixture.capabilities);
    expect(capabilitiesResult.success).toBe(true);

    const dynamicContentResult = DynamicContentSchema.safeParse(cafeDeLaBrisaFixture.dynamic_content);
    expect(dynamicContentResult.success).toBe(true);
  });

  describe('PrototypeOutputSchema (SDD - Módulo 4)', () => {
    it('debe validar un prototipo estructurado válido emitido por el Agente 2', () => {
      const validPrototype = {
        html_body: '<header class="bg-brand-primary text-brand-text"><h1>Café de la Brisa</h1></header>',
        custom_css: '.cart-drawer { transform: translateX(0); }',
        vanilla_js: 'console.log("WebCreator AI Prototype Loaded");'
      };

      const result = PrototypeOutputSchema.safeParse(validPrototype);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.html_body).toContain('Café de la Brisa');
        expect(result.data.custom_css).toContain('.cart-drawer');
        expect(result.data.vanilla_js).toContain('WebCreator AI');
      }
    });

    it('debe asignar valores por defecto de cadenas vacías si custom_css o vanilla_js son omitidos', () => {
      const minimalPrototype = {
        html_body: '<main><p>Contenido mínimo válido para el cuerpo</p></main>'
      };

      const result = PrototypeOutputSchema.safeParse(minimalPrototype);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.custom_css).toBe('');
        expect(result.data.vanilla_js).toBe('');
      }
    });

    it('debe fallar si html_body tiene menos de 10 caracteres o está ausente', () => {
      const invalidShort = {
        html_body: '<div>',
        custom_css: '',
        vanilla_js: ''
      };

      const resultShort = PrototypeOutputSchema.safeParse(invalidShort);
      expect(resultShort.success).toBe(false);

      const invalidMissing = {
        custom_css: '',
        vanilla_js: ''
      };

      const resultMissing = PrototypeOutputSchema.safeParse(invalidMissing);
      expect(resultMissing.success).toBe(false);
    });
  });
});
