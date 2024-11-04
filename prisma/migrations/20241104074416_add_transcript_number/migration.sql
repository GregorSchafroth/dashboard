/*
  Warnings:

  - A unique constraint covering the columns `[projectId,transcriptNumber]` on the table `Transcript` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Transcript_projectId_transcriptNumber_key" ON "Transcript"("projectId", "transcriptNumber");
