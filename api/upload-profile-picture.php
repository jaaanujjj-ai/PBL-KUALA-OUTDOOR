<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

try {
    if (!isset($_FILES['file'])) {
        throw new Exception('No file uploaded');
    }
    
    $file = $_FILES['file'];
    $user_id = $_POST['user_id'] ?? 0;
    
    if (!$user_id) {
        throw new Exception('User ID required');
    }
    
    // Validate
    $allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mime, $allowed)) {
        throw new Exception('Invalid file type');
    }
    
    if ($file['size'] > 5 * 1024 * 1024) {
        throw new Exception('File too large (max 5MB)');
    }
    
    // Create folder
    $upload_dir = __DIR__ . '/../upload/profiles/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // Save
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = $user_id . '_' . time() . '.' . $ext;
    $filepath = $upload_dir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $url = 'http://localhost/PBL-KELANA-OUTDOOR/upload/profiles/' . $filename;
        echo json_encode(['success' => true, 'url' => $url]);
    } else {
        throw new Exception('Failed to save file');
    }
    
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>