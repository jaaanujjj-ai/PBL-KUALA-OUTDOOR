<?php
error_reporting(0);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../../config/database.php';

try {
    $json = file_get_contents('php://input');
    $input = json_decode($json, true);
    
    error_log("🎯 CART ADD - Received: " . $json);
    
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    $customer_id = isset($input['customer_id']) ? intval($input['customer_id']) : 0;
    $equipment_id = isset($input['equipment_id']) ? intval($input['equipment_id']) : 0;
    $quantity = isset($input['quantity']) ? intval($input['quantity']) : 1;

    if ($customer_id <= 0) {
        throw new Exception('Customer ID tidak valid: ' . $customer_id);
    }
    
    if ($equipment_id <= 0) {
        throw new Exception('Equipment ID tidak valid: ' . $equipment_id);
    }
    
    if ($quantity <= 0) {
        throw new Exception('Quantity tidak valid: ' . $quantity);
    }

    $database = new Database();
    $db = $database->connect();
    
    // ✅ CEK EQUIPMENT EXIST - SESUAI STRUKTUR TABEL
    $checkEquipment = $db->prepare("SELECT equipment_id, name, stock_quantity FROM equipment WHERE equipment_id = :equipment_id");
    $checkEquipment->bindParam(':equipment_id', $equipment_id, PDO::PARAM_INT);
    $checkEquipment->execute();
    $equipment = $checkEquipment->fetch(PDO::FETCH_ASSOC);
    
    if (!$equipment) {
        throw new Exception('Equipment tidak ditemukan: ' . $equipment_id);
    }
    
    if ($quantity > $equipment['stock_quantity']) {
        throw new Exception('Quantity melebihi stok. Stok: ' . $equipment['stock_quantity'] . ', Request: ' . $quantity);
    }
    
    // ✅ CEK APAKAH SUDAH ADA DI CART
    $checkCart = $db->prepare("SELECT cart_id, quantity FROM cart WHERE customer_id = :customer_id AND equipment_id = :equipment_id");
    $checkCart->bindParam(':customer_id', $customer_id, PDO::PARAM_INT);
    $checkCart->bindParam(':equipment_id', $equipment_id, PDO::PARAM_INT);
    $checkCart->execute();
    $existingItem = $checkCart->fetch(PDO::FETCH_ASSOC);
    
    if ($existingItem) {
        // ✅ UPDATE QUANTITY JIKA SUDAH ADA
        $newQuantity = $existingItem['quantity'] + $quantity;
        
        if ($newQuantity > $equipment['stock_quantity']) {
            $newQuantity = $equipment['stock_quantity'];
        }
        
        $updateStmt = $db->prepare("UPDATE cart SET quantity = :quantity, updated_at = NOW() WHERE cart_id = :cart_id");
        $updateStmt->bindParam(':quantity', $newQuantity, PDO::PARAM_INT);
        $updateStmt->bindParam(':cart_id', $existingItem['cart_id'], PDO::PARAM_INT);
        $updateStmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Cart quantity updated',
            'cart_id' => (int)$existingItem['cart_id'],
            'quantity' => $newQuantity,
            'action' => 'updated'
        ]);
    } else {
        // ✅ INSERT BARU JIKA BELUM ADA
        $insertStmt = $db->prepare("INSERT INTO cart (customer_id, equipment_id, quantity) VALUES (:customer_id, :equipment_id, :quantity)");
        $insertStmt->bindParam(':customer_id', $customer_id, PDO::PARAM_INT);
        $insertStmt->bindParam(':equipment_id', $equipment_id, PDO::PARAM_INT);
        $insertStmt->bindParam(':quantity', $quantity, PDO::PARAM_INT);
        $insertStmt->execute();
        
        $cart_id = $db->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'message' => 'Item added to cart',
            'cart_id' => (int)$cart_id,
            'quantity' => $quantity,
            'action' => 'added'
        ]);
    }
    
} catch (Exception $e) {
    error_log("❌ CART ADD ERROR: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>