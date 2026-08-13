// components/WeightTracker.tsx
"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export function WeightTracker() {
  const [logs, setLogs] = useState<any[]>([]);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch("/api/weight");
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Erro ao buscar logs:", error);
    }
  };

  const addWeight = async () => {
    if (!weight) return;

    setLoading(true);
    try {
      const response = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      if (!response.ok) throw new Error("Erro ao salvar");

      toast.success("Peso registrado!");
      setWeight("");
      fetchLogs();
    } catch (error) {
      toast.error("Erro ao registrar peso");
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: logs.map((log) => new Date(log.date).toLocaleDateString("pt-BR")),
    datasets: [
      {
        label: "Peso (kg)",
        data: logs.map((log) => log.weight),
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Evolução do Peso",
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-emerald-700 mb-4">
        📊 Acompanhamento de Peso
      </h3>

      <div className="flex gap-2 mb-6">
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Peso atual (kg)"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          step="0.1"
        />
        <button
          onClick={addWeight}
          disabled={loading || !weight}
          className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "..." : "Registrar"}
        </button>
      </div>

      {logs.length > 1 ? (
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          Registre seu peso para ver o gráfico de evolução
        </p>
      )}

      {logs.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          <span className="font-semibold">Último registro:</span>{" "}
          {logs[logs.length - 1].weight} kg em{" "}
          {new Date(logs[logs.length - 1].date).toLocaleDateString("pt-BR")}
        </div>
      )}
    </div>
  );
}
