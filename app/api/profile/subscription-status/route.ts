// app/api/profile/subscription-status/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: clerkUser.id } });
    return NextResponse.json({ subscription: profile ?? null });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json({ error: "Failed to fetch subscription details." }, { status: 500 });
  }
}
