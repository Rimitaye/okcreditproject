<?php
// 1. Force headers at the absolute top
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

// 2. Handle the Preflight (OPTIONS) request IMMEDIATELY
// This is what the browser is complaining about in your error log
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

// 3. Database Connection
$host = 'localhost';
$db   = 'okcredit';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    // If DB fails, we still need a valid header to see the error
    header('Content-Type: application/json');
    die(json_encode(["status" => "error", "message" => "Database Connection Failed"]));
}