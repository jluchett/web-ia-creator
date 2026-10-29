import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { LiveCanvas } from './LiveCanvas.jsx';

describe('Módulo 3: Superpoderes, Wireframe Reactivo y Lead Gate (Frontend)', () => {
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
    logo_url: null
  };

  const mockDynamicContent = {
    hero: {
      headline: 'Despierta tus sentidos con café de origen',
      subheadline: 'Granos seleccionados a mano en alta montaña',
      cta_text: 'Pedir Café Recién Tostado',
      hero_image_keyword: 'artisan pour over coffee',
      hero_image_url: 'https://images.unsplash.com/photo-hero-coffee'
    },
    products: [
      {
        id: 'prod_1',
        name: 'Espresso Geisha Sierra Nevada 250g',
        description: 'Notas florales a jazmín y acidez brillante',
        price: 14.5,
        currency: 'USD',
        image_keyword: 'coffee bag',
        resolved_image_url: 'https://images.unsplash.com/photo-prod-espresso'
      }
    ],
    faqs: [
      {
        question: '¿Hacen envíos nacionales?',
        answer: 'Sí, despachamos en menos de 24 horas.'
      }
    ]
  };

  describe('Test 1: Renderizado e interacción de Superpoderes (Capacidades Nivel 2)', () => {
    it('debe renderizar los interruptores de capacidades y llamar onToggleCapability al interactuar', () => {
      const mockToggle = vi.fn();
      const capabilities = {
        has_cart: false,
        has_whatsapp_checkout: false,
        has_booking: false,
        has_custom_form: false,
        has_faq_accordion: false
      };

      render(
        <LiveCanvas
          currentPhase={2}
          branding={mockBranding}
          capabilities={capabilities}
          onToggleCapability={mockToggle}
        />
      );

      // Verificar que se renderice la sección de superpoderes
      expect(screen.getByText(/Superpoderes & Módulos/i)).toBeInTheDocument();

      // Verificar la presencia de los 5 interruptores
      const cartSwitch = screen.getByRole('switch', { name: /Carrito de compras/i });
      const waSwitch = screen.getByRole('switch', { name: /WhatsApp Checkout/i });
      const bookingSwitch = screen.getByRole('switch', { name: /Agenda de Citas/i });
      const formSwitch = screen.getByRole('switch', { name: /Formulario/i });
      const faqSwitch = screen.getByRole('switch', { name: /Preguntas Frecuentes/i });

      expect(cartSwitch).toBeInTheDocument();
      expect(cartSwitch).toHaveAttribute('aria-checked', 'false');
      expect(waSwitch).toBeInTheDocument();
      expect(bookingSwitch).toBeInTheDocument();
      expect(formSwitch).toBeInTheDocument();
      expect(faqSwitch).toBeInTheDocument();

      // Alternar el switch del carrito
      fireEvent.click(cartSwitch);
      expect(mockToggle).toHaveBeenCalledWith('has_cart', true);
    });
  });

  describe('Test 2: Wireframe Reactivo estructurado con contenidos dinámicos (Nivel 3)', () => {
    it('debe renderizar el titular, CTA e imagen del Hero, productos con precios e imagen resuelta, y FAQs', () => {
      render(
        <LiveCanvas
          currentPhase={3}
          branding={mockBranding}
          dynamicContent={mockDynamicContent}
        />
      );

      // 1. Hero
      expect(screen.getByText('Despierta tus sentidos con café de origen')).toBeInTheDocument();
      expect(screen.getByText('Granos seleccionados a mano en alta montaña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pedir Café Recién Tostado/i })).toBeInTheDocument();

      const heroImg = screen.getByAltText(/Hero - Despierta tus sentidos con café de origen/i);
      expect(heroImg).toHaveAttribute('src', 'https://images.unsplash.com/photo-hero-coffee');

      // 2. Productos
      expect(screen.getByText('Espresso Geisha Sierra Nevada 250g')).toBeInTheDocument();
      expect(screen.getByText('Notas florales a jazmín y acidez brillante')).toBeInTheDocument();
      expect(screen.getByText(/14.50/)).toBeInTheDocument();

      const prodImg = screen.getByAltText(/Espresso Geisha Sierra Nevada 250g/i);
      expect(prodImg).toHaveAttribute('src', 'https://images.unsplash.com/photo-prod-espresso');

      // 3. FAQs
      expect(screen.getByText('¿Hacen envíos nacionales?')).toBeInTheDocument();
      expect(screen.getByText('Sí, despachamos en menos de 24 horas.')).toBeInTheDocument();
    });
  });

  describe('Test 3: Muro de Conversión (Lead Gate en Fase 4)', () => {
    it('debe mostrar el formulario de Lead Gate si is_unlocked es false y llamar onUnlockLead al enviarlo', () => {
      const mockUnlock = vi.fn();
      const leadInfo = { is_unlocked: false };

      render(
        <LiveCanvas
          currentPhase={4}
          branding={mockBranding}
          dynamicContent={mockDynamicContent}
          leadInfo={leadInfo}
          onUnlockLead={mockUnlock}
        />
      );

      // Verificar que el muro de conversión se muestra
      expect(screen.getByRole('heading', { name: /La Gran Revelación/i })).toBeInTheDocument();
      expect(screen.getByTestId('lead-gate-card')).toBeInTheDocument();
      expect(
        screen.getByText(/Desbloquea el acceso a la compilación interactiva/i)
      ).toBeInTheDocument();

      // Completar campos
      const nameInput = screen.getByPlaceholderText(/Tu nombre completo/i);
      const waInput = screen.getByPlaceholderText(/Tu número de WhatsApp/i);
      const emailInput = screen.getByPlaceholderText(/Tu correo electrónico/i);
      const unlockButton = screen.getByRole('button', { name: /Desbloquear Prototipo/i });

      fireEvent.change(nameInput, { target: { value: 'Carlos Mendoza' } });
      fireEvent.change(waInput, { target: { value: '+573001234567' } });
      fireEvent.change(emailInput, { target: { value: 'carlos@cafedelabrisacol.com' } });

      fireEvent.click(unlockButton);

      expect(mockUnlock).toHaveBeenCalledWith({
        full_name: 'Carlos Mendoza',
        whatsapp: '+573001234567',
        email: 'carlos@cafedelabrisacol.com'
      });
    });

    it('no debe mostrar el Muro de Conversión si is_unlocked es true', () => {
      const leadInfo = {
        is_unlocked: true,
        full_name: 'Carlos Mendoza',
        whatsapp: '+573001234567',
        email: 'carlos@cafedelabrisacol.com'
      };

      render(
        <LiveCanvas
          currentPhase={4}
          branding={mockBranding}
          dynamicContent={mockDynamicContent}
          leadInfo={leadInfo}
        />
      );

      // El muro de conversión no debe estar presente
      expect(screen.queryByText(/Desbloquea el acceso a la compilación interactiva/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Tu número de WhatsApp/i)).not.toBeInTheDocument();
    });
  });
});
