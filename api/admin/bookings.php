<?php
// filepath: api/admin/bookings.php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

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

    // ✅ QUERY UNTUK GET BOOKINGS
    $query = "SELECT b.* FROM bookings b ORDER BY b.created_at DESC";
    $stmt = $db->prepare($query);
    $stmt->execute();
    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ✅ AMBIL EQUIPMENT NAMES + PACKAGE NAMES TERPISAH
    foreach ($bookings as &$booking) {
        // EQUIPMENT
        $equipmentQuery = "
            SELECT e.name, bi.quantity
            FROM booking_items bi
            JOIN equipment e ON bi.equipment_id = e.equipment_id
            WHERE bi.booking_id = ?
        ";
        $equipmentStmt = $db->prepare($equipmentQuery);
        $equipmentStmt->execute([$booking['booking_id']]);
        $equipmentItems = $equipmentStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $equipmentNames = [];
        foreach ($equipmentItems as $item) {
            $equipmentNames[] = $item['name'] . ' (' . $item['quantity'] . 'x)';
        }
        $booking['equipment_names'] = !empty($equipmentNames) 
            ? implode(', ', $equipmentNames) 
            : '';

        // ✅ PACKAGE
        $packageQuery = "
            SELECT ep.name, bi.quantity
            FROM booking_items bi
            JOIN equipment_packages ep ON bi.package_id = ep.package_id
            WHERE bi.booking_id = ?
        ";
        $packageStmt = $db->prepare($packageQuery);
        $packageStmt->execute([$booking['booking_id']]);
        $packageItems = $packageStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $packageNames = [];
        foreach ($packageItems as $item) {
            $packageNames[] = $item['name'] . ' (' . $item['quantity'] . 'x paket)';
        }
        $booking['package_names'] = !empty($packageNames) 
            ? implode(', ', $packageNames) 
            : '';

        // ✅ GABUNGKAN UNTUK DISPLAY
        $allItems = [];
        if (!empty($booking['equipment_names'])) $allItems[] = $booking['equipment_names'];
        if (!empty($booking['package_names'])) $allItems[] = $booking['package_names'];
        
        $booking['equipment_names'] = !empty($allItems) 
            ? implode(', ', $allItems) 
            : 'Tidak ada item';

        // ✅ GET PACKAGE ITEMS DETAIL
        if (!empty($packageItems)) {
            $packageItemsQuery = "
                SELECT pi.item_name, pi.quantity
                FROM booking_items bi
                JOIN equipment_packages ep ON bi.package_id = ep.package_id
                JOIN package_items pi ON ep.package_id = pi.package_id
                WHERE bi.booking_id = ?
                ORDER BY pi.display_order
            ";
            $itemStmt = $db->prepare($packageItemsQuery);
            $itemStmt->execute([$booking['booking_id']]);
            $booking['package_items'] = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $booking['package_items'] = [];
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $bookings,
        'total' => count($bookings)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>