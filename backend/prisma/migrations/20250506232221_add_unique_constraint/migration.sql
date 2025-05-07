/*
  Warnings:

  - A unique constraint covering the columns `[userId,type]` on the table `WhatsappConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `WhatsappConnection_userId_type_key` ON `WhatsappConnection`(`userId`, `type`);
