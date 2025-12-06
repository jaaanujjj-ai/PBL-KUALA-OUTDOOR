<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        // ============================================
        // 📦 GET: Ambil package cart customer
        // ============================================
        case 'GET':
            $customer_id = isset($_GET['customer_id']) ? (int)$_GET['customer_id'] : 0;
            
            if (!$customer_id) {
                throw new Exception('customer_id is required');
            }

            $query = "
                SELECT 
                    c.cart_id,
                    c.customer_id,
                    c.package_id,
                    c.package_name,
                    c.capacity,
                    c.quantity,
                    c.price_per_day,
                    c.total_price,
                    c.rental_start_date,
                    c.rental_end_date,
                    c.rental_days,
                    c.is_checked,
                    c.added_at,
                    c.updated_at
                FROM cart c
                WHERE c.customer_id = ? 
                  AND c.cart_type = 'package'
                ORDER BY c.added_at DESC
            ";

            $stmt = $db->prepare($query);
            $stmt->execute([$customer_id]);
            $cart_items = $stmt->fetchAll(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $cart_items,
                'count' => count($cart_items)
            ]);
            break;

        // ============================================
        // ➕ POST: Tambah package ke cart
        // ============================================
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $customer_id = $input['customer_id'] ?? 0;
            $package_id = $input['package_id'] ?? 0;
            $package_name = $input['package_name'] ?? '';
            $capacity = $input['capacity'] ?? '';
            $quantity = $input['quantity'] ?? 1;
            $price_per_day = $input['price_per_day'] ?? 0;

            if (!$customer_id || !$package_id) {
                throw new Exception('customer_id and package_id are required');
            }

            if (empty($package_name)) {
                throw new Exception('package_name is required');
            }

            // ✅ Cek apakah package tersedia
            $check_query = "
                SELECT 
                    ep.package_stock,
                    ep.package_stock_reserved,
                    (ep.package_stock - ep.package_stock_reserved) as available_stock
                FROM equipment_packages ep
                WHERE ep.package_id = ?
                  AND ep.is_active = TRUE
            ";
            
            $check_stmt = $db->prepare($check_query);
            $check_stmt->execute([$package_id]);
            $package = $check_stmt->fetch(PDO::FETCH_ASSOC);

            if (!$package) {
                throw new Exception('Package tidak ditemukan');
            }

            if ($package['available_stock'] < $quantity) {
                throw new Exception('Stock paket tidak mencukupi. Tersedia: ' . $package['available_stock']);
            }

            // ✅ KALKULASI BARU: quantity × price_per_day (TANPA rental_days)
            $total_price = $price_per_day * $quantity;

            // ✅ Cek apakah sudah ada di cart (untuk update quantity)
            $existing_query = "
                SELECT cart_id, quantity 
                FROM cart 
                WHERE customer_id = ? 
                  AND package_id = ?
                  AND cart_type = 'package'
            ";
            
            $existing_stmt = $db->prepare($existing_query);
            $existing_stmt->execute([$customer_id, $package_id]);
            $existing = $existing_stmt->fetch(PDO::FETCH_ASSOC);

            if ($existing) {
                // Update quantity jika sudah ada
                $new_quantity = $existing['quantity'] + $quantity;
                
                if ($new_quantity > $package['available_stock']) {
                    throw new Exception('Total quantity melebihi stock. Tersedia: ' . $package['available_stock']);
                }

                // ✅ KALKULASI UPDATE: quantity × price_per_day (TANPA rental_days)
                $new_total_price = $price_per_day * $new_quantity;

                $update_query = "
                    UPDATE cart 
                    SET quantity = ?,
                        total_price = ?,
                        updated_at = NOW()
                    WHERE cart_id = ?
                ";
                
                $update_stmt = $db->prepare($update_query);
                $update_stmt->execute([
                    $new_quantity,
                    $new_total_price,
                    $existing['cart_id']
                ]);

                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Quantity paket berhasil diupdate',
                    'cart_id' => (int)$existing['cart_id']
                ]);
            } else {
                // ✅ INSERT BARU dengan rental_days = 0 (placeholder)
                $insert_query = "
                    INSERT INTO cart (
                        customer_id, package_id, package_name, capacity, cart_type,
                        quantity, price_per_day, total_price, rental_start_date,
                        rental_end_date, rental_days, is_checked
                    ) VALUES (?, ?, ?, ?, 'package', ?, ?, ?, NULL, NULL, 0, 1)
                ";
                
                $stmt = $db->prepare($insert_query);
                $stmt->execute([
                    $customer_id,
                    $package_id,
                    $package_name,
                    $capacity,
                    $quantity,
                    $price_per_day,
                    $total_price
                ]);

                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Paket berhasil ditambahkan ke keranjang',
                    'cart_id' => (int)$db->lastInsertId()
                ]);
            }
            break;

        // ============================================
        // 🔄 PUT: Update package quantity di cart
        // ============================================
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            
            $cart_id = isset($input['cart_id']) ? (int)$input['cart_id'] : 0;
            $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 0;

            if (!$cart_id || !$quantity) {
                throw new Exception('cart_id and quantity are required');
            }

            if ($quantity <= 0) {
                throw new Exception('Quantity harus lebih dari 0');
            }

            // ✅ Ambil data cart untuk validasi stock
            $cart_query = "
                SELECT 
                    c.package_id,
                    c.price_per_day,
                    ep.package_stock,
                    ep.package_stock_reserved,
                    (ep.package_stock - ep.package_stock_reserved) as available_stock
                FROM cart c
                JOIN equipment_packages ep ON c.package_id = ep.package_id
                WHERE c.cart_id = ?
                  AND c.cart_type = 'package'
            ";
            
            $cart_stmt = $db->prepare($cart_query);
            $cart_stmt->execute([$cart_id]);
            $cart_data = $cart_stmt->fetch(PDO::FETCH_ASSOC);

            if (!$cart_data) {
                throw new Exception('Cart item tidak ditemukan');
            }

            // ✅ Validasi stock
            if ($quantity > $cart_data['available_stock']) {
                throw new Exception('Stock tidak mencukupi. Tersedia: ' . $cart_data['available_stock']);
            }

            // ✅ KALKULASI BARU: quantity × price_per_day (TANPA rental_days)
            $calculated_total = $cart_data['price_per_day'] * $quantity;

            // ✅ Update cart
            $update_query = "
                UPDATE cart 
                SET quantity = ?,
                    total_price = ?,
                    updated_at = NOW()
                WHERE cart_id = ?
                  AND cart_type = 'package'
            ";
            
            $stmt = $db->prepare($update_query);
            $stmt->execute([$quantity, $calculated_total, $cart_id]);

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Quantity paket berhasil diupdate',
                    'data' => [
                        'cart_id' => $cart_id,
                        'quantity' => $quantity,
                        'total_price' => $calculated_total
                    ]
                ]);
            } else {
                throw new Exception('Tidak ada perubahan data');
            }
            break;

        // ============================================
        // ❌ DELETE: Hapus package dari cart
        // ============================================
        case 'DELETE':
            $cart_id = isset($_GET['cart_id']) ? (int)$_GET['cart_id'] : 0;

            if (!$cart_id) {
                throw new Exception('cart_id is required');
            }

            $delete_query = "
                DELETE FROM cart 
                WHERE cart_id = ? 
                  AND cart_type = 'package'
            ";
            
            $stmt = $db->prepare($delete_query);
            $stmt->execute([$cart_id]);

            if ($stmt->rowCount() > 0) {
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'message' => 'Paket berhasil dihapus dari keranjang'
                ]);
            } else {
                throw new Exception('Paket tidak ditemukan di keranjang');
            }
            break;

        default:
            throw new Exception('Method not allowed');
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>