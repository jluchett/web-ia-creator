import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Project } from '../src/models/Project.model.js';

// Mocks hoisted para @google/genai
const { mockInteractionsCreate } = vi.hoisted(() => ({
  mockInteractionsCreate: vi.fn()
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      interactions: {
        create: mockInteractionsCreate
      }
    }))
  };
});

// Mock in-memory del modelo Project
vi.mock('../src/models/Project.model.js', () => {
  const store = new Map();

  class MockProject {
    constructor(data) {
      this._id = data._id || 'mock_proj_mod3';
      this.user_session_id = data.user_session_id || 'sess_mod3_123';
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

describe('Módulo 3: Niveles 2 y 3, Image Resolver & Lead Gate (SDD + TDD)', () => {
  beforeEach(() => {
    Project._clear();
    mockInteractionsCreate.mockReset();
  });

  describe('Caso 1: Nivel 2 - Invocación de Tool setSiteCapabilities', () => {
    it('debe validar con CapabilitiesSchema, actualizar master_json.capabilities, cambiar status a "capabilities_defined", avanzar current_phase a 3 y devolver 200', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod3_case1',
        status: 'brand_defined',
        current_phase: 2,
        master_json: {
          project_meta: {
            business_name: 'Café de la Brisa',
            sector: 'Gastronomía',
            target_audience: 'Jóvenes profesionales',
            tone_of_voice: 'Cálido',
            project_type: 'e_commerce_light',
            primary_action: 'whatsapp_checkout'
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
            }
          }
        }
      });

      mockInteractionsCreate.mockResolvedValueOnce({
        steps: [
          {
            type: 'function_call',
            name: 'setSiteCapabilities',
            arguments: {
              has_cart: true,
              has_whatsapp_checkout: true,
              has_booking: false,
              has_custom_form: true,
              has_faq_accordion: true
            }
          }
        ],
        text: '¡Superpoderes activados! Hemos configurado tu carrito de compras y checkout directo a WhatsApp.'
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/chat`)
        .send({ message: 'Quiero activar el carrito de compras y pedidos por WhatsApp' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tool_executed).toBe('setSiteCapabilities');
      expect(response.body.project.status).toBe('capabilities_defined');
      expect(response.body.project.current_phase).toBe(3);
      expect(response.body.project.master_json.capabilities).toEqual({
        has_cart: true,
        has_whatsapp_checkout: true,
        has_booking: false,
        has_custom_form: true,
        has_faq_accordion: true
      });
    });
  });

  describe('Caso 2: Nivel 3 - Invocación de Tool setDynamicContent + Image Resolver', () => {
    it('Subcaso 2A (Rechazo SDD): debe rechazar con 422 si la IA infiltra una URL directa en image_keyword', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod3_case2a',
        status: 'capabilities_defined',
        current_phase: 3,
        master_json: {}
      });

      mockInteractionsCreate.mockResolvedValueOnce({
        steps: [
          {
            type: 'function_call',
            name: 'setDynamicContent',
            arguments: {
              hero: {
                headline: 'Despierta tus sentidos',
                subheadline: 'Granos de especialidad',
                cta_text: 'Pedir Café',
                hero_image_keyword: 'https://images.unsplash.com/photo-direct-illegal'
              },
              products: [],
              faqs: []
            }
          }
        ],
        text: 'He configurado los contenidos iniciales con enlace directo.'
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/chat`)
        .send({ message: 'Genera el contenido de mi cafetería' })
        .expect(422);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Error de validación SDD');

      const unchangedProject = await Project.findById(project._id);
      expect(unchangedProject.status).toBe('capabilities_defined');
      expect(unchangedProject.current_phase).toBe(3);
    });

    it('Subcaso 2B (Flujo Válido con Image Resolver): debe validar keywords, inyectar URLs seguras con imageResolver, cambiar status a "content_defined" y avanzar a phase 4', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod3_case2b',
        status: 'capabilities_defined',
        current_phase: 3,
        master_json: {
          capabilities: {
            has_cart: true,
            has_whatsapp_checkout: true,
            has_booking: false,
            has_custom_form: false,
            has_faq_accordion: true
          }
        }
      });

      mockInteractionsCreate.mockResolvedValueOnce({
        steps: [
          {
            type: 'function_call',
            name: 'setDynamicContent',
            arguments: {
              hero: {
                headline: 'Despierta tus sentidos con café de origen',
                subheadline: 'Granos seleccionados a mano en alta montaña',
                cta_text: 'Pedir Café Recién Tostado',
                hero_image_keyword: 'artisan pour over coffee shop warm lighting'
              },
              products: [
                {
                  id: 'prod_1',
                  name: 'Espresso Geisha Sierra Nevada 250g',
                  description: 'Notas florales a jazmín y acidez brillante',
                  price: 14.5,
                  currency: 'USD',
                  image_keyword: 'specialty coffee bag minimal packaging'
                }
              ],
              faqs: [
                {
                  question: '¿Hacen envíos nacionales?',
                  answer: 'Sí, despachamos en menos de 24 horas.'
                }
              ]
            }
          }
        ],
        text: '¡Listo! He redactado el titular hero, el catálogo inicial y las FAQs para tu cafetería.'
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/chat`)
        .send({ message: 'Redacta el contenido de mi web' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.tool_executed).toBe('setDynamicContent');
      expect(response.body.project.status).toBe('content_defined');
      expect(response.body.project.current_phase).toBe(4);

      const dynamicContent = response.body.project.master_json.dynamic_content;
      expect(dynamicContent.hero.headline).toBe('Despierta tus sentidos con café de origen');
      expect(dynamicContent.hero.hero_image_url).toBeDefined();
      expect(dynamicContent.hero.hero_image_url).toMatch(/^https?:\/\//);

      expect(dynamicContent.products).toHaveLength(1);
      expect(dynamicContent.products[0].name).toBe('Espresso Geisha Sierra Nevada 250g');
      expect(dynamicContent.products[0].resolved_image_url).toBeDefined();
      expect(dynamicContent.products[0].resolved_image_url).toMatch(/^https?:\/\//);

      expect(dynamicContent.faqs).toHaveLength(1);
      expect(dynamicContent.faqs[0].question).toBe('¿Hacen envíos nacionales?');
    });
  });

  describe('Caso 3: Muro de Conversión (POST /api/projects/:id/unlock-lead)', () => {
    it('Subcaso 3A: debe devolver 400 si faltan datos obligatorios o email es inválido', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod3_case3a',
        status: 'content_defined',
        current_phase: 4,
        lead_info: { is_unlocked: false }
      });

      const invalidRes1 = await request(app)
        .post(`/api/projects/${project._id}/unlock-lead`)
        .send({
          full_name: '',
          whatsapp: '+573001234567',
          email: 'invalido-email'
        })
        .expect(400);

      expect(invalidRes1.body.success).toBe(false);

      const invalidRes2 = await request(app)
        .post(`/api/projects/${project._id}/unlock-lead`)
        .send({})
        .expect(400);

      expect(invalidRes2.body.success).toBe(false);
    });

    it('Subcaso 3B: debe devolver 404 si el proyecto no existe', async () => {
      await request(app)
        .post('/api/projects/proj_no_existe/unlock-lead')
        .send({
          full_name: 'Carlos Mendoza',
          whatsapp: '+573001234567',
          email: 'carlos@cafedelabrisacol.com'
        })
        .expect(404);
    });

    it('Subcaso 3C: debe validar con Zod, guardar lead_info.is_unlocked = true y captured_at, y devolver 200', async () => {
      const project = await Project.create({
        user_session_id: 'sess_mod3_case3c',
        status: 'content_defined',
        current_phase: 4,
        lead_info: { is_unlocked: false }
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/unlock-lead`)
        .send({
          full_name: 'Carlos Mendoza',
          whatsapp: '+573001234567',
          email: 'carlos@cafedelabrisacol.com'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.project.lead_info.is_unlocked).toBe(true);
      expect(response.body.project.lead_info.full_name).toBe('Carlos Mendoza');
      expect(response.body.project.lead_info.whatsapp).toBe('+573001234567');
      expect(response.body.project.lead_info.email).toBe('carlos@cafedelabrisacol.com');
      expect(response.body.project.lead_info.captured_at).toBeDefined();

      const updatedDoc = await Project.findById(project._id);
      expect(updatedDoc.lead_info.is_unlocked).toBe(true);
      expect(updatedDoc.lead_info.captured_at).not.toBeNull();
    });
  });
});
