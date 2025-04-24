-- CreateTable
CREATE TABLE "Streak" (
    "id" SERIAL NOT NULL,
    "supabaseUserId" TEXT NOT NULL,
    "best_streak" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Streak_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Streak_supabaseUserId_key" ON "Streak"("supabaseUserId");
