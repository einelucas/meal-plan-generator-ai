// app/api/user/preferences/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const preferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Erro ao buscar preferências:", error);
    return NextResponse.json({ error: "Erro ao buscar preferências" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const data = await request.json();

    const updateData: Record<string, any> = {};
    if (data.allergies !== undefined) updateData.allergies = data.allergies;
    if (data.dislikedFoods !== undefined) updateData.dislikedFoods = data.dislikedFoods;
    if (data.preferredFoods !== undefined) updateData.preferredFoods = data.preferredFoods;
    if (data.maxPrepTime !== undefined) updateData.maxPrepTime = parseInt(data.maxPrepTime);
    if (data.budgetLevel !== undefined) updateData.budgetLevel = data.budgetLevel;
    if (data.dietGoal !== undefined) updateData.dietGoal = data.dietGoal;
    if (data.additionalNotes !== undefined) updateData.additionalNotes = data.additionalNotes;

    const updated = await prisma.userPreferences.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar preferências:", error);
    return NextResponse.json({ error: "Erro ao atualizar preferências" }, { status: 500 });
  }
}
