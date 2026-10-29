import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Project } from '../src/models/Project.model.js';

// Mocks hoisted para @google/genai
const { mockGenerateContent } = vi.hoisted(() => ({
  mockGenerateContent: vi.fn()
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: mockGenerateContent
      }
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING'
    }
  };
});

// Mock in-memory del modelo Project
vi.mock('../src/models/Project.model.js', () => {
  const store = new Map();

  class MockProject {
    constructor(data) {
      this._id = data._id || 'mock_proj_agent2';
      this.user_session_id = data.user_session_id || 'sess_agent2_123';
      this.status = data.status || 'draft';
      this.current_phase = data.current_phase || 1;
      this.lead_info = data.lead_info || { is_unlocked: false };
      this.master_json = data.master_json || {};
      this.generated_prototype = data.generated_prototype || {};
      this.created_at = new Date();
      this.updated_at = new Date();
    }

    save() {
      store.set(this._id.toString(), this);
      return Promise.resolve(this);
    }

    toObject() {
      return {
        _id: this._id,
        user_session_id: this.user_session_id,
        status: this.status,
        current_phase: this.current_phase,
        lead_info: this.lead_info,
        master_json: this.master_json,
        generated_prototype: this.generated_prototype,
        created_at: this.created_at,
        updated_at: this.updated_at
      };
    }
  }

  MockProject.create = vi.fn(async (data) => {
    const doc = new MockProject({
      ...data,
      _id: data._id || 'proj_' + Math.random().toString(36).substring(2, 9)
    });
    store.set(doc._id.toString(), doc);
    return doc;
  });

  MockProject.findById = vi.fn(async (id) => {
    return store.get(id.toString()) || null;
  });

  MockProject.findByIdAndUpdate = vi.fn(async (id, update) => {
    const doc = store.get(id.toString());
    if (!doc) return null;
    if (update.$set) {
      Object.assign(doc, update.$set);
    } else {
      Object.assign(doc, update);
    }
    doc.updated_at = new Date();
    store.set(id.toString(), doc);
    return doc;
  });

  MockProject._clear = () => store.clear();
  MockProject._store = store;

  return { Project: MockProject };
});

describe('Módulo 4: Agente 2 (Ingeniero Frontend) y Prototipado Interactivo (SDD + TDD)', () => {
  const masterJsonFixture = {
    project_meta: {
      business_name: 'Café de la Brisa',
      sector: 'Gastronomía / Cafetería',
      target_audience: 'Jóvenes profesionales',
      tone_of_voice: 'Cálido y artesanal',
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
      logo_url: 'https://cdn.tuplataforma.com/logos/cafe_logo.webp'
    },
    dynamic_content: {
      hero: {
        headline: 'Despierta tus sentidos con café de origen colombiano',
        subheadline: 'Granos seleccionados a mano en alta montaña',
        cta_text: 'Pedir Café Recién Tostado',
        hero_image_keyword: 'artisan pour over coffee',
        hero_image_url: 'https://images.unsplash.com/photo-hero-coffee'
      },
      products: [
        {
          id: 'prod_1',
          name: 'Espresso Geisha 250g',
          description: 'Notas florales a jazmín y acidez brillante',
          price: 14.5,
          currency: 'USD',
          image_keyword: 'specialty coffee bag',
          resolved_image_url: 'https://images.unsplash.com/photo-prod-espresso'
        }
      ],
      faqs: [
        {
          question: '¿Hacen envíos nacionales?',
          answer: 'Sí, despachamos en menos de 24 horas.'
        }
      ]
    }
  };

  beforeEach(() => {
    Project._clear();
    mockGenerateContent.mockReset();
  });

  describe('Caso 1: Bloqueo por Lead Gate (403 Forbidden)', () => {
    it('debe rechazar la petición con 403 Forbidden si el Lead Gate NO ha sido desbloqueado (is_unlocked: false) sin invocar Gemini', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod4_blocked',
        status: 'content_defined',
        current_phase: 4,
        lead_info: {
          is_unlocked: false
        },
        master_json: masterJsonFixture
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/generate-prototype`)
        .send({})
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/Acceso denegado|Lead Gate/i);
      expect(mockGenerateContent).not.toHaveBeenCalled();

      // Verificar que el estado no fue modificado
      const unchangedProject = await Project.findById(project._id);
      expect(unchangedProject.status).toBe('content_defined');
      expect(unchangedProject.generated_prototype).toEqual({});
    });
  });

  describe('Caso 2: Generación Exitosa de Prototipo (Nivel 4)', () => {
    it('debe invocar al Agente 2, validar la salida contra PrototypeOutputSchema, guardar el prototipo en MongoDB, cambiar status a "prototype_generated" y responder 200', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod4_success',
        status: 'content_defined',
        current_phase: 4,
        lead_info: {
          is_unlocked: true,
          full_name: 'Carlos Mendoza',
          whatsapp: '+573001234567',
          email: 'carlos@cafedelabrisacol.com',
          captured_at: new Date()
        },
        master_json: masterJsonFixture
      });

      const generatedCodeOutput = {
        html_body: '<header class="bg-brand-primary text-brand-text p-6"><h1 class="font-heading text-3xl">Café de la Brisa</h1></header><main class="p-4"><section><h2 class="font-heading">Nuestros Cafés</h2></section></main>',
        custom_css: '.cart-drawer { transform: translateX(100%); transition: transform 0.3s ease; }',
        vanilla_js: 'document.addEventListener("DOMContentLoaded", () => { console.log("Prototipo inicializado"); });'
      };

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(generatedCodeOutput)
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/generate-prototype`)
        .send({ useFlagshipModel: false })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.project).toBeDefined();
      expect(response.body.project.status).toBe('prototype_generated');
      expect(response.body.project.current_phase).toBe(4);

      // Validar que se invocó @google/genai con gemini-3.8-flash y structured outputs
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-3.8-flash');
      expect(callArgs.contents).toContain('Café de la Brisa');
      expect(callArgs.config.responseMimeType).toBe('application/json');

      // Validar persistencia en el modelo
      const updatedProject = await Project.findById(project._id);
      expect(updatedProject.status).toBe('prototype_generated');
      expect(updatedProject.generated_prototype).toBeDefined();
      expect(updatedProject.generated_prototype.html_body).toBe(generatedCodeOutput.html_body);
      expect(updatedProject.generated_prototype.custom_css).toBe(generatedCodeOutput.custom_css);
      expect(updatedProject.generated_prototype.vanilla_js).toBe(generatedCodeOutput.vanilla_js);
      expect(updatedProject.generated_prototype.model_used).toBe('gemini-3.8-flash');
    });

    it('debe utilizar gemini-4-argon si useFlagshipModel es true', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod4_flagship',
        status: 'content_defined',
        current_phase: 4,
        lead_info: {
          is_unlocked: true,
          full_name: 'Carlos Mendoza',
          whatsapp: '+573001234567',
          email: 'carlos@cafedelabrisacol.com'
        },
        master_json: masterJsonFixture
      });

      const generatedCodeOutput = {
        html_body: '<header class="bg-brand-primary"><h1>Prototipo Flagship</h1></header>',
        custom_css: '',
        vanilla_js: ''
      };

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(generatedCodeOutput)
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/generate-prototype`)
        .send({ useFlagshipModel: true })
        .expect(200);

      expect(response.body.success).toBe(true);
      const callArgs = mockGenerateContent.mock.calls[0][0];
      expect(callArgs.model).toBe('gemini-4-argon');
      expect(response.body.project.generated_prototype.model_used).toBe('gemini-4-argon');
    });
  });

  describe('Caso 3: Código corrupto o incompleto bloqueado por SDD (422 Unprocessable Entity)', () => {
    it('debe rechazar con 422 si el Agente 2 devuelve un html_body menor a 10 caracteres y no corromper la base de datos', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod4_corrupt',
        status: 'content_defined',
        current_phase: 4,
        lead_info: { is_unlocked: true },
        master_json: masterJsonFixture
      });

      // Simular alucinación con html_body de 5 caracteres (<div)
      const corruptCodeOutput = {
        html_body: '<div>',
        custom_css: '',
        vanilla_js: ''
      };

      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify(corruptCodeOutput)
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/generate-prototype`)
        .send({})
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Error de validación SDD');

      // Verificar que el proyecto permanece intacto
      const intactProject = await Project.findById(project._id);
      expect(intactProject.status).toBe('content_defined');
      expect(intactProject.generated_prototype).toEqual({});
    });
  });

  describe('Caso 4: Manejo de Proyecto Inexistente (404 Not Found)', () => {
    it('debe responder 404 si el ID del proyecto no existe', async () => {
      await request(app)
        .post('/api/projects/proj_no_existe/generate-prototype')
        .send({})
        .expect(404);
    });
  });
});
