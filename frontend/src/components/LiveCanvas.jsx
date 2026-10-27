import React from 'react';
import styles from './LiveCanvas.module.css';

const MISSIONS = {
  1: {
    title: 'Misión 1: ADN & Marca',
    percent: 25,
    description: 'Definir nombre del negocio, sector, audiencia y personalidad de marca.'
  },
  2: {
    title: 'Misión 2: Estructura & Superpoderes',
    percent: 50,
    description: 'Configurar módulos interactivos (carrito, WhatsApp checkout, agenda de citas).'
  },
  3: {
    title: 'Misión 3: Contenidos, Copywriting & Catálogo',
    percent: 75,
    description: 'Redactar titulares de alta conversión, catálogo de productos y FAQs con imágenes Unsplash.'
  },
  4: {
    title: 'Misión 4: La Gran Revelación',
    percent: 100,
    description: 'Prototipo web completo generado por IA con Tailwind CSS interactivo en sandbox.'
  }
};

export function LiveCanvas({ currentPhase = 1, branding = null }) {
  const currentMission = MISSIONS[currentPhase] || MISSIONS[1];

  return (
    <main className={styles.liveCanvas} data-testid="live-canvas">
      {/* Barra de Progreso Gamificada */}
      <section className={styles.missionHeader}>
        <div className={styles.missionMeta}>
          <span className={styles.missionTitle}>{currentMission.title}</span>
          <span className={styles.missionPercent}>{currentMission.percent}%</span>
        </div>
        <div
          className={styles.progressBarContainer}
          role="progressbar"
          aria-valuenow={currentMission.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={styles.progressBarFill}
            style={{ width: `${currentMission.percent}%` }}
          />
        </div>
      </section>

      {/* Kit de Marca Reactivo */}
      {branding && (
        <section className={styles.brandKitSection}>
          <h3 className={styles.sectionTitle}>Brand Kit</h3>

          {branding.colors && (
            <div className={styles.colorGrid}>
              {Object.entries(branding.colors).map(([role, hex]) => (
                <div key={role} className={styles.colorCard}>
                  <div
                    className={styles.colorSwatch}
                    style={{ backgroundColor: hex }}
                  />
                  <span className={styles.colorRole}>{role}</span>
                  <span className={styles.colorHex}>{hex}</span>
                </div>
              ))}
            </div>
          )}

          {branding.typography && (
            <div className={styles.typographyContainer}>
              <div className={styles.typographyChip}>
                <span className={styles.typographyLabel}>Encabezados:</span>
                <span className={styles.typographyValue}>
                  {branding.typography.headings}
                </span>
              </div>
              <div className={styles.typographyChip}>
                <span className={styles.typographyLabel}>Cuerpo de texto:</span>
                <span className={styles.typographyValue}>
                  {branding.typography.body}
                </span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Wireframe Esqueleto Reactivo */}
      <section className={styles.wireframePreview}>
        <p>Wireframe Esqueleto Reactivo</p>
        <small>Los cambios visuales de marca y estructura se reflejan aquí en tiempo real.</small>
      </section>
    </main>
  );
}
