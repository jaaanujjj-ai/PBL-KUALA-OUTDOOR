
<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
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
    $customer_id = $input['customer_id'] ?? '';
    $cancellation_reason = $input['cancellation_reason'] ?? '';
    $is_admin = isset($input['is_admin']) && $input['is_admin'] === true;
    
    if (!$booking_id) {
        throw new Exception("Booking ID required");
    }
    
    // ✅ GET BOOKING DETAILS
    $sql = "SELECT * FROM package_bookings WHERE booking_id = ?";
    
    if (!$is_admin && !empty($customer_id)) {
        $sql .= " AND customer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $booking_id, $customer_id);
    } else {
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $booking_id);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception("Booking not found or access denied");
    }
    
    $booking = $result->fetch_assoc();
    
    // ✅ CHECK IF ALREADY CANCELLED
    if ($booking['booking_status'] === 'cancelled') {
        throw new Exception("Booking is already cancelled");
    }
    
    // ✅ CHECK IF COMPLETED
    if ($booking['booking_status'] === 'completed') {
        throw new Exception("Cannot cancel a completed booking");
    }
    
    // ✅ CHECK CANCELLATION POLICY
    $start_date = new DateTime($booking['start_date']);
    $now = new DateTime();
    $days_until_start = $now->diff($start_date)->days;
    
    // Example policy: Can cancel if more than 3 days before start
    $min_days_before = 3;
    $can_cancel_freely = $days_until_start >= $min_days_before;
    
    $refund_percentage = 100;
    $cancellation_fee = 0;
    
    if (!$can_cancel_freely && !$is_admin) {
        // Apply cancellation fee
        if ($days_until_start >= 2) {
            $refund_percentage = 50;
        } elseif ($days_until_start >= 1) {
            $refund_percentage = 25;
        } else {
            $refund_percentage = 0;
        }
    }
    
    $refund_amount = ($booking['total_price'] * $refund_percentage) / 100;
    $cancellation_fee = $booking['total_price'] - $refund_amount;
    
    // ✅ UPDATE BOOKING STATUS
    $old_status = $booking['booking_status'];
    
    $update_sql = "UPDATE package_bookings 
                   SET booking_status = 'cancelled',
                       payment_status = ?,
                       admin_notes = CONCAT(IFNULL(admin_notes, ''), '\n', 'Cancellation: ', ?),
                       updated_at = NOW()
                   WHERE booking_id = ?";
    
    $new_payment_status = ($booking['payment_status'] === 'paid' && $refund_amount > 0) ? 'refunded' : 'cancelled';
    $cancellation_note = $cancellation_reason 
        ? $cancellation_reason . " | Refund: Rp " . number_format($refund_amount, 0, ',', '.')
        : "Cancelled | Refund: Rp " . number_format($refund_amount, 0, ',', '.');
    
    $update_stmt = $conn->prepare($update_sql);
    $update_stmt->bind_param("ssi", $new_payment_status, $cancellation_note, $booking_id);
    
    if (!$update_stmt->execute()) {
        throw new Exception("Failed to cancel booking: " . $conn->error);
    }
    
    // ✅ RELEASE RESERVED STOCK
    $release_sql = "UPDATE equipment_packages 
                    SET package_stock_reserved = GREATEST(0, package_stock_reserved - 1)
                    WHERE package_id = ?";
    
    $release_stmt = $conn->prepare($release_sql);
    $release_stmt->bind_param("i", $booking['package_id']);
    
    if (!$release_stmt->execute()) {
        throw new Exception("Failed to release stock: " . $conn->error);
    }
    
    // ✅ LOG BOOKING HISTORY
    $history_sql = "INSERT INTO booking_history 
                    (booking_id, old_status, new_status, changed_by, changed_at, notes)
                    VALUES (?, ?, 'cancelled', ?, NOW(), ?)";
    
    $changed_by = $is_admin ? 'admin' : $customer_id;
    $history_note = "Booking cancelled. Refund: Rp " . number_format($refund_amount, 0, ',', '.') . 
                    " (" . $refund_percentage . "%) | Fee: Rp " . number_format($cancellation_fee, 0, ',', '.');
    
    $history_stmt = $conn->prepare($history_sql);
    $history_stmt->bind_param("isss", $booking_id, $old_status, $changed_by, $history_note);
    $history_stmt->execute();
    
    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Booking cancelled successfully',
        'data' => [
            'booking_id' => $booking_id,
            'old_status' => $old_status,
            'new_status' => 'cancelled',
            'refund' => [
                'percentage' => $refund_percentage,
                'amount' => $refund_amount,
                'cancellation_fee' => $cancellation_fee,
                'can_cancel_freely' => $can_cancel_freely,
                'days_until_start' => $days_until_start
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