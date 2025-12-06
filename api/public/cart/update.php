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
$quantity = isset($input['quantity']) ? intval($input['quantity']) : 0;

if ($customer_id <= 0 || $equipment_id <= 0 || $quantity < 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Data tidak valid'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    // Jika quantity = 0, hapus item
    if ($quantity === 0) {
        $deleteStmt = $db->prepare("DELETE FROM cart WHERE customer_id = :customer_id AND equipment_id = :equipment_id");
        $deleteStmt->bindParam(':customer_id', $customer_id, PDO::PARAM_INT);
        $deleteStmt->bindParam(':equipment_id', $equipment_id, PDO::PARAM_INT);
        $deleteStmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Item removed from cart'
        ]);
        exit;
    }
    
    // ✅ CEK STOK - SESUAI STRUKTUR TABEL
    $checkStock = $db->prepare("SELECT stock_quantity FROM equipment WHERE equipment_id = :equipment_id");
    $checkStock->bindParam(':equipment_id', $equipment_id, PDO::PARAM_INT);
    $checkStock->execute();
    $equipment = $checkStock->fetch(PDO::FETCH_ASSOC);
    
    if (!$equipment) {
        echo json_encode([
            'success' => false,
            'message' => 'Equipment tidak ditemukan'
        ]);
        exit;
    }
    
    if ($quantity > $equipment['stock_quantity']) {
        echo json_encode([
            'success' => false,
            'message' => 'Quantity melebihi stok tersedia'
        ]);
        exit;
    }
    
    // Update quantity
    $updateStmt = $db->prepare("UPDATE cart SET quantity = :quantity, updated_at = NOW() WHERE customer_id = :customer_id AND equipment_id = :equipment_id");
    $updateStmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
    $updateStmt->bindParam(':customer_id', $customer_id, PDO::PARAM_INT);
    $updateStmt->bindParam(':equipment_id', $equipment_id, PDO::PARAM_INT);
    $updateStmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Cart updated successfully'
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>