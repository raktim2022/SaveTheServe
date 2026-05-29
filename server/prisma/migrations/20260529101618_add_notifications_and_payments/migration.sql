/*
  Warnings:

  - A unique constraint covering the columns `[pickup_qr_token]` on the table `food_requests` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "VolunteerStatus" AS ENUM ('PENDING', 'VERIFIED', 'ACTIVE', 'REJECTED');

-- AlterEnum
ALTER TYPE "FoodRequestStatus" ADD VALUE 'REJECTED';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'VOLUNTEER';

-- AlterTable
ALTER TABLE "food_listings" ADD COLUMN     "category" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "pickup_instructions" TEXT,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "food_requests" ADD COLUMN     "assigned_volunteer_id" INTEGER,
ADD COLUMN     "pickup_otp" TEXT,
ADD COLUMN     "pickup_otp_expiry" TIMESTAMP(3),
ADD COLUMN     "pickup_otp_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pickup_qr_token" TEXT,
ADD COLUMN     "rejection_reason" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "verification_token" TEXT,
ADD COLUMN     "verification_token_expiry" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" SERIAL NOT NULL,
    "ngo_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "status" "VolunteerStatus" NOT NULL DEFAULT 'PENDING',
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_otp" TEXT,
    "phone_otp_expiry" TIMESTAMP(3),
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "channel" TEXT NOT NULL DEFAULT 'IN_APP',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "donor_id" INTEGER,
    "ngo_id" INTEGER,
    "amount" DECIMAL(12,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_user_id_key" ON "volunteers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_email_key" ON "volunteers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "food_requests_pickup_qr_token_key" ON "food_requests"("pickup_qr_token");

-- AddForeignKey
ALTER TABLE "food_requests" ADD CONSTRAINT "food_requests_assigned_volunteer_id_fkey" FOREIGN KEY ("assigned_volunteer_id") REFERENCES "volunteers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_ngo_id_fkey" FOREIGN KEY ("ngo_id") REFERENCES "ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteers" ADD CONSTRAINT "volunteers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_donor_id_fkey" FOREIGN KEY ("donor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_ngo_id_fkey" FOREIGN KEY ("ngo_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
