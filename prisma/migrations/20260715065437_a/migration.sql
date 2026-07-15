/*
  Warnings:

  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `SubsCription` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "profiles" DROP CONSTRAINT "profiles_userId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "SubsCription_stripeSubscriptionId_key" ON "SubsCription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
