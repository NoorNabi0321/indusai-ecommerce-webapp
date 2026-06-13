-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "storeName" TEXT NOT NULL DEFAULT 'IndusAI Technology',
    "supportEmail" TEXT NOT NULL DEFAULT 'support@indusai.pk',
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'We''re performing scheduled maintenance and will be back shortly.',
    "codEnabled" BOOLEAN NOT NULL DEFAULT true,
    "stripeEnabled" BOOLEAN NOT NULL DEFAULT true,
    "jazzcashEnabled" BOOLEAN NOT NULL DEFAULT true,
    "easypaisaEnabled" BOOLEAN NOT NULL DEFAULT true,
    "paymentMode" TEXT NOT NULL DEFAULT 'sandbox',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);
