<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database connection
$host = "localhost";
$db_name = "kuala_outdoor";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode([
        "error" => true,
        "message" => "Database connection failed: " . $e->getMessage()
    ]);
    exit;
}

// Get method
$method = $_SERVER['REQUEST_METHOD'];
$equipment_id = isset($_GET['id']) ? (int)$_GET['id'] : null;

if ($method === 'GET') {
    try {
        if ($equipment_id) {
            // Get single equipment by ID
            $query = "SELECT * FROM equipment WHERE equipment_id = :id";
            $stmt = $pdo->prepare($query);
            $stmt->bindParam(':id', $equipment_id, PDO::PARAM_INT);
            $stmt->execute();
            
            $equipment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($equipment) {
                // Format the data to match frontend expectations
                $formatted_equipment = [
                    "equipment_id" => (int)$equipment['equipment_id'],
                    "name" => $equipment['name'],
                    "code" => $equipment['code'],
                    "description" => $equipment['description'],
                    "category" => $equipment['category'],
                    "size_capacity" => $equipment['size_capacity'],
                    "dimensions" => $equipment['dimensions'],
                    "weight" => $equipment['weight'] ? (float)$equipment['weight'] : 0,
                    "material" => $equipment['material'],
                    "stock_quantity" => (int)$equipment['stock_quantity'],
                    "available_stock" => (int)$equipment['stock_quantity'], // Assuming available = total for now
                    "reserved_stock" => 0,
                    "rented_stock" => 0,
                    "price_per_day" => (float)$equipment['price_per_day'],
                    "condition" => $equipment['condition_item'],
                    "equipment_type" => $equipment['equipment_type'],
                    "image_url" => $equipment['image_url'],
                    "created_at" => $equipment['created_at']
                ];
                
                echo json_encode($formatted_equipment);
            } else {
                echo json_encode([
                    "error" => true,
                    "message" => "Equipment not found"
                ]);
            }
        } else {
            // Get all equipment
            $query = "SELECT * FROM equipment ORDER BY equipment_id ASC";
            $stmt = $pdo->prepare($query);
            $stmt->execute();
            
            $equipment_list = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $equipment_list[] = [
                    "equipment_id" => (int)$row['equipment_id'],
                    "name" => $row['name'],
                    "code" => $row['code'],
                    "description" => $row['description'],
                    "category" => $row['category'],
                    "size_capacity" => $row['size_capacity'],
                    "dimensions" => $row['dimensions'],
                    "weight" => $row['weight'] ? (float)$row['weight'] : 0,
                    "material" => $row['material'],
                    "stock_quantity" => (int)$row['stock_quantity'],
                    "available_stock" => (int)$row['stock_quantity'],
                    "reserved_stock" => 0,
                    "rented_stock" => 0,
                    "price_per_day" => (float)$row['price_per_day'],
                    "condition" => $row['condition_item'],
                    "equipment_type" => $row['equipment_type'],
                    "image_url" => $row['image_url'],
                    "created_at" => $row['created_at']
                ];
            }
            
            echo json_encode($equipment_list);
        }
        
    } catch(PDOException $e) {
        echo json_encode([
            "error" => true,
            "message" => "Query failed: " . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        "error" => true,
        "message" => "Method not allowed"
    ]);
}
?>