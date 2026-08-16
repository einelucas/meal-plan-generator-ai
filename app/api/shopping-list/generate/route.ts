// app/api/shopping-list/generate/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { safeParse, parseAIJson } from "@/lib/mealplan";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { mealPlanId, mealPlan } = await request.json();
    const planToProcess = await resolvePlan(mealPlanId, mealPlan);

    if (!planToProcess)
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

    const items = await generateShoppingList(planToProcess);

    let saved = null;
    if (mealPlanId) {
      saved = await prisma.shoppingList.create({
        data: { userId, mealPlanId, items },
      });
    }

    return NextResponse.json({ id: saved?.id ?? null, mealPlanId: mealPlanId ?? null, items });
  } catch (error) {
    console.error("Erro ao gerar lista de compras:", error);
    return NextResponse.json({ error: "Erro ao gerar lista" }, { status: 500 });
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

async function resolvePlan(mealPlanId?: string, mealPlan?: any) {
  if (!mealPlanId) return mealPlan ?? null;

  const plan = await prisma.mealPlan.findUnique({
    where: { id: mealPlanId },
    include: { days: true },
  });

  if (!plan) return null;

  return plan.days.reduce<Record<string, any>>((acc, day) => {
    acc[day.day] = {
      breakfast: safeParse(day.breakfast),
      lunch: safeParse(day.lunch),
      dinner: safeParse(day.dinner),
      snacks: safeParse(day.snacks),
    };
    return acc;
  }, {});
}

async function generateShoppingList(planToProcess: any) {
  const prompt = `
Extraia TODOS os ingredientes deste plano alimentar de 7 dias.
Agrupe por categoria (Hortifruti, Proteínas, Laticínios, Grãos e Cereais, Mercearia).
Calcule quantidades aproximadas para a semana toda.
Pesquise na web preços médios ATUAIS de supermercado no Brasil (ex: sites de supermercados, comparadores de preço) para estimar o valor de cada item o mais realista possível. Se não encontrar um preço confiável para algum item, estime com base em preços de mercado conhecidos, mas nunca invente um valor absurdo.
Retorne APENAS JSON com esta estrutura exata (sem markdown, sem texto):

{
  "items": [
    { "name": "Tomate", "quantity": "2 kg", "category": "Hortifruti", "estimated_price": 12.5, "checked": false },
    { "name": "Peito de frango", "quantity": "1 kg", "category": "Proteínas", "estimated_price": 22.9, "checked": false }
  ]
}

Plano alimentar: ${JSON.stringify(planToProcess)}
  `.trim();

  const response = await openai.chat.completions.create({
    // ":online" ativa a busca na web da OpenRouter, aterrando os preços em resultados reais em vez de "chutar" com o conhecimento de treino do modelo.
    model: "openai/gpt-3.5-turbo:online",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content ?? "";
  const parsed = parseAIJson(content);
  const items = Array.isArray(parsed.items) ? parsed.items : [];
  return items.map((item: any) => ({
    name: item.name ?? "Item",
    quantity: item.quantity ?? "",
    category: item.category || "Mercearia",
    estimated_price: typeof item.estimated_price === "number" ? item.estimated_price : 0,
    checked: false,
  }));
}
