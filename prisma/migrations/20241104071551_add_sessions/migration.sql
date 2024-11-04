/*
  Warnings:

  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `VoiceflowApiKey` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `VoiceflowProjectId` on the `Project` table. All the data in the column will be lost.
  - The `id` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `browser` on the `Transcript` table. All the data in the column will be lost.
  - You are about to drop the column `device` on the `Transcript` table. All the data in the column will be lost.
  - You are about to drop the column `os` on the `Transcript` table. All the data in the column will be lost.
  - You are about to drop the column `sessionId` on the `Transcript` table. All the data in the column will be lost.
  - You are about to drop the column `turnId` on the `Turn` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `projectId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[voiceflowProjectId]` on the table `Project` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,voiceflowTranscriptId]` on the table `Transcript` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerkId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `voiceflowApiKey` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voiceflowProjectId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voiceflowTranscriptId` to the `Transcript` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `projectId` on the `Transcript` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `voiceflowTurnId` to the `Turn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerkId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transcript" DROP CONSTRAINT "Transcript_projectId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_projectId_fkey";

-- DropIndex
DROP INDEX "Transcript_sessionId_idx";

-- DropIndex
DROP INDEX "Turn_turnId_idx";

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "VoiceflowApiKey",
DROP COLUMN "VoiceflowProjectId",
ADD COLUMN     "voiceflowApiKey" TEXT NOT NULL,
ADD COLUMN     "voiceflowProjectId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Transcript" DROP COLUMN "browser",
DROP COLUMN "device",
DROP COLUMN "os",
DROP COLUMN "sessionId",
ADD COLUMN     "voiceflowTranscriptId" TEXT NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Turn" DROP COLUMN "turnId",
ADD COLUMN     "voiceflowTurnId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "clerkId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "projectId",
ADD COLUMN     "projectId" INTEGER,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "voiceflowSessionId" TEXT NOT NULL,
    "transcriptId" INTEGER NOT NULL,
    "browser" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_voiceflowSessionId_idx" ON "Session"("voiceflowSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_transcriptId_voiceflowSessionId_key" ON "Session"("transcriptId", "voiceflowSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_voiceflowProjectId_key" ON "Project"("voiceflowProjectId");

-- CreateIndex
CREATE INDEX "Transcript_projectId_createdAt_idx" ON "Transcript"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "Transcript_projectId_idx" ON "Transcript"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_projectId_voiceflowTranscriptId_key" ON "Transcript"("projectId", "voiceflowTranscriptId");

-- CreateIndex
CREATE INDEX "Turn_voiceflowTurnId_idx" ON "Turn"("voiceflowTurnId");

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_projectId_idx" ON "User"("projectId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
