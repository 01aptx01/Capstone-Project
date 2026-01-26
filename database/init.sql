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
  price DECIMAL(6,2)
);

CREATE TABLE stock (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT,
  product_id INT,
  quantity INT
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  machine_id INT,
  product_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO machines (machine_code, location)
VALUES ('VM001', 'Demo');

INSERT INTO products (name, price)
VALUES ('Cola', 20.00);

INSERT INTO stock (machine_id, product_id, quantity)
VALUES (1, 1, 10);