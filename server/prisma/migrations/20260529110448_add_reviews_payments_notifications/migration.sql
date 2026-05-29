/*
  Warnings:

  - The `status` column on the `payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[order_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "city_stats" (
    "id" SERIAL NOT NULL,
    "city" TEXT NOT NULL,
    "total_donations" INTEGER NOT NULL DEFAULT 0,
    "total_meals_rescued" INTEGER NOT NULL DEFAULT 0,
    "total_people_fed" INTEGER NOT NULL DEFAULT 0,
    "active_restaurants" INTEGER NOT NULL DEFAULT 0,
    "active_ngos" INTEGER NOT NULL DEFAULT 0,
    "co2_saved_kg" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "city_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_logs" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" INTEGER NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "city_stats_city_key" ON "city_stats"("city");

-- CreateIndex
CREATE INDEX "city_stats_city_idx" ON "city_stats"("city");

-- CreateIndex
CREATE INDEX "admin_logs_admin_id_created_at_idx" ON "admin_logs"("admin_id", "created_at");

-- CreateIndex
CREATE INDEX "admin_logs_target_type_target_id_idx" ON "admin_logs"("target_type", "target_id");

-- CreateIndex
CREATE INDEX "food_listings_restaurant_id_status_idx" ON "food_listings"("restaurant_id", "status");

-- CreateIndex
CREATE INDEX "food_listings_status_expiry_time_idx" ON "food_listings"("status", "expiry_time");

-- CreateIndex
CREATE INDEX "food_requests_ngo_id_status_idx" ON "food_requests"("ngo_id", "status");

-- CreateIndex
CREATE INDEX "food_requests_food_listing_id_status_idx" ON "food_requests"("food_listing_id", "status");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_sent_at_idx" ON "notifications"("user_id", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_donor_id_status_idx" ON "payments"("donor_id", "status");

-- CreateIndex
CREATE INDEX "payments_ngo_id_status_idx" ON "payments"("ngo_id", "status");

-- CreateIndex
CREATE INDEX "reviews_restaurant_id_rating_idx" ON "reviews"("restaurant_id", "rating");

-- CreateIndex
CREATE INDEX "reviews_ngo_id_rating_idx" ON "reviews"("ngo_id", "rating");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_food_request_id_fkey" FOREIGN KEY ("food_request_id") REFERENCES "food_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
