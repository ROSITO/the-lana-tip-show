-- CreateTable
CREATE TABLE "financial_products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "interest_rate" DECIMAL(5,2) NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "financial_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "investments" (
    "id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "initial_amount" DECIMAL(10,2) NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "maturity_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "investments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "investments" ADD CONSTRAINT "investments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "financial_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

