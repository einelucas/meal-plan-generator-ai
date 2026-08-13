"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { availablePlans } from "@/lib/plans";
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

export default function ProfilePage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Buscar dados da assinatura
  const { data: subscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await fetch("/api/profile/subscription-status");
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isLoaded && isSignedIn,
  });

  // Buscar logs de peso — sempre retorna array
  const { data: weightLogs = [], isLoading: isLoadingWeightLogs } = useQuery<WeightLog[]>({
    queryKey: ["weight-logs"],
    queryFn: async () => {
      const res = await fetch("/api/weight-logs");
      if (!res.ok) return [];
      const data = await res.json();
      // A rota pode retornar array direto ou { logs: [] }
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.logs)) return data.logs;
      return [];
    },
    enabled: !!isSignedIn,
  });

  // Buscar dados físicos
  const { data: physicalData, isLoading: isLoadingPhysical } = useQuery<PhysicalData>({
    queryKey: ["physical-data"],
    queryFn: async () => {
      const res = await fetch("/api/user/physical-data");
      if (!res.ok) return null;
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

  const formattedWeightLogs = weightLogs.map((log) => ({
    date: new Date(log.date).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
    weight: log.weight,
  }));

  const handleSignOut = () => {
    if (confirm("Deseja realmente sair?")) {
      router.push("/sign-out");
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

  const isLoading = isLoadingSubscription || isLoadingWeightLogs || isLoadingPhysical;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Spinner />
        <span className="ml-2 text-slate-600">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm text-slate-400">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Perfil</h1>
        </div>
      </div>

      {/* AI Badge */}
      <div className="max-w-7xl mx-auto px-6 mt-4">
        <div className="bg-gradient-to-r from-[#007BFF]/10 to-[#28A745]/10 rounded-xl p-4 border border-[#007BFF]/20">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#007BFF]" />
            <span className="text-sm font-semibold text-[#007BFF]">IA Ativa</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Plano personalizado para você</p>
        </div>
      </div>

      {/* Grid principal */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Coluna esquerda */}
          <div className="lg:col-span-4 space-y-6">

            {/* Card de perfil */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.fullName || "Avatar"}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-full flex items-center justify-center text-2xl text-white">
                      {user?.firstName?.charAt(0) || "👤"}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">
                    {user?.fullName || user?.firstName || "Usuário"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                  {(userDietType || userCookingLevel) && (
                    <div className="flex gap-2 mt-2">
                      {userDietType && (
                        <span className="px-2 py-1 bg-[#007BFF]/10 text-[#007BFF] rounded-full text-xs font-medium">
                          {userDietType}
                        </span>
                      )}
                      {userCookingLevel && (
                        <span className="px-2 py-1 bg-[#28A745]/10 text-[#28A745] rounded-full text-xs font-medium">
                          {userCookingLevel}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full mt-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={14} />
                Editar perfil
              </button>
            </div>

            {/* Antes & Depois — só se tiver logs */}
            {weightLogs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800">Antes & Depois</h3>
                  <button className="text-xs text-[#007BFF] font-medium flex items-center gap-1">
                    <Camera size={12} />
                    Adicionar foto
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-slate-100 rounded-xl flex flex-col items-center justify-center">
                    <ImageIcon size={24} className="text-slate-400 mb-2" />
                    <span className="text-sm font-medium text-slate-500">Antes</span>
                    <span className="text-xs text-slate-400">
                      {new Date(weightLogs[0].date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                    </span>
                  </div>
                  <div className="aspect-square bg-gradient-to-br from-[#28A745]/20 to-[#007BFF]/20 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-[#28A745]/40">
                    <Sparkles size={24} className="text-[#28A745] mb-2" />
                    <span className="text-sm font-medium text-[#28A745]">Agora</span>
                    <span className="text-xs text-slate-400">
                      {new Date(weightLogs[weightLogs.length - 1].date).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Configurações */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Bell size={18} className="text-purple-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Notificações</span>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${notifications ? "bg-[#28A745]" : "bg-slate-300"}`}
                  onClick={(e) => { e.stopPropagation(); setNotifications(!notifications); }}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${notifications ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </button>

              <button className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Moon size={18} className="text-slate-500" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">Modo Escuro</span>
                </div>
                <div
                  className={`w-12 h-6 rounded-full transition-colors ${darkMode ? "bg-[#28A745]" : "bg-slate-300"}`}
                  onClick={(e) => { e.stopPropagation(); setDarkMode(!darkMode); }}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${darkMode ? "translate-x-6" : "translate-x-0"}`} />
                </div>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full p-4 flex items-center gap-3 hover:bg-red-50 transition-colors border-t border-slate-100"
              >
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <LogOut size={18} className="text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-500">Sair da conta</span>
              </button>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="lg:col-span-8 space-y-6">

            {/* Stats — só aparece se houver dados */}
            {(currentWeight !== undefined || userHeight !== undefined || targetWeight !== undefined) && (
              <div className="grid grid-cols-3 gap-4">
                {currentWeight !== undefined && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Scale size={16} className="text-[#007BFF]" />
                      <span className="text-xs text-slate-400">Atual</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{currentWeight}kg</p>
                  </div>
                )}
                {userHeight !== undefined && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Ruler size={16} className="text-[#28A745]" />
                      <span className="text-xs text-slate-400">Altura</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{userHeight}m</p>
                  </div>
                )}
                {targetWeight !== undefined && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={16} className="text-orange-500" />
                      <span className="text-xs text-slate-400">Meta</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{targetWeight}kg</p>
                  </div>
                )}
              </div>
            )}

            {/* Gráfico de peso — só se tiver logs */}
            {weightLogs.length > 0 && (
              <WeightChart
                weightLogs={formattedWeightLogs}
                startWeight={startWeight}
                targetWeight={targetWeight}
                currentWeight={currentWeight}
              />
            )}

            {/* Estado vazio — sem dados de perfil */}
            {!currentWeight && !userHeight && !targetWeight && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-100">
                <p className="text-5xl mb-4">📊</p>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Complete seu perfil</h3>
                <p className="text-slate-500 mb-6">
                  Adicione seus dados físicos para ver seu progresso e gerar planos personalizados.
                </p>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="bg-[#007BFF] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#0056b3] transition-colors"
                >
                  <Edit size={16} className="inline mr-2" />
                  Completar perfil
                </button>
              </div>
            )}
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
