// app/api/generate-mealplan/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [profile, preferences] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        select: {
          height: true,
          currentWeight: true,
          targetWeight: true,
          dietType: true,
          cookingLevel: true,
        },
      }),
      prisma.userPreferences.findUnique({
        where: { userId },
        select: {
          dislikedFoods: true,
          preferredFoods: true,
          maxPrepTime: true,
          dietGoal: true,
        },
      }),
    ]);

    if (!profile?.currentWeight || !profile?.targetWeight) {
      return NextResponse.json(
        { error: "Complete seus dados físicos no perfil primeiro" },
        { status: 400 }
      );
    }

    const dailyCalories = calculateDailyCalories(
      profile.height || 170,
      profile.currentWeight,
      profile.targetWeight
    );

    const prompt = buildPrompt({ profile, preferences, dailyCalories });

    const response = await openai.chat.completions.create({
      model: "openai/gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Você é um assistente especializado em nutrição. Responda apenas com JSON válido.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 4000,
    });

    const aiContent = response.choices[0]?.message?.content;
    if (!aiContent) throw new Error("Resposta vazia da IA");

    // Parsear JSON da IA
    const rawPlan = parseAIJson(aiContent);

    // Converter do formato PT (que a IA retorna) para o formato EN (que o frontend usa)
    const mealPlan = convertPtPlanToFrontend(rawPlan);

    return NextResponse.json({
      success: true,
      mealPlan,
      userData: {
        calories: dailyCalories,
        dietType: profile.dietType,
        cookingLevel: profile.cookingLevel,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro em generate-mealplan:", message);
    return NextResponse.json(
      { error: "Erro ao gerar plano alimentar", details: message },
      { status: 500 }
    );
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function calculateDailyCalories(
  height: number,
  currentWeight: number,
  targetWeight: number
): number {
  const tmb = 10 * currentWeight + 6.25 * height - 5 * 30 + 5;
  const maintenance = Math.round(tmb * 1.55);
  if (targetWeight < currentWeight) return Math.round(maintenance - 500);
  if (targetWeight > currentWeight) return Math.round(maintenance + 300);
  return maintenance;
}

function buildPrompt({ profile, preferences, dailyCalories }: any): string {
  return `
Você é um nutricionista profissional. Crie um plano alimentar de 7 dias.

DADOS DO USUÁRIO:
- Peso atual: ${profile.currentWeight}kg | Meta: ${profile.targetWeight}kg
- Altura: ${profile.height || 170}cm
- Tipo de dieta: ${profile.dietType || "balanceada"}
- Nível na cozinha: ${profile.cookingLevel || "intermediário"}
- Não gosta: ${preferences?.dislikedFoods?.join(", ") || "nenhum"}
- Prefere: ${preferences?.preferredFoods?.join(", ") || "nenhum"}
- Tempo máx preparo: ${preferences?.maxPrepTime || 30} min
- Objetivo: ${preferences?.dietGoal || "perder peso"}
- Calorias diárias: ${dailyCalories} kcal

Retorne APENAS JSON com esta estrutura exata (sem markdown, sem texto):
{
  "segunda": {
    "cafe": { "nome": "string", "descricao": "string", "emoji": "string", "calorias": 0, "proteina": 0, "carboidratos": 0, "gordura": 0, "tempo_preparo": 0, "dificuldade": "Fácil", "ingredientes": [] },
    "almoco": { mesmo formato },
    "jantar": { mesmo formato },
    "lanches": [ { mesmo formato } ]
  },
  "terca": { ... },
  "quarta": { ... },
  "quinta": { ... },
  "sexta": { ... },
  "sabado": { ... },
  "domingo": { ... }
}
`.trim();
}

function parseAIJson(content: string): any {
  const cleaned = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("JSON inválido na resposta da IA");
  }
}

/**
 * Converte uma refeição do formato PT (IA) para o formato EN (frontend).
 * PT: nome, descricao, calorias, proteina, carboidratos, gordura, tempo_preparo, dificuldade, emoji, ingredientes
 * EN: name, description, calories, prep_time, difficulty, rating, emoji
 */
function convertMeal(meal: any): any {
  if (!meal) return null;
  return {
    name: meal.nome || meal.name || "Refeição",
    description: meal.descricao || meal.description || "",
    calories: meal.calorias ?? meal.calories ?? 0,
    prep_time: meal.tempo_preparo ?? meal.prep_time ?? 0,
    difficulty: meal.dificuldade || meal.difficulty || "Fácil",
    emoji: meal.emoji || "🍽️",
    rating: meal.rating || 0,
    // mantém macros para uso futuro
    proteina: meal.proteina ?? 0,
    carboidratos: meal.carboidratos ?? 0,
    gordura: meal.gordura ?? 0,
    ingredientes: meal.ingredientes || [],
  };
}

/**
 * Converte o plano semanal PT para o formato que o frontend (meal-plan-dashboard) usa.
 * O dashboard usa chaves em inglês: Monday, Tuesday... e refeições: breakfast, lunch, dinner, snacks
 */
function convertPtPlanToFrontend(rawPlan: any): any {
  const dayMap: Record<string, string> = {
    segunda: "Monday",
    terca: "Tuesday",
    quarta: "Wednesday",
    quinta: "Thursday",
    sexta: "Friday",
    sabado: "Saturday",
    domingo: "Sunday",
  };

  const result: any = {};

  for (const [dayPt, dayEn] of Object.entries(dayMap)) {
    const day = rawPlan[dayPt];
    if (!day) {
      result[dayEn] = {
        breakfast: null,
        lunch: null,
        dinner: null,
        snacks: [],
      };
      continue;
    }

    result[dayEn] = {
      breakfast: convertMeal(day.cafe),
      lunch: convertMeal(day.almoco),
      dinner: convertMeal(day.jantar),
      snacks: Array.isArray(day.lanches)
        ? day.lanches.map(convertMeal)
        : [],
    };
  }

  return result;
}
