
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
    
    // ✅ GET PARAMETERS
    $customer_id = $_GET['customer_id'] ?? '';
    $booking_status = $_GET['booking_status'] ?? 'all';
    $payment_status = $_GET['payment_status'] ?? 'all';
    $search = $_GET['search'] ?? '';
    $start_date_from = $_GET['start_date_from'] ?? '';
    $start_date_to = $_GET['start_date_to'] ?? '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    $is_admin = isset($_GET['is_admin']) && $_GET['is_admin'] === 'true';
    
    // ✅ BUILD QUERY
    $sql = "SELECT 
                b.booking_id,
                b.customer_id,
                b.package_id,
                b.start_date,
                b.end_date,
                b.total_days,
                b.total_price,
                b.payment_status,
                b.booking_status,
                b.pickup_location,
                b.delivery_location,
                b.customer_name,
                b.customer_phone,
                b.customer_email,
                b.notes,
                b.admin_notes,
                b.payment_proof,
                b.payment_date,
                b.confirmed_at,
                b.created_at,
                b.updated_at,
                p.name as package_name,
                p.capacity,
                p.image_url,
                p.thumbnail_url
            FROM package_bookings b
            INNER JOIN equipment_packages p ON b.package_id = p.package_id
            WHERE 1=1";
    
    // Filter by customer (if not admin)
    if (!$is_admin && !empty($customer_id)) {
        $customer_id = $conn->real_escape_string($customer_id);
        $sql .= " AND b.customer_id = '$customer_id'";
    }
    
    // Filter by booking status
    if ($booking_status !== 'all') {
        $booking_status = $conn->real_escape_string($booking_status);
        $sql .= " AND b.booking_status = '$booking_status'";
    }
    
    // Filter by payment status
    if ($payment_status !== 'all') {
        $payment_status = $conn->real_escape_string($payment_status);
        $sql .= " AND b.payment_status = '$payment_status'";
    }
    
    // Search
    if (!empty($search)) {
        $search = $conn->real_escape_string($search);
        $sql .= " AND (b.customer_name LIKE '%$search%' 
                  OR b.customer_phone LIKE '%$search%' 
                  OR p.name LIKE '%$search%')";
    }
    
    // Date range filter
    if (!empty($start_date_from)) {
        $start_date_from = $conn->real_escape_string($start_date_from);
        $sql .= " AND b.start_date >= '$start_date_from'";
    }
    
    if (!empty($start_date_to)) {
        $start_date_to = $conn->real_escape_string($start_date_to);
        $sql .= " AND b.start_date <= '$start_date_to'";
    }
    
    // Order by
    $sql .= " ORDER BY b.created_at DESC LIMIT $limit OFFSET $offset";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Query error: " . $conn->error);
    }
    
    $bookings = [];
    while ($row = $result->fetch_assoc()) {
        $bookings[] = [
            'booking_id' => (int)$row['booking_id'],
            'customer' => [
                'customer_id' => $row['customer_id'],
                'name' => $row['customer_name'],
                'phone' => $row['customer_phone'],
                'email' => $row['customer_email']
            ],
            'package' => [
                'package_id' => (int)$row['package_id'],
                'name' => $row['package_name'],
                'capacity' => $row['capacity'],
                'image_url' => $row['image_url'],
                'thumbnail_url' => $row['thumbnail_url']
            ],
            'rental_period' => [
                'start_date' => $row['start_date'],
                'end_date' => $row['end_date'],
                'total_days' => (int)$row['total_days']
            ],
            'location' => [
                'pickup' => $row['pickup_location'],
                'delivery' => $row['delivery_location']
            ],
            'payment' => [
                'total_price' => (float)$row['total_price'],
                'status' => $row['payment_status'],
                'proof' => $row['payment_proof'],
                'payment_date' => $row['payment_date']
            ],
            'status' => [
                'booking_status' => $row['booking_status'],
                'payment_status' => $row['payment_status']
            ],
            'notes' => $row['notes'],
            'admin_notes' => $row['admin_notes'],
            'confirmed_at' => $row['confirmed_at'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at']
        ];
    }
    
    // ✅ GET TOTAL COUNT
    $count_sql = "SELECT COUNT(*) as total FROM package_bookings b WHERE 1=1";
    
    if (!$is_admin && !empty($customer_id)) {
        $count_sql .= " AND b.customer_id = '" . $conn->real_escape_string($customer_id) . "'";
    }
    
    if ($booking_status !== 'all') {
        $count_sql .= " AND b.booking_status = '" . $conn->real_escape_string($booking_status) . "'";
    }
    
    $count_result = $conn->query($count_sql);
    $total = $count_result->fetch_assoc()['total'];
    
    echo json_encode([
        'success' => true,
        'data' => $bookings,
        'pagination' => [
            'total' => (int)$total,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $total
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