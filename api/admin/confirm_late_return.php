<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
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

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->booking_id) || !isset($data->late_fee)) {
            throw new Exception("Data tidak lengkap");
        }

        // ✅ UPDATE DENGAN KOLOM YANG SUDAH ADA
        $query = "UPDATE bookings 
                  SET status = 'completed',
                      late_fee = :late_fee,
                      late_return_time = :late_minutes,
                      total_actual_cost = total_estimated_cost + :late_fee,
                      updated_at = NOW()
                  WHERE booking_id = :booking_id";
        
        $stmt = $db->prepare($query);
        $stmt->bindParam(':late_fee', $data->late_fee);
        $stmt->bindParam(':late_minutes', $data->late_minutes);
        $stmt->bindParam(':booking_id', $data->booking_id);

        if ($stmt->execute()) {
            // Kembalikan stok equipment
            $query_items = "SELECT equipment_id, quantity 
                           FROM booking_items 
                           WHERE booking_id = :booking_id 
                           AND equipment_id IS NOT NULL";
            
            $stmt_items = $db->prepare($query_items);
            $stmt_items->bindParam(':booking_id', $data->booking_id);
            $stmt_items->execute();
            $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

            foreach ($items as $item) {
                $query_update_stock = "UPDATE equipment 
                                      SET stock_quantity = stock_quantity + :quantity 
                                      WHERE equipment_id = :equipment_id";
                $stmt_stock = $db->prepare($query_update_stock);
                $stmt_stock->bindParam(':quantity', $item['quantity']);
                $stmt_stock->bindParam(':equipment_id', $item['equipment_id']);
                $stmt_stock->execute();
            }

            echo json_encode([
                'success' => true,
                'message' => 'Pengembalian terlambat berhasil dikonfirmasi',
                'late_fee' => $data->late_fee,
                'late_minutes' => $data->late_minutes
            ]);
        } else {
            throw new Exception("Gagal konfirmasi pengembalian");
        }
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