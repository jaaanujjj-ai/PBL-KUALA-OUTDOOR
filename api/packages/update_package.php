<?php
// filepath: api/packages/update_package.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../config/database.php';

$data = json_decode(file_get_contents("php://input"), true);

try {
    $database = new Database();
    $db = $database->getConnection();
    $db->beginTransaction();
    
    $package_id = $data['package_id'];
    
    // ✅ Update package info
    $query = "UPDATE equipment_packages SET 
        name = ?,
        capacity = ?,
        capacity_text = ?,
        description = ?,
        package_price = ?,
        duration_days = ?,
        badge_text = ?,
        badge_color = ?,
        is_active = ?,
        package_stock = ?
        WHERE package_id = ?";
    
    $stmt = $db->prepare($query);
    $stmt->execute([
        $data['name'] ?? '',
        $data['capacity'] ?? '',
        $data['capacity_text'] ?? '',
        $data['description'] ?? '',
        $data['package_price'] ?? 0,
        $data['duration_days'] ?? 3,
        $data['badge_text'] ?? '',
        $data['badge_color'] ?? '#FF9800',
        $data['is_active'] ?? 1,
        $data['package_stock'] ?? 5,
        $package_id
    ]);
    
    // ✅ Delete old items then insert new ones
    if (isset($data['items']) && is_array($data['items'])) {
        // Delete old items
        $deleteQuery = "DELETE FROM package_items WHERE package_id = ?";
        $deleteStmt = $db->prepare($deleteQuery);
        $deleteStmt->execute([$package_id]);
        
        // Insert new items
        $itemQuery = "INSERT INTO package_items (package_id, item_name, quantity, display_order) 
                      VALUES (?, ?, ?, ?)";
        $itemStmt = $db->prepare($itemQuery);
        
        foreach ($data['items'] as $item) {
            if (!empty($item['item_name'])) {
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
        'message' => 'Paket berhasil diupdate'
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