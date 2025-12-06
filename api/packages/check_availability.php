
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
    
    // ✅ GET PARAMETERS
    $package_id = isset($_GET['package_id']) ? (int)$_GET['package_id'] : 0;
    $start_date = $_GET['start_date'] ?? '';
    $end_date = $_GET['end_date'] ?? '';
    $quantity = isset($_GET['quantity']) ? (int)$_GET['quantity'] : 1;
    
    if (!$package_id || !$start_date || !$end_date) {
        throw new Exception("Package ID, start_date, and end_date required");
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
    
    // ✅ GET PACKAGE STOCK
    $package_sql = "SELECT 
                        package_stock,
                        package_stock_reserved,
                        (package_stock - package_stock_reserved) as available_stock,
                        package_price,
                        is_active
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
    
    // ✅ CHECK EXISTING BOOKINGS IN DATE RANGE
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
    
    // ✅ CALCULATE AVAILABILITY
    $available_stock = (int)$package['available_stock'];
    $remaining_stock = $available_stock - (int)$booked_count;
    $is_available = $remaining_stock >= $quantity;
    
    // ✅ CALCULATE PRICE
    $price_per_day = (float)$package['package_price'];
    $total_price = $price_per_day * $total_days * $quantity;
    
    echo json_encode([
        'success' => true,
        'data' => [
            'is_available' => $is_available,
            'package_id' => $package_id,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'total_days' => $total_days,
            'quantity' => $quantity,
            'stock' => [
                'total' => (int)$package['package_stock'],
                'reserved' => (int)$package['package_stock_reserved'],
                'available' => $available_stock,
                'remaining' => max(0, $remaining_stock),
                'booked_in_range' => (int)$booked_count
            ],
            'pricing' => [
                'price_per_day' => $price_per_day,
                'total_days' => $total_days,
                'quantity' => $quantity,
                'subtotal' => $total_price,
                'total' => $total_price
            ]
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