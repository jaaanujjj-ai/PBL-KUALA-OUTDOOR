<?php
// filepath: api/packages/get_package_detail.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

if (!isset($_GET['package_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Package ID required'
    ]);
    exit;
}

$package_id = $_GET['package_id'];

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Get package info
    $query = "SELECT 
        ep.package_id,
        ep.name,
        ep.capacity,
        ep.capacity_text,
        ep.description,
        ep.package_price as price,
        ep.duration_days,
        ep.badge_text,
        ep.badge_color,
        ep.is_popular,
        ep.is_active,
        ep.display_order,
        ep.package_stock,
        ep.package_stock_reserved,
        (ep.package_stock - ep.package_stock_reserved) as available_stock,
        ep.image_url,
        ep.thumbnail_url
    FROM equipment_packages ep
    WHERE ep.package_id = ?";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$package_id]);
    $package = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$package) {
        echo json_encode([
            'success' => false,
            'message' => 'Package not found'
        ]);
        exit;
    }
    
    // Get items
    $itemQuery = "SELECT 
        package_item_id,
        item_name as name,
        quantity,
        display_order,
        notes
    FROM package_items 
    WHERE package_id = ? 
    ORDER BY display_order ASC";
    
    $itemStmt = $db->prepare($itemQuery);
    $itemStmt->execute([$package_id]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format response
    $response = [
        'package_id' => (int)$package['package_id'],
        'name' => $package['name'],
        'capacity' => $package['capacity'],
        'capacity_text' => $package['capacity_text'],
        'description' => $package['description'],
        'price' => (float)$package['price'],
        'price_formatted' => 'Rp ' . number_format($package['price'], 0, ',', '.'),
        'duration_days' => (int)$package['duration_days'],
        'badge' => $package['badge_text'] ? [
            'text' => $package['badge_text'],
            'color' => $package['badge_color']
        ] : null,
        'is_popular' => (bool)$package['is_popular'],
        'is_active' => (bool)$package['is_active'],
        'display_order' => (int)$package['display_order'],
        'stock' => [
            'total' => (int)$package['package_stock'],
            'reserved' => (int)$package['package_stock_reserved'],
            'available' => (int)$package['available_stock']
        ],
        'images' => [
            'url' => $package['image_url'],
            'thumbnail' => $package['thumbnail_url']
        ],
        'items' => $items
    ];
    
    echo json_encode([
        'success' => true,
        'message' => 'Package detail retrieved successfully',
        'data' => $response
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>