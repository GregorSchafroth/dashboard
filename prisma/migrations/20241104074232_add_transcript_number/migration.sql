/*
  Warnings:

  - Added the required column `transcriptNumber` to the `Transcript` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transcript" ADD COLUMN     "transcriptNumber" INTEGER NOT NULL;
