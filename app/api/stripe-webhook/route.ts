// app/api/stripe-webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await onCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.payment_failed":
        await onPaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await onSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`Error handling Stripe event ${event.type}:`, err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ─── handlers ────────────────────────────────────────────────────────────────

async function onCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.clerkUserId;
  const subscriptionId = session.subscription as string;

  if (!userId || !subscriptionId) {
    console.error("checkout.session.completed: missing userId or subscriptionId", {
      userId,
      subscriptionId,
    });
    return;
  }

  await prisma.profile.update({
    where: { userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      subscriptionActive: true,
      subscriptionTier: session.metadata?.planType ?? null,
    },
  });

  console.log(`Subscription activated for user: ${userId}`);
}

async function onPaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  const profile = await prisma.profile.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    select: { userId: true },
  });

  if (!profile?.userId) {
    console.error("invoice.payment_failed: no profile for subscriptionId", subscriptionId);
    return;
  }

  await prisma.profile.update({
    where: { userId: profile.userId },
    data: { subscriptionActive: false },
  });

  console.log(`Payment failed — subscription deactivated for user: ${profile.userId}`);
}

async function onSubscriptionDeleted(subscription: Stripe.Subscription) {
  const profile = await prisma.profile.findUnique({
    where: { stripeSubscriptionId: subscription.id },
    select: { userId: true },
  });

  if (!profile?.userId) {
    console.error("subscription.deleted: no profile for subscriptionId", subscription.id);
    return;
  }

  await prisma.profile.update({
    where: { userId: profile.userId },
    data: { subscriptionActive: false, stripeSubscriptionId: null },
  });

  console.log(`Subscription canceled for user: ${profile.userId}`);
}
