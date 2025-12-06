
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host = "localhost";
$db_name = "kuala_outdoor";
$username = "root";
$password = "";

try {
    if (!isset($_FILES['file']) || !isset($_POST['booking_id']) || !isset($_POST['customer_id'])) {
        throw new Exception('File, booking_id, and customer_id required');
    }
    
    $file = $_FILES['file'];
    $booking_id = (int)$_POST['booking_id'];
    $customer_id = $_POST['customer_id'];
    
    $conn = new mysqli($host, $username, $password, $db_name);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    
    // ✅ VERIFY BOOKING OWNERSHIP
    $verify_sql = "SELECT booking_id FROM package_bookings 
                   WHERE booking_id = ? AND customer_id = ?";
    $verify_stmt = $conn->prepare($verify_sql);
    $verify_stmt->bind_param("is", $booking_id, $customer_id);
    $verify_stmt->execute();
    $verify_result = $verify_stmt->get_result();
    
    if ($verify_result->num_rows === 0) {
        throw new Exception('Booking not found or access denied');
    }
    
    // ✅ VALIDATE FILE
    $allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);
    
    if (!in_array($mime, $allowed)) {
        throw new Exception('Invalid file type. Allowed: JPG, PNG, GIF, PDF');
    }
    
    if ($file['size'] > 10 * 1024 * 1024) {
        throw new Exception('File too large (max 10MB)');
    }
    
    // ✅ CREATE UPLOAD DIRECTORY
    $upload_dir = __DIR__ . '/../../upload/payment_proofs/';
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0755, true);
    }
    
    // ✅ GENERATE FILENAME
    $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'payment_' . $booking_id . '_' . time() . '.' . $ext;
    $filepath = $upload_dir . $filename;
    
    // ✅ MOVE FILE
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        $url = 'http://localhost/PBL-KELANA-OUTDOOR/upload/payment_proofs/' . $filename;
        
        // ✅ UPDATE BOOKING
        $update_sql = "UPDATE package_bookings 
                       SET payment_proof = ?,
                           payment_date = NOW(),
                           payment_status = 'paid',
                           updated_at = NOW()
                       WHERE booking_id = ? AND customer_id = ?";
        
        $update_stmt = $conn->prepare($update_sql);
        $update_stmt->bind_param("sis", $url, $booking_id, $customer_id);
        
        if (!$update_stmt->execute()) {
            throw new Exception('Failed to update booking');
        }
        
        // ✅ LOG HISTORY
        $history_sql = "INSERT INTO booking_history 
                        (booking_id, old_status, new_status, changed_by, changed_at, notes)
                        VALUES (?, 'pending', 'paid', ?, NOW(), 'Payment proof uploaded')";
        
        $history_stmt = $conn->prepare($history_sql);
        $history_stmt->bind_param("is", $booking_id, $customer_id);
        $history_stmt->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Payment proof uploaded successfully',
            'data' => [
                'booking_id' => $booking_id,
                'payment_proof' => $url,
                'filename' => $filename
            ]
        ]);
    } else {
        throw new Exception('Failed to upload file');
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

if (isset($conn)) {
    $conn->close();
}
?>