<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);

$customer_id = isset($input['customer_id']) ? intval($input['customer_id']) : 0;
$equipment_id = isset($input['equipment_id']) ? intval($input['equipment_id']) : 0;

if ($customer_id <= 0 || $equipment_id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Data tidak valid'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    $deleteStmt = $db->prepare("DELETE FROM cart WHERE customer_id = :customer_id AND equipment_id = :equipment_id");
    $deleteStmt->bindParam(':customer_id', $customer_id, PDO::PARAM_INT);
    $deleteStmt->bindParam(':equipment_id', $equipment_id, PDO::PARAM_INT);
    $deleteStmt->execute();
    
    if ($deleteStmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Cart item tidak ditemukan'
        ]);
    }
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>