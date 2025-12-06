
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
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
    $conn = new mysqli($host, $username, $password, $db_name);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    $conn->begin_transaction();
    
    // ✅ GET JSON INPUT
    $input = json_decode(file_get_contents('php://input'), true);
    
    $booking_id = isset($input['booking_id']) ? (int)$input['booking_id'] : 0;
    $booking_status = $input['booking_status'] ?? '';
    $payment_status = $input['payment_status'] ?? '';
    $admin_notes = $input['admin_notes'] ?? '';
    $admin_id = $input['admin_id'] ?? ''; // ID admin yang melakukan perubahan
    
    if (!$booking_id) {
        throw new Exception("Booking ID required");
    }
    
    if (!$booking_status && !$payment_status) {
        throw new Exception("At least one status field required");
    }
    
    // ✅ GET CURRENT BOOKING
    $current_sql = "SELECT * FROM package_bookings WHERE booking_id = ?";
    $current_stmt = $conn->prepare($current_sql);
    $current_stmt->bind_param("i", $booking_id);
    $current_stmt->execute();
    $current_result = $current_stmt->get_result();
    
    if ($current_result->num_rows === 0) {
        throw new Exception("Booking not found");
    }
    
    $current = $current_result->fetch_assoc();
    $old_booking_status = $current['booking_status'];
    $old_payment_status = $current['payment_status'];
    
    // ✅ VALIDATE STATUS TRANSITIONS
    $valid_booking_statuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    $valid_payment_statuses = ['pending', 'paid', 'cancelled', 'refunded'];
    
    if ($booking_status && !in_array($booking_status, $valid_booking_statuses)) {
        throw new Exception("Invalid booking status");
    }
    
    if ($payment_status && !in_array($payment_status, $valid_payment_statuses)) {
        throw new Exception("Invalid payment status");
    }
    
    // ✅ BUILD UPDATE QUERY
    $update_fields = [];
    $update_values = [];
    $update_types = '';
    
    if ($booking_status) {
        $update_fields[] = "booking_status = ?";
        $update_values[] = $booking_status;
        $update_types .= 's';
    }
    
    if ($payment_status) {
        $update_fields[] = "payment_status = ?";
        $update_values[] = $payment_status;
        $update_types .= 's';
    }
    
    if ($admin_notes) {
        $update_fields[] = "admin_notes = ?";
        $update_values[] = $admin_notes;
        $update_types .= 's';
    }
    
    // Add confirmed_by and confirmed_at if status is confirmed
    if ($booking_status === 'confirmed') {
        $update_fields[] = "confirmed_by = ?";
        $update_fields[] = "confirmed_at = NOW()";
        $update_values[] = $admin_id;
        $update_types .= 's';
    }
    
    $update_fields[] = "updated_at = NOW()";
    
    $update_sql = "UPDATE package_bookings SET " . implode(", ", $update_fields) . " WHERE booking_id = ?";
    $update_values[] = $booking_id;
    $update_types .= 'i';
    
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param($update_types, ...$update_values);
    
    if (!$update_stmt->execute()) {
        throw new Exception("Failed to update booking: " . $conn->error);
    }
    
    // ✅ HANDLE STOCK WHEN CANCELLED OR COMPLETED
    if ($booking_status === 'cancelled' || $booking_status === 'completed') {
        // Release reserved stock
        $release_sql = "UPDATE equipment_packages 
                        SET package_stock_reserved = GREATEST(0, package_stock_reserved - 1)
                        WHERE package_id = ?";
        
        $release_stmt = $conn->prepare($release_sql);
        $release_stmt->bind_param("i", $current['package_id']);
        $release_stmt->execute();
    }
    
    // ✅ LOG BOOKING HISTORY
    if ($booking_status && $booking_status !== $old_booking_status) {
        $history_sql = "INSERT INTO booking_history 
                        (booking_id, old_status, new_status, changed_by, changed_at, notes)
                        VALUES (?, ?, ?, ?, NOW(), ?)";
        
        $history_stmt = $conn->prepare($history_sql);
        $notes_text = "Booking status changed to: $booking_status";
        if ($admin_notes) {
            $notes_text .= " - " . $admin_notes;
        }
        $history_stmt->bind_param("issss", $booking_id, $old_booking_status, $booking_status, $admin_id, $notes_text);
        $history_stmt->execute();
    }
    
    if ($payment_status && $payment_status !== $old_payment_status) {
        $history_sql = "INSERT INTO booking_history 
                        (booking_id, old_status, new_status, changed_by, changed_at, notes)
                        VALUES (?, ?, ?, ?, NOW(), ?)";
        
        $history_stmt = $conn->prepare($history_sql);
        $notes_text = "Payment status changed to: $payment_status";
        $history_stmt->bind_param("issss", $booking_id, $old_payment_status, $payment_status, $admin_id, $notes_text);
        $history_stmt->execute();
    }
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Booking status updated successfully',
        'data' => [
            'booking_id' => $booking_id,
            'old_status' => [
                'booking' => $old_booking_status,
                'payment' => $old_payment_status
            ],
            'new_status' => [
                'booking' => $booking_status ?: $old_booking_status,
                'payment' => $payment_status ?: $old_payment_status
            ]
        ]
    ]);
    
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();
?>