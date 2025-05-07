/*
  Warnings:

  - A unique constraint covering the columns `[whatsappConnectionId,leadNumber]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `chat` ALTER COLUMN `lastMessageAt` DROP DEFAULT,
    ALTER COLUMN `isActive` DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX `Chat_whatsappConnectionId_leadNumber_key` ON `Chat`(`whatsappConnectionId`, `leadNumber`);
