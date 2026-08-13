// app/api/create-profile/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser)
      return NextResponse.json({ error: "User not found in Clerk." }, { status: 404 });

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email)
      return NextResponse.json({ error: "User does not have an email address." }, { status: 400 });

    const existing = await prisma.profile.findUnique({ where: { userId: clerkUser.id } });
    if (existing)
      return NextResponse.json({ message: "Profile already exists." });

    await prisma.profile.create({
      data: {
        userId: clerkUser.id,
        email,
        subscriptionActive: false,
        subscriptionTier: null,
        stripeSubscriptionId: null,
      },
    });

    return NextResponse.json({ message: "Profile created successfully." }, { status: 201 });
  } catch (error) {
    console.error("Error in create-profile:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}
