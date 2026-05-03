SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS vending;
USE vending;

-- Drop order
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
  points INT NOT NULL DEFAULT 0,
  registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_use DATETIME NULL,
  status ENUM('active','suspended','banned') NOT NULL DEFAULT 'active',
  UNIQUE KEY uq_users_phone (phone_number)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE promotions (
  promotion_id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  type ENUM('fixed_amount','percent') NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  expire_date DATETIME NULL,
  UNIQUE KEY uq_promotions_code (code)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE machines (
  machine_code VARCHAR(20) NOT NULL,
  location TEXT NULL,
  status ENUM('online','maintenance','offline') NOT NULL DEFAULT 'online',
  last_active DATETIME NULL,
  PRIMARY KEY (machine_code)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(200),
  heating_time INT
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
  UNIQUE KEY uq_orders_charge_id (charge_id),
  KEY idx_orders_machine (machine_code),
  KEY idx_orders_user (user_id),
  KEY idx_orders_promo (promotion_id),
  CONSTRAINT fk_orders_machine
    FOREIGN KEY (machine_code) REFERENCES machines(machine_code)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_orders_promotion
    FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
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
  UNIQUE KEY uq_mje_job_seq (job_id, seq),
  KEY idx_mje_machine (machine_code),
  KEY idx_mje_job (job_id),
  KEY idx_mje_charge (order_charge_id),
  KEY idx_mje_created (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- =====================
-- SEED DATA
-- =====================

-- Machine
INSERT INTO machines (machine_code, location, status) VALUES ('MP1-001', 'KMUTT', 'online');

-- Products
INSERT INTO products (name, description, price, heating_time, image_url) VALUES
('เปามดแดง', 'ไส้หมูแดงเข้มข้น หวานกำลังดี', 32.00, 15, '/product/img/pao-moddaeng.png'),
('เปาหมูสับ', 'หมูสับไข่เค็ม รสกลมกล่อม', 32.00, 20, '/product/img/pao-moosub.png'),
('เปากุ้ง', 'เนื้อกุ้งเด้งเต็มคำ', 32.00, 15, '/product/img/pao-shrimp.png'),
('เปาเต้าหู้', 'ไส้เต้าหู้รสกลมกล่อม', 22.00, 12, '/product/img/pao-tofu.png'),
('เปาเห็ดหอม', 'ไส้เห็ดหอม รสกลมกล่อม', 25.00, 15, '/product/img/pao-mushroom.png'),
('เปาครีม', 'ครีมคัสตาร์ด หอมหวานละมุน', 25.00, 12, '/product/img/pao-cream.png');

-- Stock (20 each for machine 1)
INSERT INTO machine_slots (machine_code, slot_number, product_id, quantity) VALUES
('MP1-001', 1, 1, 20),
('MP1-001', 2, 2, 20),
('MP1-001', 3, 3, 20),
('MP1-001', 4, 4, 20),
('MP1-001', 5, 5, 20),
('MP1-001', 6, 6, 20);