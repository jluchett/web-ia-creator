# 📘 Manual de Proyecto y Arquitectura: WebCreator AI (v2.0)

**Plataforma Conversacional y Gamificada de Prototipado Web y Captura de Leads Asistida por IA**

## 📑 Tabla de Contenidos

1. [Resumen Ejecutivo & Visión del Producto](#1-resumen-ejecutivo--visión-del-producto)

2. [Modelo de Negocio y Embudo con "Lead Gate"](#2-modelo-de-negocio-y-embudo-con-lead-gate)

3. [Experiencia de Usuario (UX), Gamificación y Mitigación de Latencia](#3-experiencia-de-usuario-ux-gamificación-y-mitigación-de-latencia)

4. [Arquitectura del Sistema & Stack Tecnológico (Actualizado 2026)](#4-arquitectura-del-sistema--stack-tecnológico-actualizado-2026)

5. [El "JSON Maestro" Adaptativo (Modelado de Datos)](#5-el-json-maestro-adaptativo-modelado-de-datos)

6. [Diseño de Agentes, Modelos Gemini e Integración con IA](#6-diseño-de-agentes-modelos-gemini-e-integración-con-ia)

7. [Fases del Desarrollo & Roadmap Tecnológico](#7-fases-del-desarrollo--roadmap-tecnológico)

8. [Guía de Implementación para Desarrolladores](#8-guía-de-implementación-para-desarrolladores)

9. [Seguridad, Control de Costos y Métricas (KPIs)](#9-seguridad-control-de-costos-y-métricas-kpis)

## 1. Resumen Ejecutivo & Visión del Producto

### 1.1 El Problema

Los dueños de pequeños negocios, emprendedores y profesionales independientes sufren de **"parálisis por la página en blanco"** y complejidad técnica cuando intentan crear su sitio web en plataformas tradicionales (Wix, WordPress, Framer). Por otro lado, contratar una agencia convencional implica costos elevados, reuniones extensas y falta de claridad visual en las fases iniciales.

### 1.2 La Solución: WebCreator AI

WebCreator AI es un **Consultor Creativo y Arquitecto Web Automatizado** con una interfaz interactiva de dos paneles:

* **Panel Izquierdo (Asistente IA):** Un chat conversacional guiado que acompaña al usuario misión por misión (desde la identidad de marca hasta el catálogo y la arquitectura del sitio).

* **Panel Derecho (Live Canvas Híbrido):** Un lienzo dinámico que en las primeras fases muestra un **Wireframe Reactivo en tiempo real** (hidratado al instante con los colores, logos y textos aprobados) y, en la fase final, compila y renderiza un **prototipo navegable e interactivo (HTML5 + Tailwind CSS + JS Vanilla)** dentro de un entorno aislado (`<iframe>`).

El usuario no diseña ni arrastra bloques complejos: **el usuario toma decisiones estratégicas**, aprueba conceptos visuales generados por IA y experimenta su sitio web funcionando antes de contratar el desarrollo real.

## 2. Modelo de Negocio y Embudo con "Lead Gate"

La plataforma opera como un **Embudo de Conversión Interactiva para Servicios de Desarrollo de Software (*Productized Service*)**, protegido mediante un muro de captura de datos (*Lead Gate*) estratégico antes del consumo intensivo de cómputo del prototipo final.

```
[ Usuario entra gratis (Sesión persistente con Rate Limit) ]
                             ↓
[ Misiones 1 a 3: Chat Gamificado + Kit de Marca + Wireframe Reactivo ]
                             ↓
[ 🔒 LEAD GATE (Paso del Nivel 3 al 4): "¿Dónde enviamos tu Kit de Marca y el link de tu Prototipo?" ]
  (El usuario ingresa Nombre, WhatsApp y Email para desbloquear la compilación final)
                             ↓
[ Misión 4: Compilación y Renderizado del Prototipo Interactivo en el Iframe ]
  (Ajustes de colores/fuentes en tiempo real vía CSS Variables sin costo de tokens)
                             ↓
[ BOTÓN DE MONETIZACIÓN: "Quiero publicar mi sitio web real y funcional" ]
                             ↓
[ Cierre de venta directa para la agencia/desarrollador ($300 - $1,500+ USD) ]


```

### Ventajas Estratégicas del Nuevo Embudo

1. **Captura Temprana del Lead (*Lead Gate*):** Incluso si el usuario no compra inmediatamente tras ver el prototipo, la agencia ya capturó su WhatsApp, Email y el **JSON Maestro** con todas las necesidades de su negocio en el punto máximo de entusiasmo (transición del Nivel 3 al 4).

2. **Protección del Presupuesto de API:** La llamada más costosa (generación de código completo e interactividad por el Agente 2) solo se ejecuta para leads verificados.

3. **Eliminación de la Fase de Levantamiento de Requerimientos:** Al cerrar la venta, el equipo técnico recibe un documento JSON validado con paleta de colores, logo generado, copy persuasivo, estructura y módulos requeridos.

## 3. Experiencia de Usuario (UX), Gamificación y Mitigación de Latencia

La interfaz se divide en dos secciones principales bajo un enfoque *desktop-first* adaptable:

```
+------------------------------------+------------------------------------+
|                                    |  PANEL LATERAL DINÁMICO            |
|  CHAT INTERACTIVO (ASISTENTE IA)   |  (LIVE CANVAS / DASHBOARD)         |
|                                    |                                    |
|  • Mensajes en streaming           |  • Barra de progreso por Misiones  |
|  • Chips de respuesta rápida       |  • Niveles 1-3: Wireframe Reactivo |
|  • Selectores visuales de marca    |  • Controles de color instantáneos |
|  • Modal de Lead Gate (Nivel 3->4) |  • Nivel 4: Visor Iframe Interactivo|
+------------------------------------+------------------------------------+


```

### Progresión Gamificada por Misiones y Respuesta Visual Inmediata

1. **Nivel 1: ADN & Marca (Progreso 0%** $\rightarrow$ **25%)**

   * **Objetivo:** Definir nombre del negocio, sector, audiencia y personalidad.

   * **Acción IA:** Sugiere paletas de color armónicas, tipografías de Google Fonts y genera propuestas de logotipo en tiempo real usando **`gemini-nano-banana-2.1`**.

   * **Live Canvas:** Muestra las tarjetas del *Brand Kit* y aplica inmediatamente los colores seleccionados sobre un *Wireframe Esqueleto* en React.

2. **Nivel 2: Estructura & Superpoderes (Progreso 25%** $\rightarrow$ **50%)**

   * **Objetivo:** Definir el tipo de sitio (E-commerce ligero, Landing de Servicios, Reservas, Portafolio).

   * **Acción IA:** Invoca la función `setSiteCapabilities` para activar módulos (carrito en memoria, checkout hacia WhatsApp, agenda de citas, calculadora o formulario).

   * **Live Canvas:** El *Wireframe Reactivo* añade o quita bloques estructurales con animaciones suaves según los "Superpoderes" activados.

3. **Nivel 3: Contenidos, Copywriting & Catálogo (Progreso 50%** $\rightarrow$ **75%)**

   * **Objetivo:** Redactar titulares de alta conversión, beneficios, preguntas frecuentes y primeros productos/servicios.

   * **Acción IA:** Genera el copywriting persuasivo y emite *keywords* de búsqueda en inglés para cada producto/sección. El backend consulta la **API de Unsplash** para inyectar fotografías reales de alta resolución (cero enlaces rotos).

   * **Pre-cálculo asíncrono:** Mientras el usuario revisa los textos, el backend prepara el esqueleto del prompt para reducir el tiempo de espera del Nivel 4.

4. **Nivel 4: La Gran Revelación (Progreso 75%** $\rightarrow$ **100%)**

   * **Requisito de Desbloqueo (*Lead Gate*):** El usuario ingresa su WhatsApp/Email para desbloquear la compilación y recibir su resumen.

   * **Acción IA:** El **Agente 2 (`gemini-3.8-flash` / `gemini-4-argon`)** compila el prototipo completo utilizando **HTML5 + Tailwind CSS + JS Vanilla**.

   * **Iteración Instantánea (*Zero-Token Styling*):** Una vez renderizado el `<iframe>`, el usuario puede cambiar colores o tipografías desde una barra de herramientas superior; React actualiza las **Variables CSS (`:root`)** del `<iframe>` en milisegundos sin volver a llamar a la IA.

## 4. Arquitectura del Sistema & Stack Tecnológico (Actualizado 2026)

```
[ Frontend: React + Vite + CSS Modules (Shell) ]
                 │
                 │ REST API / Server-Sent Events (SSE)
                 ▼
[ Backend: Node.js (Fastify / Express) + Zod Validation + Rate Limiter ]
       │                                      │
       ├──▶ [ Google Gen AI SDK (@google/genai) ]
       │      ├─ Agente 1 (Chat & Tools): gemini-3.8-flash
       │      ├─ Micro-tareas / Clasificación: gemini-3.5-flash-lite
       │      ├─ Generación de Logos: gemini-nano-banana-2.1
       │      └─ Agente 2 (Código UI): gemini-3.8-flash / gemini-4-argon
       │
       ├──▶ [ Unsplash Official API (Image Resolver + Caché) ]
       │
       └──▶ [ Database: MongoDB Atlas (Mongoose) ]


```

### Justificación del Stack y Actualización de Modelos Gemini (Octubre 2026)

De acuerdo con la documentación oficial vigente de Google Gemini API (`ai.google.dev/gemini-api/docs/models`):

* **Migración del SDK:** El paquete antiguo `@google/generative-ai` fue deprecado en noviembre de 2025. Toda la arquitectura utiliza el SDK oficial unificado **`@google/genai`** y su **Interactions API** / **Models API**.

* **Retiro de modelos 2.5 y 2.0:** Los modelos Gemini 2.0 están apagados y el acceso a la familia 2.5 está restringido a cuentas legacy. Para proyectos nuevos, Google establece el uso de la familia **Gemini 3.5 / 3.8** y **Gemini 4**:

  * **`gemini-3.8-flash`:** Modelo Flash estable más avanzado de Google, diseñado específicamente para ingeniería de software de largo horizonte, agentes autónomos y flujos empresariales complejos. Ideal tanto para el Agente 1 como para el Agente 2.

  * **`gemini-4-argon`:** Modelo insignia (*flagship*) de razonamiento profundo con ventana de contexto de 1M de tokens y capacidad de *long decode* de hasta 1M de tokens. Se utiliza en el Agente 2 cuando el proyecto requiere lógica JavaScript compleja o múltiples vistas simuladas.

  * **`gemini-3.5-flash-lite`:** Modelo ultrarrápido y de mínimo costo para tareas auxiliares de alto volumen (validación de entradas, autocompletado de sugerencias).

  * **`gemini-nano-banana-2.1` (*Nano Banana 2.1*):** Modelo estable de generación y edición de imágenes de alta eficiencia con excelente manejo de tipografía y diseño gráfico, empleado en el Nivel 1 para generar propuestas de logotipos (reemplazando a Imagen 4, actualmente dado de baja).

* **Motor de Estilos del Prototipo (Tailwind CSS CDN + CSS Variables):** En lugar de generar cientos de líneas de CSS3 nativo desde cero (lo que incrementa la latencia y el gasto de tokens), el contenedor `<iframe>` inyecta Tailwind CSS vía CDN configurado dinámicamente con las variables de marca del usuario.

## 5. El "JSON Maestro" Adaptativo (Modelado de Datos)

El documento almacenado en MongoDB separa estrictamente los metadatos del lead, las reglas de negocio validadas con **Zod**, las imágenes resueltas por servidor y el paquete de código compilado.

### Esquema de Documento en MongoDB (`Projects Collection`)

```
{
  "_id": "670fd123abc4567890ef1111",
  "user_session_id": "sess_xyz_98765",
  "status": "prototype_generated",
  "current_phase": 4,
  "lead_info": {
    "is_unlocked": true,
    "full_name": "Carlos Mendoza",
    "whatsapp": "+573001234567",
    "email": "carlos@cafedelabrisacol.com",
    "captured_at": "2026-10-20T16:10:00.000Z"
  },
  "master_json": {
    "project_meta": {
      "business_name": "Café de la Brisa",
      "sector": "Gastronomía / Cafetería de Especialidad",
      "target_audience": "Jóvenes profesionales y amantes del café de origen",
      "tone_of_voice": "Cálido, acogedor y artesanal",
      "project_type": "e_commerce_light",
      "primary_action": "whatsapp_checkout"
    },
    "capabilities": {
      "has_cart": true,
      "has_whatsapp_checkout": true,
      "has_booking": false,
      "has_custom_form": true,
      "has_faq_accordion": true
    },
    "branding": {
      "colors": {
        "primary": "#4A2E1B",
        "secondary": "#D4A373",
        "accent": "#FAEDCD",
        "background": "#FEFAE0",
        "text": "#283618"
      },
      "typography": {
        "headings": "Playfair Display",
        "body": "Inter"
      },
      "logo_url": "https://cdn.tuplataforma.com/logos/nano_banana_logo_123.webp"
    },
    "dynamic_content": {
      "hero": {
        "headline": "Despierta tus sentidos con café de origen colombiano",
        "subheadline": "Granos seleccionados a mano en alta montaña y tostados cada semana.",
        "cta_text": "Pedir Café Recién Tostado",
        "hero_image_query": "artisan pour over coffee shop warm lighting",
        "hero_image_url": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80"
      },
      "products": [
        {
          "id": "prod_1",
          "name": "Espresso Geisha Sierra Nevada 250g",
          "description": "Notas florales a jazmín, bergamota y acidez brillante.",
          "price": 14.50,
          "currency": "USD",
          "image_search_query": "specialty coffee bag minimal packaging",
          "resolved_image_url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80"
        }
      ],
      "faqs": [
        {
          "question": "¿Hacen envíos a todo el país?",
          "answer": "Sí, despachamos en menos de 24 horas tras el tueste."
        }
      ]
    }
  },
  "generated_prototype": {
    "model_used": "gemini-3.8-flash",
    "html_body": "<header class='bg-brand-bg text-brand-text'>...</header>",
    "custom_css": ".cart-drawer { transition: transform 0.3s ease-in-out; }",
    "vanilla_js": "document.addEventListener('DOMContentLoaded', () => { ... });"
  },
  "created_at": "2026-10-20T16:00:00.000Z",
  "updated_at": "2026-10-20T16:12:30.000Z"
}


```

## 6. Diseño de Agentes, Modelos Gemini e Integración con IA

El sistema implementa una arquitectura de **Agentes Especializados con Esquemas Estrictos**:

```
                  ┌────────────────────────────────────┐
                  │        Mensaje del Usuario         │
                  └─────────────────┬──────────────────┘
                                    │
                                    ▼
                  ┌────────────────────────────────────┐
                  │   AGENTE 1: Consultor de Marca     │
                  │       (gemini-3.8-flash)           │
                  └─────────────────┬──────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐      ┌─────────────────────┐    ┌─────────────────────┐
│ Tool: Branding  │      │ Tool: Capabilities  │    │ Tool: Content/Items │
│ + Nano Banana   │      │ (Esquema Estricto)  │    │ + Unsplash Resolver │
└────────┬────────┘      └──────────┬──────────┘    └──────────┬──────────┘
         └──────────────────────────┼──────────────────────────┘
                                    │
                    Valida con Zod y guarda en MongoDB
                                    │
                        [ 🔒 LEAD GATE SUPERADO ]
                                    │
                                    ▼
                  ┌────────────────────────────────────┐
                  │   AGENTE 2: Ingeniero Frontend     │
                  │ (gemini-3.8-flash / gemini-4-argon)│
                  │ Structured Output: {html, css, js} │
                  └─────────────────┬──────────────────┘
                                    │
                                    ▼
                  [ Renderizado Seguro en Iframe React ]


```

### 6.1 Agente 1: Consultor de Marca (`gemini-3.8-flash`)

En lugar de usar una única función genérica con un objeto abierto (propenso a alucinaciones de llaves), el Agente 1 dispone de **3 herramientas con tipado estricto**:

1. `setBrandIdentity`: Define `business_name`, `sector`, `tone_of_voice`, paleta hexadecimal de 5 colores y fuentes. Dispara en paralelo a **`gemini-nano-banana-2.1`** para generar propuestas de logo.

2. `setSiteCapabilities`: Define el `project_type` y los booleanos exactos de los módulos interactivos (`has_cart`, `has_whatsapp_checkout`, `has_booking`, `has_custom_form`).

3. `setDynamicContent`: Define el `hero`, la lista de `products` o servicios (incluyendo `image_search_query` en inglés en vez de URLs inventadas) y `faqs`.

### 6.2 Agente 2: Ingeniero Frontend (`gemini-3.8-flash` o `gemini-4-argon`)

* **Configuración:** Utiliza **Structured Outputs (`responseSchema`)** para garantizar que la salida sea siempre un objeto JSON válido con tres propiedades: `html_body`, `custom_css` y `vanilla_js`.

* **System Prompt Optimizado del Agente 2:**

  > "Eres un Ingeniero Frontend Senior especialista en UI/UX y conversión. Recibirás un `master_json` con la especificación completa de un negocio y generarás un prototipo web interactivo de una sola página (SPA simulada).
  > REGLAS OBLIGATORIAS:
  >
  > 1. **Estilos con Tailwind CSS y Variables Nativas:** El entorno ya incluye Tailwind CSS vía CDN y tiene preconfiguradas las clases utilitarias `bg-brand-primary`, `text-brand-primary`, `bg-brand-secondary`, `bg-brand-accent`, `bg-brand-bg`, `text-brand-text`, `font-heading` y `font-body`. Úsalas extensivamente para que el diseño responda en tiempo real a las variables CSS del contenedor.
  >
  > 2. **Cero Imágenes Rotas:** Usa exclusivamente las URLs provistas en `hero_image_url`, `logo_url` y `resolved_image_url` del JSON.
  >
  > 3. **Interactividad Vanilla JS Realista:** Si `has_cart` es `true`, implementa un carrito lateral (drawer) funcional en memoria que sume productos, calcule el total y, al hacer clic en finalizar compra, genere un mensaje resumen o simule el envío a WhatsApp. Si hay formularios o reservas, muestra un modal interactivo de confirmación exitosa al enviar.
  >
  > 4. **Formato de Salida:** Devuelve estrictamente el esquema JSON solicitado con `html_body` (solo el contenido dentro de `<body>`), `custom_css` (solo animaciones o reglas específicas mínimas) y `vanilla_js`."

## 7. Fases del Desarrollo & Roadmap Tecnológico

### Fase 1: Base Arquitectónica y Chat Streaming (Semanas 1 - 2)

* Configuración del monorepo o repositorios de Frontend (React + Vite) y Backend (Node.js + Fastify/Express + MongoDB Atlas).

* Integración del SDK oficial `@google/genai` con `gemini-3.8-flash`.

* Implementación de persistencia de sesión anónima (`localStorage` + `user_session_id`) y *Rate Limiting* por IP.

### Fase 2: Function Calling Estricto, Unsplash y Wireframe Reactivo (Semanas 3 - 4)

* Creación de las declaraciones de funciones tipadas (`setBrandIdentity`, `setSiteCapabilities`, `setDynamicContent`) y validación con **Zod**.

* Integración del servicio de **Unsplash API** en el backend para traducir `image_search_query` en URLs válidas con caché.

* Integración de **`gemini-nano-banana-2.1`** para la generación de logos en el Nivel 1.

* Construcción del componente `LiveWireframe.jsx` para dar feedback visual instantáneo durante los Niveles 1 a 3.

### Fase 3: Lead Gate, Agente Generador y Visor Sandbox (Semanas 5 - 6)

* Implementación del modal de **Lead Gate** (captura de Nombre, WhatsApp y Email al completar el Nivel 3).

* Construcción del Agente 2 con *Structured Outputs* en `gemini-3.8-flash` (y soporte para `gemini-4-argon`).

* Desarrollo del componente `IframePreview.jsx` con inyección de Tailwind CDN, variables CSS reactivas (`:root`) y aislamiento `sandbox="allow-scripts"`.

### Fase 4: Panel de Agencia, Exportación y Cierre Comercial (Semanas 7 - 8)

* Barra de edición rápida post-generación (cambio de colores y tipografías en vivo sin consumo de tokens).

* Botón de conversión principal (*"Publicar mi sitio web real"*) conectado a WhatsApp / Pasarela de pago de anticipo.

* Dashboard privado para el desarrollador/agencia con listado de leads capturados, visor del prototipo prometido y descarga del `master_json`.

## 8. Guía de Implementación para Desarrolladores

### 8.1 Componente Visor Reactivo con Tailwind y CSS Variables (`IframePreview.jsx`)

Este patrón permite que el usuario cambie colores o fuentes desde la interfaz de React y vea el resultado de forma instantánea dentro del `<iframe>` sin volver a ejecutar el Agente 2:

```
import React, { useMemo } from 'react';
import styles from './IframePreview.module.css';

export const IframePreview = ({ branding, prototypeCode }) => {
  const { colors, typography } = branding;
  const { html_body, custom_css, vanilla_js } = prototypeCode;

  const combinedSource = useMemo(() => {
    const headingFont = typography?.headings || 'Playfair Display';
    const bodyFont = typography?.body || 'Inter';
    const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      headingFont
    )}:wght@600;700&family=${encodeURIComponent(bodyFont)}:wght@400;500;600&display=swap`;

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link href="${googleFontsUrl}" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            :root {
              --color-primary: ${colors?.primary || '#4A2E1B'};
              --color-secondary: ${colors?.secondary || '#D4A373'};
              --color-accent: ${colors?.accent || '#FAEDCD'};
              --color-bg: ${colors?.background || '#FEFAE0'};
              --color-text: ${colors?.text || '#283618'};
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
                    'brand-text': 'var(--color-text)',
                  },
                  fontFamily: {
                    heading: ['var(--font-heading)'],
                    body: ['var(--font-body)'],
                  }
                }
              }
            };
          </script>
        </head>
        <body>
          ${html_body || ''}
          <script>${vanilla_js || ''}<\/script>
        </body>
      </html>
    `;
  }, [colors, typography, html_body, custom_css, vanilla_js]);

  return (
    <div className={styles.iframeContainer}>
      <iframe
        title="Prototipo Web Vivo"
        srcDoc={combinedSource}
        sandbox="allow-scripts"
        className={styles.iframeElement}
      />
    </div>
  );
};


```

### 8.2 Servicio de IA en Node.js con el Nuevo SDK `@google/genai` (Octubre 2026)

Implementación actualizada utilizando el paquete oficial `@google/genai`, la nueva **Interactions API** para el Agente 1 y **Structured Outputs** para el Agente 2 con `gemini-3.8-flash`:

```
// services/aiService.js
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { resolveUnsplashImage } from './unsplashService.js';

// Inicialización estándar del nuevo SDK unificado (lee GEMINI_API_KEY del entorno)
const ai = new GoogleGenAI({});

// 1. Esquema de validación Zod en el Backend para proteger MongoDB
const BrandIdentityZodSchema = z.object({
  business_name: z.string(),
  sector: z.string(),
  tone_of_voice: z.string(),
  colors: z.object({
    primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    text: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
  }),
  typography: z.object({
    headings: z.string(),
    body: z.string()
  })
});

// 2. Declaración de herramienta estricta para la Interactions API (Agente 1)
const setBrandIdentityTool = {
  type: 'function',
  name: 'setBrandIdentity',
  description: 'Guarda la identidad visual, colores hexadecimales y tipografías del negocio en el Nivel 1.',
  parameters: {
    type: 'object',
    properties: {
      business_name: { type: 'string', description: 'Nombre comercial del proyecto' },
      sector: { type: 'string', description: 'Industria o nicho del negocio' },
      tone_of_voice: { type: 'string', description: 'Personalidad de comunicación' },
      colors: {
        type: 'object',
        properties: {
          primary: { type: 'string', description: 'Color principal en formato HEX (#RRGGBB)' },
          secondary: { type: 'string', description: 'Color secundario en formato HEX' },
          accent: { type: 'string', description: 'Color de acento/botones en formato HEX' },
          background: { type: 'string', description: 'Color de fondo principal en formato HEX' },
          text: { type: 'string', description: 'Color de texto principal en formato HEX' }
        },
        required: ['primary', 'secondary', 'accent', 'background', 'text']
      },
      typography: {
        type: 'object',
        properties: {
          headings: { type: 'string', description: 'Nombre de fuente de Google Fonts para títulos' },
          body: { type: 'string', description: 'Nombre de fuente de Google Fonts para párrafos' }
        },
        required: ['headings', 'body']
      }
    },
    required: ['business_name', 'sector', 'tone_of_voice', 'colors', 'typography']
  }
};

/**
 * AGENTE 1: Procesa la conversación y ejecuta Function Calling con gemini-3.8-flash
 */
export async function runConsultantAgent(userMessage, currentMasterJson) {
  const interaction = await ai.interactions.create({
    model: 'gemini-3.8-flash',
    input: `Estado actual del proyecto: ${JSON.stringify(currentMasterJson)}\nUsuario dice: ${userMessage}`,
    tools: [setBrandIdentityTool]
  });

  const patches = {};

  for (const step of interaction.steps) {
    if (step.type === 'function_call' && step.name === 'setBrandIdentity') {
      // Validación estricta con Zod antes de persistir en base de datos
      const validatedBranding = BrandIdentityZodSchema.parse(step.arguments);
      patches.branding = validatedBranding;
    }
  }

  return {
    interaction,
    patches
  };
}

/**
 * GENERADOR DE LOGOS (Nivel 1): Usa Nano Banana 2.1 (gemini-nano-banana-2.1)
 */
export async function generateBrandLogo(businessName, sector, primaryColor) {
  const response = await ai.models.generateContent({
    model: 'gemini-nano-banana-2.1',
    contents: `Create a modern, minimalist vector-style logo icon and wordmark for "${businessName}", a business in the ${sector} sector. Primary brand color: ${primaryColor}. Clean white background, high contrast, studio quality typography.`
  });

  return response;
}

/**
 * AGENTE 2: Compila el código del prototipo usando Structured Outputs
 * Soporta 'gemini-3.8-flash' (por defecto) o 'gemini-4-argon' (proyectos complejos)
 */
export async function generatePrototypeCode(masterJson, useFlagshipModel = false) {
  const targetModel = useFlagshipModel ? 'gemini-4-argon' : 'gemini-3.8-flash';

  const response = await ai.models.generateContent({
    model: targetModel,
    contents: `Genera el prototipo web interactivo completo para el siguiente JSON Maestro:\n${JSON.stringify(masterJson)}`,
    config: {
      systemInstruction:
        'Eres un Ingeniero Frontend Senior. Genera código HTML5 semántico con clases de Tailwind CSS (bg-brand-primary, text-brand-text, font-heading, etc.), CSS auxiliar mínimo y JavaScript Vanilla funcional para simular carritos, modales y envíos a WhatsApp.',
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          html_body: {
            type: Type.STRING,
            description: 'Código HTML interno del body usando clases de Tailwind CSS y las URLs reales del JSON.'
          },
          custom_css: {
            type: Type.STRING,
            description: 'Reglas CSS adicionales únicamente para transiciones o scrollbars.'
          },
          vanilla_js: {
            type: Type.STRING,
            description: 'Lógica JavaScript pura para interactividad del carrito, apertura de modales y botones.'
          }
        },
        required: ['html_body', 'custom_css', 'vanilla_js']
      }
    }
  });

  return JSON.parse(response.text);
}


```

## 9. Seguridad, Control de Costos y Métricas (KPIs)

### 9.1 Políticas de Seguridad y Presupuesto

* **Aislamiento de Ejecución:** El atributo `sandbox="allow-scripts"` (sin `allow-same-origin`) impide que el código JS generado por el LLM lea `localStorage`, cookies de sesión o realice peticiones autenticadas hacia el dominio principal.

* **Cuotas por Sesión (*Rate Limiting*):** Máximo de 30 mensajes con el Agente 1 por IP/sesión al día, máximo de 2 generaciones de logotipos con `gemini-nano-banana-2.1` por sesión gratuita, y **1 compilación del Agente 2 desbloqueable tras completar el *Lead Gate*** (con 1 regeneración adicional permitida).

### 9.2 Métricas Clave de Éxito (KPIs)

* **Tasa de Desbloqueo del *Lead Gate*:** % de usuarios que inician el Nivel 1 y dejan sus datos de contacto al finalizar el Nivel 3 (Meta objetivo: $> 35\%$).

* **Tiempo de Compilación del Nivel 4:** Latencia total del Agente 2 con `gemini-3.8-flash` + Tailwind CDN (Meta objetivo: $< 15\text{ segundos}$).

* **Tasa de Solicitud de Despliegue Real:** % de leads capturados que presionan el botón de contratación tras interactuar con su prototipo (Meta objetivo: $> 12\%$).

*Manual técnico v2.0 actualizado y optimizado para la arquitectura de producción de WebCreator AI.*