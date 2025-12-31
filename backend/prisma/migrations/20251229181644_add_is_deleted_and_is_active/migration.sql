-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
