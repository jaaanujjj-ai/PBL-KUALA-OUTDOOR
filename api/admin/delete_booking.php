<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
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

    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->booking_id)) {
            throw new Exception("Booking ID tidak tersedia");
        }

        // Hapus booking_items terlebih dahulu (foreign key constraint)
        $query = "DELETE FROM booking_items WHERE booking_id = :booking_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':booking_id', $data->booking_id);
        $stmt->execute();

        // Hapus booking
        $query = "DELETE FROM bookings WHERE booking_id = :booking_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':booking_id', $data->booking_id);

        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Booking berhasil dihapus'
            ]);
        } else {
            throw new Exception("Gagal menghapus booking");
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