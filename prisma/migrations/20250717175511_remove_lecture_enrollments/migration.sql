/*
  Warnings:

  - You are about to drop the `cause_lecture_enrollments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lecture_enrollments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `cause_lecture_enrollments` DROP FOREIGN KEY `cause_lecture_enrollments_causeLectureId_fkey`;

-- DropForeignKey
ALTER TABLE `cause_lecture_enrollments` DROP FOREIGN KEY `cause_lecture_enrollments_userId_fkey`;

-- DropForeignKey
ALTER TABLE `lecture_enrollments` DROP FOREIGN KEY `lecture_enrollments_lectureId_fkey`;

-- DropForeignKey
ALTER TABLE `lecture_enrollments` DROP FOREIGN KEY `lecture_enrollments_userId_fkey`;

-- DropTable
DROP TABLE `cause_lecture_enrollments`;

-- DropTable
DROP TABLE `lecture_enrollments`;
