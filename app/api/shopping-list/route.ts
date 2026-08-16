// app/api/shopping-list/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const mealPlanId = searchParams.get("mealPlanId");

  try {
    const list = await prisma.shoppingList.findFirst({
      where: { userId, ...(mealPlanId ? { mealPlanId } : {}) },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ list });
  } catch (error) {
    console.error("Erro ao buscar lista de compras:", error);
    return NextResponse.json({ error: "Erro ao buscar lista" }, { status: 500 });
  }
}
