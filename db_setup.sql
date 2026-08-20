-- Run this once against a new MySQL 8+ database.
CREATE DATABASE IF NOT EXISTS personal_trainer_db;
USE personal_trainer_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    otp VARCHAR(6),
    otp_expiry DATETIME,
    password VARCHAR(255) NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    country VARCHAR(50),
    address_line TEXT,
    apartment VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    pin_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS trainers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    image_url VARCHAR(255),
    description TEXT
);

CREATE TABLE IF NOT EXISTS plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration VARCHAR(50),
    description TEXT,
    features JSON
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service VARCHAR(100) NOT NULL,
    duration VARCHAR(50),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    additional_info TEXT,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO trainers (name, specialty, image_url, description)
SELECT 'John Doe', 'Cardio Instructor', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 'Personalized cardio training'
WHERE NOT EXISTS (SELECT 1 FROM trainers WHERE name = 'John Doe');

INSERT INTO trainers (name, specialty, image_url, description)
SELECT 'Jane Smith', 'Yoga Specialist', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 'Yoga and mobility coaching'
WHERE NOT EXISTS (SELECT 1 FROM trainers WHERE name = 'Jane Smith');

INSERT INTO plans (name, price, duration, description, features)
SELECT 'Basic Plan', 15.00, 'Monthly', '', JSON_ARRAY()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Basic Plan');

INSERT INTO plans (name, price, duration, description, features)
SELECT 'Pro Plan', 34.00, 'Monthly', '', JSON_ARRAY()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Pro Plan');

INSERT INTO plans (name, price, duration, description, features)
SELECT 'Elite Plan', 155.00, 'Yearly', '', JSON_ARRAY()
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE name = 'Elite Plan');
