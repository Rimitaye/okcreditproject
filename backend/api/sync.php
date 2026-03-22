<?php
require_once '../config/db.php';

$input = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? '';
$user_id = $input['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["error" => "User session required"]);
    exit;
}

// 1. PUSH: Client sends offline data to MySQL
if ($action === 'push') {
    $parties = $input['parties'] ?? [];
    $transactions = $input['transactions'] ?? [];

    $pdo->beginTransaction();
    try {
        // Sync Parties (Customers/Suppliers)
        $stmtP = $pdo->prepare("INSERT INTO parties (uuid, user_id, name, phone, type, balance, due_date, deleted) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE name=VALUES(name), balance=VALUES(balance), due_date=VALUES(due_date), deleted=VALUES(deleted)");
        
        foreach ($parties as $p) {
            $stmtP->execute([$p['uuid'], $user_id, $p['name'], $p['phone'], $p['type'], $p['balance'], $p['due_date'], $p['deleted'] ?? 0]);
        }

        // Sync Ledger Transactions
        $stmtT = $pdo->prepare("INSERT INTO transactions (uuid, user_id, party_uuid, type, amount, note, deleted, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE amount=VALUES(amount), note=VALUES(note), deleted=VALUES(deleted)");
        
        foreach ($transactions as $t) {
            $stmtT->execute([$t['uuid'], $user_id, $t['party_uuid'], $t['type'], $t['amount'], $t['note'], $t['deleted'] ?? 0, $t['created_at']]);
        }

        $pdo->commit();
        echo json_encode(["status" => "success"]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(["error" => $e->getMessage()]);
    }
}

// 2. PULL: Client fetches changes from other devices/backups
if ($action === 'pull') {
    $last_sync = $input['last_sync'] ?? '2000-01-01 00:00:00';

    $stmtP = $pdo->prepare("SELECT * FROM parties WHERE user_id = ? AND updated_at > ?");
    $stmtP->execute([$user_id, $last_sync]);
    
    $stmtT = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? AND synced_at > ?");
    $stmtT->execute([$user_id, $last_sync]);

    echo json_encode([
        "parties" => $stmtP->fetchAll(),
        "transactions" => $stmtT->fetchAll(),
        "server_time" => date('Y-m-d H:i:s')
    ]);
}
?>