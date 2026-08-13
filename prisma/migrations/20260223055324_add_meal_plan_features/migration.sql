-- CreateTable
CREATE TABLE "MealPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "dietType" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "allergies" TEXT,
    "cuisine" TEXT,
    "snacks" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isTemplate" BOOLEAN NOT NULL DEFAULT false,
    "favorite" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DayPlan" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "breakfast" TEXT NOT NULL,
    "lunch" TEXT NOT NULL,
    "dinner" TEXT NOT NULL,
    "snacks" TEXT,
    "rating" INTEGER,
    "userFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DayPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShoppingList" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShoppingList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "WeightLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dislikedFoods" TEXT[],
    "preferredFoods" TEXT[],
    "maxPrepTime" INTEGER,
    "budgetLevel" TEXT,
    "dietGoal" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SharedPlan" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "shareToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SharedPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealPlan_userId_idx" ON "MealPlan"("userId");

-- CreateIndex
CREATE INDEX "MealPlan_createdAt_idx" ON "MealPlan"("createdAt");

-- CreateIndex
CREATE INDEX "DayPlan_mealPlanId_idx" ON "DayPlan"("mealPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "DayPlan_mealPlanId_day_key" ON "DayPlan"("mealPlanId", "day");

-- CreateIndex
CREATE INDEX "ShoppingList_userId_idx" ON "ShoppingList"("userId");

-- CreateIndex
CREATE INDEX "ShoppingList_createdAt_idx" ON "ShoppingList"("createdAt");

-- CreateIndex
CREATE INDEX "WeightLog_userId_idx" ON "WeightLog"("userId");

-- CreateIndex
CREATE INDEX "WeightLog_date_idx" ON "WeightLog"("date");

-- CreateIndex
CREATE UNIQUE INDEX "WeightLog_userId_date_key" ON "WeightLog"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreferences_userId_key" ON "UserPreferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SharedPlan_shareToken_key" ON "SharedPlan"("shareToken");

-- CreateIndex
CREATE INDEX "SharedPlan_shareToken_idx" ON "SharedPlan"("shareToken");

-- AddForeignKey
ALTER TABLE "MealPlan" ADD CONSTRAINT "MealPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DayPlan" ADD CONSTRAINT "DayPlan_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeightLog" ADD CONSTRAINT "WeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreferences" ADD CONSTRAINT "UserPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SharedPlan" ADD CONSTRAINT "SharedPlan_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
