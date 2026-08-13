// types/profile.ts

export interface PhysicalData {
  height?: number;
  startWeight?: number;
  targetWeight?: number;
  currentWeight?: number;
  dietType?: string;
  cookingLevel?: string;
}

export interface UserPreferences {
  dislikedFoods: string[];
  preferredFoods: string[];
  maxPrepTime?: number;
  budgetLevel?: "low" | "medium" | "high";
  dietGoal?: "perder peso" | "ganhar massa" | "manter";
}

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  subscriptionTier?: string | null;
  subscriptionActive: boolean;
  stripeSubscriptionId?: string | null;
  createdAt: string;
  updatedAt: string;
}
