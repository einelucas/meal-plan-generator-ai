// app/api/profile/unsubscribe/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({ where: { userId: clerkUser.id } });

    if (!profile?.stripeSubscriptionId)
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });

    // Cancela ao final do período (não imediatamente)
    const canceled = await stripe.subscriptions.update(profile.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false,
      },
    });

    return NextResponse.json({ subscription: canceled });
  } catch (error: any) {
    console.error("Error unsubscribing:", error);
    return NextResponse.json({ error: error.message || "Failed to unsubscribe." }, { status: 500 });
  }
}
