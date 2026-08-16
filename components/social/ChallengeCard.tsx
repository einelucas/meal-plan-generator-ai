// components/social/ChallengeCard.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Target, Clock, ChevronRight } from "lucide-react";

interface Challenge {
  title: string;
  participants: number;
  daysLeft: number;
  progress: number;
  reward: string;
}

const defaultChallenge: Challenge = {
  title: "Desafio 7 Dias Sem Açúcar",
  participants: 234,
  daysLeft: 5,
  progress: 65,
  reward: "500 pontos",
};

export default function ChallengeCard({ challenge }: { challenge?: Challenge }) {
  const data = challenge || defaultChallenge;

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="bg-gradient-to-br from-[#007BFF] to-[#0056b3] rounded-2xl p-4 text-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <Target size={20} />
          <span className="font-semibold">{data.title}</span>
        </div>
        <ChevronRight size={20} className="text-white/70" />
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1 text-sm text-white/80">
          <Users size={14} />
          <span>{data.participants} participantes</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-white/80">
          <Clock size={14} />
          <span>{data.daysLeft} dias restantes</span>
        </div>
      </div>

      <div className="bg-white/20 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${data.progress}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="h-full bg-white rounded-full"
        />
      </div>
      <div className="flex justify-between mt-2 text-sm">
        <span className="text-white/80">Seu progresso</span>
        <span className="font-semibold">{data.progress}%</span>
      </div>

      <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
        <span className="text-sm text-white/80">🏆 Recompensa:</span>
        <span className="font-bold">{data.reward}</span>
      </div>
    </motion.div>
  );
}
