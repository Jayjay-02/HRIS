-- LTO HR Database Schema (MySQL)

-- Create database
CREATE DATABASE IF NOT EXISTS lto_hr;
USE lto_hr;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr', 'head', 'employee') DEFAULT 'employee',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- To insert admin user, run the PHP script:
-- php backend/database/create_admin.php
-- Or manually insert with bcrypt hash of 'admin123':
-- INSERT INTO users (name, email, password, role) VALUES ('Administrator', 'admin@gmail.com', '$2y$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'admin');
