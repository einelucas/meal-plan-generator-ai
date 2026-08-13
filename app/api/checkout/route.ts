// app/api/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPriceIdFromType } from "@/lib/plans";

const ALLOWED_PLANS = ["semana", "mes", "ano"] as const;
type PlanType = (typeof ALLOWED_PLANS)[number];

export async function POST(request: NextRequest) {
  try {
    const { planType, userId, email } = await request.json();

    if (!planType || !userId || !email)
      return NextResponse.json(
        { error: "planType, userId e email são obrigatórios." },
        { status: 400 }
      );

    if (!ALLOWED_PLANS.includes(planType as PlanType))
      return NextResponse.json({ error: "Tipo de plano inválido." }, { status: 400 });

    const priceId = getPriceIdFromType(planType);
    if (!priceId)
      return NextResponse.json({ error: "Price ID não encontrado para o plano." }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      mode: "subscription",
      metadata: { clerkUserId: userId, planType },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/subscribe`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout API Error:", error.message);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
