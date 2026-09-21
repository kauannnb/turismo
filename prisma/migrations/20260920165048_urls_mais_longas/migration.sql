-- Nomes de tabela em PascalCase de proposito: o Linux e case-sensitive.
-- Ver "Caixa dos nomes de tabela" no HANDOFF.md.

-- AlterTable
ALTER TABLE `Destination` MODIFY `coverImage` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `Package` MODIFY `shortDescription` VARCHAR(255) NOT NULL,
    MODIFY `coverImage` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `PackageImage` MODIFY `url` VARCHAR(500) NOT NULL;
