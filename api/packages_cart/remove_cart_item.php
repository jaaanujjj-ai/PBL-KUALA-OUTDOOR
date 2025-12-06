
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
    
    $cart_id = isset($input['cart_id']) ? (int)$input['cart_id'] : 0;
    $customer_id = $input['customer_id'] ?? '';
    
    if (!$cart_id || !$customer_id) {
        throw new Exception("Cart ID and Customer ID required");
    }
    
    // ✅ DELETE CART ITEM
    $sql = "DELETE FROM package_cart WHERE cart_id = ? AND customer_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("is", $cart_id, $customer_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to remove cart item: " . $conn->error);
    }
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("Cart item not found");
    }
    
    // ✅ GET REMAINING CART COUNT
    $count_sql = "SELECT COUNT(*) as cart_count FROM package_cart WHERE customer_id = ?";
    $count_stmt = $conn->prepare($count_sql);
    $count_stmt->bind_param("s", $customer_id);
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $cart_count = $count_result->fetch_assoc()['cart_count'];
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart item removed successfully',
        'data' => [
            'cart_count' => (int)$cart_count
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