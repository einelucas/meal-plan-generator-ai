// app/api/check-subscription/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { subscriptionActive: true },
    });

    return NextResponse.json({ subscriptionActive: profile?.subscriptionActive ?? false });
  } catch (error) {
    console.error("check-subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
