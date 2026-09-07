-- ========================================================
-- MIGRATION: Add Size Support to Products, Cart & Orders
-- Run this once against your ORGOS MySQL database
-- (e.g. mysql -u root -p your_db_name < add_product_sizes.sql)
-- ========================================================

-- ------------------------------------------------------
-- 1. NEW TABLE: product_sizes
--    Each row = one size option for one product, with its
--    own stock count. A product with no rows here is treated
--    as a "one size / no size" product (old behaviour).
-- ------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_sizes (
    size_id     INT AUTO_INCREMENT PRIMARY KEY,
    product_id  INT NOT NULL,
    size        VARCHAR(10) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_product_size (product_id, size),
    CONSTRAINT fk_product_sizes_product
        FOREIGN KEY (product_id) REFERENCES products(product_id)
        ON DELETE CASCADE
);

-- ------------------------------------------------------
-- 2. cart_items: remember which size the user picked
-- ------------------------------------------------------

ALTER TABLE cart_items
    ADD COLUMN size VARCHAR(10) NULL AFTER product_id;

-- A user can now have the SAME product twice in cart as long
-- as the size is different, so drop any old unique constraint
-- on (cart_id, product_id) if one exists, and add a size-aware one.
-- (Skip/ignore this block if no such constraint exists in your DB.)
-- ALTER TABLE cart_items DROP INDEX uniq_cart_product;
-- ALTER TABLE cart_items ADD UNIQUE KEY uniq_cart_product_size (cart_id, product_id, size);

-- ------------------------------------------------------
-- 3. order_items: remember which size was actually ordered
-- ------------------------------------------------------

ALTER TABLE order_items
    ADD COLUMN size VARCHAR(10) NULL AFTER product_id;
