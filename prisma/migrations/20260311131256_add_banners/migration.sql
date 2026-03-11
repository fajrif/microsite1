-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "order_no" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "short_description" TEXT,
    "cta_button_text" TEXT,
    "cta_button_href" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);
