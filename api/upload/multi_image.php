<?php
// filepath: PBL-KELANA-OUTDOOR/api/upload/multi_image.php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// ✅ DATABASE CONNECTION (INI YANG KURANG!)
$host = "localhost";
$db_name = "kuala_outdoor";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => true,
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit();
}

// ==================== POST METHOD (UPLOAD & SAVE TO DB) ====================
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // ✅ VALIDASI EQUIPMENT_ID (BUKAN equipment_code!)
        if (!isset($_POST['equipment_id']) || empty($_POST['equipment_id'])) {
            throw new Exception('Equipment ID is required');
        }

        if (!isset($_FILES['images']) || empty($_FILES['images']['name'])) {
            throw new Exception('No image files uploaded');
        }

        $equipmentId = (int)$_POST['equipment_id'];
        
        // ✅ VALIDASI: Cek apakah equipment_id valid
        $stmt = $pdo->prepare("SELECT code FROM equipment WHERE equipment_id = ?");
        $stmt->execute([$equipmentId]);
        $equipment = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$equipment) {
            throw new Exception("Equipment ID $equipmentId not found");
        }
        
        $equipmentCode = preg_replace('/[^a-zA-Z0-9_-]/', '', $equipment['code']);

        // Create upload directory
        $uploadDir = __DIR__ . '/../../uploads/equipment/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        if (!is_writable($uploadDir)) {
            throw new Exception('Upload directory is not writable');
        }

        $uploadedImages = [];
        $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $maxFileSize = 5 * 1024 * 1024; // 5MB

        // ✅ GET CURRENT MAX DISPLAY_ORDER
        $stmt = $pdo->prepare("SELECT COALESCE(MAX(display_order), 0) as max_order FROM equipment_images WHERE equipment_id = ?");
        $stmt->execute([$equipmentId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $currentMaxOrder = $result['max_order'];

        // ✅ CEK APAKAH SUDAH ADA PRIMARY IMAGE
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM equipment_images WHERE equipment_id = ? AND is_primary = 1");
        $stmt->execute([$equipmentId]);
        $hasPrimary = $stmt->fetchColumn() > 0;

        // Handle multiple files
        $filesCount = is_array($_FILES['images']['name']) ? count($_FILES['images']['name']) : 1;

        for ($i = 0; $i < $filesCount; $i++) {
            // Get file info
            if (is_array($_FILES['images']['name'])) {
                $fileName = $_FILES['images']['name'][$i];
                $fileTmp = $_FILES['images']['tmp_name'][$i];
                $fileSize = $_FILES['images']['size'][$i];
                $fileType = $_FILES['images']['type'][$i];
                $fileError = $_FILES['images']['error'][$i];
            } else {
                $fileName = $_FILES['images']['name'];
                $fileTmp = $_FILES['images']['tmp_name'];
                $fileSize = $_FILES['images']['size'];
                $fileType = $_FILES['images']['type'];
                $fileError = $_FILES['images']['error'];
            }

            if ($fileError !== UPLOAD_ERR_OK) {
                throw new Exception("Upload error for '$fileName': Error code $fileError");
            }

            if ($fileSize > $maxFileSize) {
                throw new Exception("File '$fileName' exceeds 5MB");
            }

            $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

            if (!in_array($fileExtension, $allowedExtensions)) {
                throw new Exception("Invalid extension for '$fileName'");
            }

            if (!in_array(strtolower($fileType), $allowedTypes)) {
                throw new Exception("Invalid MIME type for '$fileName'");
            }

            // Security check
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $fileTmp);
            finfo_close($finfo);

            if (!in_array(strtolower($mimeType), $allowedTypes)) {
                throw new Exception("File '$fileName' failed MIME verification");
            }

            // Generate unique filename
            $timestamp = time();
            $uniqueId = uniqid();
            $newFilename = strtolower($equipmentCode) . "_" . $timestamp . "_" . ($i + 1) . "_" . $uniqueId . "." . $fileExtension;
            $targetPath = $uploadDir . $newFilename;

            // Move uploaded file
            if (move_uploaded_file($fileTmp, $targetPath)) {
                chmod($targetPath, 0644);
                
                $imageUrl = '/uploads/equipment/' . $newFilename;
                
                // ✅✅✅ INI YANG PENTING: SIMPAN KE DATABASE! ✅✅✅
                $isPrimary = !$hasPrimary && $i === 0; // First image jadi primary jika belum ada
                $displayOrder = $currentMaxOrder + $i + 1;
                
                $stmt = $pdo->prepare("
                    INSERT INTO equipment_images 
                    (equipment_id, image_url, is_primary, display_order, created_at) 
                    VALUES (?, ?, ?, ?, NOW())
                ");
                
                $stmt->execute([
                    $equipmentId,
                    $imageUrl,
                    $isPrimary ? 1 : 0,
                    $displayOrder
                ]);
                
                $imageId = (int)$pdo->lastInsertId();
                
                $uploadedImages[] = [
                    'image_id' => $imageId,
                    'filename' => $newFilename,
                    'image_url' => $imageUrl,
                    'full_url' => 'http://localhost/PBL-KELANA-OUTDOOR' . $imageUrl,
                    'is_primary' => $isPrimary,
                    'display_order' => $displayOrder,
                    'size' => $fileSize,
                    'type' => $fileType
                ];
                
                error_log("✅ Image uploaded & saved to DB: $newFilename (ID: $imageId)");
                
                if ($isPrimary) {
                    $hasPrimary = true;
                }
            } else {
                throw new Exception("Failed to move '$fileName'");
            }
        }

        echo json_encode([
            'success' => true,
            'message' => count($uploadedImages) . ' image(s) uploaded successfully',
            'images' => $uploadedImages
        ]);

    } catch (Exception $e) {
        http_response_code(400);
        error_log("❌ Upload error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'error' => true,
            'message' => $e->getMessage()
        ]);
    }
    exit();
}

// ==================== DELETE METHOD ====================
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $input = file_get_contents("php://input");
        $data = json_decode($input, true);
        
        if (!isset($data['image_id'])) {
            throw new Exception('Image ID is required');
        }
        
        $imageId = (int)$data['image_id'];
        
        // Get image info
        $stmt = $pdo->prepare("SELECT equipment_id, image_url, is_primary FROM equipment_images WHERE image_id = ?");
        $stmt->execute([$imageId]);
        $image = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$image) {
            throw new Exception('Image not found');
        }
        
        $equipmentId = $image['equipment_id'];
        $isPrimary = $image['is_primary'];
        
        // Delete physical file
        $filePath = __DIR__ . '/../../' . ltrim($image['image_url'], '/');
        if (file_exists($filePath)) {
            unlink($filePath);
            error_log("🗑️ Deleted file: $filePath");
        }
        
        // Delete from database
        $stmt = $pdo->prepare("DELETE FROM equipment_images WHERE image_id = ?");
        $stmt->execute([$imageId]);
        
        // ✅ Jika primary image dihapus, set image pertama yang tersisa jadi primary
        if ($isPrimary) {
            $stmt = $pdo->prepare("
                SELECT image_id FROM equipment_images 
                WHERE equipment_id = ? 
                ORDER BY display_order ASC 
                LIMIT 1
            ");
            $stmt->execute([$equipmentId]);
            $nextImage = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($nextImage) {
                $stmt = $pdo->prepare("UPDATE equipment_images SET is_primary = 1 WHERE image_id = ?");
                $stmt->execute([$nextImage['image_id']]);
                error_log("✅ Set new primary image: " . $nextImage['image_id']);
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Image deleted successfully'
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        error_log("❌ Delete error: " . $e->getMessage());
        echo json_encode([
            'success' => false,
            'error' => true,
            'message' => $e->getMessage()
        ]);
    }
    exit();
}

// Method not allowed
http_response_code(405);
echo json_encode([
    'success' => false,
    'message' => 'Method not allowed'
]);
?>