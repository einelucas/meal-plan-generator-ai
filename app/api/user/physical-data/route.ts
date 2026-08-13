// app/api/user/physical-data/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const ALLOWED_FIELDS = [
  "height",
  "startWeight",
  "targetWeight",
  "currentWeight",
  "dietType",
  "cookingLevel",
] as const;

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: Object.fromEntries(ALLOWED_FIELDS.map((f) => [f, true])) as any,
    });
    return NextResponse.json(profile ?? {});
  } catch (error) {
    console.error("Erro ao buscar dados físicos:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const body = await request.json();

    const updateData: Record<string, any> = {};
    for (const field of ALLOWED_FIELDS) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    if (Object.keys(updateData).length === 0)
      return NextResponse.json({ error: "Nenhum campo para atualizar" }, { status: 400 });

    const updated = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar dados físicos:", error);
    return NextResponse.json({ error: "Erro ao atualizar dados" }, { status: 500 });
  }
}
