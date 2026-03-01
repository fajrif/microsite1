-- CreateTable
CREATE TABLE "classifications" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "showcases" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classification_id" TEXT NOT NULL,
    "description" TEXT,
    "tagline" TEXT NOT NULL,
    "objective" TEXT,
    "solution" TEXT,
    "campaign_dates" TEXT,
    "market" TEXT,
    "formats" TEXT,
    "source" TEXT,
    "metrics_text" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "showcases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "samples" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "showcase_id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "audio" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "samples_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metrics" (
    "id" TEXT NOT NULL,
    "showcase_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT,
    "caption" TEXT,
    "prefix" TEXT,
    "value" DOUBLE PRECISION NOT NULL,
    "suffix" TEXT,
    "hide_name" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "classifications_name_key" ON "classifications"("name");

-- CreateIndex
CREATE UNIQUE INDEX "showcases_name_key" ON "showcases"("name");

-- CreateIndex
CREATE UNIQUE INDEX "samples_name_key" ON "samples"("name");

-- AddForeignKey
ALTER TABLE "showcases" ADD CONSTRAINT "showcases_classification_id_fkey" FOREIGN KEY ("classification_id") REFERENCES "classifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "samples" ADD CONSTRAINT "samples_showcase_id_fkey" FOREIGN KEY ("showcase_id") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_showcase_id_fkey" FOREIGN KEY ("showcase_id") REFERENCES "showcases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
