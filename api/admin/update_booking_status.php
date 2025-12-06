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

        if (!isset($data->booking_id) || !isset($data->status)) {
            throw new Exception("Data tidak lengkap");
        }

        // ✅ Jika status = 'completed', kembalikan stok equipment DULU sebelum update status
        if ($data->status === 'completed') {
            $query_items = "SELECT equipment_id, quantity FROM booking_items WHERE booking_id = :booking_id";
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
                
                if (!$stmt_stock->execute()) {
                    throw new Exception("Gagal mengembalikan stok equipment ID: " . $item['equipment_id']);
                }
            }
        }

        // Update status booking
        $query = "UPDATE bookings SET status = :status WHERE booking_id = :booking_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':status', $data->status);
        $stmt->bindParam(':booking_id', $data->booking_id);

        if ($stmt->execute()) {
            // ✅ Jika status = 'active', kurangi stok equipment
            if ($data->status === 'active') {
                $query_items = "SELECT equipment_id, quantity FROM booking_items WHERE booking_id = :booking_id";
                $stmt_items = $db->prepare($query_items);
                $stmt_items->bindParam(':booking_id', $data->booking_id);
                $stmt_items->execute();
                $items = $stmt_items->fetchAll(PDO::FETCH_ASSOC);

                foreach ($items as $item) {
                    $query_update_stock = "UPDATE equipment 
                                          SET stock_quantity = stock_quantity - :quantity 
                                          WHERE equipment_id = :equipment_id";
                    $stmt_stock = $db->prepare($query_update_stock);
                    $stmt_stock->bindParam(':quantity', $item['quantity']);
                    $stmt_stock->bindParam(':equipment_id', $item['equipment_id']);
                    
                    if (!$stmt_stock->execute()) {
                        throw new Exception("Gagal mengurangi stok equipment ID: " . $item['equipment_id']);
                    }
                }
            }

            echo json_encode([
                'success' => true,
                'message' => 'Status booking berhasil diupdate',
                'status' => $data->status
            ]);
        } else {
            throw new Exception("Gagal update status booking");
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