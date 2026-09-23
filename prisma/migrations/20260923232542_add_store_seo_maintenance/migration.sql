-- AlterTable
ALTER TABLE `stores` ADD COLUMN `closedMessage` VARCHAR(300) NULL,
    ADD COLUMN `maintenanceMode` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maintenanceMsg` VARCHAR(300) NULL,
    ADD COLUMN `seoDescription` VARCHAR(320) NULL,
    ADD COLUMN `seoKeywords` VARCHAR(255) NULL,
    ADD COLUMN `seoNoIndex` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `seoTitle` VARCHAR(120) NULL;
