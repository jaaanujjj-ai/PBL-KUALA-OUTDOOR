<?php
echo "<h3>🔍 Connection Test - FIXED</h3>";

// ✅ PERBAIKI: Gunakan nama database yang BENAR
$correct_db_name = "kuala_outdoor";  // Bukan "kelana_outdoor"

echo "<br><strong>Testing: $correct_db_name</strong><br>";
try {
    $pdo = new PDO("mysql:host=localhost;dbname=$correct_db_name;charset=utf8", "root", "");
    echo "✅ SUCCESS: Connected to $correct_db_name<br>";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM equipment");
    $count = $stmt->fetch()['count'];
    echo "✅ Equipment count: $count<br>";
    
    // Test sample data
    $stmt = $pdo->query("SELECT equipment_id, name, code FROM equipment LIMIT 3");
    echo "<br><strong>Sample Data:</strong><br>";
    while ($row = $stmt->fetch()) {
        echo "- {$row['equipment_id']}: {$row['name']} ({$row['code']})<br>";
    }
    
} catch (Exception $e) {
    echo "❌ FAILED: " . $e->getMessage() . "<br>";
}
?>