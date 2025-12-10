-- CreateTable
CREATE TABLE "bank_transactions" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

-- Add constraints
ALTER TABLE "bank_transactions" ADD CONSTRAINT "bank_transactions_type_check" CHECK ("type" IN ('credit', 'debit'));

