"use client";

import React from 'react';
import { AreaChart, Area, XAxis, ResponsiveContainer } from 'recharts';

interface WeightChartProps {
  weightLogs: Array<{ date: string; weight: number }>;
  startWeight?: number;
  targetWeight?: number;
  currentWeight?: number;
}

export default function WeightChart({ 
  weightLogs,
  startWeight,
  targetWeight,
  currentWeight
}: WeightChartProps) {
  // Se não houver logs, não renderiza o gráfico
  if (!weightLogs || weightLogs.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="text-center">
          <h3 className="font-semibold text-slate-800 mb-2">Progresso de Peso</h3>
          <p className="text-sm text-slate-400">
            Nenhum registro de peso encontrado.
          </p>
          <button className="mt-3 text-xs text-[#007BFF] font-medium hover:underline">
            + Adicionar primeiro registro
          </button>
        </div>
      </div>
    );
  }

  // Usa os dados reais do usuário
  const data = weightLogs;
  const firstWeight = startWeight || data[0]?.weight || 0;
  const lastWeight = currentWeight || data[data.length - 1]?.weight || 0;
  const goalWeight = targetWeight || 0;
  const weightLoss = (firstWeight - lastWeight).toFixed(1);
  const progress = goalWeight ? ((firstWeight - lastWeight) / (firstWeight - goalWeight) * 100).toFixed(0) : null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-slate-800">Progresso de Peso</h3>
          {progress && (
            <p className="text-xs text-slate-400 mt-0.5">
              {progress}% da meta atingida
            </p>
          )}
        </div>
        <span className="text-xs text-[#28A745] font-medium bg-[#28A745]/10 px-2 py-1 rounded-full">
          -{weightLoss}kg
        </span>
      </div>
      
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#007BFF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#007BFF"
              strokeWidth={2}
              fill="url(#weightGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between mt-3 pt-3 border-t border-slate-100 text-sm">
        <div className="text-center flex-1">
          <span className="text-xs text-slate-400">Início</span>
          <p className="font-semibold text-slate-700">{firstWeight} kg</p>
        </div>
        <div className="text-center flex-1">
          <span className="text-xs text-slate-400">Atual</span>
          <p className="font-semibold text-[#28A745]">{lastWeight} kg</p>
        </div>
        {goalWeight > 0 && (
          <div className="text-center flex-1">
            <span className="text-xs text-slate-400">Meta</span>
            <p className="font-semibold text-[#007BFF]">{goalWeight} kg</p>
          </div>
        )}
      </div>
    </div>
  );
}