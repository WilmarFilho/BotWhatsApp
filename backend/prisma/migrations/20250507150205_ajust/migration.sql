-- AlterTable
ALTER TABLE `chat` ALTER COLUMN `lastMessageAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `whatsappconnection` MODIFY `phoneNumber` VARCHAR(191) NULL;
