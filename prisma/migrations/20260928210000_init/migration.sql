-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('OFFICE', 'PRINT', 'AGRO', 'BUSINESS', 'OTHER');

-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('REQUESTED', 'UNDER_REVIEW', 'QUOTED', 'IMPORTING', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SourcingStatus" AS ENUM ('REQUESTED', 'SEARCHING', 'SUPPLIER_FOUND', 'QUOTED', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "name" VARCHAR(160) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "company_id" UUID,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "tax_id" VARCHAR(80),
    "email" VARCHAR(255),
    "phone" VARCHAR(40),
    "address" TEXT,
    "country_code" CHAR(2) NOT NULL DEFAULT 'ST',
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(180) NOT NULL,
    "name_pt" VARCHAR(200) NOT NULL,
    "name_en" VARCHAR(200) NOT NULL,
    "description_pt" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "detail_pt" VARCHAR(255),
    "detail_en" VARCHAR(255),
    "category" "ProductCategory" NOT NULL,
    "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
    "price" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "origin_pt" VARCHAR(120) NOT NULL,
    "origin_en" VARCHAR(120) NOT NULL,
    "lead_time_pt" VARCHAR(120) NOT NULL,
    "lead_time_en" VARCHAR(120) NOT NULL,
    "min_quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_pt" VARCHAR(60) NOT NULL,
    "unit_en" VARCHAR(60) NOT NULL,
    "image_url" TEXT,
    "featured_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" UUID NOT NULL,
    "number" VARCHAR(32) NOT NULL,
    "company_id" UUID NOT NULL,
    "requested_by_id" UUID,
    "status" "QuoteStatus" NOT NULL DEFAULT 'REQUESTED',
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "valid_until" DATE,
    "quoted_at" TIMESTAMPTZ(3),
    "delivered_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_items" (
    "id" UUID NOT NULL,
    "quote_id" UUID NOT NULL,
    "product_id" UUID,
    "product_name" VARCHAR(200) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "quote_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sourcing_requests" (
    "id" UUID NOT NULL,
    "number" VARCHAR(32) NOT NULL,
    "company_id" UUID NOT NULL,
    "requested_by_id" UUID,
    "description" TEXT NOT NULL,
    "quantity" INTEGER,
    "budget" DECIMAL(12,2),
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "desired_by" DATE,
    "image_url" TEXT,
    "status" "SourcingStatus" NOT NULL DEFAULT 'REQUESTED',
    "internal_notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "sourcing_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","product_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_company_id_idx" ON "users"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_tax_id_key" ON "companies"("tax_id");

-- CreateIndex
CREATE INDEX "companies_status_idx" ON "companies"("status");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_status_category_idx" ON "products"("status", "category");

-- CreateIndex
CREATE INDEX "products_featured_order_idx" ON "products"("featured_order");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_number_key" ON "quotes"("number");

-- CreateIndex
CREATE INDEX "quotes_company_id_idx" ON "quotes"("company_id");

-- CreateIndex
CREATE INDEX "quotes_requested_by_id_idx" ON "quotes"("requested_by_id");

-- CreateIndex
CREATE INDEX "quotes_status_created_at_idx" ON "quotes"("status", "created_at");

-- CreateIndex
CREATE INDEX "quote_items_quote_id_idx" ON "quote_items"("quote_id");

-- CreateIndex
CREATE INDEX "quote_items_product_id_idx" ON "quote_items"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "sourcing_requests_number_key" ON "sourcing_requests"("number");

-- CreateIndex
CREATE INDEX "sourcing_requests_company_id_idx" ON "sourcing_requests"("company_id");

-- CreateIndex
CREATE INDEX "sourcing_requests_requested_by_id_idx" ON "sourcing_requests"("requested_by_id");

-- CreateIndex
CREATE INDEX "sourcing_requests_status_created_at_idx" ON "sourcing_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "favorites_product_id_idx" ON "favorites"("product_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_items" ADD CONSTRAINT "quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sourcing_requests" ADD CONSTRAINT "sourcing_requests_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sourcing_requests" ADD CONSTRAINT "sourcing_requests_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
