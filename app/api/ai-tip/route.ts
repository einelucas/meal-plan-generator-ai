// app/api/ai-tip/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * POST /api/ai-tip
 * Gera (ou retorna do cache do dia) uma dica personalizada com base nos dados reais do usuário.
 * Body: { todayCalories: number, calorieTarget?: number, completedCount: number, totalMeals: number, hasPlan: boolean }
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { todayCalories = 0, calorieTarget, completedCount = 0, totalMeals = 0, hasPlan = false } = await request.json();

    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { dailyTip: true, dailyTipDate: true, dietType: true },
    });
    if (!profile)
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });

    const now = new Date();
    if (profile.dailyTip && profile.dailyTipDate && isSameDay(profile.dailyTipDate, now)) {
      return NextResponse.json({ tip: profile.dailyTip, cached: true });
    }

    if (!hasPlan) {
      return NextResponse.json({ tip: "Complete seu perfil e gere um plano para receber dicas personalizadas da IA.", cached: false });
    }

    const prompt = `Você é um assistente de nutrição motivador. Em português brasileiro, escreva UMA frase curta (máximo 30 palavras) e personalizada para o usuário com base nestes dados de hoje. Sem markdown, apenas a frase.

Tipo de dieta: ${profile.dietType || "não especificada"}
Calorias consumidas hoje: ${todayCalories} kcal
Meta diária de calorias: ${calorieTarget || "não definida"} kcal
Refeições concluídas hoje: ${completedCount} de ${totalMeals}`;

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const tip = response.choices[0]?.message?.content?.trim() || "Continue seguindo seu plano, você está indo bem!";

    await prisma.profile.update({ where: { userId }, data: { dailyTip: tip, dailyTipDate: now } });

    return NextResponse.json({ tip, cached: false });
  } catch (error) {
    console.error("Erro ao gerar dica da IA:", error);
    return NextResponse.json({ error: "Erro ao gerar dica" }, { status: 500 });
  }
}
