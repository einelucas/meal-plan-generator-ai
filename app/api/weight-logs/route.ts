// app/api/weight-logs/route.ts
//
// Rota alternativa para buscar histórico de peso (mantida por compatibilidade).
// Redireciona para GET /api/weight.
//
export { GET } from "../weight/route";
