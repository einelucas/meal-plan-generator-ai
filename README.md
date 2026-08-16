<div align="center">

<img src="./public/logo.png" alt="SmartPlate AI" width="120" />

# SmartPlate AI

**SaaS de planejamento alimentar que combina preferências do usuário, acompanhamento de peso e inteligência artificial para gerar planos semanais e listas de compras.**

<img src="https://skillicons.dev/icons?i=ts,nextjs,react,tailwind,postgres,prisma,vercel&theme=dark" alt="TypeScript, Next.js, React, Tailwind CSS, PostgreSQL, Prisma e Vercel" />

</div>

## Sobre o projeto

O SmartPlate AI permite que o usuário registre seus dados físicos, objetivo, preferências alimentares e nível de experiência na cozinha. A aplicação utiliza essas informações para gerar um plano alimentar de sete dias com refeições, calorias, macronutrientes, tempo de preparo e dificuldade.

Além da geração do plano, o sistema mantém histórico, cria listas de compras, acompanha a evolução de peso e controla assinaturas recorrentes.

> Os conteúdos gerados são informativos e não substituem avaliação ou acompanhamento de nutricionista ou outro profissional de saúde.

## Funcionalidades

- Cadastro, login e gerenciamento de sessão com Clerk
- Perfil com altura, peso inicial, peso atual, meta e tipo de dieta
- Preferências de alimentos, restrições, objetivo, orçamento e tempo de preparo
- Geração de plano alimentar completo para sete dias
- Café da manhã, almoço, jantar e lanches por dia
- Informações de calorias, proteínas, carboidratos e gorduras
- Salvamento, exclusão, favoritos e compartilhamento de planos
- Lista de compras agrupada por categoria e gerada a partir do plano
- Registro de peso com histórico e gráficos de evolução
- Assinaturas semanal, mensal e anual com Stripe Checkout
- Webhooks para ativação, falha de pagamento e cancelamento
- Proteção das áreas de plano e perfil conforme autenticação e assinatura

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Aplicação | Next.js 15, React 19 e TypeScript |
| Interface | Tailwind CSS, Framer Motion, Lucide, Recharts e Chart.js |
| Estado assíncrono | TanStack React Query |
| Autenticação | Clerk |
| Inteligência artificial | OpenRouter por meio do SDK compatível da OpenAI |
| Dados | PostgreSQL e Prisma ORM |
| Pagamentos | Stripe Checkout e Stripe Webhooks |

## Fluxo principal

```mermaid
flowchart LR
    A[Perfil e preferências] --> B[API do SmartPlate]
    B --> C[Modelo via OpenRouter]
    C --> D[Plano de 7 dias]
    D --> E[Salvar e favoritar]
    D --> F[Lista de compras]
    D --> G[Acompanhamento]
```

## Estrutura

```text
app/
├── api/                     # IA, planos, perfil, peso e Stripe
├── mealplan/                # Painel de planejamento alimentar
├── profile/                 # Perfil e evolução do usuário
├── sign-up/                 # Cadastro com Clerk
└── subscribe/               # Escolha de assinatura
components/                  # Dashboard, lista de compras e gráficos
hooks/                       # Consultas e mutações com React Query
lib/                         # Prisma, Stripe, planos e helpers
prisma/                      # Schema e migrations PostgreSQL
types/                       # Tipos compartilhados
```

## Como executar

### Requisitos

- Node.js 20 ou superior
- npm
- Banco PostgreSQL
- Conta no Clerk
- Chave da OpenRouter
- Conta e produtos configurados no Stripe

### Instalação

```bash
git clone https://github.com/einelucas/meal-plan-generator-ai.git
cd meal-plan-generator-ai
npm install
```

Crie `.env.local` na raiz:

```env
DATABASE_URL="postgresql://usuario:senha@host:5432/smartplate"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

OPENROUTER_API_KEY="sk-or-..."

STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_WEEKLY="price_..."
STRIPE_PRICE_MONTHLY="price_..."
STRIPE_PRICE_YEARLY="price_..."

NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

Prepare o banco e inicie a aplicação:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Webhook do Stripe em desenvolvimento

Com o Stripe CLI autenticado:

```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

Copie o segredo retornado para `STRIPE_WEBHOOK_SECRET`. Os preços configurados no Stripe devem corresponder às variáveis semanal, mensal e anual.

## Principais modelos de dados

- `Profile`: conta, assinatura e dados físicos
- `UserPreferences`: preferências e objetivo alimentar
- `MealPlan` e `DayPlan`: plano e dias da semana
- `Meal`, `Ingredient` e `NutritionalInfo`: refeições e dados nutricionais
- `ShoppingList`: listas geradas por plano
- `WeightLog`: histórico de peso
- `SharedPlan`: compartilhamento por token

## Status

Projeto em evolução. Entre as melhorias previstas estão validação mais rígida das respostas da IA, testes automatizados, revisão dos cálculos nutricionais e aprimoramento das rotas de compartilhamento.
