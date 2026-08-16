// components/AdherenceRing.tsx
"use client";

import { motion } from "framer-motion";

interface AdherenceRingProps {
  percentage?: number;
  size?: number;
}

export default function AdherenceRing({ percentage = 0, size = 120 }: AdherenceRingProps) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#adherenceGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="adherenceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#007BFF" />
              <stop offset="100%" stopColor="#28A745" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold text-slate-800"
          >
            {percentage}%
          </motion.span>
          <span className="text-xs text-slate-400">adesão</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 mt-2 text-center">
        Você seguiu <span className="font-semibold text-[#28A745]">{percentage}%</span> do plano!
      </p>
    </div>
  );
}
