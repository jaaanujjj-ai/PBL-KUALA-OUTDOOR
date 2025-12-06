
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
    
    // ✅ GET JSON INPUT
    $input = json_decode(file_get_contents('php://input'), true);
    
    $customer_id = $input['customer_id'] ?? '';
    $package_id = isset($input['package_id']) ? (int)$input['package_id'] : 0;
    $start_date = $input['start_date'] ?? '';
    $end_date = $input['end_date'] ?? '';
    $quantity = isset($input['quantity']) ? (int)$input['quantity'] : 1;
    $notes = $input['notes'] ?? '';
    
    if (!$customer_id || !$package_id || !$start_date || !$end_date) {
        throw new Exception("Customer ID, Package ID, start_date, and end_date required");
    }
    
    // ✅ VALIDATE DATES
    $start = new DateTime($start_date);
    $end = new DateTime($end_date);
    $now = new DateTime();
    
    if ($start < $now) {
        throw new Exception("Start date cannot be in the past");
    }
    
    if ($end <= $start) {
        throw new Exception("End date must be after start date");
    }
    
    $total_days = $start->diff($end)->days;
    
    // ✅ GET PACKAGE INFO
    $package_sql = "SELECT 
                        package_price,
                        package_stock,
                        package_stock_reserved,
                        (package_stock - package_stock_reserved) as available_stock,
                        is_active,
                        name
                    FROM equipment_packages 
                    WHERE package_id = ?";
    
    $package_stmt = $conn->prepare($package_sql);
    $package_stmt->bind_param("i", $package_id);
    $package_stmt->execute();
    $package_result = $package_stmt->get_result();
    
    if ($package_result->num_rows === 0) {
        throw new Exception("Package not found");
    }
    
    $package = $package_result->fetch_assoc();
    
    if (!$package['is_active']) {
        throw new Exception("Package is not available");
    }
    
    // ✅ CHECK AVAILABILITY
    $booking_sql = "SELECT COUNT(*) as booked_count
                    FROM package_bookings
                    WHERE package_id = ?
                    AND booking_status IN ('pending', 'confirmed', 'in_progress')
                    AND (
                        (start_date <= ? AND end_date >= ?) OR
                        (start_date <= ? AND end_date >= ?) OR
                        (start_date >= ? AND end_date <= ?)
                    )";
    
    $booking_stmt = $conn->prepare($booking_sql);
    $booking_stmt->bind_param(
        "issssss", 
        $package_id,
        $start_date, $start_date,
        $end_date, $end_date,
        $start_date, $end_date
    );
    $booking_stmt->execute();
    $booking_result = $booking_stmt->get_result();
    $booked_count = $booking_result->fetch_assoc()['booked_count'];
    
    $available_stock = (int)$package['available_stock'];
    $remaining_stock = $available_stock - (int)$booked_count;
    
    if ($remaining_stock < $quantity) {
        throw new Exception("Insufficient stock. Only $remaining_stock available.");
    }
    
    // ✅ CALCULATE PRICE
    $price_per_day = (float)$package['package_price'];
    $total_price = $price_per_day * $total_days * $quantity;
    
    // ✅ CHECK IF ALREADY IN CART
    $check_sql = "SELECT cart_id FROM package_cart 
                  WHERE customer_id = ? AND package_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("si", $customer_id, $package_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        // UPDATE EXISTING CART ITEM
        $cart = $check_result->fetch_assoc();
        $cart_id = $cart['cart_id'];
        
        $update_sql = "UPDATE package_cart 
                       SET start_date = ?, 
                           end_date = ?, 
                           total_days = ?,
                           quantity = ?,
                           total_price = ?,
                           notes = ?,
                           created_at = NOW()
                       WHERE cart_id = ?";
        
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param(
            "ssiidsi",
            $start_date,
            $end_date,
            $total_days,
            $quantity,
            $total_price,
            $notes,
            $cart_id
        );
        
        if (!$update_stmt->execute()) {
            throw new Exception("Failed to update cart: " . $conn->error);
        }
        
        $message = "Cart updated successfully";
        
    } else {
        // INSERT NEW CART ITEM
        $insert_sql = "INSERT INTO package_cart 
                       (customer_id, package_id, start_date, end_date, total_days, quantity, total_price, notes, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
        
        $insert_stmt = $conn->prepare($insert_sql);
        $insert_stmt->bind_param(
            "sissiids",
            $customer_id,
            $package_id,
            $start_date,
            $end_date,
            $total_days,
            $quantity,
            $total_price,
            $notes
        );
        
        if (!$insert_stmt->execute()) {
            throw new Exception("Failed to add to cart: " . $conn->error);
        }
        
        $cart_id = $conn->insert_id;
        $message = "Package added to cart successfully";
    }
    
    // ✅ GET CART COUNT
    $count_sql = "SELECT COUNT(*) as cart_count FROM package_cart WHERE customer_id = ?";
    $count_stmt = $conn->prepare($count_sql);
    $count_stmt->bind_param("s", $customer_id);
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $cart_count = $count_result->fetch_assoc()['cart_count'];
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data' => [
            'cart_id' => (int)$cart_id,
            'cart_count' => (int)$cart_count,
            'package_name' => $package['name'],
            'total_price' => $total_price
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