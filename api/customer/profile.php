<?php
// filepath: c:\xampp\htdocs\PBL-KELANA-OUTDOOR\api\customer\profile.php

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/php_errors.log');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
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
    
    $method = $_SERVER['REQUEST_METHOD'];
    
    // ✅ GET - AMBIL PROFILE DENGAN JOIN customers & user_profiles
    if ($method === 'GET') {
        $customer_id = $_GET['id'] ?? 0;
        
        error_log("📥 GET Request - Customer ID: " . $customer_id);
        
        if (!$customer_id) {
            error_log("⚠️ Customer ID tidak ditemukan");
            echo json_encode([
                'success' => false,
                'message' => 'Customer ID tidak ditemukan'
            ]);
            exit;
        }
        
        // ✅ QUERY JOIN - GANTI c.username DENGAN c.name
        $stmt = $conn->prepare("
            SELECT 
                c.customer_id,
                c.name as customer_name,
                c.email as customer_email,
                c.phone as customer_phone,
                c.identity_card_number as customer_identity_number,
                up.full_name,
                up.email,
                up.phone,
                up.identity_type,
                up.identity_number,
                up.birth_date,
                up.gender,
                up.address,
                up.profile_picture,
                up.is_complete
            FROM customers c
            LEFT JOIN user_profiles up ON c.customer_id = up.user_id
            WHERE c.customer_id = ?
        ");
        
        if (!$stmt) {
            error_log("❌ Prepare failed: " . $conn->error);
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("i", $customer_id);
        
        if (!$stmt->execute()) {
            error_log("❌ Execute failed: " . $stmt->error);
            throw new Exception("Execute failed: " . $stmt->error);
        }
        
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $data = $result->fetch_assoc();
            
            // ✅ PRIORITAS: user_profiles > customers
            $profile = [
                'customer_id' => $data['customer_id'],
                'name' => $data['customer_name'],
                'email' => $data['email'] ?? $data['customer_email'],
                'full_name' => $data['full_name'] ?? $data['customer_name'] ?? '',
                'phone' => $data['phone'] ?? $data['customer_phone'] ?? '',
                'identity_type' => $data['identity_type'] ?? 'KTP',
                'identity_number' => $data['identity_number'] ?? $data['customer_identity_number'] ?? '',
                'birth_date' => $data['birth_date'] ?? '',
                'gender' => $data['gender'] ?? null,
                'address' => $data['address'] ?? '',
                'profile_picture' => $data['profile_picture'] ?? null,
                'is_complete' => $data['is_complete'] ?? 0
            ];
            
            error_log("✅ Customer found: " . ($profile['full_name'] ?: $profile['name']) . " (ID: " . $customer_id . ")");
            
            echo json_encode([
                'success' => true,
                'data' => $profile
            ]);
        } else {
            error_log("⚠️ Customer not found with ID: " . $customer_id);
            
            echo json_encode([
                'success' => false,
                'message' => 'Customer tidak ditemukan dengan ID: ' . $customer_id
            ]);
        }
        
        $stmt->close();
    }
    
    // ✅ POST - UPDATE/INSERT PROFILE
    elseif ($method === 'POST') {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        
        error_log("📥 UPDATE Request - Data: " . json_encode($data));
        
        if (!$data || !isset($data['customer_id'])) {
            error_log("⚠️ Customer ID tidak ditemukan");
            echo json_encode([
                'success' => false,
                'message' => 'Customer ID tidak ditemukan'
            ]);
            exit;
        }
        
        $customer_id = $data['customer_id'];
        
        // ✅ CEK APAKAH PROFILE SUDAH ADA
        $check_stmt = $conn->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
        $check_stmt->bind_param("i", $customer_id);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        $profile_exists = $check_result->num_rows > 0;
        $check_stmt->close();
        
        if ($profile_exists) {
            // ✅ UPDATE PROFILE
            $updateFields = [];
            $params = [];
            $types = '';
            
            $allowedFields = [
                'full_name' => 's',
                'email' => 's',
                'phone' => 's',
                'identity_type' => 's',
                'identity_number' => 's',
                'birth_date' => 's',
                'gender' => 's',
                'address' => 's',
                'profile_picture' => 's'
            ];
            
            foreach ($allowedFields as $field => $type) {
                if (isset($data[$field])) {
                    $updateFields[] = "$field = ?";
                    $params[] = $data[$field];
                    $types .= $type;
                    error_log("🔄 Updating: $field = " . $data[$field]);
                }
            }
            
            // ✅ CEK APAKAH PROFIL LENGKAP
            $is_complete = (
                !empty($data['full_name']) &&
                !empty($data['phone']) &&
                !empty($data['identity_number']) &&
                !empty($data['birth_date']) &&
                !empty($data['gender']) &&
                !empty($data['address'])
            ) ? 1 : 0;
            
            $updateFields[] = "is_complete = ?";
            $params[] = $is_complete;
            $types .= 'i';
            
            if (empty($updateFields)) {
                echo json_encode(['success' => false, 'message' => 'Tidak ada data']);
                exit;
            }
            
            $sql = "UPDATE user_profiles SET " . implode(', ', $updateFields) . " WHERE user_id = ?";
            $params[] = $customer_id;
            $types .= 'i';
            
            error_log("🔍 SQL: " . $sql);
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . $conn->error);
            }
            
            $stmt->bind_param($types, ...$params);
            
            if ($stmt->execute()) {
                error_log("✅ Profile updated for customer_id: " . $customer_id);
                echo json_encode([
                    'success' => true,
                    'message' => 'Profile berhasil diupdate'
                ]);
            } else {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $stmt->close();
            
        } else {
            // ✅ INSERT PROFILE BARU
            $stmt = $conn->prepare("
                INSERT INTO user_profiles (
                    user_id, email, full_name, phone, 
                    identity_type, identity_number, birth_date, 
                    gender, address, profile_picture, is_complete
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $email = $data['email'] ?? '';
            $full_name = $data['full_name'] ?? '';
            $phone = $data['phone'] ?? '';
            $identity_type = $data['identity_type'] ?? 'KTP';
            $identity_number = $data['identity_number'] ?? '';
            $birth_date = $data['birth_date'] ?? null;
            $gender = $data['gender'] ?? null;
            $address = $data['address'] ?? '';
            $profile_picture = $data['profile_picture'] ?? null;
            
            $is_complete = (
                !empty($full_name) &&
                !empty($phone) &&
                !empty($identity_number) &&
                !empty($birth_date) &&
                !empty($gender) &&
                !empty($address)
            ) ? 1 : 0;
            
            $stmt->bind_param(
                "isssssssssi",
                $customer_id,
                $email,
                $full_name,
                $phone,
                $identity_type,
                $identity_number,
                $birth_date,
                $gender,
                $address,
                $profile_picture,
                $is_complete
            );
            
            if ($stmt->execute()) {
                error_log("✅ Profile created for customer_id: " . $customer_id);
                echo json_encode([
                    'success' => true,
                    'message' => 'Profile berhasil dibuat'
                ]);
            } else {
                throw new Exception("Execute failed: " . $stmt->error);
            }
            
            $stmt->close();
        }
    }
    
    else {
        error_log("⚠️ Method not allowed: " . $method);
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'message' => 'Method not allowed'
        ]);
    }
    
} catch (Exception $e) {
    error_log("❌ Exception: " . $e->getMessage());
    error_log("❌ Stack trace: " . $e->getTraceAsString());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Server error: ' . $e->getMessage()
    ]);
}

$conn->close();
?>