-- Nomes de tabela em PascalCase de proposito: o Linux e case-sensitive.
-- Ver "Caixa dos nomes de tabela" no HANDOFF.md.

-- DropForeignKey
ALTER TABLE `Package` DROP FOREIGN KEY `Package_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Departure` MODIFY `spotsTotal` INTEGER NOT NULL DEFAULT 0,
    MODIFY `spotsAvailable` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Destination` MODIFY `region` VARCHAR(191) NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `coverImage` VARCHAR(500) NULL;

-- AlterTable
ALTER TABLE `Package` MODIFY `shortDescription` VARCHAR(255) NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `price` DECIMAL(10, 2) NULL,
    MODIFY `durationDays` INTEGER NULL,
    MODIFY `departureCity` VARCHAR(191) NULL,
    MODIFY `coverImage` VARCHAR(500) NULL,
    MODIFY `included` JSON NULL,
    MODIFY `notIncluded` JSON NULL,
    MODIFY `itinerary` JSON NULL,
    MODIFY `categoryId` INTEGER NULL;

-- AlterTable
ALTER TABLE `PackageImage` MODIFY `alt` VARCHAR(191) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE `Package` ADD CONSTRAINT `Package_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
