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
    
    // ✅ GET CUSTOMER ID
    $customer_id = $_GET['customer_id'] ?? '';
    
    if (!$customer_id) {
        throw new Exception("Customer ID required");
    }
    
    // ✅ GET CART ITEMS
    $sql = "SELECT 
                c.cart_id,
                c.package_id,
                c.start_date,
                c.end_date,
                c.total_days,
                c.quantity,
                c.total_price,
                c.notes,
                c.created_at,
                p.name as package_name,
                p.capacity,
                p.capacity_text,
                p.description,
                p.package_price,
                p.image_url,
                p.thumbnail_url,
                p.badge_text,
                p.badge_color,
                p.package_stock,
                p.package_stock_reserved,
                (p.package_stock - p.package_stock_reserved) as available_stock
            FROM package_cart c
            INNER JOIN equipment_packages p ON c.package_id = p.package_id
            WHERE c.customer_id = ?
            ORDER BY c.created_at DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $customer_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $cart_items = [];
    $grand_total = 0;
    
    while ($row = $result->fetch_assoc()) {
        // ✅ GET PACKAGE ITEMS
        $items_sql = "SELECT item_name, quantity 
                      FROM package_items 
                      WHERE package_id = ? 
                      ORDER BY display_order ASC";
        $items_stmt = $conn->prepare($items_sql);
        $items_stmt->bind_param("i", $row['package_id']);
        $items_stmt->execute();
        $items_result = $items_stmt->get_result();
        
        $items = [];
        while ($item = $items_result->fetch_assoc()) {
            $items[] = [
                'name' => $item['item_name'],
                'quantity' => (int)$item['quantity']
            ];
        }
        
        // ✅ CHECK IF STILL AVAILABLE
        $is_available = (int)$row['available_stock'] >= (int)$row['quantity'];
        
        $cart_item = [
            'cart_id' => (int)$row['cart_id'],
            'package' => [
                'package_id' => (int)$row['package_id'],
                'name' => $row['package_name'],
                'capacity' => $row['capacity'],
                'capacity_text' => $row['capacity_text'],
                'description' => $row['description'],
                'price_per_day' => (float)$row['package_price'],
                'image_url' => $row['image_url'],
                'thumbnail_url' => $row['thumbnail_url'],
                'badge' => $row['badge_text'] ? [
                    'text' => $row['badge_text'],
                    'color' => $row['badge_color']
                ] : null,
                'items' => $items,
                'available_stock' => (int)$row['available_stock']
            ],
            'rental_details' => [
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'total_days' => (int)$row['total_days'],
                'quantity' => (int)$row['quantity']
            ],
            'pricing' => [
                'price_per_day' => (float)$row['package_price'],
                'total_days' => (int)$row['total_days'],
                'quantity' => (int)$row['quantity'],
                'subtotal' => (float)$row['total_price'],
                'total' => (float)$row['total_price']
            ],
            'notes' => $row['notes'],
            'is_available' => $is_available,
            'created_at' => $row['created_at']
        ];
        
        $cart_items[] = $cart_item;
        $grand_total += (float)$row['total_price'];
    }
    
    echo json_encode([
        'success' => true,
        'data' => [
            'items' => $cart_items,
            'summary' => [
                'total_items' => count($cart_items),
                'grand_total' => $grand_total
            ]
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>