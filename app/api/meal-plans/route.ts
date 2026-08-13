// app/api/meal-plans/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Mapeamento inglês → inglês (o frontend já envia em inglês após a geração)
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { mealPlan, dietType, calories, allergies, cuisine, snacks, name } =
      await request.json();

    const saved = await prisma.mealPlan.create({
      data: {
        userId,
        name: name || `Plano ${new Date().toLocaleDateString("pt-BR")}`,
        dietType,
        calories,
        allergies,
        cuisine,
        snacks,
        days: {
          create: Object.entries(mealPlan).map(([day, meals]: [string, any]) => ({
            day,
            breakfast: JSON.stringify(meals.breakfast ?? null),
            lunch: JSON.stringify(meals.lunch ?? null),
            dinner: JSON.stringify(meals.dinner ?? null),
            snacks: meals.snacks ? JSON.stringify(meals.snacks) : null,
          })),
        },
      },
      include: { days: true },
    });

    return NextResponse.json({ success: true, plan: parsePlanDays(saved) });
  } catch (error) {
    console.error("Erro ao salvar plano:", error);
    return NextResponse.json({ error: "Erro ao salvar" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const onlyFavorites = searchParams.get("favorites") === "true";

  try {
    const plans = await prisma.mealPlan.findMany({
      where: { userId, ...(onlyFavorites ? { favorite: true } : {}) },
      include: { days: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ plans: plans.map(parsePlanDays) });
  } catch (error) {
    console.error("Erro ao buscar planos:", error);
    return NextResponse.json({ error: "Erro ao buscar" }, { status: 500 });
  }
}

// ─── helpers ────────────────────────────────────────────────────────────────

function safeParse(value: string | null): any {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

function parsePlanDays(plan: any) {
  return {
    ...plan,
    days: plan.days.map((day: any) => ({
      ...day,
      breakfast: safeParse(day.breakfast),
      lunch: safeParse(day.lunch),
      dinner: safeParse(day.dinner),
      snacks: safeParse(day.snacks),
    })),
  };
}
