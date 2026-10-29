---
name: verify-sandbox-preview
description: Ejecuta la suite completa del monorepo y verifica la seguridad del componente IframePreview (sandbox="allow-scripts", inyección de variables CSS de marca y ausencia de regresiones).
---
# Skill: Verificación del Motor de Prototipos (Sandbox Preview)

Cuando el usuario solicite ejecutar `/verify-sandbox-preview` o al finalizar la implementación del Módulo 4, ejecuta este protocolo en orden:

1. **Verificación de Contratos y Suite Global (TDD):**
   - Ejecuta `npm.cmd test` en la raíz del monorepo y confirma que el 100% de los tests en `@webcreator/shared`, `@webcreator/backend` y `@webcreator/frontend` pasen en verde.
2. **Auditoría de Seguridad del Sandbox:**
   - Inspecciona `frontend/src/components/IframePreview.jsx` y verifica que el elemento `<iframe>` tenga explícitamente `sandbox="allow-scripts"` (sin `allow-same-origin`) y reciba el documento vía `srcDoc`.
3. **Auditoría de Reactividad CSS (Cero Latencia):**
   - Verifica que `IframePreview.jsx` inyecte los colores de `branding.colors` y las fuentes de `branding.typography` como variables CSS dentro de `:root { ... }` en el `<head>` del `srcDoc`.
4. **Prueba de Compilación de Producción:**
   - Ejecuta `npm.cmd run build --prefix frontend` para garantizar que el empaquetado de Vite no tenga errores de importación ni de estilos CSS Modules.