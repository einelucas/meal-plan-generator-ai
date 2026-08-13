// lib/mealplan.ts
// Funções utilitárias compartilhadas para planos alimentares

export const DAY_MAPPING: Record<string, string> = {
  segunda: "Monday",
  terca: "Tuesday",
  quarta: "Wednesday",
  quinta: "Thursday",
  sexta: "Friday",
  sabado: "Saturday",
  domingo: "Sunday",
};

export const REQUIRED_DAYS = Object.keys(DAY_MAPPING);

/**
 * Calcula calorias diárias com base na fórmula de Mifflin-St Jeor.
 * NOTA: Assume idade=30 e sexo masculino. Adicione `age` e `gender` ao perfil
 * para cálculo mais preciso.
 */
export function calculateDailyCalories(
  height: number,
  currentWeight: number,
  targetWeight: number,
  _dietType: string
): number {
  const tmb = 10 * currentWeight + 6.25 * height - 5 * 30 + 5;
  const activityFactor = 1.55; // atividade moderada
  const maintenance = Math.round(tmb * activityFactor);

  if (targetWeight < currentWeight) return Math.round(maintenance - 500); // emagrecer
  if (targetWeight > currentWeight) return Math.round(maintenance + 300); // ganhar massa
  return maintenance; // manter
}

/**
 * Calcula os totais nutricionais de cada dia do plano semanal.
 */
export function calculateDailyTotals(mealPlan: any): Record<string, any> {
  const totals: Record<string, any> = {};

  for (const day of REQUIRED_DAYS) {
    const dayPlan = mealPlan[day];
    if (!dayPlan) continue;

    let calorias = 0, proteina = 0, carboidratos = 0, gordura = 0;

    const sumMeal = (meal: any) => {
      if (!meal) return;
      calorias += meal.calorias || 0;
      proteina += meal.proteina || 0;
      carboidratos += meal.carboidratos || 0;
      gordura += meal.gordura || 0;
    };

    sumMeal(dayPlan.cafe);
    sumMeal(dayPlan.almoco);
    sumMeal(dayPlan.jantar);
    (dayPlan.lanches ?? []).forEach(sumMeal);

    totals[day] = {
      calorias: Math.round(calorias),
      proteina: Math.round(proteina),
      carboidratos: Math.round(carboidratos),
      gordura: Math.round(gordura),
    };
  }

  return totals;
}

/**
 * Preenche dias faltantes no plano gerado pela IA.
 */
export function fillMissingDays(mealPlan: any): any {
  const emptyMeal = {
    nome: "Dia não gerado",
    calorias: 0,
    proteina: 0,
    carboidratos: 0,
    gordura: 0,
    descricao: "",
    emoji: "❓",
    tempo_preparo: 0,
    dificuldade: "Fácil",
    ingredientes: [],
  };

  for (const day of REQUIRED_DAYS) {
    if (!mealPlan[day]) {
      mealPlan[day] = {
        cafe: { ...emptyMeal },
        almoco: { ...emptyMeal },
        jantar: { ...emptyMeal },
        lanches: [],
      };
    }
  }

  return mealPlan;
}

/**
 * Faz parse seguro de string JSON; retorna null em caso de falha.
 */
export function safeParse<T = any>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Extrai e parseia o JSON retornado pela IA, tratando markdown fences.
 */
export function parseAIJson(content: string): any {
  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Resposta da IA não contém JSON válido");
  }
}
