
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$db_name = "kuala_outdoor";
$username = "root";
$password = "";

try {
    $conn = new mysqli($host, $username, $password, $db_name);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    $conn->begin_transaction();
    
    // ✅ GET JSON INPUT
    $input = json_decode(file_get_contents('php://input'), true);
    
    $customer_id = $input['customer_id'] ?? '';
    $cart_ids = $input['cart_ids'] ?? []; // Array of cart IDs to checkout
    $pickup_location = $input['pickup_location'] ?? '';
    $delivery_location = $input['delivery_location'] ?? '';
    $customer_name = $input['customer_name'] ?? '';
    $customer_phone = $input['customer_phone'] ?? '';
    $customer_email = $input['customer_email'] ?? '';
    $notes = $input['notes'] ?? '';
    
    if (!$customer_id || empty($cart_ids)) {
        throw new Exception("Customer ID and cart items required");
    }
    
    if (!$customer_name || !$customer_phone) {
        throw new Exception("Customer name and phone required");
    }
    
    $booking_ids = [];
    $total_amount = 0;
    
    // ✅ PROCESS EACH CART ITEM
    foreach ($cart_ids as $cart_id) {
        // Get cart item
        $cart_sql = "SELECT c.*, p.name as package_name, p.package_price, 
                            p.package_stock, p.package_stock_reserved
                     FROM package_cart c
                     INNER JOIN equipment_packages p ON c.package_id = p.package_id
                     WHERE c.cart_id = ? AND c.customer_id = ?";
        
        $cart_stmt = $conn->prepare($cart_sql);
        $cart_stmt->bind_param("is", $cart_id, $customer_id);
        $cart_stmt->execute();
        $cart_result = $cart_stmt->get_result();
        
        if ($cart_result->num_rows === 0) {
            throw new Exception("Cart item not found: $cart_id");
        }
        
        $cart = $cart_result->fetch_assoc();
        
        // ✅ CHECK AVAILABILITY
        $available_stock = (int)$cart['package_stock'] - (int)$cart['package_stock_reserved'];
        
        if ($available_stock < (int)$cart['quantity']) {
            throw new Exception("Insufficient stock for package: " . $cart['package_name']);
        }
        
        // ✅ CREATE BOOKING
        $booking_sql = "INSERT INTO package_bookings 
                        (customer_id, package_id, start_date, end_date, total_days, 
                         total_price, pickup_location, delivery_location, 
                         customer_name, customer_phone, customer_email, notes,
                         payment_status, booking_status, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', NOW())";
        
        $booking_stmt = $conn->prepare($booking_sql);
        $booking_stmt->bind_param(
            "sissidssssss",
            $customer_id,
            $cart['package_id'],
            $cart['start_date'],
            $cart['end_date'],
            $cart['total_days'],
            $cart['total_price'],
            $pickup_location,
            $delivery_location,
            $customer_name,
            $customer_phone,
            $customer_email,
            $notes
        );
        
        if (!$booking_stmt->execute()) {
            throw new Exception("Failed to create booking: " . $conn->error);
        }
        
        $booking_id = $conn->insert_id;
        $booking_ids[] = $booking_id;
        $total_amount += (float)$cart['total_price'];
        
        // ✅ RESERVE STOCK
        $reserve_sql = "UPDATE equipment_packages 
                        SET package_stock_reserved = package_stock_reserved + ?
                        WHERE package_id = ?";
        
        $reserve_stmt = $conn->prepare($reserve_sql);
        $reserve_stmt->bind_param("ii", $cart['quantity'], $cart['package_id']);
        
        if (!$reserve_stmt->execute()) {
            throw new Exception("Failed to reserve stock: " . $conn->error);
        }
        
        // ✅ LOG BOOKING HISTORY
        $history_sql = "INSERT INTO booking_history 
                        (booking_id, old_status, new_status, changed_by, changed_at, notes)
                        VALUES (?, NULL, 'pending', ?, NOW(), 'Booking created')";
        
        $history_stmt = $conn->prepare($history_sql);
        $history_stmt->bind_param("is", $booking_id, $customer_id);
        $history_stmt->execute();
        
        // ✅ REMOVE FROM CART
        $remove_sql = "DELETE FROM package_cart WHERE cart_id = ? AND customer_id = ?";
        $remove_stmt = $conn->prepare($remove_sql);
        $remove_stmt->bind_param("is", $cart_id, $customer_id);
        $remove_stmt->execute();
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Booking created successfully',
        'data' => [
            'booking_ids' => $booking_ids,
            'total_bookings' => count($booking_ids),
            'total_amount' => $total_amount,
            'customer_name' => $customer_name,
            'customer_phone' => $customer_phone,
            'customer_email' => $customer_email
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>