/*
  Warnings:

  - You are about to drop the column `rating` on the `DayPlan` table. All the data in the column will be lost.
  - You are about to drop the column `userFeedback` on the `DayPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DayPlan" DROP COLUMN "rating",
DROP COLUMN "userFeedback",
ADD COLUMN     "dayFeedback" TEXT,
ADD COLUMN     "dayRating" INTEGER,
ALTER COLUMN "breakfast" DROP NOT NULL,
ALTER COLUMN "lunch" DROP NOT NULL,
ALTER COLUMN "dinner" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MealPlan" ADD COLUMN     "userContext" JSONB;

-- CreateTable
CREATE TABLE "NutritionalInfo" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,
    "fiber" DOUBLE PRECISION,
    "sugar" DOUBLE PRECISION,
    "sodium" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionalInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "dayPlanId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "prepTime" INTEGER,
    "difficulty" TEXT,
    "servings" INTEGER DEFAULT 1,
    "rating" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "userNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionalInfo_mealId_key" ON "NutritionalInfo"("mealId");

-- AddForeignKey
ALTER TABLE "NutritionalInfo" ADD CONSTRAINT "NutritionalInfo_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_dayPlanId_fkey" FOREIGN KEY ("dayPlanId") REFERENCES "DayPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
