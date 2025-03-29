/*
  Warnings:

  - You are about to drop the column `userId` on the `LearningRecord` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[supabaseUserId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[supabaseUserId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `supabaseUserId` to the `LearningRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supabaseUserId` to the `Profile` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LearningRecord" DROP CONSTRAINT "LearningRecord_userId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- AlterTable
ALTER TABLE "LearningRecord" DROP COLUMN "userId",
ADD COLUMN     "supabaseUserId" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "userId",
ADD COLUMN     "supabaseUserId" VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_supabaseUserId_key" ON "Profile"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_supabaseUserId_key" ON "User"("supabaseUserId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_supabaseUserId_fkey" FOREIGN KEY ("supabaseUserId") REFERENCES "User"("supabaseUserId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecord" ADD CONSTRAINT "LearningRecord_supabaseUserId_fkey" FOREIGN KEY ("supabaseUserId") REFERENCES "User"("supabaseUserId") ON DELETE RESTRICT ON UPDATE CASCADE;
