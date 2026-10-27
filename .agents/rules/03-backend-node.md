---
trigger: glob
globs: ["backend/**"]
description: Reglas exclusivas para el Sub-Agente de Backend (Node.js + Express + MongoDB)
---
# Reglas de Backend y Persistencia
- **Stack:** Node.js con ES Modules (`"type": "module"`), Express y Mongoose para MongoDB Atlas[cite: 1].
- **Validación SDD:** Todo payload que actualice el `master_json` debe validarse primero con `MasterJsonSchema` (o sus sub-esquemas) importados desde `@webcreator/shared`.
- **TDD en Backend:** Usa Vitest y `supertest` para probar los endpoints HTTP en Fase RED antes de escribir los controladores en Fase GREEN.