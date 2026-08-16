"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/spinner";
import { motion } from "framer-motion";
import {
  Camera,
  Scale,
  Ruler,
  Target,
  Bell,
  Moon,
  LogOut,
  Edit,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import WeightChart from "@/components/WeightChart";
import AdherenceRing from "@/components/AdherenceRing";
import EditProfileModal from "@/components/EditProfileModal";

interface WeightLog {
  id: string;
  weight: number;
  date: string;
}

interface PhysicalData {
  height?: number;
  startWeight?: number;
  targetWeight?: number;
  currentWeight?: number;
  dietType?: string;
  cookingLevel?: string;
}

const achievements = [
  { icon: "🔥", name: "7 Dias Seguidos", unlocked: true, desc: "Seguiu o plano por 7 dias" },
  { icon: "🥗", name: "50 Refeições", unlocked: true, desc: "Completou 50 refeições" },
  { icon: "⭐", name: "Chef Iniciante", unlocked: true, desc: "Preparou 10 receitas" },
  { icon: "🏆", name: "Top 10 Ranking", unlocked: false, desc: "Entre no top 10" },
  { icon: "💪", name: "30 Dias Fit", unlocked: false, desc: "Complete o desafio 30 dias" },
  { icon: "🌟", name: "Super Chef", unlocked: false, desc: "Prepare 100 receitas" },
];

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  const addWeight = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(newWeight) }),
      });
      if (!res.ok) throw new Error("Erro ao registrar peso");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Peso registrado!");
      setNewWeight("");
      queryClient.invalidateQueries({ queryKey: ["weight-logs"] });
      queryClient.invalidateQueries({ queryKey: ["physical-data"] });
    },
    onError: () => toast.error("Erro ao registrar peso"),
  });

  const { data: weightLogs = [], isLoading: isLoadingWeightLogs } = useQuery<WeightLog[]>({
    queryKey: ["weight-logs"],
    queryFn: async () => {
      const res = await fetch("/api/weight-logs");
      if (!res.ok) return [];
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.logs)) return data.logs;
      return [];
    },
    enabled: !!isSignedIn,
  });

  const { data: physicalData, isLoading: isLoadingPhysical } = useQuery<PhysicalData>({
    queryKey: ["physical-data"],
    queryFn: async () => {
      const res = await fetch("/api/user/physical-data");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!isSignedIn,
  });

  const { data: plansData } = useQuery({
    queryKey: ["meal-plans"],
    queryFn: async () => {
      const res = await fetch("/api/meal-plans");
      if (!res.ok) return { plans: [] };
      return res.json();
    },
    enabled: !!isSignedIn,
  });

  const { data: favoritePlansData } = useQuery({
    queryKey: ["meal-plans", "favorites"],
    queryFn: async () => {
      const res = await fetch("/api/meal-plans?favorites=true");
      if (!res.ok) return { plans: [] };
      return res.json();
    },
    enabled: !!isSignedIn,
  });

  const currentWeight = physicalData?.currentWeight;
  const startWeight = physicalData?.startWeight;
  const targetWeight = physicalData?.targetWeight;
  const userHeight = physicalData?.height;
  const userDietType = physicalData?.dietType;
  const userCookingLevel = physicalData?.cookingLevel;

  const latestPlan = plansData?.plans?.[0] ?? null;
  const daysWithMeals = latestPlan ? latestPlan.days.filter((d: any) => d.breakfast || d.lunch || d.dinner).length : 0;
  const planCoverage = latestPlan ? Math.round((daysWithMeals / 7) * 100) : 0;
  const favoriteCount = favoritePlansData?.plans?.length ?? 0;

  const formattedWeightLogs = weightLogs.map((log) => ({
    date: new Date(log.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
    weight: log.weight,
  }));

  const handleSignOut = () => {
    if (confirm("Deseja realmente sair?")) {
      signOut(() => router.push("/"));
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner />
        <span className="ml-2 text-slate-600">Carregando...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-slate-600">Faça login para visualizar seu perfil.</p>
      </div>
    );
  }

  const isLoading = isLoadingWeightLogs || isLoadingPhysical;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner />
        <span className="ml-2 text-slate-600">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8">
      <Toaster position="top-center" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna esquerda */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card de perfil */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="relative mb-4">
                {user?.imageUrl ? (
                  <Image src={user.imageUrl} alt={user.fullName || "Avatar"} width={96} height={96} className="w-24 h-24 rounded-full object-cover shadow-lg" />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-full flex items-center justify-center text-3xl text-white shadow-lg">
                    {user?.firstName?.charAt(0) || "👤"}
                  </div>
                )}
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#28A745] rounded-full flex items-center justify-center border-2 border-white shadow">
                  <Camera size={14} className="text-white" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-slate-800">{user?.fullName || user?.firstName || "Usuário"}</h2>
              <p className="text-slate-400 text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
              {(userDietType || userCookingLevel) && (
                <div className="flex gap-2 mt-3">
                  {userDietType && <span className="px-3 py-1 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-xs font-medium">{userDietType}</span>}
                  {userCookingLevel && <span className="px-3 py-1 bg-[#28A745]/10 text-[#28A745] rounded-full text-xs font-medium">{userCookingLevel}</span>}
                </div>
              )}
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="mt-4 py-2 px-4 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={14} />
                Editar perfil
              </button>
            </div>

            {(currentWeight !== undefined || userHeight !== undefined || targetWeight !== undefined) && (
              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                <div className="text-center">
                  <div className="w-10 h-10 bg-[#007BFF]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Scale size={18} className="text-[#007BFF]" />
                  </div>
                  <p className="text-lg font-bold text-slate-800">{currentWeight !== undefined ? `${currentWeight}kg` : "—"}</p>
                  <p className="text-xs text-slate-400">Atual</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-[#28A745]/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Ruler size={18} className="text-[#28A745]" />
                  </div>
                  <p className="text-lg font-bold text-slate-800">{userHeight !== undefined ? `${userHeight}m` : "—"}</p>
                  <p className="text-xs text-slate-400">Altura</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Target size={18} className="text-orange-500" />
                  </div>
                  <p className="text-lg font-bold text-slate-800">{targetWeight !== undefined ? `${targetWeight}kg` : "—"}</p>
                  <p className="text-xs text-slate-400">Meta</p>
                </div>
              </div>
            )}
          </div>

          {/* Configurações */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800">Configurações</h3>
            </div>
            <div className="p-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell size={16} className="text-purple-500" />
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1 text-left">Notificações</span>
                <div
                  className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${notifications ? "bg-[#28A745]" : "bg-slate-300"}`}
                  onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${notifications ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Moon size={16} className="text-slate-500" />
                </div>
                <span className="text-sm font-medium text-slate-700 flex-1 text-left">Modo Escuro</span>
                <div
                  className={`w-12 h-6 rounded-full transition-colors flex-shrink-0 ${darkMode ? "bg-[#28A745]" : "bg-slate-300"}`}
                  onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </button>

              <button onClick={handleSignOut} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition-colors">
                <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <LogOut size={16} className="text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-500 flex-1 text-left">Sair da conta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="lg:col-span-8 space-y-6">
          {/* Adesão + Antes & Depois */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Adesão ao Plano</h3>
              <div className="flex items-center justify-around flex-wrap gap-4">
                <AdherenceRing percentage={planCoverage} size={120} />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#007BFF]" />
                    <span className="text-sm text-slate-600 flex-1">Dias com plano</span>
                    <span className="text-sm font-bold text-slate-800">{daysWithMeals}/7</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#28A745]" />
                    <span className="text-sm text-slate-600 flex-1">Favoritas</span>
                    <span className="text-sm font-bold text-slate-800">{favoriteCount}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-sm text-slate-600 flex-1">Trocas</span>
                    <span className="text-sm font-bold text-slate-800">3</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800">Antes &amp; Depois</h3>
                <button className="text-xs text-[#007BFF] flex items-center gap-1 font-medium">
                  <Camera size={12} /> Adicionar foto
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 h-36">
                <div className="bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                  <ImageIcon size={28} className="text-slate-300 mb-2" />
                  <span className="text-sm text-slate-400">Antes</span>
                  <span className="text-xs text-slate-300">
                    {weightLogs.length > 0 ? new Date(weightLogs[0].date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }) : "—"}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-[#28A745]/20 to-[#007BFF]/20 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-[#28A745]/40">
                  <Sparkles size={28} className="text-[#28A745] mb-2" />
                  <span className="text-sm text-[#28A745] font-medium">Agora</span>
                  <span className="text-xs text-slate-400">
                    {weightLogs.length > 0 ? new Date(weightLogs[weightLogs.length - 1].date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }) : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registrar novo peso */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <Scale size={16} className="text-[#007BFF] flex-shrink-0" />
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="Registrar peso de hoje (kg)"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#007BFF]"
              />
              <button
                onClick={() => addWeight.mutate()}
                disabled={!newWeight || addWeight.isPending}
                className="bg-[#007BFF] hover:bg-[#0056b3] text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50 transition-colors"
              >
                {addWeight.isPending ? "..." : "Registrar"}
              </button>
            </div>
          </div>

          {/* Gráfico de peso — só se tiver logs */}
          {weightLogs.length > 0 ? (
            <WeightChart weightLogs={formattedWeightLogs} startWeight={startWeight} targetWeight={targetWeight} currentWeight={currentWeight} />
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
              <p className="text-5xl mb-4">📊</p>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Complete seu perfil</h3>
              <p className="text-slate-500 mb-6">Adicione seus dados físicos para ver seu progresso e gerar planos personalizados.</p>
              <button onClick={() => setIsEditModalOpen(true)} className="bg-[#007BFF] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0056b3] transition-colors">
                <Edit size={16} className="inline mr-2" />
                Completar perfil
              </button>
            </div>
          )}

          {/* Conquistas */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-bold text-slate-800">Conquistas</h3>
              <span className="text-sm text-slate-400">{achievements.filter((a) => a.unlocked).length} de {achievements.length} desbloqueadas</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {achievements.map((ach, i) => (
                <motion.div
                  key={i}
                  whileHover={ach.unlocked ? { scale: 1.05 } : {}}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer transition-all ${
                    ach.unlocked ? "bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200" : "bg-slate-50 border-2 border-slate-100"
                  }`}
                  title={ach.desc}
                >
                  <span className={`text-3xl ${!ach.unlocked && "grayscale opacity-40"}`}>{ach.icon}</span>
                  <span className={`text-xs text-center font-medium leading-tight ${ach.unlocked ? "text-slate-700" : "text-slate-400"}`}>{ach.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de edição */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        physicalData={{
          height: userHeight,
          currentWeight,
          targetWeight,
          startWeight,
          dietType: userDietType,
          cookingLevel: userCookingLevel,
        }}
      />
    </div>
  );
}
