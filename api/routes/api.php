<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET");

try {
    $pdo = new PDO("mysql:host=localhost;dbname=kuala_outdoor", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $pdo->query("SELECT * FROM equipment ORDER BY equipment_id ASC");
    $equipment = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $equipment[] = [
            "equipment_id" => (int)$row['equipment_id'],
            "name" => $row['name'],
            "code" => $row['code'],
            "description" => $row['description'],
            "category" => $row['category'],
            "size_capacity" => $row['size_capacity'],
            "dimensions" => $row['dimensions'],
            "weight" => (float)$row['weight'],
            "material" => $row['material'],
            "stock_quantity" => (int)$row['stock_quantity'],
            "available_stock" => (int)$row['stock_quantity'],
            "reserved_stock" => 0,
            "rented_stock" => 0,
            "price_per_day" => (int)$row['price_per_day'],
            "condition" => $row['condition_item'],
            "equipment_type" => $row['equipment_type'],
            "image_url" => $row['image_url'],
            "created_at" => $row['created_at']
        ];
    }
    
    echo json_encode($equipment);
    
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>