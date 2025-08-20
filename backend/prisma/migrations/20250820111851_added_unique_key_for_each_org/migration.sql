/*
  Warnings:

  - A unique constraint covering the columns `[vkey]` on the table `Org` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vkey` to the `Org` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Org" ADD COLUMN     "vkey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Org_vkey_key" ON "public"."Org"("vkey");
