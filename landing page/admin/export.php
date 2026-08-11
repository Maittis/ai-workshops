<?php
session_start();
require_once __DIR__ . '/../admin/config.php';
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/export.php';

if (empty($_SESSION['admin_logged_in'])) {
    header('Location: index.php');
    exit;
}

$format = $_GET['format'] ?? 'csv';
if (!in_array($format, ['csv', 'xlsx'], true)) {
    $format = 'csv';
}

$rows = db()->query('SELECT * FROM signups ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);

$headers = ['ID', 'Full Name', 'Email', 'Phone Number', 'Profession', 'Class Time', 'Level', 'Message', 'Submitted At'];

$data = [];
foreach ($rows as $r) {
    $data[] = [
        $r['id'],
        $r['full_name'],
        $r['email'],
        $r['phone'],
        $r['profession'],
        $r['class_time'],
        $r['level'],
        $r['message'],
        $r['submitted_at']
    ];
}

$filename = 'signups-' . date('Y-m-d');

if ($format === 'xlsx') {
    download_xlsx($headers, $data, $filename);
}
download_csv($headers, $data, $filename);