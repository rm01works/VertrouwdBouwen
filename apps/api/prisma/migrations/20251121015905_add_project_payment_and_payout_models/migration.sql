-- CreateEnum
CREATE TYPE "ProjectPaymentStatus" AS ENUM ('NOT_FUNDED', 'PARTIALLY_FUNDED', 'FULLY_FUNDED');

-- CreateEnum
CREATE TYPE "ProjectPaymentDirection" AS ENUM ('INCOMING', 'OUTGOING');

-- CreateEnum
CREATE TYPE "ProjectPaymentStatusEnum" AS ENUM ('PENDING_CONSUMER', 'PENDING_ADMIN_REVIEW', 'ESCROW_CONFIRMED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING_ADMIN_PAYOUT', 'PAID');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN "payment_status" "ProjectPaymentStatus" NOT NULL DEFAULT 'NOT_FUNDED';
ALTER TABLE "projects" ADD COLUMN "escrow_funded_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "project_payments" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "consumer_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "direction" "ProjectPaymentDirection" NOT NULL DEFAULT 'INCOMING',
    "status" "ProjectPaymentStatusEnum" NOT NULL DEFAULT 'PENDING_ADMIN_REVIEW',
    "transaction_reference" TEXT,
    "admin_notes" TEXT,
    "confirmed_at" TIMESTAMP(3),
    "confirmed_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "milestone_id" TEXT NOT NULL,
    "contractor_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING_ADMIN_PAYOUT',
    "transaction_reference" TEXT,
    "admin_notes" TEXT,
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),
    "paid_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_payment_status_idx" ON "projects"("payment_status");

-- CreateIndex
CREATE UNIQUE INDEX "project_payments_transaction_reference_key" ON "project_payments"("transaction_reference");

-- CreateIndex
CREATE INDEX "project_payments_project_id_idx" ON "project_payments"("project_id");

-- CreateIndex
CREATE INDEX "project_payments_consumer_id_idx" ON "project_payments"("consumer_id");

-- CreateIndex
CREATE INDEX "project_payments_status_idx" ON "project_payments"("status");

-- CreateIndex
CREATE INDEX "project_payments_transaction_reference_idx" ON "project_payments"("transaction_reference");

-- CreateIndex
CREATE INDEX "project_payments_created_at_idx" ON "project_payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_milestone_id_key" ON "payouts"("milestone_id");

-- CreateIndex
CREATE UNIQUE INDEX "payouts_transaction_reference_key" ON "payouts"("transaction_reference");

-- CreateIndex
CREATE INDEX "payouts_project_id_idx" ON "payouts"("project_id");

-- CreateIndex
CREATE INDEX "payouts_contractor_id_idx" ON "payouts"("contractor_id");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_transaction_reference_idx" ON "payouts"("transaction_reference");

-- CreateIndex
CREATE INDEX "payouts_requested_at_idx" ON "payouts"("requested_at");

-- AddForeignKey
ALTER TABLE "project_payments" ADD CONSTRAINT "project_payments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_payments" ADD CONSTRAINT "project_payments_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

