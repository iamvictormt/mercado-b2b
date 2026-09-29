-- Replace the fixed PostgreSQL enum with editable category records.
CREATE TABLE "product_categories" (
    "slug" VARCHAR(80) NOT NULL,
    "name_pt" VARCHAR(120) NOT NULL,
    "name_en" VARCHAR(120) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("slug")
);

INSERT INTO "product_categories" ("slug", "name_pt", "name_en") VALUES
    ('office', 'Escritórios', 'Offices'),
    ('print', 'Gráficas e comunicação', 'Print & communication'),
    ('agro', 'Agro-negócios', 'Agribusiness'),
    ('business', 'Pequenos negócios', 'Small businesses'),
    ('other', 'Outros', 'Other');

DROP INDEX "products_status_category_idx";

ALTER TABLE "products"
    ALTER COLUMN "category" TYPE VARCHAR(80)
    USING LOWER("category"::text);

DROP TYPE "ProductCategory";

ALTER TABLE "products"
    ADD CONSTRAINT "products_category_fkey"
    FOREIGN KEY ("category") REFERENCES "product_categories"("slug")
    ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "products_status_category_idx" ON "products"("status", "category");

-- Highlighting is now a yes/no choice; recency determines the display order.
UPDATE "products"
SET "featured_order" = CASE WHEN "featured_order" > 0 THEN 1 ELSE 0 END;
