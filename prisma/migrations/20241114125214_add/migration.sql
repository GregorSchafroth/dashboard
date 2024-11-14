-- AlterTable
ALTER TABLE "Turn" ADD COLUMN     "sequence" INTEGER;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" DROP NOT NULL;
