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
            // Get usage guide for specific equipment
            if (isset($_GET['equipment_id'])) {
                $equipment_id = intval($_GET['equipment_id']);
                
                $stmt = $pdo->prepare("SELECT * FROM equipment_usage_guides 
                                       WHERE equipment_id = ? 
                                       ORDER BY step_number ASC");
                $stmt->execute([$equipment_id]);
                $steps = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode([
                    'success' => true,
                    'data' => $steps
                ]);
            } else {
                throw new Exception('equipment_id parameter required');
            }
            break;

        case 'POST':
            // Save usage guide steps for equipment
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['equipment_id']) || !isset($input['steps'])) {
                throw new Exception('equipment_id and steps are required');
            }
            
            $equipment_id = intval($input['equipment_id']);
            $steps = $input['steps'];
            
            // First, delete existing steps for this equipment
            $stmt = $pdo->prepare("DELETE FROM equipment_usage_guides WHERE equipment_id = ?");
            $stmt->execute([$equipment_id]);
            
            // Insert new steps
            if (count($steps) > 0) {
                $stmt = $pdo->prepare("INSERT INTO equipment_usage_guides 
                                       (equipment_id, step_number, title, description) 
                                       VALUES (?, ?, ?, ?)");
                
                foreach ($steps as $index => $step) {
                    $step_number = $index + 1; // Ensure sequential numbering
                    $title = $step['title'] ?? '';
                    $description = $step['description'] ?? '';
                    
                    $stmt->execute([$equipment_id, $step_number, $title, $description]);
                }
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Usage guide steps saved successfully'
            ]);
            break;

        case 'DELETE':
            // Delete all usage guide steps for equipment
            if (isset($_GET['equipment_id'])) {
                $equipment_id = intval($_GET['equipment_id']);
                
                $stmt = $pdo->prepare("DELETE FROM equipment_usage_guides WHERE equipment_id = ?");
                $stmt->execute([$equipment_id]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Usage guide steps deleted successfully'
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
