import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Project } from '../src/models/Project.model.js';

// Mocks hoisted para @google/genai
const { mockInteractionsCreate, mockGenerateContent } = vi.hoisted(() => ({
  mockInteractionsCreate: vi.fn(),
  mockGenerateContent: vi.fn()
}));

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      interactions: {
        create: mockInteractionsCreate
      },
      models: {
        generateContent: mockGenerateContent
      }
    }))
  };
});

// Mock in-memory del modelo Project idéntico al de projects.test.js
vi.mock('../src/models/Project.model.js', () => {
  const store = new Map();

  class MockProject {
    constructor(data) {
      this._id = data._id || 'mock_proj_agent1';
      this.user_session_id = data.user_session_id || 'sess_agent1_123';
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
      _id: 'proj_' + Math.random().toString(36).substring(2, 9)
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

describe('Agente 1 (Consultor de Marca) - SDD & TDD', () => {
  beforeEach(() => {
    Project._clear();
    mockInteractionsCreate.mockReset();
    mockGenerateContent.mockReset();
  });

  describe('POST /api/projects/:id/chat', () => {
    it('Caso 1 (Function Call Válido - Nivel 1): debe validar con SDD, actualizar master_json, status a "brand_defined", current_phase a 2 y devolver 200 con { reply, tool_executed: "setBrandIdentity", project }', async () => {
      // 1. Proyecto en estado inicial
      const project = await Project.create({
        user_session_id: 'sess_cafe_001',
        status: 'draft',
        current_phase: 1,
        master_json: {}
      });

      // 2. Simular respuesta del Agente 1 (gemini-3.8-flash) con invocación de tool setBrandIdentity
      mockInteractionsCreate.mockResolvedValueOnce({
        steps: [
          {
            type: 'function_call',
            name: 'setBrandIdentity',
            arguments: {
              project_meta: {
                business_name: 'Café de la Brisa',
                sector: 'Gastronomía / Cafetería de Especialidad',
                target_audience: 'Jóvenes profesionales y amantes del café de origen',
                tone_of_voice: 'Cálido, acogedor y artesanal',
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
          }
        ],
        text: '¡Excelente concepto! He definido la identidad de marca para Café de la Brisa.'
      });

      // 3. Simular generación paralela de 3 opciones de logo con gemini-nano-banana-2.1
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify([
          {
            id: 'logo_opt_1',
            concept: 'Grano de café minimalista',
            style: 'Monoline Vector',
            preview_url: 'https://cdn.webcreator.ai/logos/logo1.webp'
          },
          {
            id: 'logo_opt_2',
            concept: 'Taza artesanal con vapor costero',
            style: 'Handcrafted Serif',
            preview_url: 'https://cdn.webcreator.ai/logos/logo2.webp'
          },
          {
            id: 'logo_opt_3',
            concept: 'Sello con sol y olas de café de origen',
            style: 'Vintage Coastal Badge',
            preview_url: 'https://cdn.webcreator.ai/logos/logo3.webp'
          }
        ])
      });

      // 4. Enviar mensaje del usuario al endpoint de chat
      const response = await request(app)
        .post(`/api/projects/${project._id}/chat`)
        .send({
          message: 'Tengo una cafetería llamada Café de la Brisa en Santa Marta, especializada en café artesanal.'
        });

      // 5. Validaciones de respuesta HTTP
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tool_executed).toBe('setBrandIdentity');
      expect(response.body.reply).toBeDefined();
      expect(response.body.project).toBeDefined();

      // 6. Validaciones de estado y avance gamificado en el proyecto
      expect(response.body.project.status).toBe('brand_defined');
      expect(response.body.project.current_phase).toBe(2);
      expect(response.body.project.master_json.project_meta.business_name).toBe('Café de la Brisa');
      expect(response.body.project.master_json.branding.colors.primary).toBe('#4A2E1B');
      expect(response.body.project.master_json.branding.typography.headings).toBe('Playfair Display');

      // 7. Validaciones de persistencia en BD
      const updatedInDb = await Project.findById(project._id);
      expect(updatedInDb.status).toBe('brand_defined');
      expect(updatedInDb.current_phase).toBe(2);
      expect(updatedInDb.master_json.project_meta.business_name).toBe('Café de la Brisa');
    });

    it('Caso 2 (Alucinación de la IA Bloqueada por SDD): debe interceptar error Zod si la IA devuelve color inválido ("cafe") y NO corromper el master_json', async () => {
      // 1. Proyecto en estado inicial
      const project = await Project.create({
        user_session_id: 'sess_cafe_002',
        status: 'draft',
        current_phase: 1,
        master_json: {}
      });

      // 2. Simular que el LLM alucina devolviendo un color en texto "cafe" en vez de código Hex
      mockInteractionsCreate.mockResolvedValueOnce({
        steps: [
          {
            type: 'function_call',
            name: 'setBrandIdentity',
            arguments: {
              project_meta: {
                business_name: 'Café de la Brisa',
                sector: 'Gastronomía',
                target_audience: 'Jóvenes',
                tone_of_voice: 'Cálido',
                project_type: 'e_commerce_light',
                primary_action: 'whatsapp_checkout'
              },
              branding: {
                colors: {
                  primary: 'cafe', // <--- INVÁLIDO según HexColorSchema
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
          }
        ],
        text: 'He configurado tu paleta de color café.'
      });

      // 3. Enviar mensaje del usuario
      const response = await request(app)
        .post(`/api/projects/${project._id}/chat`)
        .send({
          message: 'Quiero colores café para mi negocio.'
        });

      // 4. Debe rechazar o controlar el error sin retornar éxito de mutación
      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();

      // 5. Verificar que la BD NO fue corrompida (master_json permanece intacto y phase en 1)
      const projectInDb = await Project.findById(project._id);
      expect(projectInDb.status).toBe('draft');
      expect(projectInDb.current_phase).toBe(1);
      expect(projectInDb.master_json.branding).toBeUndefined();
    });

    it('Caso 3 (Generación de Opciones de Logo con gemini-nano-banana-2.1): debe devolver 3 propuestas visuales seleccionables estructuradas', async () => {
      const project = await Project.create({
        user_session_id: 'sess_cafe_003',
        status: 'draft',
        current_phase: 1,
        master_json: {}
      });

      // Simular respuesta de nano banana 2.1
      mockGenerateContent.mockResolvedValueOnce({
        text: JSON.stringify([
          {
            id: 'logo_opt_1',
            concept: 'Grano de café minimalista',
            style: 'Monoline Vector',
            preview_url: 'https://cdn.webcreator.ai/logos/logo1.webp'
          },
          {
            id: 'logo_opt_2',
            concept: 'Taza artesanal con vapor costero',
            style: 'Handcrafted Serif',
            preview_url: 'https://cdn.webcreator.ai/logos/logo2.webp'
          },
          {
            id: 'logo_opt_3',
            concept: 'Sello con sol y olas de café de origen',
            style: 'Vintage Coastal Badge',
            preview_url: 'https://cdn.webcreator.ai/logos/logo3.webp'
          }
        ])
      });

      const response = await request(app)
        .post(`/api/projects/${project._id}/logo-options`)
        .send({
          business_name: 'Café de la Brisa',
          sector: 'Gastronomía',
          primary_color: '#4A2E1B'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.logo_options).toHaveLength(3);
      expect(response.body.logo_options[0]).toMatchObject({
        id: 'logo_opt_1',
        concept: expect.any(String),
        style: expect.any(String),
        preview_url: expect.stringMatching(/^https?:\/\//)
      });
    });
  });
});
