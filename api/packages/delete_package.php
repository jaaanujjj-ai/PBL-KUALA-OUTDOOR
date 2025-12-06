
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, POST, OPTIONS');
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
    
    $package_id = isset($input['package_id']) ? (int)$input['package_id'] : 0;
    $force_delete = isset($input['force_delete']) && $input['force_delete'] === true;
    
    if (!$package_id) {
        throw new Exception("Package ID required");
    }
    
    // ✅ CHECK IF PACKAGE EXISTS
    $check_sql = "SELECT name, package_stock_reserved FROM equipment_packages WHERE package_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $package_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows === 0) {
        throw new Exception("Package not found");
    }
    
    $package = $check_result->fetch_assoc();
    $package_name = $package['name'];
    
    // ✅ CHECK FOR ACTIVE BOOKINGS
    $booking_check_sql = "SELECT COUNT(*) as active_bookings 
                          FROM package_bookings 
                          WHERE package_id = ? 
                          AND booking_status IN ('pending', 'confirmed', 'in_progress')";
    
    $booking_check_stmt = $conn->prepare($booking_check_sql);
    $booking_check_stmt->bind_param("i", $package_id);
    $booking_check_stmt->execute();
    $booking_result = $booking_check_stmt->get_result();
    $active_bookings = $booking_result->fetch_assoc()['active_bookings'];
    
    if ($active_bookings > 0 && !$force_delete) {
        throw new Exception("Cannot delete package with active bookings. Use force_delete=true or set is_active=0 instead.");
    }
    
    // ✅ CHECK FOR CART ITEMS
    $cart_check_sql = "SELECT COUNT(*) as cart_count FROM package_cart WHERE package_id = ?";
    $cart_check_stmt = $conn->prepare($cart_check_sql);
    $cart_check_stmt->bind_param("i", $package_id);
    $cart_check_stmt->execute();
    $cart_result = $cart_check_stmt->get_result();
    $cart_count = $cart_result->fetch_assoc()['cart_count'];
    
    // ✅ DELETE CART ITEMS
    if ($cart_count > 0) {
        $delete_cart_sql = "DELETE FROM package_cart WHERE package_id = ?";
        $delete_cart_stmt = $conn->prepare($delete_cart_sql);
        $delete_cart_stmt->bind_param("i", $package_id);
        $delete_cart_stmt->execute();
    }
    
    // ✅ DELETE PACKAGE ITEMS
    $delete_items_sql = "DELETE FROM package_items WHERE package_id = ?";
    $delete_items_stmt = $conn->prepare($delete_items_sql);
    $delete_items_stmt->bind_param("i", $package_id);
    
    if (!$delete_items_stmt->execute()) {
        throw new Exception("Failed to delete package items: " . $conn->error);
    }
    
    $deleted_items = $delete_items_stmt->affected_rows;
    
    // ✅ DELETE PACKAGE AVAILABILITY (if exists)
    $delete_availability_sql = "DELETE FROM package_availability WHERE package_id = ?";
    if ($conn->query("SHOW TABLES LIKE 'package_availability'")->num_rows > 0) {
        $delete_availability_stmt = $conn->prepare($delete_availability_sql);
        $delete_availability_stmt->bind_param("i", $package_id);
        $delete_availability_stmt->execute();
    }
    
    // ✅ DELETE PACKAGE
    $delete_sql = "DELETE FROM equipment_packages WHERE package_id = ?";
    $delete_stmt = $conn->prepare($delete_sql);
    $delete_stmt->bind_param("i", $package_id);
    
    if (!$delete_stmt->execute()) {
        throw new Exception("Failed to delete package: " . $conn->error);
    }
    
    if ($delete_stmt->affected_rows === 0) {
        throw new Exception("Package not found or already deleted");
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Package deleted successfully',
        'data' => [
            'package_id' => $package_id,
            'package_name' => $package_name,
            'deleted_items' => $deleted_items,
            'deleted_cart_items' => $cart_count,
            'had_active_bookings' => $active_bookings > 0
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