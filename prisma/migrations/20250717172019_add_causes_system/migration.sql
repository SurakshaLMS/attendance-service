-- CreateTable
CREATE TABLE `causes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `content` LONGTEXT NULL,
    `coverImage` VARCHAR(191) NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
    `requiresVerification` BOOLEAN NOT NULL DEFAULT false,
    `enrollmentKey` VARCHAR(191) NULL,
    `instituteOrganizationId` INTEGER NULL,
    `globalOrganizationId` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `causes_enrollmentKey_key`(`enrollmentKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cause_enrollments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `causeId` INTEGER NOT NULL,
    `verificationStatus` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `verifiedBy` INTEGER NULL,
    `verifiedAt` DATETIME(3) NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `cause_enrollments_userId_causeId_key`(`userId`, `causeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cause_lectures` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `causeId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `content` LONGTEXT NULL,
    `type` ENUM('LIVE', 'RECORDED', 'HYBRID') NOT NULL DEFAULT 'RECORDED',
    `status` ENUM('SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `liveStreamUrl` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NULL,
    `startedAt` DATETIME(3) NULL,
    `endedAt` DATETIME(3) NULL,
    `recordingUrl` VARCHAR(191) NULL,
    `recordingAvailableAfter` DATETIME(3) NULL,
    `visibility` ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PRIVATE',
    `requiresEnrollment` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecture_documents` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `causeLectureId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `documentUrl` VARCHAR(191) NOT NULL,
    `documentType` ENUM('PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'IMAGE', 'VIDEO', 'AUDIO', 'OTHER') NOT NULL,
    `fileSize` INTEGER NULL,
    `uploadedBy` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cause_lecture_enrollments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `causeLectureId` INTEGER NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastAccessedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `watchTimeMinutes` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `cause_lecture_enrollments_userId_causeLectureId_key`(`userId`, `causeLectureId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `causes` ADD CONSTRAINT `causes_instituteOrganizationId_fkey` FOREIGN KEY (`instituteOrganizationId`) REFERENCES `institute_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `causes` ADD CONSTRAINT `causes_globalOrganizationId_fkey` FOREIGN KEY (`globalOrganizationId`) REFERENCES `global_organizations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cause_enrollments` ADD CONSTRAINT `cause_enrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cause_enrollments` ADD CONSTRAINT `cause_enrollments_causeId_fkey` FOREIGN KEY (`causeId`) REFERENCES `causes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cause_enrollments` ADD CONSTRAINT `cause_enrollments_verifiedBy_fkey` FOREIGN KEY (`verifiedBy`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cause_lectures` ADD CONSTRAINT `cause_lectures_causeId_fkey` FOREIGN KEY (`causeId`) REFERENCES `causes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_documents` ADD CONSTRAINT `lecture_documents_causeLectureId_fkey` FOREIGN KEY (`causeLectureId`) REFERENCES `cause_lectures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_documents` ADD CONSTRAINT `lecture_documents_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cause_lecture_enrollments` ADD CONSTRAINT `cause_lecture_enrollments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cause_lecture_enrollments` ADD CONSTRAINT `cause_lecture_enrollments_causeLectureId_fkey` FOREIGN KEY (`causeLectureId`) REFERENCES `cause_lectures`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
