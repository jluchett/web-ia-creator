import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';
import { LiveCanvas } from './components/LiveCanvas.jsx';

describe('Frontend Shell & Layout (SDD + TDD)', () => {
  const cafeDeLaBrisaBranding = {
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
  };

  it('debe renderizar el layout de 2 columnas: Panel Izquierdo (ChatPanel) y Panel Derecho (LiveCanvas)', () => {
    render(<App />);

    const chatPanel = screen.getByTestId('chat-panel');
    const liveCanvas = screen.getByTestId('live-canvas');

    expect(chatPanel).toBeInTheDocument();
    expect(liveCanvas).toBeInTheDocument();
  });

  describe('Barra de Progreso Gamificada por Misiones', () => {
    it('debe mostrar Nivel 1: 25% y "Misión 1: ADN & Marca" cuando currentPhase es 1', () => {
      render(<LiveCanvas currentPhase={1} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
      expect(progressBar).toHaveAttribute('aria-valuenow', '25');
      expect(screen.getByText(/25%/i)).toBeInTheDocument();
      expect(screen.getByText(/Misión 1: ADN & Marca/i)).toBeInTheDocument();
    });

    it('debe mostrar Nivel 2: 50% y "Misión 2: Estructura & Superpoderes" cuando currentPhase es 2', () => {
      render(<LiveCanvas currentPhase={2} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '50');
      expect(screen.getByText(/50%/i)).toBeInTheDocument();
      expect(screen.getByText(/Misión 2: Estructura & Superpoderes/i)).toBeInTheDocument();
    });

    it('debe mostrar Nivel 3: 75% y "Misión 3: Contenidos, Copywriting & Catálogo" cuando currentPhase es 3', () => {
      render(<LiveCanvas currentPhase={3} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(screen.getByText(/75%/i)).toBeInTheDocument();
      expect(screen.getByText(/Misión 3: Contenidos, Copywriting & Catálogo/i)).toBeInTheDocument();
    });

    it('debe mostrar Nivel 4: 100% y "Misión 4: La Gran Revelación" cuando currentPhase es 4', () => {
      render(<LiveCanvas currentPhase={4} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '100');
      expect(screen.getByText(/100%/i)).toBeInTheDocument();
      expect(screen.getByText(/Misión 4: La Gran Revelación/i)).toBeInTheDocument();
    });
  });

  describe('Fichas del Kit de Marca (Brand Kit)', () => {
    it('debe renderizar las fichas del Kit de Marca (colores y tipografías) cuando recibe el fixture de "Café de la Brisa"', () => {
      render(<LiveCanvas currentPhase={1} branding={cafeDeLaBrisaBranding} />);

      // Verificar que se rendericen los códigos de color
      expect(screen.getByText('#4A2E1B')).toBeInTheDocument();
      expect(screen.getByText('#D4A373')).toBeInTheDocument();
      expect(screen.getByText('#FAEDCD')).toBeInTheDocument();
      expect(screen.getByText('#FEFAE0')).toBeInTheDocument();
      expect(screen.getByText('#283618')).toBeInTheDocument();

      // Verificar que se rendericen las tipografías
      expect(screen.getByText(/Playfair Display/i)).toBeInTheDocument();
      expect(screen.getByText(/Inter/i)).toBeInTheDocument();
    });
  });
});
