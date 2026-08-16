// components/StatCard.tsx
"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext?: string;
  color?: "blue" | "green" | "orange" | "purple";
  trend?: number;
}

const colors = {
  blue: { bg: "bg-[#007BFF]/10", text: "text-[#007BFF]", icon: "text-[#007BFF]" },
  green: { bg: "bg-[#28A745]/10", text: "text-[#28A745]", icon: "text-[#28A745]" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", icon: "text-orange-500" },
  purple: { bg: "bg-purple-100", text: "text-purple-600", icon: "text-purple-500" },
};

export default function StatCard({ icon: Icon, label, value, subtext, color = "blue", trend }: StatCardProps) {
  const colorSet = colors[color];

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className={`w-10 h-10 ${colorSet.bg} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={20} className={colorSet.icon} />
      </div>
      <p className="text-slate-500 text-xs font-medium">{label}</p>
      <div className="flex items-end gap-2 mt-1">
        <span className={`text-2xl font-bold ${colorSet.text}`}>{value}</span>
        {subtext && <span className="text-slate-400 text-sm mb-0.5">{subtext}</span>}
      </div>
      {trend !== undefined && (
        <div className={`mt-2 text-xs font-medium ${trend > 0 ? "text-[#28A745]" : "text-red-500"}`}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% esta semana
        </div>
      )}
    </motion.div>
  );
}
