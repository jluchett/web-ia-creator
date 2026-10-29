import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { IframePreview } from './IframePreview.jsx';
import { LiveCanvas } from './LiveCanvas.jsx';

describe('Módulo 4: Visor Sandbox Seguro (IframePreview) y Botón de Monetización (TDD)', () => {
  const mockBranding = {
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
  };

  const mockPrototypeCode = {
    html_body: '<header class="bg-brand-primary text-brand-text p-6"><h1 class="font-heading text-2xl">Café de la Brisa</h1><button class="bg-brand-accent p-2">Ver Menú</button></header>',
    custom_css: '.cart-drawer { transition: transform 0.3s ease; }',
    vanilla_js: 'console.log("Interactive cart initialized");'
  };

  describe('Test 1: Seguridad y Aislamiento del Sandbox (IframePreview.jsx)', () => {
    it('debe renderizar un elemento <iframe> con sandbox="allow-scripts", sin "allow-same-origin", y con título descriptivo', () => {
      render(
        <IframePreview
          branding={mockBranding}
          prototypeCode={mockPrototypeCode}
        />
      );

      const iframe = screen.getByTitle(/Prototipo Web Vivo/i);
      expect(iframe).toBeInTheDocument();
      expect(iframe.tagName.toLowerCase()).toBe('iframe');

      // Auditoría estricta de seguridad del sandbox
      const sandboxAttr = iframe.getAttribute('sandbox');
      expect(sandboxAttr).toBe('allow-scripts');
      expect(sandboxAttr).not.toContain('allow-same-origin');
    });

    it('debe inyectar Tailwind CDN, configuración extendida, html_body, custom_css y vanilla_js dentro de srcDoc', () => {
      render(
        <IframePreview
          branding={mockBranding}
          prototypeCode={mockPrototypeCode}
        />
      );

      const iframe = screen.getByTitle(/Prototipo Web Vivo/i);
      const srcDoc = iframe.getAttribute('srcDoc');

      expect(srcDoc).toBeDefined();
      expect(srcDoc).toContain('https://cdn.tailwindcss.com');
      expect(srcDoc).toContain('Café de la Brisa');
      expect(srcDoc).toContain('bg-brand-primary');
      expect(srcDoc).toContain('.cart-drawer { transition: transform 0.3s ease; }');
      expect(srcDoc).toContain('console.log("Interactive cart initialized");');
      expect(srcDoc).toContain('tailwind.config =');
      expect(srcDoc).toContain('brand-primary');
    });
  });

  describe('Test 2: Reactividad de Variables CSS (:root) con Cero Latencia', () => {
    it('debe sincronizar los colores y fuentes de marca como variables CSS dentro del :root de srcDoc', () => {
      const { rerender } = render(
        <IframePreview
          branding={mockBranding}
          prototypeCode={mockPrototypeCode}
        />
      );

      let iframe = screen.getByTitle(/Prototipo Web Vivo/i);
      let srcDoc = iframe.getAttribute('srcDoc');

      expect(srcDoc).toContain('--color-primary: #4A2E1B;');
      expect(srcDoc).toContain('--color-secondary: #D4A373;');
      expect(srcDoc).toContain('--color-accent: #FAEDCD;');
      expect(srcDoc).toContain('--color-bg: #FEFAE0;');
      expect(srcDoc).toContain('--color-text: #283618;');
      expect(srcDoc).toContain("'Playfair Display', serif");
      expect(srcDoc).toContain("'Inter', sans-serif");

      // Modificar branding (reactividad de marca sin llamadas de red)
      const updatedBranding = {
        ...mockBranding,
        colors: {
          ...mockBranding.colors,
          primary: '#1E3A8A',
          background: '#FFFFFF'
        },
        typography: {
          headings: 'Montserrat',
          body: 'Roboto'
        }
      };

      rerender(
        <IframePreview
          branding={updatedBranding}
          prototypeCode={mockPrototypeCode}
        />
      );

      iframe = screen.getByTitle(/Prototipo Web Vivo/i);
      srcDoc = iframe.getAttribute('srcDoc');

      expect(srcDoc).toContain('--color-primary: #1E3A8A;');
      expect(srcDoc).toContain('--color-bg: #FFFFFF;');
      expect(srcDoc).toContain("'Montserrat', serif");
      expect(srcDoc).toContain("'Roboto', sans-serif");
    });
  });

  describe('Test 3: Flujo Nivel 4 en LiveCanvas, Generación y Botón de Monetización', () => {
    const unlockedLeadInfo = {
      is_unlocked: true,
      full_name: 'Carlos Mendoza',
      whatsapp: '+573001234567',
      email: 'carlos@cafedelabrisacol.com'
    };

    it('debe mostrar el botón para "Generar Prototipo Interactivo" cuando el Lead Gate está desbloqueado y aún no hay prototipo generado', () => {
      const mockGenerate = vi.fn();

      render(
        <LiveCanvas
          currentPhase={4}
          branding={mockBranding}
          leadInfo={unlockedLeadInfo}
          generatedPrototype={null}
          onGeneratePrototype={mockGenerate}
        />
      );

      const generateBtn = screen.getByRole('button', { name: /Generar Prototipo Interactivo/i });
      expect(generateBtn).toBeInTheDocument();

      fireEvent.click(generateBtn);
      expect(mockGenerate).toHaveBeenCalledTimes(1);
    });

    it('debe renderizar IframePreview y el Botón de Monetización cuando generatedPrototype está disponible', () => {
      const mockPublish = vi.fn();

      render(
        <LiveCanvas
          currentPhase={4}
          branding={mockBranding}
          leadInfo={unlockedLeadInfo}
          generatedPrototype={mockPrototypeCode}
          onPublishClick={mockPublish}
        />
      );

      // 1. Debe existir el iframe sandbox
      expect(screen.getByTitle(/Prototipo Web Vivo/i)).toBeInTheDocument();

      // 2. Debe renderizar el Botón de Monetización
      const monetizationBtn = screen.getByRole('button', {
        name: /Quiero publicar mi sitio web real y funcional/i
      });
      expect(monetizationBtn).toBeInTheDocument();

      fireEvent.click(monetizationBtn);
      expect(mockPublish).toHaveBeenCalledTimes(1);
    });
  });
});
