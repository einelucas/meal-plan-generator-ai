// components/OnboardingWizard.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Leaf,
  Apple,
  Fish,
  Wheat,
  Milk,
  Egg,
  Heart,
} from "lucide-react";

const dietTypes = [
  { id: "tradicional", label: "Tradicional", icon: "🍽️", desc: "Alimentação balanceada sem restrições" },
  { id: "vegetariana", label: "Vegetariana", icon: "🥬", desc: "Sem carne, com ovos e laticínios" },
  { id: "vegana", label: "Vegana", icon: "🌱", desc: "Apenas alimentos de origem vegetal" },
  { id: "low_carb", label: "Low Carb", icon: "🥩", desc: "Baixo consumo de carboidratos" },
  { id: "mediterranea", label: "Mediterrânea", icon: "🫒", desc: "Azeite, peixes e grãos integrais" },
  { id: "cetogenica", label: "Cetogênica", icon: "🥓", desc: "Muito baixo carbo, alta gordura" },
];

const allergyOptions = [
  { id: "Glúten", label: "Glúten", icon: Wheat },
  { id: "Lactose", label: "Lactose", icon: Milk },
  { id: "Ovos", label: "Ovos", icon: Egg },
  { id: "Frutos do mar", label: "Frutos do mar", icon: Fish },
  { id: "Amendoim", label: "Amendoim", icon: Apple },
  { id: "Soja", label: "Soja", icon: Leaf },
];

const cuisineOptions = [
  { id: "Brasileira", label: "Brasileira", emoji: "🇧🇷" },
  { id: "Italiana", label: "Italiana", emoji: "🇮🇹" },
  { id: "Japonesa", label: "Japonesa", emoji: "🇯🇵" },
  { id: "Mexicana", label: "Mexicana", emoji: "🇲🇽" },
  { id: "Árabe", label: "Árabe", emoji: "🇱🇧" },
  { id: "Indiana", label: "Indiana", emoji: "🇮🇳" },
];

const cookingLevels = [
  { id: "iniciante", label: "Iniciante", desc: "Preciso de receitas simples e rápidas", emoji: "👶" },
  { id: "intermediario", label: "Intermediário", desc: "Consigo seguir receitas normalmente", emoji: "👨‍🍳" },
  { id: "avancado", label: "Avançado", desc: "Adoro desafios na cozinha", emoji: "⭐" },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [cookingLevel, setCookingLevel] = useState("");

  const toggleAllergy = (id: string) =>
    setSelectedAllergies((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  const toggleCuisine = (id: string) =>
    setSelectedCuisines((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const saveOnboarding = useMutation({
    mutationFn: async () => {
      const [physicalRes, preferencesRes] = await Promise.all([
        fetch("/api/user/physical-data", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dietType: selectedDiet, cookingLevel }),
        }),
        fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            allergies: selectedAllergies,
            preferredFoods: selectedCuisines,
          }),
        }),
      ]);
      if (!physicalRes.ok || !preferencesRes.ok) {
        throw new Error("Erro ao salvar suas preferências");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["physical-data"] });
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      toast.success("Perfil configurado com sucesso!");
      onComplete();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const steps = [
    {
      title: "Qual seu tipo de dieta?",
      subtitle: "Escolha a que mais combina com você",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {dietTypes.map((diet) => (
            <motion.button
              key={diet.id}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDiet(diet.id)}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                selectedDiet === diet.id ? "border-[#007BFF] bg-[#007BFF]/10" : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-2xl">{diet.icon}</span>
              <h4 className="font-semibold text-slate-800 mt-2">{diet.label}</h4>
              <p className="text-xs text-slate-500 mt-1">{diet.desc}</p>
            </motion.button>
          ))}
        </div>
      ),
    },
    {
      title: "Alguma restrição alimentar?",
      subtitle: "Selecione todas que se aplicam",
      content: (
        <div className="grid grid-cols-3 gap-3">
          {allergyOptions.map((allergy) => {
            const Icon = allergy.icon;
            const isSelected = selectedAllergies.includes(allergy.id);
            return (
              <motion.button
                key={allergy.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleAllergy(allergy.id)}
                className={`p-4 rounded-2xl border-2 flex flex-col items-center transition-all ${
                  isSelected ? "border-red-400 bg-red-50" : "border-slate-200 bg-white"
                }`}
              >
                <Icon size={24} className={isSelected ? "text-red-500" : "text-slate-400"} />
                <span className={`text-xs mt-2 font-medium ${isSelected ? "text-red-600" : "text-slate-600"}`}>
                  {allergy.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: "Culinárias preferidas",
      subtitle: "Quais tipos de comida você mais gosta?",
      content: (
        <div className="grid grid-cols-2 gap-3">
          {cuisineOptions.map((cuisine) => {
            const isSelected = selectedCuisines.includes(cuisine.id);
            return (
              <motion.button
                key={cuisine.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleCuisine(cuisine.id)}
                className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                  isSelected ? "border-[#28A745] bg-[#28A745]/10" : "border-slate-200 bg-white"
                }`}
              >
                <span className="text-2xl">{cuisine.emoji}</span>
                <span className={`font-medium ${isSelected ? "text-[#28A745]" : "text-slate-700"}`}>
                  {cuisine.label}
                </span>
                {isSelected && <Check size={18} className="text-[#28A745] ml-auto" />}
              </motion.button>
            );
          })}
        </div>
      ),
    },
    {
      title: "Seu nível na cozinha?",
      subtitle: "Isso ajuda a personalizar as receitas",
      content: (
        <div className="space-y-3">
          {cookingLevels.map((level) => (
            <motion.button
              key={level.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setCookingLevel(level.id)}
              className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                cookingLevel === level.id ? "border-[#007BFF] bg-[#007BFF]/10" : "border-slate-200 bg-white"
              }`}
            >
              <span className="text-3xl">{level.emoji}</span>
              <div className="text-left">
                <h4 className="font-semibold text-slate-800">{level.label}</h4>
                <p className="text-sm text-slate-500">{level.desc}</p>
              </div>
              {cookingLevel === level.id && <Check size={20} className="text-[#007BFF] ml-auto" />}
            </motion.button>
          ))}
        </div>
      ),
    },
  ];

  const canProceed = () => {
    switch (step) {
      case 0:
        return selectedDiet !== "";
      case 1:
        return true;
      case 2:
        return selectedCuisines.length > 0;
      case 3:
        return cookingLevel !== "";
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      <div className="px-6 pt-8 mb-6 max-w-lg w-full mx-auto">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-[#007BFF]" : "bg-slate-200"}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 overflow-auto max-w-lg w-full mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{steps[step].title}</h2>
            <p className="text-slate-500 mb-6">{steps[step].subtitle}</p>
            {steps[step].content}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-3 max-w-lg w-full mx-auto">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="h-12 px-6 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => (step < steps.length - 1 ? setStep(step + 1) : saveOnboarding.mutate())}
            disabled={!canProceed() || saveOnboarding.isPending}
            className="flex-1 h-12 bg-[#007BFF] hover:bg-[#0056b3] rounded-xl text-base font-semibold text-white disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {step < steps.length - 1 ? (
              <>
                Continuar
                <ChevronRight size={18} className="ml-2" />
              </>
            ) : saveOnboarding.isPending ? (
              "Salvando..."
            ) : (
              <>
                Começar
                <Heart size={18} className="ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
