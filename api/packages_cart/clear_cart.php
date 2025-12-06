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
    
    // ✅ GET JSON INPUT
    $input = json_decode(file_get_contents('php://input'), true);
    $customer_id = $input['customer_id'] ?? '';
    
    if (!$customer_id) {
        throw new Exception("Customer ID required");
    }
    
    // ✅ DELETE ALL CART ITEMS
    $sql = "DELETE FROM package_cart WHERE customer_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $customer_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to clear cart: " . $conn->error);
    }
    
    $deleted_count = $stmt->affected_rows;
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart cleared successfully',
        'data' => [
            'deleted_count' => $deleted_count
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