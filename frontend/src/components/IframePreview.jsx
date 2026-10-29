import React, { useMemo } from 'react';
import styles from './IframePreview.module.css';

/**
 * Componente Visor Sandbox Seguro (IframePreview).
 * Aísla la ejecución del código generado por IA con sandbox="allow-scripts"
 * e inyecta variables CSS dinámicas en :root para reactividad instantánea con cero latencia.
 */
export function IframePreview({ branding = {}, prototypeCode = {} }) {
  const { colors, typography } = branding || {};
  const { html_body, custom_css, vanilla_js } = prototypeCode || {};

  const combinedSource = useMemo(() => {
    const primaryColor = colors?.primary || '#4A2E1B';
    const secondaryColor = colors?.secondary || '#D4A373';
    const accentColor = colors?.accent || '#FAEDCD';
    const backgroundColor = colors?.background || '#FEFAE0';
    const textColor = colors?.text || '#283618';

    const headingFont = typography?.headings || 'Playfair Display';
    const bodyFont = typography?.body || 'Inter';

    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      headingFont
    )}:wght@600;700&family=${encodeURIComponent(bodyFont)}:wght@400;500;600&display=swap`;

    return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="${googleFontsUrl}" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      :root {
        --color-primary: ${primaryColor};
        --color-secondary: ${secondaryColor};
        --color-accent: ${accentColor};
        --color-bg: ${backgroundColor};
        --color-text: ${textColor};
        --font-heading: '${headingFont}', serif;
        --font-body: '${bodyFont}', sans-serif;
      }
      body {
        background-color: var(--color-bg);
        color: var(--color-text);
        font-family: var(--font-body);
        margin: 0;
        padding: 0;
      }
      ${custom_css || ''}
    </style>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              'brand-primary': 'var(--color-primary)',
              'brand-secondary': 'var(--color-secondary)',
              'brand-accent': 'var(--color-accent)',
              'brand-bg': 'var(--color-bg)',
              'brand-text': 'var(--color-text)'
            },
            fontFamily: {
              heading: ['var(--font-heading)'],
              body: ['var(--font-body)']
            }
          }
        }
      };
    </script>
  </head>
  <body>
    ${html_body || ''}
    <script>
      ${vanilla_js || ''}
    </script>
  </body>
</html>`;
  }, [colors, typography, html_body, custom_css, vanilla_js]);

  return (
    <div className={styles.iframeContainer}>
      <div className={styles.iframeHeader}>
        <div className={styles.windowDots}>
          <div className={`${styles.dot} ${styles.dotRed}`} />
          <div className={`${styles.dot} ${styles.dotYellow}`} />
          <div className={`${styles.dot} ${styles.dotGreen}`} />
        </div>
        <div className={styles.addressBar}>https://sandbox.webcreator.ai/preview</div>
      </div>
      <iframe
        title="Prototipo Web Vivo"
        srcDoc={combinedSource}
        sandbox="allow-scripts"
        className={styles.iframeElement}
      />
    </div>
  );
}
