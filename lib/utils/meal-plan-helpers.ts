// lib/utils/meal-plan-helpers.ts
import { WeeklyPlan, DailyTotals, Meal } from "@/types/mealplan";

// 🔥 Função para calcular totais de um dia
export function calculateDayTotals(dayPlan: any): DailyTotals {
  let calorias = 0;
  let proteina = 0;
  let carboidratos = 0;
  let gordura = 0;

  const meals = ['cafe', 'almoco', 'jantar'];
  
  meals.forEach(mealType => {
    const meal = dayPlan[mealType];
    if (meal) {
      calorias += meal.calorias || 0;
      proteina += meal.proteina || 0;
      carboidratos += meal.carboidratos || 0;
      gordura += meal.gordura || 0;
    }
  });

  if (dayPlan.lanches && Array.isArray(dayPlan.lanches)) {
    dayPlan.lanches.forEach((snack: Meal) => {
      calorias += snack.calorias || 0;
      proteina += snack.proteina || 0;
      carboidratos += snack.carboidratos || 0;
      gordura += snack.gordura || 0;
    });
  }

  return { calorias, proteina, carboidratos, gordura };
}

// 🔥 Função para converter dias em inglês para português
export function dayEnToPt(dayEn: string): string {
  const map: { [key: string]: string } = {
    'Monday': 'segunda',
    'Tuesday': 'terca',
    'Wednesday': 'quarta',
    'Thursday': 'quinta',
    'Friday': 'sexta',
    'Saturday': 'sabado',
    'Sunday': 'domingo',
  };
  return map[dayEn] || dayEn;
}

// 🔥 Função para converter dias em português para inglês
export function dayPtToEn(dayPt: string): string {
  const map: { [key: string]: string } = {
    'segunda': 'Monday',
    'terca': 'Tuesday',
    'quarta': 'Wednesday',
    'quinta': 'Thursday',
    'sexta': 'Friday',
    'sabado': 'Saturday',
    'domingo': 'Sunday',
  };
  return map[dayPt] || dayPt;
}

// 🔥 Função para validar se um plano é válido
export function isValidMealPlan(plan: any): plan is WeeklyPlan {
  const requiredDays = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  
  return requiredDays.every(day => {
    const dayPlan = plan[day];
    return dayPlan && (
      dayPlan.cafe ||
      dayPlan.almoco ||
      dayPlan.jantar ||
      (dayPlan.lanches && dayPlan.lanches.length > 0)
    );
  });
}