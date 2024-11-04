/*
  Warnings:

  - Added the required column `VoiceflowApiKey` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `VoiceflowProjectId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "VoiceflowApiKey" TEXT NOT NULL,
ADD COLUMN     "VoiceflowProjectId" TEXT NOT NULL;
