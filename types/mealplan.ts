// types/mealplan.ts

export interface Meal {
  nome: string;
  descricao: string;
  emoji: string;
  calorias: number;
  proteina: number;    // gramas
  carboidratos: number; // gramas
  gordura: number;     // gramas
  tempo_preparo: number; // minutos
  dificuldade: "Fácil" | "Médio" | "Difícil";
  ingredientes: string[];
  // metadados opcionais
  id?: string;
  rating?: number;
  is_favorite?: boolean;
  is_completed?: boolean;
}

export interface DayPlan {
  cafe: Meal | null;
  almoco: Meal | null;
  jantar: Meal | null;
  lanches: Meal[];
}

export interface WeeklyPlan {
  segunda: DayPlan;
  terca: DayPlan;
  quarta: DayPlan;
  quinta: DayPlan;
  sexta: DayPlan;
  sabado: DayPlan;
  domingo: DayPlan;
}

export interface DailyTotals {
  calorias: number;
  proteina: number;
  carboidratos: number;
  gordura: number;
}

export type WeeklyTotals = Record<keyof WeeklyPlan, DailyTotals>;

export interface SavedPlanDay {
  id: string;
  day: string;
  breakfast: Meal | null;
  lunch: Meal | null;
  dinner: Meal | null;
  snacks: Meal[] | null;
}

export interface SavedPlan {
  id: string;
  name: string;
  dietType: string;
  calories: number;
  allergies?: string;
  cuisine?: string;
  snacks: boolean;
  favorite: boolean;
  createdAt: string;
  days: SavedPlanDay[];
}

export interface GeneratePlanResponse {
  success: boolean;
  mealPlan: WeeklyPlan;
  totals: WeeklyTotals;
  userData: {
    calories: number;
    dietType: string | null;
    cookingLevel: string | null;
  };
  error?: string;
  details?: string;
}
