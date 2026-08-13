// src/constants/plans.ts

export interface Plan {
  name: string;
  amount: number;
  currency: string;
  interval: string;
  isPopular?: boolean;
  description: string;
  features: string[];
}

export const availablePlans: Plan[] = [
  {
    name: "Plano Semanal",
    amount: 19.9,
    currency: "BRL",
    interval: "semana",
    description:
      "Ideal para testar o serviço antes de assumir um compromisso maior.",
    features: [
      "Planos alimentares ilimitados com IA",
      "Insights nutricionais com IA",
      "Cancele quando quiser",
    ],
  },
  {
    name: "Plano Mensal",
    amount: 59.9,
    currency: "BRL",
    interval: "mes",
    isPopular: true, // Plano mais escolhido
    description:
      "Perfeito para quem quer acompanhamento contínuo e acesso completo aos recursos.",
    features: [
      "Planos alimentares ilimitados com IA",
      "Suporte prioritário com IA",
      "Cancele quando quiser",
    ],
  },
  {
    name: "Plano Anual",
    amount: 497.9,
    currency: "BRL",
    interval: "ano",
    description:
      "Melhor custo-benefício para quem quer evoluir a alimentação no longo prazo.",
    features: [
      "Planos alimentares ilimitados com IA",
      "Todos os recursos premium",
      "Cancele quando quiser",
    ],
  },
];

const priceIdMap: Record<string, string> = {
  semana: process.env.STRIPE_PRICE_WEEKLY!,
  mes: process.env.STRIPE_PRICE_MONTHLY!,
  ano: process.env.STRIPE_PRICE_YEARLY!,
};

export const getPriceIdFromType = (planType: string) => priceIdMap[planType];
