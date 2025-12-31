/*
  Warnings:

  - Added the required column `updatedAt` to the `AIInsight` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `AIInsight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `JoinRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ProjectMember` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIInsight" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "JoinRequest" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProjectMember" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "AIInsightType";
