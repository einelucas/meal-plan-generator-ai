// hooks/useMealPlan.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import type {
  WeeklyPlan,
  SavedPlan,
  GeneratePlanInput,
  GeneratePlanResponse,
  Meal,
} from "@/types/mealplan";

export function useMealPlan() {
  const { isSignedIn } = useUser();
  const queryClient = useQueryClient();

  // ============================================
  // BUSCAR PLANOS SALVOS
  // ============================================
  const {
    data: savedPlans,
    isLoading: plansLoading,
    refetch: refetchPlans,
  } = useQuery({
    queryKey: ["meal-plans"],
    queryFn: async () => {
      const response = await fetch("/api/meal-plans");
      if (!response.ok) {
        throw new Error("Erro ao buscar planos");
      }
      const data = await response.json();
      return data.plans as SavedPlan[];
    },
    enabled: isSignedIn,
  });

  // ============================================
  // BUSCAR PLANO ESPECÍFICO
  // ============================================
  const usePlan = (planId: string | null) =>
    useQuery({
      queryKey: ["meal-plan", planId],
      queryFn: async () => {
        if (!planId) return null;
        const response = await fetch(`/api/meal-plans/${planId}`);
        if (!response.ok) {
          throw new Error("Erro ao buscar plano");
        }
        const data = await response.json();
        return data.plan as SavedPlan;
      },
      enabled: isSignedIn && !!planId,
    });

  // ============================================
  // GERAR PLANO COM IA
  // ============================================
  const generatePlan = useMutation({
    mutationFn: async (input: GeneratePlanInput) => {
      const response = await fetch("/api/generate-mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao gerar plano");
      }

      return response.json() as Promise<GeneratePlanResponse>;
    },
    onSuccess: (data) => {
      toast.success("Plano gerado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // SALVAR PLANO
  // ============================================
  const savePlan = useMutation({
    mutationFn: async (params: {
      mealPlan: WeeklyPlan;
      dietType: string;
      calories: number;
      allergies?: string;
      cuisine?: string;
      snacks: boolean;
      name?: string;
    }) => {
      const response = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar plano");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      toast.success("Plano salvo com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // DELETAR PLANO
  // ============================================
  const deletePlan = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/meal-plans/${planId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar plano");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      toast.success("Plano removido!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // FAVORITAR/DESFAVORITAR PLANO
  // ============================================
  const toggleFavorite = useMutation({
    mutationFn: async ({
      planId,
      favorite,
    }: {
      planId: string;
      favorite: boolean;
    }) => {
      const response = await fetch(`/api/meal-plans/${planId}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite }),
      });

      if (!response.ok) {
        throw new Error("Erro ao favoritar");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      toast.success(
        variables.favorite ? "Plano favoritado!" : "Favorito removido!",
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // ATUALIZAR NOME DO PLANO
  // ============================================
  const updatePlanName = useMutation({
    mutationFn: async ({ planId, name }: { planId: string; name: string }) => {
      const response = await fetch(`/api/meal-plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar nome");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      toast.success("Nome atualizado!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // ============================================
  // MARCAR REFEIÇÃO COMO CONCLUÍDA
  // ============================================
  const toggleMealComplete = useMutation({
    mutationFn: async ({
      planId,
      day,
      mealType,
      completed,
    }: {
      planId: string;
      day: string;
      mealType: string;
      completed: boolean;
    }) => {
      // TODO: Implementar endpoint para marcar refeição
      const response = await fetch(`/api/meal-plans/${planId}/meals/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, mealType, completed }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar refeição");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plan"] });
    },
  });

  // ============================================
  // AVALIAR REFEIÇÃO
  // ============================================
  const rateMeal = useMutation({
    mutationFn: async ({
      planId,
      day,
      mealType,
      rating,
    }: {
      planId: string;
      day: string;
      mealType: string;
      rating: number;
    }) => {
      // TODO: Implementar endpoint para avaliar
      const response = await fetch(`/api/meal-plans/${planId}/meals/rate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, mealType, rating }),
      });

      if (!response.ok) {
        throw new Error("Erro ao avaliar");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Avaliação registrada!");
    },
  });

  return {
    // Queries
    savedPlans: savedPlans || [],
    plansLoading,
    usePlan,
    refetchPlans,

    // Mutations
    generatePlan,
    savePlan,
    deletePlan,
    toggleFavorite,
    updatePlanName,
    toggleMealComplete,
    rateMeal,

    // Status
    isGenerating: generatePlan.isPending,
    isSaving: savePlan.isPending,
    isDeleting: deletePlan.isPending,
  };
}
