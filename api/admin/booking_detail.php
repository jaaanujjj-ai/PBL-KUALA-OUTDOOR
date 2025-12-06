<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    if (!$db) {
        throw new Exception("Database connection failed");
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $booking_id = isset($_GET['booking_id']) ? $_GET['booking_id'] : null;

        if (!$booking_id) {
            throw new Exception("Booking ID tidak tersedia");
        }

        // ✅ QUERY LANGSUNG DARI TABEL BOOKINGS (TANPA JOIN CUSTOMERS)
        $query = "SELECT * FROM bookings WHERE booking_id = :booking_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':booking_id', $booking_id);
        $stmt->execute();
        $booking = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$booking) {
            throw new Exception("Booking tidak ditemukan");
        }

        // Query booking items dengan detail equipment
        $query_items = "SELECT 
                          bi.*,
                          e.name as equipment_name,
                          e.code as equipment_code,
                          e.category,
                          e.price_per_day
                        FROM booking_items bi
                        JOIN equipment e ON bi.equipment_id = e.equipment_id
                        WHERE bi.booking_id = :booking_id";
        
        $stmt_items = $db->prepare($query_items);
        $stmt_items->bindParam(':booking_id', $booking_id);
        $stmt_items->execute();
        $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

        $booking['items'] = $items;

        echo json_encode([
            'success' => true,
            'data' => $booking
        ]);

    } else {
        http_response_code(405);
        echo json_encode([
            "success" => false,
            "message" => "Method not allowed"
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>