import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Project } from '../src/models/Project.model.js';

// Mock in-memory del modelo Mongoose para ejecución en milisegundos sin MongoDB externo
vi.mock('../src/models/Project.model.js', () => {
  const store = new Map();

  class MockProject {
    constructor(data) {
      this._id = data._id || 'mock_proj_123';
      this.user_session_id = data.user_session_id || 'sess_default_123';
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
    const doc = new MockProject({ ...data, _id: 'proj_' + Math.random().toString(36).substring(2, 9) });
    store.set(doc._id.toString(), doc);
    return doc;
  });

  MockProject.findById = vi.fn(async (id) => {
    return store.get(id.toString()) || null;
  });

  MockProject.findByIdAndUpdate = vi.fn(async (id, update, options) => {
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

describe('Backend Projects API (SDD + TDD)', () => {
  beforeEach(() => {
    Project._clear();
  });

  describe('POST /api/projects', () => {
    it('debe crear un nuevo proyecto en estado inicial (current_phase: 1, status: "draft") y responder 201', async () => {
      const response = await request(app)
        .post('/api/projects')
        .send({ user_session_id: 'sess_user_001' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.current_phase).toBe(1);
      expect(response.body.data.status).toBe('draft');
      expect(response.body.data.master_json).toBeDefined();
    });
  });

  describe('PATCH /api/projects/:id/master-json', () => {
    it('debe actualizar la sección de branding con datos válidos y responder 200', async () => {
      const created = await Project.create({
        user_session_id: 'sess_user_001',
        status: 'draft',
        current_phase: 1,
        master_json: {}
      });

      const validBranding = {
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
          logo_url: 'https://cdn.example.com/logo.webp'
        }
      };

      const response = await request(app)
        .patch(`/api/projects/${created._id}/master-json`)
        .send(validBranding);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.master_json.branding.colors.primary).toBe('#4A2E1B');
      expect(response.body.data.master_json.branding.typography.headings).toBe('Playfair Display');
    });

    it('debe rechazar con 400 Bad Request si un color hexadecimal es inválido (ej. "rojo")', async () => {
      const created = await Project.create({
        user_session_id: 'sess_user_001',
        status: 'draft',
        current_phase: 1,
        master_json: {}
      });

      const invalidColorPayload = {
        branding: {
          colors: {
            primary: 'rojo',
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
      };

      const response = await request(app)
        .patch(`/api/projects/${created._id}/master-json`)
        .send(invalidColorPayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      const errorMsg = JSON.stringify(response.body.error);
      expect(errorMsg).toMatch(/hexadecimal/i);
    });

    it('debe rechazar con 400 Bad Request si recibe una URL directa en image_keyword', async () => {
      const created = await Project.create({
        user_session_id: 'sess_user_001',
        status: 'draft',
        current_phase: 1,
        master_json: {}
      });

      const invalidImagePayload = {
        dynamic_content: {
          hero: {
            headline: 'Despierta tus sentidos con café de origen',
            subheadline: 'Granos seleccionados a mano',
            cta_text: 'Pedir Café',
            hero_image_keyword: 'https://images.unsplash.com/photo-1234'
          }
        }
      };

      const response = await request(app)
        .patch(`/api/projects/${created._id}/master-json`)
        .send(invalidImagePayload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      const errorMsg = JSON.stringify(response.body.error);
      expect(errorMsg).toMatch(/no una URL directa/i);
    });

    it('debe responder 404 si el proyecto no existe', async () => {
      const response = await request(app)
        .patch('/api/projects/non_existent_id/master-json')
        .send({
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
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
