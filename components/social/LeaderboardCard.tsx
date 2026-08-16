// components/social/LeaderboardCard.tsx
"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";

const mockUsers = [
  { name: "Ana Silva", points: 2450, avatar: "👩", position: 1 },
  { name: "Carlos M.", points: 2320, avatar: "👨", position: 2 },
  { name: "Você", points: 2180, avatar: "🙋", position: 3, isUser: true },
  { name: "Julia R.", points: 1950, avatar: "👩‍🦰", position: 4 },
  { name: "Pedro L.", points: 1820, avatar: "👦", position: 5 },
];

const positionIcons: Record<number, React.ReactNode> = {
  1: <Trophy className="text-amber-500" size={18} />,
  2: <Medal className="text-slate-400" size={18} />,
  3: <Award className="text-amber-700" size={18} />,
};

export default function LeaderboardCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-slate-800">Ranking Semanal</h3>
        <span className="text-xs text-[#007BFF] font-medium">Ver todos</span>
      </div>

      <div className="space-y-3">
        {mockUsers.map((user, index) => (
          <motion.div
            key={user.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-2 rounded-xl ${user.isUser ? "bg-[#007BFF]/10 border border-[#007BFF]/20" : ""}`}
          >
            <div className="w-8 h-8 flex items-center justify-center">
              {positionIcons[user.position] || <span className="text-slate-400 font-medium">{user.position}</span>}
            </div>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-xl">{user.avatar}</div>
            <div className="flex-1">
              <p className={`font-medium text-sm ${user.isUser ? "text-[#007BFF]" : "text-slate-700"}`}>{user.name}</p>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800">{user.points}</span>
              <span className="text-xs text-slate-400 ml-1">pts</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
