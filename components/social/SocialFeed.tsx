// components/social/SocialFeed.tsx
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { motion } from "framer-motion";
import { Target, Clock, Users, Heart, MessageCircle, Share2, Plus, Send } from "lucide-react";
import LeaderboardCard from "./LeaderboardCard";
import ChallengeCard from "./ChallengeCard";

const sharedPlans = [
  {
    author: "Ana Silva",
    avatar: "👩",
    title: "Meu plano Low Carb favorito",
    desc: "Esse plano me ajudou a perder 5kg em 2 meses! Recomendo muito.",
    likes: 234,
    comments: 45,
    time: "2h atrás",
    tag: "Low Carb",
  },
  {
    author: "Nutricionista Pro",
    avatar: "👨‍⚕️",
    title: "Plano Detox de 7 dias",
    desc: "Um detox completo para resetar seu metabolismo.",
    likes: 1520,
    comments: 203,
    time: "1d atrás",
    tag: "Detox",
    verified: true,
  },
  {
    author: "Carlos M.",
    avatar: "👨",
    title: "Semana Mediterrânea Completa",
    desc: "Inspirado na dieta mediterrânea tradicional com ingredientes acessíveis.",
    likes: 89,
    comments: 12,
    time: "3d atrás",
    tag: "Mediterrânea",
  },
];

const pointsGuide = [
  { action: "Completar refeição", points: "+10 pts" },
  { action: "Seguir plano 100% no dia", points: "+50 pts" },
  { action: "Compartilhar receita", points: "+25 pts" },
  { action: "Convidar amigo", points: "+100 pts" },
  { action: "Completar desafio", points: "+200 pts" },
];

const friends = [
  { name: "Ana Silva", avatar: "👩", status: "Completou 5 dias seguidos! 🔥", points: 2450 },
  { name: "Carlos M.", avatar: "👨", status: "Novo plano Mediterrâneo 🫒", points: 2320 },
  { name: "Julia R.", avatar: "👩‍🦰", status: "Perdeu 2kg esta semana! 🎉", points: 1950 },
];

const podium = [
  { name: "Carlos M.", pts: 2320, pos: 2, avatar: "👨", h: "h-24" },
  { name: "Ana Silva", pts: 2450, pos: 1, avatar: "👩", h: "h-32" },
  { name: "Você", pts: 2180, pos: 3, avatar: "🙋", h: "h-20" },
];

const otherChallenges = [
  { title: "30 Dias Fit", participants: 892, daysLeft: 22, progress: 27, reward: "1000 pontos" },
  { title: "Zero Ultraprocessados", participants: 445, daysLeft: 14, progress: 0, reward: "500 pontos" },
  { title: "Café da Manhã Saudável", participants: 1203, daysLeft: 7, progress: 0, reward: "200 pontos" },
];

const tabs = [
  { id: "feed", label: "Feed" },
  { id: "ranking", label: "Ranking" },
  { id: "desafios", label: "Desafios" },
];

export default function SocialFeed() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="p-4 sm:p-8">
      {/* Tabs */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div className="flex bg-white border border-slate-200 p-1 rounded-xl w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id ? "bg-[#007BFF] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button className="bg-[#007BFF] hover:bg-[#0056b3] text-white rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center gap-2">
          <Plus size={16} /> Convidar Amigo
        </button>
      </div>

      {activeTab === "feed" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-4">
                {user?.imageUrl ? (
                  <Image src={user.imageUrl} alt="Avatar" width={40} height={40} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007BFF] to-[#28A745] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user?.firstName?.charAt(0) || "U"}
                  </div>
                )}
                <div className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-slate-400 text-sm cursor-pointer">Compartilhe seu plano ou receita favorita...</div>
                <button className="w-9 h-9 bg-[#007BFF] hover:bg-[#0056b3] rounded-xl flex items-center justify-center text-white flex-shrink-0">
                  <Send size={16} />
                </button>
              </div>
            </div>

            {sharedPlans.map((plan, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-2xl">{plan.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{plan.author}</p>
                      {plan.verified && (
                        <div className="w-5 h-5 bg-[#007BFF] rounded-full flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold">✓</span>
                        </div>
                      )}
                      <span className="text-xs px-2 py-0.5 bg-[#28A745]/10 text-[#28A745] rounded-full font-medium">{plan.tag}</span>
                    </div>
                    <p className="text-sm text-slate-400">{plan.time}</p>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{plan.title}</h3>
                <p className="text-slate-600 text-sm mb-4">{plan.desc}</p>
                <div className="h-40 bg-gradient-to-br from-[#28A745]/20 to-[#007BFF]/20 rounded-xl mb-4 flex items-center justify-center">
                  <span className="text-6xl">🍽️</span>
                </div>
                <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
                  <button className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors">
                    <Heart size={18} /> <span className="text-sm">{plan.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-[#007BFF] transition-colors">
                    <MessageCircle size={18} /> <span className="text-sm">{plan.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-500 hover:text-[#28A745] transition-colors ml-auto">
                    <Share2 size={18} /> <span className="text-sm">Compartilhar</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Amigos</h3>
              <div className="space-y-4">
                {friends.map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">{f.avatar}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-700 text-sm">{f.name}</p>
                      <p className="text-xs text-slate-500 truncate">{f.status}</p>
                    </div>
                    <span className="text-xs font-bold text-[#28A745]">{f.points}pts</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Ver todos os amigos</button>
            </div>

            <ChallengeCard />
          </div>
        </div>
      )}

      {activeTab === "ranking" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="bg-gradient-to-br from-[#007BFF] to-[#0056b3] rounded-2xl p-8 mb-6 text-white">
              <div className="flex justify-center items-end gap-6">
                {podium.map((user, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <div className="text-3xl">{user.avatar}</div>
                    <div className="bg-white/20 rounded-xl px-3 py-1">
                      <span className="text-sm font-bold">{user.pts}pts</span>
                    </div>
                    <div className={`w-20 ${user.h} bg-white/20 rounded-t-xl flex items-end justify-center pb-2`}>
                      <span className="text-2xl font-bold">{user.pos === 1 ? "🥇" : user.pos === 2 ? "🥈" : "🥉"}</span>
                    </div>
                    <p className="font-medium text-sm">{user.name}</p>
                  </div>
                ))}
              </div>
            </div>
            <LeaderboardCard />
          </div>
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">Como Ganhar Pontos</h3>
              <div className="space-y-3">
                {pointsGuide.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-600">{item.action}</span>
                    <span className="text-sm font-bold text-[#28A745]">{item.points}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "desafios" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ChallengeCard />
          <ChallengeCard challenge={{ title: "Semana Vegetariana", participants: 156, daysLeft: 3, progress: 85, reward: "300 pontos" }} />
          {otherChallenges.map((c, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-[#007BFF]/10 rounded-xl flex items-center justify-center">
                  <Target size={20} className="text-[#007BFF]" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{c.title}</h3>
                  <div className="flex gap-3 mt-1 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users size={12} />
                      {c.participants}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {c.daysLeft} dias
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-[#007BFF] rounded-full" style={{ width: `${c.progress}%` }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-amber-600">🏆 {c.reward}</span>
                <button className="bg-[#007BFF] hover:bg-[#0056b3] text-white text-sm rounded-full px-4 py-1.5">Participar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
