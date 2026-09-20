-- AlterTable
ALTER TABLE `destination` MODIFY `coverImage` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `package` MODIFY `shortDescription` VARCHAR(255) NOT NULL,
    MODIFY `coverImage` VARCHAR(500) NOT NULL;

-- AlterTable
ALTER TABLE `packageimage` MODIFY `url` VARCHAR(500) NOT NULL;
