<?php
session_start();
if (!isset($_SESSION['USR'])) die();
try {
    $dbh = new PDO('mysql:dbname=ekrupnox_svs1;host=localhost', 'mysql', 'mysql', [
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo $e->getMessage();
    die();
}

$manager = $_SESSION['USR'];
$managerID = (int)$manager['id'];

if (isset($_GET['get_state'])) {
    $phone = $dbh->query("SELECT yahoo FROM svs_users WHERE id = " . $manager['id'])->fetchColumn(0);
    $phone = trim($phone);
    echo $phone;
}

if (isset($_GET['get_info'])) {
    $phone = trim($_GET['get_info']);
    $customer = $dbh->prepare("SELECT * FROM svs_customers WHERE contact_phone1 LIKE ? LIMIT 1");
    $customer->execute(['%'.$phone.'%']);
    $response['customer'] = $customer->fetch();

    $orders = $dbh->prepare("SELECT * FROM svs_orders WHERE order_status != 'canceled' AND manager_id = ?  AND customer_phone LIKE ?  ORDER BY id DESC LIMIT 3");
    $orders->execute([$managerID, '%'.$phone.'%']);
    $response['orders'] = $orders->fetchAll();
    echo json_encode($response);
}

