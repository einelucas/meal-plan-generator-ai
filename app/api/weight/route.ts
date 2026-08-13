// app/api/weight/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const logs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Erro ao buscar histórico de peso:", error);
    return NextResponse.json({ error: "Erro ao buscar histórico" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { weight, notes, date } = await request.json();

    if (!weight || isNaN(Number(weight)))
      return NextResponse.json({ error: "Peso inválido" }, { status: 400 });

    const log = await prisma.weightLog.create({
      data: {
        userId,
        weight: Number(weight),
        notes: notes ?? null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error("Erro ao registrar peso:", error);
    return NextResponse.json({ error: "Erro ao registrar peso" }, { status: 500 });
  }
}
