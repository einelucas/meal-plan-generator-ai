// app/api/meal-plans/[id]/favorite/route.ts
//
// ⚠️  ROTA REMOVIDA — USE PATCH /api/meal-plans/[id]
//
// Esta rota foi consolidada em PATCH /api/meal-plans/[id] com o campo
// `favorite` no body. Isso elimina a duplicidade de lógica.
//
// Migração no frontend:
//   ANTES: PATCH /api/meal-plans/{id}/favorite  { favorite: true }
//   DEPOIS: PATCH /api/meal-plans/{id}           { favorite: true }
//
// Se precisar manter compatibilidade durante transição, você pode reexportar:
export { PATCH } from "../route";
