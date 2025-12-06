-- Create equipment_packages table
CREATE TABLE IF NOT EXISTS `equipment_packages` (
  `package_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `capacity` varchar(50) NOT NULL COMMENT 'e.g. 4 Orang, 2-3 Orang',
  `capacity_text` varchar(100) DEFAULT NULL COMMENT 'Optional detail text',
  `description` text,
  `price` decimal(10,2) NOT NULL COMMENT 'Price per duration',
  `duration_days` int(11) NOT NULL DEFAULT 3 COMMENT 'Rental duration in days',
  `stock_total` int(11) NOT NULL DEFAULT 0,
  `stock_reserved` int(11) NOT NULL DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `image_thumbnail` varchar(500) DEFAULT NULL,
  `badge_text` varchar(50) DEFAULT NULL COMMENT 'e.g. BEST SELLER, HEMAT',
  `badge_color` varchar(20) DEFAULT '#FF9800',
  `is_popular` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`package_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_popular` (`is_popular`),
  KEY `idx_display_order` (`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create package_items table
CREATE TABLE IF NOT EXISTS `package_items` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `package_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Item name',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `display_order` int(11) NOT NULL DEFAULT 0,
  `notes` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`item_id`),
  KEY `idx_package` (`package_id`),
  KEY `idx_display_order` (`display_order`),
  CONSTRAINT `fk_package_items_package` FOREIGN KEY (`package_id`) REFERENCES `equipment_packages` (`package_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create package_cart table
CREATE TABLE IF NOT EXISTS `package_cart` (
  `cart_id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` varchar(100) NOT NULL,
  `package_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `notes` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_package` (`package_id`),
  CONSTRAINT `fk_cart_package` FOREIGN KEY (`package_id`) REFERENCES `equipment_packages` (`package_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create package_bookings table
CREATE TABLE IF NOT EXISTS `package_bookings` (
  `booking_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_code` varchar(50) NOT NULL,
  `customer_id` varchar(100) NOT NULL,
  `package_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `total_price` decimal(10,2) NOT NULL,
  `pickup_location` varchar(255) NOT NULL,
  `delivery_location` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `notes` text,
  `payment_proof` varchar(500) DEFAULT NULL,
  `payment_status` enum('pending','paid','verified') NOT NULL DEFAULT 'pending',
  `booking_status` enum('pending','confirmed','active','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`booking_id`),
  UNIQUE KEY `booking_code` (`booking_code`),
  KEY `idx_customer` (`customer_id`),
  KEY `idx_package` (`package_id`),
  KEY `idx_status` (`booking_status`),
  KEY `idx_payment` (`payment_status`),
  CONSTRAINT `fk_booking_package` FOREIGN KEY (`package_id`) REFERENCES `equipment_packages` (`package_id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create booking_history table
CREATE TABLE IF NOT EXISTS `booking_history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `status_from` varchar(50) DEFAULT NULL,
  `status_to` varchar(50) NOT NULL,
  `notes` text,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`),
  KEY `idx_booking` (`booking_id`),
  CONSTRAINT `fk_history_booking` FOREIGN KEY (`booking_id`) REFERENCES `package_bookings` (`booking_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data
INSERT INTO `equipment_packages` (`name`, `capacity`, `capacity_text`, `description`, `price`, `duration_days`, `stock_total`, `badge_text`, `badge_color`, `is_popular`, `is_active`, `display_order`) VALUES
('PAKET KOMPLIT 4 ORANG', '4 Orang', 'Cocok untuk grup kecil', 'Paket lengkap untuk 4 orang dengan semua perlengkapan camping', 750000, 3, 5, 'BEST SELLER', '#FF5722', 1, 1, 1),
('PAKET HEMAT 2 ORANG', '2 Orang', 'Sempurna untuk couple', 'Paket ekonomis untuk 2 orang dengan peralatan standar', 450000, 3, 8, 'HEMAT', '#4CAF50', 1, 1, 2),
('PAKET KELUARGA 6 ORANG', '6 Orang', 'Untuk keluarga besar', 'Paket besar untuk keluarga 6 orang dengan perlengkapan lengkap', 1200000, 3, 3, NULL, '#FF9800', 0, 1, 3);

-- Insert sample items for PAKET KOMPLIT 4 ORANG
INSERT INTO `package_items` (`package_id`, `name`, `quantity`, `display_order`) VALUES
(1, 'Tenda 4 Orang', 1, 1),
(1, 'Sleeping Bag', 4, 2),
(1, 'Matras', 4, 3),
(1, 'Kompor Portable + Gas', 1, 4),
(1, 'Nesting Cooking Set', 1, 5),
(1, 'Headlamp', 4, 6),
(1, 'Tas Carrier 60L', 4, 7);

-- Insert sample items for PAKET HEMAT 2 ORANG
INSERT INTO `package_items` (`package_id`, `name`, `quantity`, `display_order`) VALUES
(2, 'Tenda 2-3 Orang', 1, 1),
(2, 'Sleeping Bag', 2, 2),
(2, 'Matras', 2, 3),
(2, 'Kompor Portable', 1, 4),
(2, 'Headlamp', 2, 5);

-- Insert sample items for PAKET KELUARGA 6 ORANG
INSERT INTO `package_items` (`package_id`, `name`, `quantity`, `display_order`) VALUES
(3, 'Tenda 6 Orang', 1, 1),
(3, 'Sleeping Bag', 6, 2),
(3, 'Matras', 6, 3),
(3, 'Kompor Portable + Gas', 2, 4),
(3, 'Nesting Cooking Set Besar', 1, 5),
(3, 'Headlamp', 6, 6),
(3, 'Tas Carrier 60L', 6, 7),
(3, 'Flysheet', 1, 8);
