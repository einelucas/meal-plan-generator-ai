// types/api.ts
import { WeeklyPlan, SavedPlan, GeneratePlanResponse } from "./mealplan";
import { PhysicalData, UserPreferences, UserProfile } from "./profile";

export interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  data?: T;
}

// ─── Responses ───────────────────────────────────────────────────────────────

export interface MealPlansResponse {
  plans: SavedPlan[];
}

export interface SingleMealPlanResponse {
  plan: SavedPlan;
}

export interface SubscriptionStatusResponse {
  subscription: UserProfile | null;
}

export type PhysicalDataResponse = PhysicalData;
export type PreferencesResponse = UserPreferences;
export type { GeneratePlanResponse };

// ─── Requests ────────────────────────────────────────────────────────────────

export type UpdatePhysicalDataRequest = Partial<PhysicalData>;
export type UpdatePreferencesRequest = Partial<UserPreferences>;

export interface SaveMealPlanRequest {
  mealPlan: WeeklyPlan;
  dietType: string;
  calories: number;
  allergies?: string;
  cuisine?: string;
  snacks: boolean;
  name?: string;
}

export interface CheckoutRequest {
  planType: "semana" | "mes" | "ano";
  userId: string;
  email: string;
}
