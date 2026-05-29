-- CreateTable
CREATE TABLE "reviews" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "reviewer_id" INTEGER NOT NULL,
    "reviewer_role" "UserRole" NOT NULL,
    "restaurant_id" INTEGER,
    "ngo_id" INTEGER,
    "food_request_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_ngo_id_fkey" FOREIGN KEY ("ngo_id") REFERENCES "ngos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
