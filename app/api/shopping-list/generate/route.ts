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

    const shoppingList = await generateShoppingList(planToProcess);

    if (mealPlanId) {
      await prisma.shoppingList.create({
        data: { userId, mealPlanId, items: shoppingList },
      });
    }

    return NextResponse.json(shoppingList);
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
Agrupe por categoria (Hortifruti, Carnes, Laticínios, Grãos, Temperos, Outros).
Calcule quantidades aproximadas para a semana toda.
Retorne APENAS JSON com esta estrutura exata:

{
  "categories": {
    "Hortifruti": ["2 kg de tomate", "1 maço de alface"],
    "Carnes": ["1 kg de peito de frango"],
    "Laticínios": ["1 litro de leite"],
    "Grãos": ["500g de arroz"],
    "Temperos": ["alho", "cebola", "azeite"],
    "Outros": []
  }
}

Plano alimentar: ${JSON.stringify(planToProcess)}
  `.trim();

  const response = await openai.chat.completions.create({
    model: "openai/gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content ?? "";
  return parseAIJson(content);
}
