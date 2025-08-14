/*
  Warnings:

  - You are about to drop the column `dailyNotificationCount` on the `Org` table. All the data in the column will be lost.
  - You are about to drop the column `lastNotificationReset` on the `Org` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Org" DROP COLUMN "dailyNotificationCount",
DROP COLUMN "lastNotificationReset";
