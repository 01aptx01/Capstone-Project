SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS vending;
USE vending;

-- Drop order
DROP TABLE IF EXISTS user_promotions;
DROP TABLE IF EXISTS otp_sessions;
DROP TABLE IF EXISTS admin_user_role;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS machine_job_events;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS machine_slots;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS machines;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  display_name VARCHAR(100) NULL,
  points INT NOT NULL DEFAULT 0,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_use DATETIME NULL,
  status ENUM('active','suspended','banned') NOT NULL DEFAULT 'active',
  UNIQUE KEY uq_users_phone (phone_number),
  -- Composite index: covers WHERE status='active' AND last_use < X (user maintenance sweeper)
  KEY idx_users_status_lastuse (status, last_use)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE otp_sessions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(15) NOT NULL,
  code_hash VARCHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_otp_phone_expires (phone_number, expires_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE promotions (
  promotion_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  type ENUM('fixed_amount','percent') NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expire_date DATETIME NULL,
  points_cost INT NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 0 COMMENT '0 = unlimited redemptions',
  UNIQUE KEY uq_promotions_code (code)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE user_promotions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  promotion_id INT NOT NULL,
  status ENUM('active','used','expired') NOT NULL DEFAULT 'active',
  code VARCHAR(50) NULL,
  redeemed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_promotions_code (code),
  KEY idx_user_promotions_user (user_id),
  KEY idx_user_promotions_promo (promotion_id),
  CONSTRAINT fk_user_promotions_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_user_promotions_promotion
    FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE machines (
  machine_code VARCHAR(20) NOT NULL,
  location TEXT NULL,
  status ENUM('online','maintenance','offline') NOT NULL DEFAULT 'online',
  last_active DATETIME NULL,
  secret_token_hash VARCHAR(255) NULL,
  is_online TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (machine_code)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(200),
  heating_time INT,
  category ENUM('meat', 'vegetarian', 'sweet') NOT NULL DEFAULT 'meat'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE machine_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_code VARCHAR(20) NOT NULL,
  slot_number INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_machine_slot (machine_code, slot_number),
  KEY idx_machine_slots_machine (machine_code),
  KEY idx_machine_slots_product (product_id),
  CONSTRAINT fk_machine_slots_machine
    FOREIGN KEY (machine_code) REFERENCES machines(machine_code)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_machine_slots_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  machine_code VARCHAR(20) NOT NULL,
  user_id INT NULL,
  promotion_id INT NULL,
  user_promotion_id INT NULL,
  charge_id VARCHAR(64) NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method ENUM('cash','qr_code','credit_card') NOT NULL,
  status ENUM(
    'pending_payment',
    'cancelled',
    'payment_failed',
    'paid',
    'dispensing',
    'completed',
    'dispense_failed',
    'refunded'
  ) NOT NULL DEFAULT 'pending_payment',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_orders_charge_id (charge_id),
  KEY idx_orders_machine (machine_code),
  KEY idx_orders_user (user_id),
  KEY idx_orders_promo (promotion_id),
  KEY idx_orders_user_promo (user_promotion_id),
  -- Composite: covers background sweeper (WHERE status='pending_payment' AND created_at < X)
  KEY idx_orders_status_created (status, created_at),
  -- Composite: covers dispatch_pending_jobs (WHERE machine_code=X AND status='paid')
  KEY idx_orders_machine_status (machine_code, status),
  CONSTRAINT fk_orders_machine
    FOREIGN KEY (machine_code) REFERENCES machines(machine_code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_orders_promotion
    FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_orders_user_promotion
    FOREIGN KEY (user_promotion_id) REFERENCES user_promotions(id)
    ON UPDATE CASCADE ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price_at_purchase DECIMAL(10,2) NOT NULL,
  KEY idx_order_items_order (order_id),
  KEY idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE machine_job_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  machine_code VARCHAR(20) NOT NULL,
  job_id VARCHAR(64) NOT NULL,
  order_charge_id VARCHAR(64) NULL,
  event_type VARCHAR(50) NOT NULL,
  state VARCHAR(50) NULL,
  seq INT NOT NULL,
  payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolved_at DATETIME NULL,
  UNIQUE KEY uq_mje_job_seq (job_id, seq),
  KEY idx_mje_machine (machine_code),
  KEY idx_mje_job (job_id),
  KEY idx_mje_charge (order_charge_id),
  KEY idx_mje_created (created_at),
  CONSTRAINT fk_machine_job_events_machine_code
    FOREIGN KEY (machine_code) REFERENCES machines(machine_code)
    ON UPDATE CASCADE ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  first_name VARCHAR(100) DEFAULT '',
  last_name VARCHAR(100) DEFAULT '',
  position VARCHAR(100) DEFAULT '',
  phone VARCHAR(20) DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_admin_users_email (email)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(255) NULL,
  UNIQUE KEY uq_roles_name (name)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE admin_user_role (
  admin_user_id INT NOT NULL,
  role_id INT NOT NULL,
  PRIMARY KEY (admin_user_id, role_id),
  CONSTRAINT fk_aur_admin_user
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_aur_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  provider VARCHAR(32) NOT NULL,
  provider_ref VARCHAR(128) NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'THB',
  fee_amount DECIMAL(10,2) NULL,
  status VARCHAR(32) NOT NULL,
  raw_payload_json JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_transactions_order (order_id),
  KEY idx_transactions_provider_ref (provider_ref),
  CONSTRAINT fk_transactions_order
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================
-- SEED DATA
-- =====================

-- Admin roles (RBAC)
INSERT INTO roles (name, description) VALUES
('superadmin', 'Full administrative access'),
('admin', 'Standard administrative access');

-- Machine (dev token plaintext: dev-machine-token — bcrypt hash below; production: create via Admin)
INSERT INTO machines (machine_code, secret_token_hash, location, status) VALUES (
  'MP1-001',
  '$2b$10$W0G.2otS8YZDbRVFSeuSgOcqxw.8d4KypWoqRzYieAREZnz/OrtSq',
  'KMUTT',
  'online'
);

-- Products
INSERT INTO products (name, description, price, heating_time, image_url, category) VALUES
('เปาหมูแดง', 'ไส้หมูแดงเข้มข้น หวานกำลังดี', 32.00, 15, '/product/img/pao-moddaeng.png', 'meat'),
('เปาหมูสับ', 'หมูสับไข่เค็ม รสกลมกล่อม', 32.00, 20, '/product/img/pao-moosub.png', 'meat'),
('เปากุ้ง', 'เนื้อกุ้งเด้งเต็มคำ', 32.00, 15, '/product/img/pao-shrimp.png', 'meat'),
('เปาเต้าหู้', 'ไส้เต้าหู้รสกลมกล่อม', 22.00, 12, '/product/img/pao-tofu.png', 'vegetarian'),
('เปาเห็ดหอม', 'ไส้เห็ดหอม รสกลมกล่อม', 25.00, 15, '/product/img/pao-mushroom.png', 'vegetarian'),
('เปาครีม', 'ครีมคัสตาร์ด หอมหวานละมุน', 25.00, 12, '/product/img/pao-cream.png', 'sweet');

-- Stock (20 each for machine 1)
INSERT INTO machine_slots (machine_code, slot_number, product_id, quantity) VALUES
('MP1-001', 1, 1, 20),
('MP1-001', 2, 2, 20),
('MP1-001', 3, 3, 20),
('MP1-001', 4, 4, 20),
('MP1-001', 5, 5, 20),
('MP1-001', 6, 6, 20);

-- Redeemable promotions (web-ui /redeem)
INSERT INTO promotions (code, type, discount_amount, is_active, expire_date, points_cost, max_uses) VALUES
('POINTS50', 'fixed_amount', 10.00, 1, DATE_ADD(NOW(), INTERVAL 1 YEAR), 50, 0),
('POINTS100', 'percent', 15.00, 1, DATE_ADD(NOW(), INTERVAL 1 YEAR), 100, 0);

-- Demo member (web-ui login / profile / redeem)
INSERT INTO users (phone_number, points, last_use, status) VALUES
('0631723422', 150, NOW(), 'active')
ON DUPLICATE KEY UPDATE
  points = VALUES(points),
  last_use = VALUES(last_use),
  status = VALUES(status);

-- Seed mock order history for the demo user
SET @demo_user_id = (SELECT user_id FROM users WHERE phone_number = '0631723422' LIMIT 1);

-- Order 1: Completed order (2 days ago)
INSERT INTO orders (machine_code, user_id, charge_id, total_price, payment_method, status, created_at)
VALUES ('MP1-001', @demo_user_id, 'chrg_test_00000001', 57.00, 'qr_code', 'completed', DATE_SUB(NOW(), INTERVAL 2 DAY));

SET @order1_id = LAST_INSERT_ID();
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
(@order1_id, 2, 1, 32.00), -- เปาหมูสับ
(@order1_id, 5, 1, 25.00); -- เปาเห็ดหอม

-- Order 2: Completed order (1 hour ago)
INSERT INTO orders (machine_code, user_id, charge_id, total_price, payment_method, status, created_at)
VALUES ('MP1-001', @demo_user_id, 'chrg_test_00000002', 32.00, 'credit_card', 'completed', DATE_SUB(NOW(), INTERVAL 1 HOUR));

SET @order2_id = LAST_INSERT_ID();
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
(@order2_id, 1, 1, 32.00); -- เปาหมูแดง

-- Seed one active coupon for the demo user
SET @promo_id = (SELECT promotion_id FROM promotions WHERE code = 'POINTS50' LIMIT 1);
INSERT INTO user_promotions (user_id, promotion_id, status)
VALUES (@demo_user_id, @promo_id, 'active');
