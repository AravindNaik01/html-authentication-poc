-- ============================================================
-- MERN Auth DB - MySQL Schema
-- Assignment: MERN Stack Authentication & CRUD with MySQL
-- ============================================================

-- Create Database
CREATE DATABASE IF NOT EXISTS mern_auth_db;
USE mern_auth_db;

-- ============================================================
-- Users Table
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_reset_token (reset_token)
);

-- ============================================================
-- Items Table
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'pending', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);

-- ============================================================
-- Sample Data (Optional - for testing)
-- ============================================================
-- NOTE: The password below is 'Password@123' hashed with bcrypt
-- INSERT INTO users (name, email, phone, password) VALUES
-- ('Demo User', 'demo@example.com', '9876543210', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- INSERT INTO items (user_id, title, description, status) VALUES
-- (1, 'First Task', 'This is the first sample task', 'active'),
-- (1, 'Second Task', 'This is the second sample task', 'pending'),
-- (1, 'Third Task', 'This is the third sample task (completed)', 'completed');
