import React, { useState } from 'react';
import { IframePreview } from './IframePreview.jsx';
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

const CAPABILITY_ITEMS = [
  {
    key: 'has_cart',
    label: 'Carrito de compras',
    icon: '🛒',
    desc: 'Permite acumular productos y servicios en memoria'
  },
  {
    key: 'has_whatsapp_checkout',
    label: 'WhatsApp Checkout',
    icon: '💬',
    desc: 'Envía pedidos estructurados directo a tu chat de WhatsApp'
  },
  {
    key: 'has_booking',
    label: 'Agenda de Citas',
    icon: '📅',
    desc: 'Calendario para reservar sesiones y servicios'
  },
  {
    key: 'has_custom_form',
    label: 'Formulario',
    icon: '📝',
    desc: 'Captura de cotizaciones o consultas personalizadas'
  },
  {
    key: 'has_faq_accordion',
    label: 'Preguntas Frecuentes',
    icon: '❓',
    desc: 'Acordeón con dudas y respuestas inmediatas'
  }
];

export function LiveCanvas({
  currentPhase = 1,
  branding = null,
  logoOptions = [],
  selectedLogoId = null,
  onSelectLogo = null,
  capabilities = null,
  onToggleCapability = null,
  dynamicContent = null,
  leadInfo = null,
  onUnlockLead = null,
  generatedPrototype = null,
  onGeneratePrototype = null,
  isGeneratingPrototype = false,
  onPublishClick = null
}) {
  const currentMission = MISSIONS[currentPhase] || MISSIONS[1];

  const [leadFormData, setLeadFormData] = useState({
    full_name: '',
    whatsapp: '',
    email: ''
  });

  const handleLeadSubmit = (e) => {
    e.preventDefault();
    if (onUnlockLead) {
      onUnlockLead(leadFormData);
    }
  };

  const isLeadLocked = currentPhase >= 4 && (!leadInfo || leadInfo.is_unlocked !== true);

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

      {/* Kit de Marca Reactivo (Nivel 1) */}
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

      {/* Propuestas de Logo Interactivas (gemini-nano-banana-2.1) */}
      {logoOptions && logoOptions.length > 0 && (
        <section className={styles.logosSection}>
          <h3 className={styles.sectionTitle}>Propuestas de Logo (gemini-nano-banana-2.1)</h3>
          <div className={styles.logoGrid}>
            {logoOptions.map((opt) => {
              const isSelected = selectedLogoId === opt.id;
              return (
                <div
                  key={opt.id}
                  className={styles.logoCard}
                  data-testid={`logo-card-${opt.id}`}
                  data-selected={isSelected ? 'true' : 'false'}
                >
                  <span className={styles.logoBadge}>{opt.style}</span>
                  <h4 className={styles.logoConcept}>{opt.concept}</h4>
                  <button
                    type="button"
                    className={styles.logoSelectBtn}
                    data-testid={`logo-select-${opt.id}`}
                    onClick={() => onSelectLogo && onSelectLogo(opt)}
                  >
                    {isSelected ? '✓ Seleccionado' : 'Seleccionar Logo'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Superpoderes & Módulos Interactivas (Nivel 2) */}
      {(capabilities || currentPhase >= 2) && (
        <section className={styles.superpowersSection}>
          <h3 className={styles.sectionTitle}>Superpoderes & Módulos</h3>
          <div className={styles.superpowerGrid}>
            {CAPABILITY_ITEMS.map((item) => {
              const isActive = Boolean(capabilities && capabilities[item.key]);
              return (
                <div
                  key={item.key}
                  className={styles.superpowerCard}
                  data-active={isActive ? 'true' : 'false'}
                >
                  <div className={styles.superpowerInfo}>
                    <div className={styles.superpowerHeader}>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    <span className={styles.superpowerDesc}>{item.desc}</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-label={item.label}
                    aria-checked={isActive ? 'true' : 'false'}
                    className={styles.switchButton}
                    onClick={() => onToggleCapability && onToggleCapability(item.key, !isActive)}
                  >
                    <div className={styles.switchTrack} data-checked={isActive ? 'true' : 'false'}>
                      <div className={styles.switchThumb} />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Muro de Conversión (Lead Gate - Transición Nivel 3 -> 4) */}
      {isLeadLocked ? (
        <section className={styles.leadGateCard} data-testid="lead-gate-card">
          <span className={styles.leadGateBadge}>🔒 Muro de Conversión</span>
          <h3 className={styles.leadGateTitle}>La Gran Revelación</h3>
          <p className={styles.leadGateSubtitle}>
            Desbloquea el acceso a la compilación interactiva de tu sitio web en tiempo real y recibe el Brand Kit completo en tu WhatsApp y correo.
          </p>
          <form className={styles.leadGateForm} onSubmit={handleLeadSubmit}>
            <input
              type="text"
              name="full_name"
              className={styles.leadGateInput}
              placeholder="Tu nombre completo"
              value={leadFormData.full_name}
              onChange={(e) => setLeadFormData({ ...leadFormData, full_name: e.target.value })}
              required
            />
            <input
              type="tel"
              name="whatsapp"
              className={styles.leadGateInput}
              placeholder="Tu número de WhatsApp"
              value={leadFormData.whatsapp}
              onChange={(e) => setLeadFormData({ ...leadFormData, whatsapp: e.target.value })}
              required
            />
            <input
              type="email"
              name="email"
              className={styles.leadGateInput}
              placeholder="Tu correo electrónico"
              value={leadFormData.email}
              onChange={(e) => setLeadFormData({ ...leadFormData, email: e.target.value })}
              required
            />
            <button type="submit" className={styles.leadGateSubmitBtn}>
              Desbloquear Prototipo
            </button>
          </form>
        </section>
      ) : null}

      {/* Misión 4: Generación de Prototipo (Desbloqueado sin prototipo generado aún) */}
      {currentPhase >= 4 && leadInfo?.is_unlocked === true && (!generatedPrototype || !generatedPrototype.html_body) && (
        <section className={styles.generateCard} data-testid="generate-card">
          <span className={styles.generateBadge}>Misión 4 • La Gran Revelación</span>
          <h3 className={styles.generateTitle}>Compilación del Prototipo Vivo</h3>
          <p className={styles.generateDesc}>
            Tu Lead Gate está desbloqueado. El Agente 2 (Ingeniero Frontend con IA) compilará tu sitio web interactivo completo en HTML5, Tailwind CSS y JavaScript Vanilla.
          </p>
          <button
            type="button"
            className={styles.generateBtn}
            onClick={() => onGeneratePrototype && onGeneratePrototype()}
            disabled={isGeneratingPrototype}
          >
            {isGeneratingPrototype ? 'Compilando Prototipo con IA...' : 'Generar Prototipo Interactivo'}
          </button>
        </section>
      )}

      {/* Misión 4: Visor Sandbox Seguro (IframePreview) y Botón de Monetización */}
      {currentPhase >= 4 && leadInfo?.is_unlocked === true && generatedPrototype && generatedPrototype.html_body ? (
        <section className={styles.prototypeSection} data-testid="prototype-section">
          <div className={styles.prototypeHeader}>
            <span className={styles.prototypeBadge}>🚀 Prototipo Interactivo Vivo</span>
            <h3 className={styles.prototypeTitle}>Vista Previa de tu Sitio Web</h3>
          </div>
          <IframePreview
            branding={branding}
            prototypeCode={generatedPrototype}
          />
          <div className={styles.monetizationCard} data-testid="monetization-card">
            <div className={styles.monetizationInfo}>
              <span className={styles.monetizationBadge}>💎 Oferta Exclusiva de Lanzamiento</span>
              <h4 className={styles.monetizationTitle}>¿Listo para llevar este prototipo a producción?</h4>
              <p className={styles.monetizationDesc}>
                Convertimos este prototipo interactivo en un sitio web real con dominio personalizado, pasarela de pagos integrada, SEO avanzado y hosting de alto rendimiento ($300 - $1,500 USD).
              </p>
            </div>
            <button
              type="button"
              className={styles.monetizationBtn}
              onClick={() => onPublishClick && onPublishClick()}
            >
              Quiero publicar mi sitio web real y funcional
            </button>
          </div>
        </section>
      ) : null}

      {/* Wireframe Reactivo Estructurado con Contenidos Dinámicos (Nivel 3 o Nivel 4 pre-compilación) */}
      {(!generatedPrototype || !generatedPrototype.html_body) && dynamicContent && (dynamicContent.hero || (dynamicContent.products && dynamicContent.products.length > 0)) ? (
        <section className={styles.wireframeStructured} data-testid="wireframe-structured">
          {/* Sección Hero */}
          {dynamicContent.hero && (
            <div className={styles.heroBlock}>
              <div className={styles.heroContent}>
                <h2 className={styles.heroHeadline}>{dynamicContent.hero.headline}</h2>
                <p className={styles.heroSubheadline}>{dynamicContent.hero.subheadline}</p>
                <button type="button" className={styles.heroCta}>
                  {dynamicContent.hero.cta_text || 'Comenzar Ahora'}
                </button>
              </div>
              {dynamicContent.hero.hero_image_url && (
                <div className={styles.heroImageContainer}>
                  <img
                    src={dynamicContent.hero.hero_image_url}
                    alt={`Hero - ${dynamicContent.hero.headline}`}
                    className={styles.heroImage}
                  />
                </div>
              )}
            </div>
          )}

          {/* Catálogo de Productos / Servicios */}
          {dynamicContent.products && dynamicContent.products.length > 0 && (
            <div className={styles.catalogSection}>
              <h3 className={styles.sectionTitle}>Catálogo & Productos</h3>
              <div className={styles.catalogGrid}>
                {dynamicContent.products.map((product) => (
                  <div key={product.id || product.name} className={styles.productCard}>
                    {product.resolved_image_url && (
                      <img
                        src={product.resolved_image_url}
                        alt={product.name}
                        className={styles.productImage}
                      />
                    )}
                    <div className={styles.productDetails}>
                      <h4 className={styles.productName}>{product.name}</h4>
                      <p className={styles.productDesc}>{product.description}</p>
                      <div className={styles.productFooter}>
                        <span className={styles.productPrice}>
                          ${Number(product.price).toFixed(2)} {product.currency || 'USD'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección Preguntas Frecuentes (FAQs) */}
          {dynamicContent.faqs && dynamicContent.faqs.length > 0 && (
            <div className={styles.faqsSection}>
              <h3 className={styles.sectionTitle}>Preguntas Frecuentes</h3>
              <div className={styles.faqList}>
                {dynamicContent.faqs.map((faq, idx) => (
                  <div key={idx} className={styles.faqItem}>
                    <h5 className={styles.faqQuestion}>{faq.question}</h5>
                    <p className={styles.faqAnswer}>{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : (!generatedPrototype || !generatedPrototype.html_body) ? (
        /* Wireframe Esqueleto Base cuando aún no hay contenido dinámico */
        <section className={styles.wireframePreview}>
          <p>Wireframe Esqueleto Reactivo</p>
          <small>Los cambios visuales de marca, superpoderes y contenidos se reflejan aquí en tiempo real.</small>
        </section>
      ) : null}
    </main>
  );
}
