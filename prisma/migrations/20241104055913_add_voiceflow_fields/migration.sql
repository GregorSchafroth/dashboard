-- CreateTable
CREATE TABLE "Turn" (
    "id" SERIAL NOT NULL,
    "transcriptId" INTEGER NOT NULL,
    "turnId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "format" TEXT NOT NULL,

    CONSTRAINT "Turn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Turn_transcriptId_idx" ON "Turn"("transcriptId");

-- CreateIndex
CREATE INDEX "Turn_turnId_idx" ON "Turn"("turnId");

-- AddForeignKey
ALTER TABLE "Turn" ADD CONSTRAINT "Turn_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
