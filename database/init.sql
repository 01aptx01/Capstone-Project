CREATE DATABASE IF NOT EXISTS vending;
USE vending;

CREATE TABLE machines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_code VARCHAR(20) UNIQUE,
  location VARCHAR(100)
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50),
  description VARCHAR(100),
  price DECIMAL(6,2),
  heating_time INT,
  image_url VARCHAR(200)
);

CREATE TABLE stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT,
  product_id INT,
  quantity INT,
  FOREIGN KEY (machine_id) REFERENCES machines(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT,
  product_id INT,
  quantity INT DEFAULT 1,
  charge_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (machine_id) REFERENCES machines(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- =====================
-- SEED DATA
-- =====================

-- Machine
INSERT INTO machines (machine_code, location)
VALUES ('MP1-001', 'KMUTT');

-- Products
INSERT INTO products (name, description, price, heating_time, image_url) VALUES
('เปามดแดง', 'ไส้หมูแดงเข้มข้น หวานกำลังดี', 32.00, 15, '/product/img/pao-moddaeng.png'),
('เปาหมูสับ', 'หมูสับไข่เค็ม รสกลมกล่อม', 32.00, 20, '/product/img/pao-moosub.png'),
('เปากุ้ง', 'เนื้อกุ้งเด้งเต็มคำ', 32.00, 15, '/product/img/pao-shrimp.png'),
('เปาครีม', 'ครีมคัสตาร์ด หอมหวานละมุน', 25.00, 12, '/product/img/pao-cream.png');

-- Stock (20 each for machine 1)
INSERT INTO stock (machine_id, product_id, quantity) VALUES
(1, 1, 20),
(1, 2, 20),
(1, 3, 20),
(1, 4, 20);