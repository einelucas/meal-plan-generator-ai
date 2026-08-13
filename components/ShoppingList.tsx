// components/ShoppingList.tsx
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";

interface ShoppingListProps {
  mealPlanId?: string;
  mealPlan?: any;
}

export function ShoppingList({ mealPlanId, mealPlan }: ShoppingListProps) {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any>(null);
  const { isSignedIn } = useUser();

  const generateList = async () => {
    if (!isSignedIn) {
      toast.error("Faça login para gerar lista de compras");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/shopping-list/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlanId, mealPlan }),
      });

      if (!response.ok) throw new Error("Erro ao gerar lista");

      const data = await response.json();
      setList(data);
      toast.success("Lista gerada com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar lista");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!list) return;

    const text = Object.entries(list.categories)
      .map(
        ([category, items]) =>
          `${category}:\n${(items as string[]).map((i) => `  • ${i}`).join("\n")}`,
      )
      .join("\n\n");

    navigator.clipboard.writeText(text);
    toast.success("Lista copiada!");
  };

  if (!list) {
    return (
      <button
        onClick={generateList}
        disabled={loading}
        className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50"
      >
        {loading ? "Gerando..." : "🛒 Gerar Lista de Compras"}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-emerald-700">Lista de Compras</h3>
        <div className="space-x-2">
          <button
            onClick={copyToClipboard}
            className="text-gray-600 hover:text-gray-800"
          >
            📋 Copiar
          </button>
          <button
            onClick={() => window.print()}
            className="text-gray-600 hover:text-gray-800"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(list.categories).map(
          ([category, items]) =>
            (items as string[]).length > 0 && (
              <div key={category}>
                <h4 className="font-semibold text-emerald-600 mb-2">
                  {category}
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {(items as string[]).map((item, i) => (
                    <li key={i} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ),
        )}
      </div>
    </div>
  );
}
