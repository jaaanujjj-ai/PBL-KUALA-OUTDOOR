<?php
// filepath: PBL-KELANA-OUTDOOR/api/admin/equipment.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "localhost";
$db_name = "kuala_outdoor";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // ✅ HELPER FUNCTION: Get equipment images dari tabel equipment_images
    function getEquipmentImages($pdo, $equipment_id) {
        $stmt = $pdo->prepare("
            SELECT image_id, image_url, is_primary, display_order
            FROM equipment_images
            WHERE equipment_id = ?
            ORDER BY is_primary DESC, display_order ASC
        ");
        $stmt->execute([$equipment_id]);
        
        $images = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $images[] = [
                'image_id' => (int)$row['image_id'],
                'image_url' => 'http://localhost/PBL-KELANA-OUTDOOR' . $row['image_url'],
                'is_primary' => (bool)$row['is_primary'],
                'display_order' => (int)$row['display_order']
            ];
        }
        
        return $images;
    }
    
    // ✅ HELPER FUNCTION: Get usage guide steps
    function getUsageGuide($pdo, $equipment_id) {
        $stmt = $pdo->prepare("
            SELECT guide_id, step_number, title, description
            FROM equipment_usage_guides
            WHERE equipment_id = ?
            ORDER BY step_number ASC
        ");
        $stmt->execute([$equipment_id]);
        
        $steps = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $steps[] = [
                'guide_id' => (int)$row['guide_id'],
                'step_number' => (int)$row['step_number'],
                'title' => $row['title'],
                'description' => $row['description']
            ];
        }
        
        return $steps;
    }
    
    // ✅ HELPER FUNCTION: Get rental terms
    function getRentalTerms($pdo, $equipment_id) {
        $stmt = $pdo->prepare("
            SELECT term_id, category, term_text, display_order
            FROM equipment_rental_terms
            WHERE equipment_id = ?
            ORDER BY display_order ASC
        ");
        $stmt->execute([$equipment_id]);
        
        $terms = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $terms[] = [
                'term_id' => (int)$row['term_id'],
                'category' => $row['category'],
                'term_text' => $row['term_text'],
                'display_order' => (int)$row['display_order']
            ];
        }
        
        return $terms;
    }
    
    $method = $_SERVER['REQUEST_METHOD'];
    error_log("Equipment API called with method: " . $method);
    
    switch($method) {
        // ==================== GET METHOD ====================
        case 'GET':
            // ✅ CHECK CODE AVAILABILITY
            if (isset($_GET['check_code'])) {
                $code = $_GET['check_code'];
                $excludeId = isset($_GET['exclude_id']) ? (int)$_GET['exclude_id'] : 0;
                
                if ($excludeId > 0) {
                    $stmt = $pdo->prepare("SELECT COUNT(*) FROM equipment WHERE code = ? AND equipment_id != ?");
                    $stmt->execute([$code, $excludeId]);
                } else {
                    $stmt = $pdo->prepare("SELECT COUNT(*) FROM equipment WHERE code = ?");
                    $stmt->execute([$code]);
                }
                
                $count = $stmt->fetchColumn();
                
                echo json_encode([
                    "exists" => $count > 0,
                    "message" => $count > 0 ? "Kode sudah digunakan" : "Kode tersedia"
                ]);
                break;
            }
            
            $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
            
            if ($id) {
                // ✅ GET SINGLE EQUIPMENT WITH IMAGES
                $stmt = $pdo->prepare("SELECT * FROM equipment WHERE equipment_id = ?");
                $stmt->execute([$id]);
                $equipment = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($equipment) {
                    // Get images dari tabel equipment_images
                    $images = getEquipmentImages($pdo, $equipment['equipment_id']);
                    
                    // Get usage guide steps
                    $usageGuide = getUsageGuide($pdo, $equipment['equipment_id']);
                    
                    // Get rental terms
                    $rentalTerms = getRentalTerms($pdo, $equipment['equipment_id']);
                    
                    $response = [
                        "equipment_id" => (int)$equipment['equipment_id'],
                        "name" => $equipment['name'],
                        "code" => $equipment['code'],
                        "description" => $equipment['description'] ?? '',
                        "category" => $equipment['category'],
                        "size_capacity" => $equipment['size_capacity'] ?? '',
                        "dimensions" => $equipment['dimensions'] ?? '',
                        "weight" => $equipment['weight'] ? (float)$equipment['weight'] : 0,
                        "material" => $equipment['material'] ?? '',
                        "stock_quantity" => (int)$equipment['stock_quantity'],
                        "available_stock" => (int)$equipment['stock_quantity'],
                        "reserved_stock" => 0,
                        "rented_stock" => 0,
                        "price_per_day" => (float)$equipment['price_per_day'],
                        "condition" => $equipment['condition_item'] ?? 'baik',
                        "equipment_type" => $equipment['equipment_type'] ?? 'single',
                        "image_url" => $equipment['image_url'] ?? null,
                        "images" => $images,  // ✅ Array of images
                        "primary_image" => !empty($images) ? $images[0]['image_url'] : ($equipment['image_url'] ?? null),
                        "usage_guide" => $usageGuide,  // ✅ Array of usage guide steps
                        "rental_terms" => $rentalTerms,  // ✅ Array of rental terms
                        "created_at" => $equipment['created_at']
                    ];
                    
                    echo json_encode($response);
                } else {
                    http_response_code(404);
                    echo json_encode(["error" => true, "message" => "Equipment not found"]);
                }
            } else {
                // ✅ GET ALL EQUIPMENT WITH IMAGES
                $stmt = $pdo->query("SELECT * FROM equipment ORDER BY created_at DESC");
                $equipments = [];
                
                while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                    // Get images untuk setiap equipment
                    $images = getEquipmentImages($pdo, $row['equipment_id']);
                    
                    // Get usage guide steps
                    $usageGuide = getUsageGuide($pdo, $row['equipment_id']);
                    
                    // Get rental terms
                    $rentalTerms = getRentalTerms($pdo, $row['equipment_id']);
                    
                    $equipments[] = [
                        "equipment_id" => (int)$row['equipment_id'],
                        "name" => $row['name'],
                        "code" => $row['code'],
                        "description" => $row['description'] ?? '',
                        "category" => $row['category'],
                        "size_capacity" => $row['size_capacity'] ?? '',
                        "dimensions" => $row['dimensions'] ?? '',
                        "weight" => $row['weight'] ? (float)$row['weight'] : 0,
                        "material" => $row['material'] ?? '',
                        "stock_quantity" => (int)$row['stock_quantity'],
                        "available_stock" => (int)$row['stock_quantity'],
                        "reserved_stock" => 0,
                        "rented_stock" => 0,
                        "price_per_day" => (float)$row['price_per_day'],
                        "condition" => $row['condition_item'] ?? 'baik',
                        "equipment_type" => $row['equipment_type'] ?? 'single',
                        "image_url" => $row['image_url'] ?? null,
                        "images" => $images,  // ✅ Array of images
                        "primary_image" => !empty($images) ? $images[0]['image_url'] : ($row['image_url'] ?? null),
                        "usage_guide" => $usageGuide,  // ✅ Array of usage guide steps
                        "rental_terms" => $rentalTerms,  // ✅ Array of rental terms
                        "created_at" => $row['created_at']
                    ];
                }
                
                echo json_encode($equipments);
            }
            break;
            
        // ==================== POST METHOD (CREATE) ====================
        case 'POST':
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            error_log("📥 Received POST data: " . print_r($data, true));
            
            if (!$data) {
                throw new Exception("Invalid JSON data received");
            }
            
            // Validasi
            if (empty($data['name']) || empty($data['code']) || empty($data['category'])) {
                throw new Exception("Name, code, and category are required");
            }
            
            // Cek duplicate code
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM equipment WHERE code = ?");
            $stmt->execute([$data['code']]);
            if ($stmt->fetchColumn() > 0) {
                throw new Exception("Kode equipment '{$data['code']}' sudah digunakan");
            }
            
            // ✅ INSERT EQUIPMENT (image_url bisa null karena pakai equipment_images table)
            $sql = "INSERT INTO equipment (
                name, code, description, category, size_capacity, 
                dimensions, weight, material, stock_quantity, 
                price_per_day, condition_item, equipment_type, image_url, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'single', ?, NOW())";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute([
                $data['name'],
                $data['code'],
                $data['description'] ?? '',
                $data['category'],
                $data['size_capacity'] ?? '',
                $data['dimensions'] ?? '',
                isset($data['weight']) && $data['weight'] !== '' ? (float)$data['weight'] : null,
                $data['material'] ?? '',
                (int)($data['stock_quantity'] ?? 0),
                (float)($data['price_per_day'] ?? 0),
                $data['condition'] ?? 'baik',
                $data['image_url'] ?? null  // Primary image URL (optional)
            ]);
            
            if ($result) {
                $equipment_id = (int)$pdo->lastInsertId();
                
                error_log("✅ Equipment created successfully with ID: " . $equipment_id);
                
                echo json_encode([
                    "success" => true,
                    "message" => "Equipment berhasil ditambahkan",
                    "equipment_id" => $equipment_id
                ]);
            } else {
                throw new Exception("Failed to insert equipment");
            }
            break;
            
        // ==================== PUT METHOD (UPDATE) ====================
        case 'PUT':
            $input = file_get_contents("php://input");
            $data = json_decode($input, true);
            
            error_log("📥 Received PUT data: " . print_r($data, true));
            
            if (!$data || !isset($data['equipment_id'])) {
                throw new Exception("Equipment ID is required for update");
            }
            
            // Validasi
            if (empty($data['name']) || empty($data['code'])) {
                throw new Exception("Name and code are required");
            }
            
            // Cek duplicate code
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM equipment WHERE code = ? AND equipment_id != ?");
            $stmt->execute([$data['code'], $data['equipment_id']]);
            if ($stmt->fetchColumn() > 0) {
                throw new Exception("Kode equipment '{$data['code']}' sudah digunakan");
            }
            
            // ✅ UPDATE EQUIPMENT
            $sql = "UPDATE equipment SET 
                name=?, code=?, description=?, category=?, size_capacity=?, 
                dimensions=?, weight=?, material=?, stock_quantity=?, 
                price_per_day=?, condition_item=?, image_url=?
                WHERE equipment_id=?";
            
            $stmt = $pdo->prepare($sql);
            $result = $stmt->execute([
                $data['name'],
                $data['code'],
                $data['description'] ?? '',
                $data['category'],
                $data['size_capacity'] ?? '',
                $data['dimensions'] ?? '',
                isset($data['weight']) && $data['weight'] !== '' ? (float)$data['weight'] : null,
                $data['material'] ?? '',
                (int)($data['stock_quantity'] ?? 0),
                (float)($data['price_per_day'] ?? 0),
                $data['condition'] ?? 'baik',
                $data['image_url'] ?? null,
                (int)$data['equipment_id']
            ]);
            
            if ($result) {
                error_log("✅ Equipment updated successfully: " . $data['equipment_id']);
                
                echo json_encode([
                    "success" => true,
                    "message" => "Equipment berhasil diupdate"
                ]);
            } else {
                throw new Exception("Failed to update equipment");
            }
            break;
            
        // ==================== DELETE METHOD ====================
        case 'DELETE':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
            
            if (!$id) {
                throw new Exception("Equipment ID is required for deletion");
            }
            
            // ✅ DELETE ALL IMAGES dari equipment_images table
            $stmt = $pdo->prepare("SELECT image_url FROM equipment_images WHERE equipment_id = ?");
            $stmt->execute([$id]);
            $images = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Delete physical files
            foreach ($images as $img) {
                $file_path = __DIR__ . '/../../' . ltrim($img['image_url'], '/');
                if (file_exists($file_path)) {
                    unlink($file_path);
                    error_log("🗑️ Deleted image file: " . $file_path);
                }
            }
            
            // Delete from equipment_images table
            $stmt = $pdo->prepare("DELETE FROM equipment_images WHERE equipment_id = ?");
            $stmt->execute([$id]);
            
            // ✅ DELETE EQUIPMENT
            $stmt = $pdo->prepare("DELETE FROM equipment WHERE equipment_id = ?");
            $result = $stmt->execute([$id]);
            
            if ($result) {
                error_log("✅ Equipment deleted successfully: " . $id);
                
                echo json_encode([
                    "success" => true,
                    "message" => "Equipment dan semua gambarnya berhasil dihapus"
                ]);
            } else {
                throw new Exception("Failed to delete equipment");
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                "error" => true,
                "message" => "Method $method not allowed"
            ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    error_log("❌ Database error: " . $e->getMessage());
    echo json_encode([
        "error" => true,
        "message" => "Database error: " . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(400);
    error_log("❌ General error: " . $e->getMessage());
    echo json_encode([
        "error" => true,
        "message" => $e->getMessage()
    ]);
}
?>