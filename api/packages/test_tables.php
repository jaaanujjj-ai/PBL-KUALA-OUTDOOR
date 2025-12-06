<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
    // Check if tables exist
    $tables = ['equipment_packages', 'package_items'];
    $existingTables = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
        if ($stmt->rowCount() > 0) {
            $existingTables[] = $table;
        }
    }
    
    echo json_encode([
        'success' => true,
        'existing_tables' => $existingTables,
        'message' => count($existingTables) === count($tables) ? 'All tables exist' : 'Some tables missing'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
