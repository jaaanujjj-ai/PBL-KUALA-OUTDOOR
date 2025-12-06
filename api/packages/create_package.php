<?php
// filepath: api/packages/create_package.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

try {
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();
    
    // ✅ Insert package
    $query = "INSERT INTO equipment_packages 
        (name, capacity, capacity_text, description, package_price, duration_days, 
         badge_text, badge_color, is_popular, is_active, package_stock, package_stock_reserved, display_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        $data['name'],
        $data['capacity'],
        $data['capacity_text'] ?? '',
        $data['description'] ?? '',
        $data['package_price'],
        $data['duration_days'] ?? 3,
        $data['badge_text'] ?? '',
        $data['badge_color'] ?? '#FF9800',
        $data['is_popular'] ?? 0,
        $data['is_active'] ?? 1,
        $data['package_stock'] ?? 5
    ]);
    
    $package_id = $db->lastInsertId();
    
    // ✅ Insert items (PENTING!)
    if (!empty($data['items']) && is_array($data['items'])) {
        $itemQuery = "INSERT INTO package_items (package_id, item_name, quantity, display_order) 
                      VALUES (?, ?, ?, ?)";
        $itemStmt = $db->prepare($itemQuery);
        
        foreach ($data['items'] as $item) {
            if (!empty($item['item_name'])) { // Skip empty items
                $itemStmt->execute([
                    $package_id,
                    $item['item_name'],
                    $item['quantity'] ?? 1,
                    $item['display_order'] ?? 0
                ]);
            }
        }
    }
    
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Paket berhasil dibuat',
        'package_id' => $package_id
    ]);
    
} catch (Exception $e) {
    if (isset($db)) {
        $db->rollBack();
    }
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>