
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
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
    
    // ✅ GET JSON INPUT
    $input = json_decode(file_get_contents('php://input'), true);
    
    $cart_id = isset($input['cart_id']) ? (int)$input['cart_id'] : 0;
    $customer_id = $input['customer_id'] ?? '';
    $start_date = $input['start_date'] ?? null;
    $end_date = $input['end_date'] ?? null;
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : null;
    $notes = $input['notes'] ?? null;
    
    if (!$cart_id || !$customer_id) {
        throw new Exception("Cart ID and Customer ID required");
    }
    
    // ✅ GET CURRENT CART ITEM
    $cart_sql = "SELECT c.*, p.package_price, p.package_stock, p.package_stock_reserved
                 FROM package_cart c
                 INNER JOIN equipment_packages p ON c.package_id = p.package_id
                 WHERE c.cart_id = ? AND c.customer_id = ?";
    
    $cart_stmt = $conn->prepare($cart_sql);
    $cart_stmt->bind_param("is", $cart_id, $customer_id);
    $cart_stmt->execute();
    $cart_result = $cart_stmt->get_result();
    
    if ($cart_result->num_rows === 0) {
        throw new Exception("Cart item not found");
    }
    
    $cart = $cart_result->fetch_assoc();
    
    // ✅ UPDATE FIELDS
    $new_start_date = $start_date ?? $cart['start_date'];
    $new_end_date = $end_date ?? $cart['end_date'];
    $new_quantity = $quantity ?? $cart['quantity'];
    $new_notes = $notes !== null ? $notes : $cart['notes'];
    
    // ✅ VALIDATE DATES
    $start = new DateTime($new_start_date);
    $end = new DateTime($new_end_date);
    $now = new DateTime();
    
    if ($start < $now) {
        throw new Exception("Start date cannot be in the past");
    }
    
    if ($end <= $start) {
        throw new Exception("End date must be after start date");
    }
    
    $total_days = $start->diff($end)->days;
    
    // ✅ CHECK AVAILABILITY
    $available_stock = (int)$cart['package_stock'] - (int)$cart['package_stock_reserved'];
    
    if ($available_stock < $new_quantity) {
        throw new Exception("Insufficient stock. Only $available_stock available.");
    }
    
    // ✅ CALCULATE NEW PRICE
    $price_per_day = (float)$cart['package_price'];
    $new_total_price = $price_per_day * $total_days * $new_quantity;
    
    // ✅ UPDATE CART
    $update_sql = "UPDATE package_cart 
                   SET start_date = ?,
                       end_date = ?,
                       total_days = ?,
                       quantity = ?,
                       total_price = ?,
                       notes = ?
                   WHERE cart_id = ? AND customer_id = ?";
    
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param(
        "ssiidsis",
        $new_start_date,
        $new_end_date,
        $total_days,
        $new_quantity,
        $new_total_price,
        $new_notes,
        $cart_id,
        $customer_id
    );
    
    if (!$update_stmt->execute()) {
        throw new Exception("Failed to update cart: " . $conn->error);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart item updated successfully',
        'data' => [
            'cart_id' => $cart_id,
            'start_date' => $new_start_date,
            'end_date' => $new_end_date,
            'total_days' => $total_days,
            'quantity' => $new_quantity,
            'total_price' => $new_total_price
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>