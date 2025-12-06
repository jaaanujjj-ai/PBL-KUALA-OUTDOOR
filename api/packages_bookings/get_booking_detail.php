
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
    
    // ✅ GET BOOKING ID
    $booking_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $customer_id = $_GET['customer_id'] ?? '';
    $is_admin = isset($_GET['is_admin']) && $_GET['is_admin'] === 'true';
    
    if (!$booking_id) {
        throw new Exception("Booking ID required");
    }
    
    // ✅ GET BOOKING DETAIL
    $sql = "SELECT 
                b.*,
                p.name as package_name,
                p.capacity,
                p.capacity_text,
                p.description,
                p.package_price,
                p.image_url,
                p.thumbnail_url,
                p.badge_text,
                p.badge_color
            FROM package_bookings b
            INNER JOIN equipment_packages p ON b.package_id = p.package_id
            WHERE b.booking_id = ?";
    
    if (!$is_admin && !empty($customer_id)) {
        $sql .= " AND b.customer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $booking_id, $customer_id);
    } else {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $booking_id);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Booking not found");
    }
    
    $booking = $result->fetch_assoc();
    
    // ✅ GET PACKAGE ITEMS
    $items_sql = "SELECT item_name, quantity 
                  FROM package_items 
                  WHERE package_id = ? 
                  ORDER BY display_order ASC";
    $items_stmt = $conn->prepare($items_sql);
    $items_stmt->bind_param("i", $booking['package_id']);
    $items_stmt->execute();
    $items_result = $items_stmt->get_result();
    
    $items = [];
    while ($item = $items_result->fetch_assoc()) {
        $items[] = [
            'name' => $item['item_name'],
            'quantity' => (int)$item['quantity']
        ];
    }
    
    // ✅ GET BOOKING HISTORY
    $history_sql = "SELECT * FROM booking_history 
                    WHERE booking_id = ? 
                    ORDER BY changed_at DESC";
    $history_stmt = $conn->prepare($history_sql);
    $history_stmt->bind_param("i", $booking_id);
    $history_stmt->execute();
    $history_result = $history_stmt->get_result();
    
    $history = [];
    while ($h = $history_result->fetch_assoc()) {
        $history[] = [
            'old_status' => $h['old_status'],
            'new_status' => $h['new_status'],
            'changed_by' => $h['changed_by'],
            'changed_at' => $h['changed_at'],
            'notes' => $h['notes']
        ];
    }
    
    // ✅ BUILD RESPONSE
    $response = [
        'booking_id' => (int)$booking['booking_id'],
        'customer' => [
            'customer_id' => $booking['customer_id'],
            'name' => $booking['customer_name'],
            'phone' => $booking['customer_phone'],
            'email' => $booking['customer_email']
        ],
        'package' => [
            'package_id' => (int)$booking['package_id'],
            'name' => $booking['package_name'],
            'capacity' => $booking['capacity'],
            'capacity_text' => $booking['capacity_text'],
            'description' => $booking['description'],
            'price_per_day' => (float)$booking['package_price'],
            'image_url' => $booking['image_url'],
            'thumbnail_url' => $booking['thumbnail_url'],
            'badge' => $booking['badge_text'] ? [
                'text' => $booking['badge_text'],
                'color' => $booking['badge_color']
            ] : null,
            'items' => $items
        ],
        'rental_period' => [
            'start_date' => $booking['start_date'],
            'end_date' => $booking['end_date'],
            'total_days' => (int)$booking['total_days']
        ],
        'location' => [
            'pickup' => $booking['pickup_location'],
            'delivery' => $booking['delivery_location']
        ],
        'payment' => [
            'total_price' => (float)$booking['total_price'],
            'status' => $booking['payment_status'],
            'proof' => $booking['payment_proof'],
            'payment_date' => $booking['payment_date']
        ],
        'status' => [
            'booking_status' => $booking['booking_status'],
            'payment_status' => $booking['payment_status']
        ],
        'notes' => $booking['notes'],
        'admin_notes' => $booking['admin_notes'],
        'confirmed_by' => $booking['confirmed_by'],
        'confirmed_at' => $booking['confirmed_at'],
        'created_at' => $booking['created_at'],
        'updated_at' => $booking['updated_at'],
        'history' => $history
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $response
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