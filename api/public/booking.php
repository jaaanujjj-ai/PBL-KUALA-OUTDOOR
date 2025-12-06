<?php
// filepath: api/public/booking.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

try {
    $database = new Database();
    $pdo = $database->getConnection();

    if (!$pdo) {
        throw new Exception("Database connection failed");
    }

    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);

        error_log("📥 Booking Input: " . json_encode($input, JSON_PRETTY_PRINT));

        // ✅ VALIDASI - CEK ADA EQUIPMENT ATAU PACKAGE
        $hasEquipment = !empty($input['equipment_items']);
        $hasPackage = !empty($input['package_items']);

        if (!$hasEquipment && !$hasPackage) {
            throw new Exception("Minimal harus ada 1 equipment atau 1 paket");
        }

        if (
            empty($input['customer_name']) ||
            empty($input['start_date']) ||
            empty($input['end_date'])
        ) {
            throw new Exception("Data booking tidak lengkap");
        }

        $customer_name = $input['customer_name'];
        $customer_phone = $input['customer_phone'] ?? null;
        $customer_email = $input['customer_email'] ?? null;
        $customer_identity_number = $input['customer_identity_number'] ?? null;
        $customer_id = $input['customer_id'] ?? null;
        $start_date = $input['start_date'];
        $end_date = $input['end_date'];
        $notes = $input['notes'] ?? '';

        // Hitung durasi
        $start = new DateTime($start_date);
        $end = new DateTime($end_date);
        $duration = $start->diff($end)->days;
        if ($duration <= 0) $duration = 1;

        $pdo->beginTransaction();

        try {
            $total_price = 0;

            // ✅ HITUNG HARGA DARI EQUIPMENT
            if ($hasEquipment) {
                foreach ($input['equipment_items'] as $item) {
                    $stmt = $pdo->prepare("SELECT price_per_day, name FROM equipment WHERE equipment_id = ?");
                    $stmt->execute([$item['equipment_id']]);
                    $equipment = $stmt->fetch(PDO::FETCH_ASSOC);

                    if (!$equipment) {
                        throw new Exception("Equipment ID {$item['equipment_id']} tidak ditemukan");
                    }

                    $item_total = $equipment['price_per_day'] * $item['quantity'] * $duration;
                    $total_price += $item_total;
                    
                    error_log("💰 Equipment: {$equipment['name']} | Qty: {$item['quantity']} | Total: {$item_total}");
                }
            }

            // ✅ HITUNG HARGA DARI PAKET
            if ($hasPackage) {
                foreach ($input['package_items'] as $item) {
                    $stmt = $pdo->prepare("SELECT package_price, name FROM equipment_packages WHERE package_id = ?");
                    $stmt->execute([$item['package_id']]);
                    $package = $stmt->fetch(PDO::FETCH_ASSOC);

                    if (!$package) {
                        throw new Exception("Package ID {$item['package_id']} tidak ditemukan");
                    }

                    $item_total = $package['package_price'] * $item['quantity'] * $duration;
                    $total_price += $item_total;
                    
                    error_log("📦 Package: {$package['name']} | Qty: {$item['quantity']} | Total: {$item_total}");
                }
            }

            error_log("💵 Total Price: Rp " . number_format($total_price, 0, ',', '.'));

            // Generate booking code
            $booking_code = "KO-" . date('Ymd') . "-" . str_pad(rand(100, 999), 3, '0', STR_PAD_LEFT);

            // ✅ INSERT BOOKING
            $query = "INSERT INTO bookings (
                customer_name, customer_phone, customer_email, customer_identity_number,
                customer_id, booking_code, start_date, end_date, estimated_duration, 
                total_estimated_cost, status, payment_status, notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unpaid', ?, NOW())";

            $stmt = $pdo->prepare($query);
            $success = $stmt->execute([
                $customer_name, $customer_phone, $customer_email, $customer_identity_number,
                $customer_id, $booking_code, $start_date, $end_date, $duration,
                $total_price, $notes
            ]);

            if (!$success) {
                throw new Exception("Gagal menyimpan booking");
            }

            $booking_id = $pdo->lastInsertId();

            // ✅ INSERT EQUIPMENT ITEMS
            if ($hasEquipment) {
                foreach ($input['equipment_items'] as $item) {
                    $insertQuery = "INSERT INTO booking_items (booking_id, equipment_id, quantity)
                                    VALUES (?, ?, ?)";
                    $stmt = $pdo->prepare($insertQuery);
                    $stmt->execute([$booking_id, $item['equipment_id'], $item['quantity']]);
                }
            }

            // ✅ INSERT PACKAGE ITEMS
            if ($hasPackage) {
                foreach ($input['package_items'] as $item) {
                    $insertQuery = "INSERT INTO booking_items (booking_id, package_id, quantity)
                                    VALUES (?, ?, ?)";
                    $stmt = $pdo->prepare($insertQuery);
                    $stmt->execute([$booking_id, $item['package_id'], $item['quantity']]);
                }
            }

            $pdo->commit();

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Booking berhasil dibuat",
                "booking_id" => $booking_id,
                "booking_code" => $booking_code,
                "total_price" => $total_price,
                "duration" => $duration
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        exit;
    }

} catch (Exception $e) {
    error_log("❌ Error: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>