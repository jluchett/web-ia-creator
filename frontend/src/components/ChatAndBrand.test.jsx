import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App.jsx';
import * as apiService from '../services/api.js';

// Mock del servicio de API frontend
vi.mock('../services/api.js', () => ({
  createProject: vi.fn().mockResolvedValue({ success: true, data: { _id: 'proj_123' } }),
  sendChatMessage: vi.fn(),
  updateProjectMasterJson: vi.fn(),
  fetchLogoOptions: vi.fn()
}));

describe('Chat Interactivo y Selector de Marca en Vivo (SDD + TDD)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe enviar un mensaje desde ChatPanel, agregar la respuesta de IA al historial y actualizar automáticamente el LiveCanvas al 50% (Fase 2) con nuevos colores y fuentes', async () => {
    const mockApiResponse = {
      success: true,
      reply: '¡Excelente concepto! He definido la identidad visual de Café de la Brisa.',
      tool_executed: 'setBrandIdentity',
      project: {
        _id: 'proj_123',
        status: 'brand_defined',
        current_phase: 2,
        master_json: {
          project_meta: {
            business_name: 'Café de la Brisa',
            sector: 'Gastronomía',
            target_audience: 'Jóvenes profesionales',
            tone_of_voice: 'Cálido y artesanal',
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
            },
            logo_url: null
          }
        }
      },
      logo_options: [
        {
          id: 'logo_opt_1',
          concept: 'Grano de café minimalista',
          style: 'Monoline Vector',
          preview_url: 'https://cdn.webcreator.ai/logos/logo1.webp'
        },
        {
          id: 'logo_opt_2',
          concept: 'Taza artesanal con vapor',
          style: 'Handcrafted Serif',
          preview_url: 'https://cdn.webcreator.ai/logos/logo2.webp'
        },
        {
          id: 'logo_opt_3',
          concept: 'Sello costero con sol y olas',
          style: 'Vintage Coastal Badge',
          preview_url: 'https://cdn.webcreator.ai/logos/logo3.webp'
        }
      ]
    };

    apiService.sendChatMessage.mockResolvedValueOnce(mockApiResponse);

    render(<App />);

    // 1. Verificar estado inicial: Fase 1 (25%)
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText(/Misión 1: ADN & Marca/i)).toBeInTheDocument();

    // 2. Escribir mensaje en el ChatPanel
    const input = screen.getByPlaceholderText(/Escribe tu respuesta o idea de negocio/i);
    const sendButton = screen.getByRole('button', { name: /enviar/i });

    fireEvent.change(input, {
      target: {
        value: 'Tengo una cafetería llamada Café de la Brisa con estilo artesanal.'
      }
    });
    fireEvent.click(sendButton);

    // 3. Verificar que el mensaje del usuario se renderice de inmediato en el chat
    expect(
      screen.getByText('Tengo una cafetería llamada Café de la Brisa con estilo artesanal.')
    ).toBeInTheDocument();

    // 4. Esperar a que la respuesta del asistente aparezca en el historial
    await waitFor(() => {
      expect(
        screen.getByText('¡Excelente concepto! He definido la identidad visual de Café de la Brisa.')
      ).toBeInTheDocument();
    });

    // 5. Verificar que el LiveCanvas haya avanzado a la Fase 2 (50%)
    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText(/Misión 2: Estructura & Superpoderes/i)).toBeInTheDocument();
    });

    // 6. Verificar que los nuevos colores y tipografías se reflejen en el Brand Kit
    expect(screen.getByText('#4A2E1B')).toBeInTheDocument();
    expect(screen.getByText('#D4A373')).toBeInTheDocument();
    expect(screen.getByText(/Playfair Display/i)).toBeInTheDocument();
  });

  it('debe permitir seleccionar interactivamente una propuesta de logotipo en LiveCanvas y marcarla como activa en tiempo real', async () => {
    const mockApiResponse = {
      success: true,
      reply: 'Aquí tienes 3 propuestas de logo generadas con gemini-nano-banana-2.1.',
      tool_executed: 'setBrandIdentity',
      project: {
        _id: 'proj_123',
        status: 'brand_defined',
        current_phase: 2,
        master_json: {
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
            logo_url: null
          }
        }
      },
      logo_options: [
        {
          id: 'logo_opt_1',
          concept: 'Grano de café minimalista',
          style: 'Monoline Vector',
          preview_url: 'https://cdn.webcreator.ai/logos/logo1.webp'
        },
        {
          id: 'logo_opt_2',
          concept: 'Taza artesanal con vapor',
          style: 'Handcrafted Serif',
          preview_url: 'https://cdn.webcreator.ai/logos/logo2.webp'
        },
        {
          id: 'logo_opt_3',
          concept: 'Sello costero con sol y olas',
          style: 'Vintage Coastal Badge',
          preview_url: 'https://cdn.webcreator.ai/logos/logo3.webp'
        }
      ]
    };

    apiService.sendChatMessage.mockResolvedValueOnce(mockApiResponse);
    apiService.updateProjectMasterJson.mockResolvedValueOnce({ success: true });

    render(<App />);

    // Simular recepción de propuestas vía chat
    const input = screen.getByPlaceholderText(/Escribe tu respuesta/i);
    fireEvent.change(input, { target: { value: 'Generar logos' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    // Esperar a que se rendericen las opciones de logo en el LiveCanvas
    await waitFor(() => {
      expect(screen.getByText('Grano de café minimalista')).toBeInTheDocument();
      expect(screen.getByText('Taza artesanal con vapor')).toBeInTheDocument();
      expect(screen.getByText('Sello costero con sol y olas')).toBeInTheDocument();
    });

    // Hacer clic en la segunda opción de logo
    const selectButton = screen.getByTestId('logo-select-logo_opt_2');
    fireEvent.click(selectButton);

    // Verificar que se indique visualmente la opción seleccionada
    await waitFor(() => {
      expect(screen.getByTestId('logo-card-logo_opt_2')).toHaveAttribute('data-selected', 'true');
    });
  });
});
