<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'errors' => ['Method not allowed.']]);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    $data = $_POST;
}

$fullName   = trim($data['fullName'] ?? '');
$email      = trim($data['email'] ?? '');
$phone      = trim($data['phone'] ?? '');
$profession = trim($data['profession'] ?? '');
$classTime  = trim($data['classTime'] ?? '');
$level      = trim($data['level'] ?? '');
$message    = trim($data['message'] ?? '');

$errors = [];
if ($fullName === '') {
    $errors[] = 'Full Name is required.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if ($phone === '') {
    $errors[] = 'Phone number is required.';
}
if ($profession === '') {
    $errors[] = 'Profession is required.';
}
if (!in_array($classTime, ['Evening classes', 'Weekend classes'], true)) {
    $errors[] = 'Class time preference is required.';
}
if (!preg_match('/^L[12]/', $level)) {
    $errors[] = 'Level choice is required.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

try {
    $stmt = db()->prepare(
        'INSERT INTO signups (full_name, email, phone, profession, class_time, level, message, submitted_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $fullName, $email, $phone, $profession, $classTime, $level, $message, date('c')
    ]);
    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'errors' => ['Could not save signup.']]);
}