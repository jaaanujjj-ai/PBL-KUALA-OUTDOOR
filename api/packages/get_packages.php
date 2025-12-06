<?php
// filepath: api/packages/get_packages.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    // Check if table exists
    $checkTable = $db->query("SHOW TABLES LIKE 'equipment_packages'");
    if ($checkTable->rowCount() === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Table equipment_packages belum dibuat. Silakan import database_packages.sql terlebih dahulu.',
            'data' => []
        ]);
        exit;
    }
    
    // ✅ PERBAIKI: Gunakan nama kolom yang benar
    $query = "SELECT 
        ep.package_id,
        ep.name as package_name,
        ep.capacity,
        ep.capacity_text,
        ep.description,
        ep.package_price,
        ep.duration_days,
        ep.badge_text,
        ep.badge_color,
        ep.is_popular,
        ep.is_active,
        ep.display_order,
        ep.package_stock,
        ep.package_stock_reserved,
        ep.image_url,
        ep.thumbnail_url,
        COUNT(DISTINCT pi.package_item_id) as total_items
    FROM equipment_packages ep
    LEFT JOIN package_items pi ON ep.package_id = pi.package_id
    GROUP BY ep.package_id
    ORDER BY ep.display_order ASC, ep.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    $packages = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // ✅ Hitung available stock
        $reserved = (int)$row['package_stock_reserved'];
        $total = (int)$row['package_stock'];
        $available = max(0, $total - $reserved);
        
        $packages[] = [
            'package_id' => (int)$row['package_id'],
            'name' => $row['package_name'],
            'capacity' => $row['capacity'],
            'capacity_text' => $row['capacity_text'],
            'description' => $row['description'],
            'price' => (float)$row['package_price'],
            'price_formatted' => 'Rp ' . number_format($row['package_price'], 0, ',', '.'),
            'duration_days' => (int)$row['duration_days'],
            'badge' => $row['badge_text'] ? [
                'text' => $row['badge_text'],
                'color' => $row['badge_color']
            ] : null,
            'is_popular' => (bool)$row['is_popular'],
            'is_active' => (bool)$row['is_active'],
            'display_order' => (int)$row['display_order'],
            'stock' => [
                'total' => $total,
                'reserved' => $reserved,
                'available' => $available,
                'is_available' => $available > 0
            ],
            'images' => [
                'url' => $row['image_url'],
                'thumbnail' => $row['thumbnail_url']
            ],
            'total_items' => (int)$row['total_items']
        ];
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Data paket berhasil diambil',
        'data' => $packages,
        'total' => count($packages)
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