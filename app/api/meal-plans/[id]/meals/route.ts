// app/api/meal-plans/[id]/meals/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { safeParse } from "@/lib/mealplan";

type Params = { params: { id: string } };
type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

/**
 * PATCH /api/meal-plans/[id]/meals
 * Atualiza o estado (completed/rating/is_favorite) de uma refeição específica.
 * Body: { day: string, mealType: MealType, snackIndex?: number, patch: { completed?: boolean, rating?: number, is_favorite?: boolean } }
 */
export async function PATCH(request: Request, { params }: Params) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { day, mealType, snackIndex, patch } = await request.json();

    if (!day || !mealType || !patch)
      return NextResponse.json({ error: "Campos obrigatórios: day, mealType, patch" }, { status: 400 });

    const plan = await prisma.mealPlan.findUnique({ where: { id: params.id, userId }, select: { id: true } });
    if (!plan)
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 });

    const dayPlan = await prisma.dayPlan.findUnique({
      where: { mealPlanId_day: { mealPlanId: params.id, day } },
    });
    if (!dayPlan)
      return NextResponse.json({ error: "Dia não encontrado" }, { status: 404 });

    const field = mealType as MealType;
    const updateData: Record<string, string> = {};

    if (field === "snacks") {
      const snacks = safeParse<any[]>(dayPlan.snacks) || [];
      if (typeof snackIndex !== "number" || !snacks[snackIndex])
        return NextResponse.json({ error: "snackIndex inválido" }, { status: 400 });
      snacks[snackIndex] = { ...snacks[snackIndex], ...patch };
      updateData.snacks = JSON.stringify(snacks);
    } else {
      const current = safeParse<any>(dayPlan[field]);
      if (!current)
        return NextResponse.json({ error: "Refeição não encontrada" }, { status: 404 });
      updateData[field] = JSON.stringify({ ...current, ...patch });
    }

    const updated = await prisma.dayPlan.update({
      where: { mealPlanId_day: { mealPlanId: params.id, day } },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      day: {
        ...updated,
        breakfast: safeParse(updated.breakfast),
        lunch: safeParse(updated.lunch),
        dinner: safeParse(updated.dinner),
        snacks: safeParse(updated.snacks),
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar refeição:", error);
    return NextResponse.json({ error: "Erro ao atualizar refeição" }, { status: 500 });
  }
}
