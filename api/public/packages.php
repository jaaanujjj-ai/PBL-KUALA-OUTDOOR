<?php
// filepath: api/public/packages.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Query untuk ambil packages yang aktif dengan items
    $query = "SELECT 
        ep.package_id as id,
        ep.name,
        ep.capacity,
        ep.package_price as price,
        ep.badge_text as badge,
        ep.badge_color as badgeColor,
        ep.is_popular as popular,
        ep.description,
        ep.image_url,
        ep.package_stock,
        ep.package_stock_reserved,
        (ep.package_stock - ep.package_stock_reserved) as available_stock,
        CASE 
            WHEN (ep.package_stock - ep.package_stock_reserved) > 0 THEN 1
            ELSE 0
        END as in_stock
    FROM equipment_packages ep
    WHERE ep.is_active = 1
    ORDER BY ep.is_popular DESC, ep.display_order ASC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $packages = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $package_id = $row['id'];
        
        // Fetch items untuk setiap package dari table package_items
        $itemQuery = "SELECT item_name as name, quantity 
                      FROM package_items 
                      WHERE package_id = ? 
                      ORDER BY display_order ASC";
        $itemStmt = $db->prepare($itemQuery);
        $itemStmt->execute([$package_id]);
        $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format badge color
        $badgeColor = $row['badgeColor'];
        if ($badgeColor && !str_starts_with($badgeColor, 'bg-')) {
            if (stripos($badgeColor, 'FF9800') !== false) {
                $badgeColor = 'bg-orange-500';
            } elseif (stripos($badgeColor, '4CAF50') !== false) {
                $badgeColor = 'bg-green-500';
            } elseif (stripos($badgeColor, '9C27B0') !== false) {
                $badgeColor = 'bg-purple-500';
            } else {
                $badgeColor = 'bg-orange-500';
            }
        }
        
        $packages[] = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'capacity' => $row['capacity'],
            'price' => (float)$row['price'],
            'pricePerDay' => 'Rp ' . number_format($row['price'], 0, ',', '.') . ' / hari',
            'badge' => $row['badge'],
            'badgeColor' => $badgeColor ?: 'bg-orange-500',
            'popular' => (bool)$row['popular'],
            'description' => $row['description'],
            'image' => $row['image_url'],
            'in_stock' => (bool)$row['in_stock'],
            'stockText' => 'Tersedia (' . $row['available_stock'] . ' paket)',
            'items' => $items
        ];
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Packages retrieved successfully',
        'data' => $packages
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'data' => []
    ]);
}
?>