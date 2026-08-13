// app/api/profile/change-plan/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { getPriceIdFromType } from "@/lib/plans";

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { newPlan } = await request.json();
    if (!newPlan)
      return NextResponse.json({ error: "New plan is required." }, { status: 400 });

    const profile = await prisma.profile.findUnique({ where: { userId: clerkUser.id } });
    if (!profile?.stripeSubscriptionId)
      return NextResponse.json({ error: "No active subscription found." }, { status: 400 });

    const priceId = getPriceIdFromType(newPlan);
    if (!priceId)
      return NextResponse.json({ error: "Invalid plan type." }, { status: 400 });

    const subscription = await stripe.subscriptions.retrieve(profile.stripeSubscriptionId);
    const itemId = subscription.items.data[0]?.id;
    if (!itemId)
      return NextResponse.json({ error: "Subscription item not found." }, { status: 400 });

    const updated = await stripe.subscriptions.update(profile.stripeSubscriptionId, {
      cancel_at_period_end: false,
      items: [{ id: itemId, price: priceId }],
      proration_behavior: "create_prorations",
    });

    await prisma.profile.update({
      where: { userId: clerkUser.id },
      data: {
        subscriptionTier: newPlan,
        stripeSubscriptionId: updated.id,
        subscriptionActive: true,
      },
    });

    return NextResponse.json({ subscription: updated });
  } catch (error: any) {
    console.error("Error changing plan:", error);
    return NextResponse.json({ error: error.message || "Failed to change plan." }, { status: 500 });
  }
}
