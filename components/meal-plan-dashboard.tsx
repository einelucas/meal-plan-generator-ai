"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
  RefreshCw,
  Heart,
  Check,
  Star,
  Flame,
  Clock,
  X,
  Trash2,
} from "lucide-react";
import { ShoppingList } from "./ShoppingList";
import { WeightTracker } from "./WeightTracker";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface DailyMeal {
  name: string;
  description: string;
  calories: number;
  prep_time: number;
  difficulty: string;
  rating: number;
  emoji?: string;
  is_favorite?: boolean;
  proteina?: number;
  carboidratos?: number;
  gordura?: number;
  ingredientes?: string[];
}

interface DailyMealPlan {
  breakfast?: DailyMeal | null;
  lunch?: DailyMeal | null;
  dinner?: DailyMeal | null;
  snacks?: DailyMeal[];
}

interface WeeklyMealPlan {
  [day: string]: DailyMealPlan;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const weekDays = [
  { day: "Seg", date: "", full: "Segunda-feira", english: "Monday" },
  { day: "Ter", date: "", full: "Terça-feira", english: "Tuesday" },
  { day: "Qua", date: "", full: "Quarta-feira", english: "Wednesday" },
  { day: "Qui", date: "", full: "Quinta-feira", english: "Thursday" },
  { day: "Sex", date: "", full: "Sexta-feira", english: "Friday" },
  { day: "Sáb", date: "", full: "Sábado", english: "Saturday" },
  { day: "Dom", date: "", full: "Domingo", english: "Sunday" },
];

const mealTypes = [
  { id: "breakfast", label: "Café da Manhã", icon: Coffee },
  { id: "lunch", label: "Almoço", icon: Sun },
  { id: "dinner", label: "Jantar", icon: Moon },
  { id: "snacks", label: "Lanches", icon: Cookie },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const calculateDailySummary = (dayPlan: DailyMealPlan) => {
  if (!dayPlan) return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };

  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

  const addMeal = (meal: DailyMeal | null | undefined) => {
    if (!meal) return;
    totalCalories += meal.calories || 0;
    // Usa macros reais se disponíveis, senão estima
    if (meal.proteina !== undefined) {
      totalProtein += meal.proteina;
      totalCarbs += meal.carboidratos || 0;
      totalFat += meal.gordura || 0;
    } else {
      totalProtein += Math.round((meal.calories * 0.3) / 4);
      totalCarbs += Math.round((meal.calories * 0.4) / 4);
      totalFat += Math.round((meal.calories * 0.3) / 9);
    }
  };

  addMeal(dayPlan.breakfast);
  addMeal(dayPlan.lunch);
  addMeal(dayPlan.dinner);
  (dayPlan.snacks || []).forEach(addMeal);

  return { totalCalories, totalProtein: Math.round(totalProtein), totalCarbs: Math.round(totalCarbs), totalFat: Math.round(totalFat) };
};

// ─── Converte plano salvo (days[]) de volta para WeeklyMealPlan ──────────────
function savedPlanToWeekly(plan: any): WeeklyMealPlan {
  const result: WeeklyMealPlan = {};
  (plan.days || []).forEach((day: any) => {
    result[day.day] = {
      breakfast: day.breakfast || null,
      lunch: day.lunch || null,
      dinner: day.dinner || null,
      snacks: Array.isArray(day.snacks) ? day.snacks : [],
    };
  });
  return result;
}

// ─── Modal Gerar Plano ────────────────────────────────────────────────────────

function GeneratePlanModal({ isOpen, onClose, onSubmit, isPending }: any) {
  const [formData, setFormData] = useState({
    dietType: "",
    calories: 2000,
    allergies: "",
    cuisine: "",
    snacks: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles size={20} className="text-[#007BFF]" />
                Gerar Novo Plano
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Dieta</label>
                <input
                  type="text"
                  value={formData.dietType}
                  onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                  placeholder="Ex: Low Carb, Vegetariana, Keto"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Calorias Diárias</label>
                <input
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: Number(e.target.value) })}
                  min={500}
                  max={5000}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Alergias/Restrições</label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Ex: Nozes, Laticínios, Glúten"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Culinária Preferida</label>
                <input
                  type="text"
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  placeholder="Ex: Italiana, Brasileira, Japonesa"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="snacks"
                  checked={formData.snacks}
                  onChange={(e) => setFormData({ ...formData, snacks: e.target.checked })}
                  className="w-5 h-5 text-[#007BFF] border-slate-300 rounded focus:ring-[#007BFF]"
                />
                <label htmlFor="snacks" className="text-sm text-slate-700">Incluir lanches no plano</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-[#007BFF] to-[#28A745] text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? "Gerando..." : <><Sparkles size={16} /> Gerar Plano</>}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── MealCard ─────────────────────────────────────────────────────────────────

function MealCard({ meal, type, onSwap, onFavorite, isFavorite, onComplete, isComplete, onRate }: any) {
  const [rating, setRating] = useState(meal?.rating || 0);

  const handleRate = (newRating: number) => {
    setRating(newRating);
    onRate?.(type, newRating);
  };

  // Calcular macros: usa valores reais se disponíveis, senão estima
  const protein = meal?.proteina !== undefined
    ? meal.proteina
    : Math.round((meal?.calories * 0.3) / 4);
  const carbs = meal?.carboidratos !== undefined
    ? meal.carboidratos
    : Math.round((meal?.calories * 0.4) / 4);
  const fat = meal?.gordura !== undefined
    ? meal.gordura
    : Math.round((meal?.calories * 0.3) / 9);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
    >
      <div className="bg-gradient-to-br from-[#28A745]/20 to-[#007BFF]/20 h-52 flex items-center justify-center relative">
        <span className="text-9xl">{meal?.emoji || "🍽️"}</span>
        <div className="absolute top-4 right-4 flex gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onSwap}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
          >
            <RefreshCw size={18} className="text-[#007BFF]" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onFavorite}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md"
          >
            <Heart size={18} className={isFavorite ? "fill-red-500 text-red-500" : "text-slate-400"} />
          </motion.button>
        </div>
        <div className="absolute bottom-4 left-4 bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => handleRate(star)} className="focus:outline-none">
              <Star
                size={14}
                className={star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-200 hover:text-amber-200"}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{meal?.name}</h3>
            <p className="text-slate-500 mt-1">{meal?.description}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="flex items-center gap-1 text-orange-500">
                <Flame size={18} />
                <span className="font-bold text-slate-800">{meal?.calories}</span>
              </div>
              <span className="text-xs text-slate-400">kcal</span>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 text-[#007BFF]">
                <Clock size={18} />
                <span className="font-bold text-slate-800">{meal?.prep_time}</span>
              </div>
              <span className="text-xs text-slate-400">min</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Proteína", value: protein, color: "from-blue-400 to-blue-600", bg: "bg-blue-50" },
            { label: "Carboidrato", value: carbs, color: "from-orange-400 to-orange-600", bg: "bg-orange-50" },
            { label: "Gordura", value: fat, color: "from-purple-400 to-purple-600", bg: "bg-purple-50" },
          ].map((macro, i) => (
            <div key={i} className={`${macro.bg} rounded-2xl p-4 text-center`}>
              <p className="text-2xl font-bold text-slate-800">{macro.value}g</p>
              <p className="text-sm text-slate-500 mt-1">{macro.label}</p>
            </div>
          ))}
        </div>

        {/* Ingredientes */}
        {meal?.ingredientes && meal.ingredientes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-600 mb-2">Ingredientes:</p>
            <div className="flex flex-wrap gap-1">
              {meal.ingredientes.map((ing: string, i: number) => (
                <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                  {ing}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={onComplete}
            className={`flex-1 h-12 rounded-xl font-semibold transition-all ${
              isComplete
                ? "bg-[#28A745]/10 text-[#28A745] border-2 border-[#28A745] hover:bg-[#28A745]/20"
                : "bg-[#28A745] hover:bg-[#1e7e34] text-white"
            }`}
          >
            {isComplete ? (
              <><Check size={18} className="mr-2 inline" /> Concluída</>
            ) : (
              "Marcar como concluída"
            )}
          </button>
          <button className="flex-1 h-12 rounded-xl border-2 border-[#007BFF] text-[#007BFF] font-semibold hover:bg-[#007BFF]/10 transition-all">
            Ver Receita Completa
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── SwapModal ────────────────────────────────────────────────────────────────

function SwapModal({ isOpen, onClose, onSelect }: any) {
  const options = [
    { name: "Peito de Frango Grelhado", calories: 450, emoji: "🍗" },
    { name: "Salada Caesar com Camarão", calories: 380, emoji: "🥗" },
    { name: "Wrap Integral de Atum", calories: 420, emoji: "🌯" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">Trocar Refeição</h3>
            <p className="text-slate-500 mb-6">Escolha uma alternativa sugerida pela IA:</p>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { onSelect(opt); onClose(); }}
                  className="w-full flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-[#007BFF]/10 hover:border-[#007BFF] border-2 border-transparent transition-all"
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-slate-700">{opt.name}</p>
                    <p className="text-sm text-slate-500">{opt.calories} kcal</p>
                  </div>
                  <span className="text-[#007BFF] text-sm font-medium">Selecionar</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Dashboard Principal ─────────────────────────────────────────────────────

export default function MealPlanDashboard() {
  const { isSignedIn, user } = useUser();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"gerar" | "salvos" | "progresso">("gerar");
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedMeal, setSelectedMeal] = useState("lunch");
  const [completedMeals, setCompletedMeals] = useState<string[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<string[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [currentMealPlan, setCurrentMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [savedPlanId, setSavedPlanId] = useState<string | null>(null);
  const [dietType, setDietType] = useState("");
  const [calories, setCalories] = useState<number>(2000);
  const [allergies, setAllergies] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [snacks, setSnacks] = useState(true);
  const [weekStartDate, setWeekStartDate] = useState(new Date());

  // Calcular datas da semana
  useEffect(() => {
    const start = new Date();
    start.setDate(start.getDate() - start.getDay() + 1);
    setWeekStartDate(start);
    weekDays.forEach((day, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      weekDays[index].date = date.getDate().toString();
    });
  }, []);

  // Buscar planos salvos
  const { data: savedPlans } = useQuery({
    queryKey: ["meal-plans"],
    queryFn: async () => {
      const res = await fetch("/api/meal-plans");
      if (!res.ok) return { plans: [] };
      return res.json();
    },
    enabled: !!isSignedIn,
  });

  // Gerar plano
  const generateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await fetch("/api/generate-mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao gerar plano");
      return data;
    },
    onSuccess: async (data) => {
      if (data.mealPlan) {
        setCurrentMealPlan(data.mealPlan);
        toast.success("Plano gerado com sucesso!");
        setShowGenerateModal(false);
        if (isSignedIn) {
          await saveMealPlan(data.mealPlan);
        }
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const saveMealPlan = async (mealPlan: WeeklyMealPlan) => {
    try {
      const response = await fetch("/api/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealPlan,
          dietType,
          calories,
          allergies,
          cuisine,
          snacks,
          name: `Plano ${new Date().toLocaleDateString("pt-BR")}`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSavedPlanId(data.plan.id);
        queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  // Deletar plano
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      const response = await fetch(`/api/meal-plans/${planId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Erro ao deletar plano");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meal-plans"] });
      toast.success("Plano removido com sucesso!");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  // Favoritar plano
  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ planId, favorite }: { planId: string; favorite: boolean }) => {
      const response = await fetch(`/api/meal-plans/${planId}/favorite`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favorite }),
      });
      if (!response.ok) throw new Error("Erro ao favoritar");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["meal-plans"] }),
  });

  const handleGeneratePlan = (formData: any) => {
    setDietType(formData.dietType);
    setCalories(formData.calories);
    setAllergies(formData.allergies);
    setCuisine(formData.cuisine);
    setSnacks(formData.snacks);
    generateMutation.mutate(formData);
  };

  const toggleFavorite = (mealId: string) => {
    setFavoriteMeals((prev) =>
      prev.includes(mealId) ? prev.filter((m) => m !== mealId) : [...prev, mealId]
    );
  };

  const toggleComplete = (mealId: string) => {
    setCompletedMeals((prev) =>
      prev.includes(mealId) ? prev.filter((m) => m !== mealId) : [...prev, mealId]
    );
  };

  // Carregar plano salvo — converte days[] para WeeklyMealPlan
  const loadPlan = (plan: any) => {
    const weekly = savedPlanToWeekly(plan);
    setCurrentMealPlan(weekly);
    setSavedPlanId(plan.id);
    setDietType(plan.dietType || "");
    setCalories(plan.calories || 2000);
    setActiveTab("gerar");
    toast.success("Plano carregado!");
  };

  const getCurrentMeal = (): DailyMeal | null => {
    if (!currentMealPlan) return null;
    const dayMeals = currentMealPlan[weekDays[selectedDay].english];
    if (!dayMeals) return null;
    if (selectedMeal === "snacks") return dayMeals.snacks?.[0] || null;
    return (dayMeals[selectedMeal as keyof DailyMealPlan] as DailyMeal) || null;
  };

  const currentDayPlan = currentMealPlan?.[weekDays[selectedDay].english];
  const dailySummary = calculateDailySummary(currentDayPlan || {});
  const currentMeal = getCurrentMeal();

  // ─── Render tabs ─────────────────────────────────────────────────────────

  const renderTabs = () => (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab("gerar")}
            className={`py-4 px-2 font-medium border-b-2 transition-colors ${
              activeTab === "gerar" ? "border-[#007BFF] text-[#007BFF]" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            📅 Plano Semanal
          </button>
          {isSignedIn && (
            <>
              <button
                onClick={() => setActiveTab("salvos")}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === "salvos" ? "border-[#007BFF] text-[#007BFF]" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                💾 Planos Salvos ({savedPlans?.plans?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab("progresso")}
                className={`py-4 px-2 font-medium border-b-2 transition-colors ${
                  activeTab === "progresso" ? "border-[#007BFF] text-[#007BFF]" : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                📈 Meu Progresso
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // ─── Render planos salvos ─────────────────────────────────────────────────

  const renderSavedPlans = () => (
    <div className="max-w-7xl mx-auto px-6 py-6">
      <div className="grid gap-4">
        {!savedPlans?.plans?.length ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-slate-500">Nenhum plano salvo ainda.</p>
          </div>
        ) : (
          savedPlans.plans.map((plan: any) => (
            <div
              key={plan.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow"
            >
              <div>
                <h3 className="font-semibold text-slate-800">{plan.name || "Plano sem nome"}</h3>
                <p className="text-sm text-slate-500 mt-1">
                  {plan.dietType} • {plan.calories} calorias •{" "}
                  {new Date(plan.createdAt).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadPlan(plan)}
                  className="p-3 bg-[#007BFF]/10 text-[#007BFF] rounded-xl hover:bg-[#007BFF]/20 transition-colors"
                  title="Carregar plano"
                >
                  📂
                </button>
                <button
                  onClick={() => toggleFavoriteMutation.mutate({ planId: plan.id, favorite: !plan.favorite })}
                  className={`p-3 rounded-xl transition-colors ${
                    plan.favorite ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
                  }`}
                  title={plan.favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  {plan.favorite ? "❤️" : "🤍"}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Tem certeza que deseja excluir este plano?")) {
                      deletePlanMutation.mutate(plan.id);
                    }
                  }}
                  className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                  title="Excluir plano"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ─── Render principal ─────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />

      {renderTabs()}

      {activeTab === "gerar" && (
        <>
          {/* Header */}
          <div className="bg-white border-b border-slate-100 px-6 py-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-slate-400">
                    {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  <h1 className="text-2xl font-bold text-slate-800 mt-1">Plano Semanal</h1>
                </div>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="bg-[#007BFF] hover:bg-[#0056b3] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                >
                  <Sparkles size={18} />
                  Gerar Novo
                </button>
              </div>
            </div>
          </div>

          {/* AI Info */}
          <div className="max-w-7xl mx-auto px-6 mt-6">
            <div className="bg-gradient-to-r from-[#007BFF]/10 to-[#28A745]/10 rounded-xl p-4 border border-[#007BFF]/20">
              <p className="text-sm text-slate-600">
                <span className="font-semibold text-[#007BFF]">
                  Semana de {weekStartDate.getDate()} a{" "}
                  {new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).getDate()}{" "}
                  de {weekStartDate.toLocaleDateString("pt-BR", { month: "long" })}
                </span>
                <span className="ml-2">• Plano gerado pela IA com base nas suas preferências</span>
              </p>
            </div>
          </div>

          {/* Week navigation */}
          <div className="max-w-7xl mx-auto px-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-slate-400" />
              </button>
              <span className="font-semibold text-slate-700">
                {weekStartDate.getDate()} -{" "}
                {new Date(weekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).getDate()}{" "}
                {weekStartDate.toLocaleDateString("pt-BR", { month: "long" })}
              </span>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {weekDays.map((day, index) => (
                <motion.button
                  key={day.day}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDay(index)}
                  className={`flex-shrink-0 w-16 py-3 rounded-xl flex flex-col items-center transition-all ${
                    selectedDay === index
                      ? "bg-[#007BFF] text-white shadow-md shadow-[#007BFF]/30"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-[#007BFF]/30"
                  }`}
                >
                  <span className="text-xs font-medium">{day.day}</span>
                  <span className="text-xl font-bold">{day.date}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Main grid */}
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-12 gap-6">
              {/* Left sidebar */}
              <div className="col-span-3">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Refeições</h3>
                <div className="space-y-2">
                  {mealTypes.map(({ id, label, icon: Icon }) => {
                    const isActive = selectedMeal === id;
                    const isComplete = completedMeals.includes(id);
                    const isFav = favoriteMeals.includes(id);

                    return (
                      <motion.button
                        key={id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedMeal(id)}
                        className={`w-full p-4 rounded-2xl flex items-center gap-3 text-left transition-all ${
                          isActive
                            ? "bg-[#007BFF] text-white shadow-lg shadow-[#007BFF]/30"
                            : "bg-white text-slate-600 border border-slate-100 hover:border-[#007BFF]/30"
                        }`}
                      >
                        <Icon size={20} />
                        <span className="font-medium flex-1">{label}</span>
                        <div className="flex items-center gap-1">
                          {isFav && <Heart size={14} className={isActive ? "text-red-300 fill-red-300" : "text-red-400 fill-red-400"} />}
                          {isComplete && (
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isActive ? "bg-white/20" : "bg-[#28A745]"}`}>
                              <Check size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Daily Summary */}
                {currentDayPlan && (
                  <div className="bg-slate-800 rounded-2xl p-6 mt-6 text-white">
                    <h4 className="text-sm font-semibold mb-4">Resumo do Dia</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold">{dailySummary.totalCalories}</p>
                        <p className="text-xs text-white/60">kcal</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-[#28A745]">{dailySummary.totalProtein}g</p>
                        <p className="text-xs text-white/60">proteína</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-orange-400">{dailySummary.totalCarbs}g</p>
                        <p className="text-xs text-white/60">carbs</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-3 text-center">
                        <p className="text-xl font-bold text-purple-400">{dailySummary.totalFat}g</p>
                        <p className="text-xs text-white/60">gordura</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main content */}
              <div className="col-span-9">
                {generateMutation.isPending ? (
                  <div className="flex flex-col justify-center items-center h-64 bg-white rounded-3xl gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007BFF]"></div>
                    <p className="text-slate-500">Gerando seu plano personalizado...</p>
                  </div>
                ) : currentMeal ? (
                  <AnimatePresence mode="wait">
                    {selectedMeal !== "snacks" ? (
                      <MealCard
                        key={`${selectedDay}-${selectedMeal}`}
                        meal={currentMeal}
                        type={selectedMeal}
                        onSwap={() => setShowSwapModal(true)}
                        onFavorite={() => toggleFavorite(selectedMeal)}
                        isFavorite={favoriteMeals.includes(selectedMeal)}
                        onComplete={() => toggleComplete(selectedMeal)}
                        isComplete={completedMeals.includes(selectedMeal)}
                        onRate={(type: string, rating: number) => toast.success(`Avaliação ${rating}⭐ registrada!`)}
                      />
                    ) : (
                      <motion.div
                        key="snacks"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-2 gap-4"
                      >
                        {(currentMealPlan?.[weekDays[selectedDay].english]?.snacks || []).map(
                          (snack, i) => (
                            <div
                              key={i}
                              className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-4"
                            >
                              <span className="text-6xl">{snack.emoji || "🍪"}</span>
                              <div className="text-center">
                                <h4 className="text-xl font-bold text-slate-800">{snack.name}</h4>
                                <p className="text-slate-500 mt-1">{snack.calories} kcal</p>
                              </div>
                              <button className="w-full py-3 border-2 border-[#007BFF] text-[#007BFF] rounded-xl font-medium hover:bg-[#007BFF]/10 transition-all flex items-center justify-center gap-2">
                                <RefreshCw size={16} /> Trocar
                              </button>
                            </div>
                          )
                        )}
                        {(!currentMealPlan?.[weekDays[selectedDay].english]?.snacks?.length) && (
                          <div className="col-span-2 bg-white rounded-3xl p-8 text-center">
                            <p className="text-slate-400">Nenhum lanche para este dia</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center">
                    <p className="text-6xl mb-4">🥗</p>
                    <p className="text-xl font-semibold text-slate-700 mb-2">Nenhum plano gerado</p>
                    <p className="text-slate-500 mb-6">Clique em "Gerar Novo" para criar seu plano semanal personalizado pela IA</p>
                    <button
                      onClick={() => setShowGenerateModal(true)}
                      className="bg-[#007BFF] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#0056b3] transition-colors"
                    >
                      <Sparkles size={16} className="inline mr-2" />
                      Gerar Plano
                    </button>
                  </div>
                )}

                {/* Shopping List */}
                {currentMealPlan && (
                  <div className="mt-6">
                    <ShoppingList
                      mealPlanId={savedPlanId || undefined}
                      mealPlan={currentMealPlan}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "salvos" && renderSavedPlans()}
      {activeTab === "progresso" && (
        <div className="max-w-7xl mx-auto px-6 py-6">
          <WeightTracker />
        </div>
      )}

      {/* Modais */}
      <GeneratePlanModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSubmit={handleGeneratePlan}
        isPending={generateMutation.isPending}
      />

      <SwapModal
        isOpen={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onSelect={(option: any) => {
          toast.success(`Refeição trocada para ${option.name}`);
          setShowSwapModal(false);
        }}
      />

      {/* Footer */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">{user?.fullName || "Usuário"}</span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs px-2 py-1 bg-[#007BFF]/10 text-[#007BFF] rounded-full">
              {dietType || "Personalizado"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
