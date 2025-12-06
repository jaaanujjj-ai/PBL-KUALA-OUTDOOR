<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$pdo = $database->getConnection(); // ✅ PDO Connection

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            // Get rental terms for specific equipment
            if (isset($_GET['equipment_id'])) {
                $equipment_id = intval($_GET['equipment_id']);
                
                $stmt = $pdo->prepare("SELECT * FROM equipment_rental_terms 
                                       WHERE equipment_id = ? 
                                       ORDER BY display_order ASC");
                $stmt->execute([$equipment_id]);
                $terms = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'data' => $terms
                ]);
            } else {
                throw new Exception('equipment_id parameter required');
            }
            break;

        case 'POST':
            // Save rental terms for equipment
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['equipment_id']) || !isset($input['terms'])) {
                throw new Exception('equipment_id and terms are required');
            }
            
            $equipment_id = intval($input['equipment_id']);
            $terms = $input['terms'];
            
            // First, delete existing terms for this equipment
            $stmt = $pdo->prepare("DELETE FROM equipment_rental_terms WHERE equipment_id = ?");
            $stmt->execute([$equipment_id]);
            
            // Insert new terms
            if (count($terms) > 0) {
                $stmt = $pdo->prepare("INSERT INTO equipment_rental_terms 
                                       (equipment_id, category, term_text, display_order) 
                                       VALUES (?, ?, ?, ?)");
                
                foreach ($terms as $index => $term) {
                    $category = $term['category'] ?? 'Umum';
                    $term_text = $term['term_text'] ?? '';
                    $display_order = $index; // Use array index for ordering
                    
                    $stmt->execute([$equipment_id, $category, $term_text, $display_order]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Rental terms saved successfully'
            ]);
            break;

        case 'DELETE':
            // Delete all rental terms for equipment
            if (isset($_GET['equipment_id'])) {
                $equipment_id = intval($_GET['equipment_id']);
                
                $stmt = $pdo->prepare("DELETE FROM equipment_rental_terms WHERE equipment_id = ?");
                $stmt->execute([$equipment_id]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Rental terms deleted successfully'
                ]);
            } else {
                throw new Exception('equipment_id parameter required');
            }
            break;

        default:
            throw new Exception('Method not allowed');
    }

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
