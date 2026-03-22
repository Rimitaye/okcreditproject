<?php
// 1. Include DB and CORS headers (from your config/db.php)
require_once '../config/db.php';

// 2. Read the JSON data sent by React fetch()
$input = json_decode(file_get_contents('php://input'), true);

// 3. Get the action from the URL (?action=login or ?action=register)
$action = $_GET['action'] ?? '';

// --- REGISTRATION LOGIC ---
if ($action === 'register') {
    $name = $input['name'] ?? '';
    $phone = $input['phone'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($name) || empty($phone) || empty($password)) {
        echo json_encode(["status" => "error", "message" => "All fields are required"]);
        exit;
    }

    // 🛡️ Hash the password for security (Industry Standard)
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("INSERT INTO users (name, phone, password) VALUES (?, ?, ?)");
        $stmt->execute([$name, $phone, $hashedPassword]);
        
        echo json_encode([
            "status" => "success", 
            "message" => "Account created",
            "user_id" => $pdo->lastInsertId(),
            "user_name" => $name
        ]);
    } catch (PDOException $e) {
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Phone number already registered"]);
    }
    exit;
}

// --- LOGIN LOGIC ---
if ($action === 'login') {
    $phone = $input['phone'] ?? '';
    $password = $input['password'] ?? '';

    // 🔍 Find user by phone number using Prepared Statement
    $stmt = $pdo->prepare("SELECT * FROM users WHERE phone = ?");
    $stmt->execute([$phone]);
    $user = $stmt->fetch();

    // 🔑 Verify the password hash
    if ($user && password_verify($password, $user['password'])) {
        // Success: Send flattened keys for easy React access
        echo json_encode([
            "status" => "success",
            "user_id" => $user['id'],
            "user_name" => $user['name'],
            "phone" => $user['phone']
        ]);
    } else {
        // Fail: Unauthorized
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Invalid phone number or password"]);
    }
    exit;
}

// If no valid action is provided
echo json_encode(["status" => "error", "message" => "Invalid API Action"]);
?>