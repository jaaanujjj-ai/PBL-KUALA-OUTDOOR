
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    
    // ✅ GET PACKAGE ID dari URL parameter
    // Bisa dipanggil: get_package.php?id=1 atau get_package.php?package_id=1
    $package_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($package_id === 0 && isset($_GET['package_id'])) {
        $package_id = (int)$_GET['package_id'];
    }
    
    if (!$package_id) {
        throw new Exception("Package ID required. Use: ?id=1 or ?package_id=1");
    }
    
    // ✅ GET PACKAGE DATA
    $sql = "SELECT 
                p.package_id,
                p.name,
                p.capacity,
                p.capacity_text,
                p.description,
                p.package_price,
                p.duration_days,
                p.badge_text,
                p.badge_color,
                p.is_popular,
                p.display_order,
                p.is_active,
                p.total_items,
                p.included_items_count,
                p.package_stock,
                p.package_stock_reserved,
                (p.package_stock - p.package_stock_reserved) as available_stock,
                p.image_url,
                p.thumbnail_url,
                p.terms_conditions,
                p.cancellation_policy,
                p.created_at,
                p.updated_at
            FROM equipment_packages p
            WHERE p.package_id = ?";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $package_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        http_response_code(404);
        throw new Exception("Package not found with ID: $package_id");
    }
    
    $package = $result->fetch_assoc();
    
    // ✅ GET PACKAGE ITEMS
    $items_sql = "SELECT 
                    pi.package_item_id,
                    pi.item_name,
                    pi.quantity,
                    pi.display_order,
                    pi.notes
                  FROM package_items pi
                  WHERE pi.package_id = ?
                  ORDER BY pi.display_order ASC, pi.package_item_id ASC";
    
    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bind_param("i", $package_id);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();
    
    $items = [];
    while ($item = $items_result->fetch_assoc()) {
        $items[] = [
            'item_id' => (int)$item['package_item_id'],
            'name' => $item['item_name'],
            'quantity' => (int)$item['quantity'],
            'notes' => $item['notes']
        ];
    }
    
    // ✅ GET BOOKING STATISTICS (optional)
    $stats_sql = "SELECT 
                    COUNT(*) as total_bookings,
                    COUNT(CASE WHEN booking_status = 'completed' THEN 1 END) as completed_bookings,
                    COUNT(CASE WHEN booking_status IN ('pending', 'confirmed', 'in_progress') THEN 1 END) as active_bookings
                  FROM package_bookings 
                  WHERE package_id = ?";
    
    $stats_stmt = $conn->prepare($stats_sql);
    $stats_stmt->bind_param("i", $package_id);
    $stats_stmt->execute();
    $stats_result = $stats_stmt->get_result();
    $stats = $stats_result->fetch_assoc();
    
    // ✅ BUILD RESPONSE
    $response = [
        'package_id' => (int)$package['package_id'],
        'name' => $package['name'],
        'capacity' => $package['capacity'],
        'capacity_text' => $package['capacity_text'],
        'description' => $package['description'],
        'price' => (float)$package['package_price'],
        'price_formatted' => 'Rp ' . number_format($package['package_price'], 0, ',', '.'),
        'duration_days' => (int)$package['duration_days'],
        'price_per_day' => (float)$package['package_price'] / max((int)$package['duration_days'], 1),
        'badge' => $package['badge_text'] ? [
            'text' => $package['badge_text'],
            'color' => $package['badge_color']
        ] : null,
        'is_popular' => (bool)$package['is_popular'],
        'display_order' => (int)$package['display_order'],
        'is_active' => (bool)$package['is_active'],
        'stock' => [
            'total' => (int)$package['package_stock'],
            'reserved' => (int)$package['package_stock_reserved'],
            'available' => (int)$package['available_stock'],
            'is_available' => (int)$package['available_stock'] > 0
        ],
        'images' => [
            'url' => $package['image_url'],
            'thumbnail' => $package['thumbnail_url']
        ],
        'items' => $items,
        'total_items' => count($items),
        'terms_conditions' => $package['terms_conditions'],
        'cancellation_policy' => $package['cancellation_policy'],
        'statistics' => [
            'total_bookings' => (int)$stats['total_bookings'],
            'completed_bookings' => (int)$stats['completed_bookings'],
            'active_bookings' => (int)$stats['active_bookings']
        ],
        'timestamps' => [
            'created_at' => $package['created_at'],
            'updated_at' => $package['updated_at']
        ]
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $response
    ]);
    
} catch (Exception $e) {
    http_response_code(isset($_SERVER['REDIRECT_STATUS']) ? 500 : 400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?>