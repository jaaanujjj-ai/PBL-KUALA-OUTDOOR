<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

include_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    http_response_code(405);
    echo json_encode(array("message" => "Method not allowed"));
    exit();
}

$database = new Database();
$db = $database->getConnection();

$data = json_decode(file_get_contents("php://input"));

try {
    $db->beginTransaction();
    
    // 1. Insert/Update customer
    $customer_query = "INSERT INTO customers (name, phone, email, identity_card_number, emergency_contact) 
                       VALUES (?, ?, ?, ?, ?) 
                       ON DUPLICATE KEY UPDATE 
                       name = VALUES(name), 
                       email = VALUES(email),
                       identity_card_number = VALUES(identity_card_number),
                       emergency_contact = VALUES(emergency_contact)";
    
    $customer_stmt = $db->prepare($customer_query);
    $customer_stmt->execute([
        $data->customerInfo->name,
        $data->customerInfo->phone,
        $data->customerInfo->email ?? '',
        $data->customerInfo->identityCard ?? '',
        $data->customerInfo->emergencyContact ?? ''
    ]);
    
    // Get customer_id
    $customer_id_query = "SELECT customer_id FROM customers WHERE phone = ?";
    $customer_id_stmt = $db->prepare($customer_id_query);
    $customer_id_stmt->execute([$data->customerInfo->phone]);
    $customer = $customer_id_stmt->fetch(PDO::FETCH_ASSOC);
    $customer_id = $customer['customer_id'];
    
    // 2. Generate booking code
    $booking_code = 'KO-' . date('Y') . '-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
    
    // 3. Calculate duration and cost
    $start_date = $data->rentalDates->startDate;
    $end_date = $data->rentalDates->endDate;
    $duration = (strtotime($end_date) - strtotime($start_date)) / (60*60*24);
    
    $total_cost = 0;
    $equipment_names = [];
    
    // Calculate total cost from selected items
    if (isset($data->selectedItems)) {
        foreach($data->selectedItems as $item) {
            $total_cost += $item->price * $duration;
            $equipment_names[] = $item->name;
        }
    }
    
    $equipment_name_string = implode(', ', $equipment_names);
    
    // 4. Insert booking
    $booking_query = "INSERT INTO bookings (
        booking_code, 
        customer_id, 
        start_date, 
        end_date, 
        estimated_duration, 
        total_estimated_cost,
        status,
        payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', 'unpaid')";
    
    $booking_stmt = $db->prepare($booking_query);
    $booking_stmt->execute([
        $booking_code,
        $customer_id,
        $start_date,
        $end_date,
        $duration,
        $total_cost
    ]);
    
    $booking_id = $db->lastInsertId();
    
    $db->commit();
    
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Booking berhasil dibuat!",
        "booking_code" => $booking_code,
        "booking_id" => $booking_id
    ]);
    
} catch (Exception $e) {
    $db->rollback();
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Gagal membuat booking: " . $e->getMessage()
    ]);
}
?>