/*
  Warnings:

  - You are about to drop the column `guestClientEmail` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestClientFirstName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestClientLastName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestClientMiddleName` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `guestClientPhone` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "guestClientEmail",
DROP COLUMN "guestClientFirstName",
DROP COLUMN "guestClientLastName",
DROP COLUMN "guestClientMiddleName",
DROP COLUMN "guestClientPhone",
ADD COLUMN     "companyClientId" TEXT;

-- CreateTable
CREATE TABLE "CompanyClient" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "middleName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isGuest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyClient_companyId_idx" ON "CompanyClient"("companyId");

-- CreateIndex
CREATE INDEX "CompanyClient_phone_idx" ON "CompanyClient"("phone");

-- CreateIndex
CREATE INDEX "CompanyClient_email_idx" ON "CompanyClient"("email");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_companyClientId_fkey" FOREIGN KEY ("companyClientId") REFERENCES "CompanyClient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyClient" ADD CONSTRAINT "CompanyClient_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyClient" ADD CONSTRAINT "CompanyClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
