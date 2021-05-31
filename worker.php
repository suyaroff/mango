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
//$manager['id'] = 113;



$phone = $dbh->query("SELECT yahoo FROM svs_users WHERE id = " . $manager['id'])->fetchColumn(0);
$phone = trim($phone);
//79150869546
if ($phone) {
    $dateLastMonth = date_create('-30 Days')->format("Y-m-d");
    $managerID = (int)$manager['id'];
    $order = $dbh->query("SELECT * FROM svs_orders WHERE order_status != 'canceled' AND manager_id = $managerID AND created_datetime >= '$dateLastMonth' AND customer_phone LIKE '%$phone%'  ORDER BY id DESC LIMIT 1")->fetch();

    if(!$order) {
        $order = $dbh->query("SELECT * FROM svs_orders WHERE order_status != 'canceled' AND customer_phone LIKE '%$phone%'  ORDER BY id DESC LIMIT 1")->fetch();
    }

    $customer = $dbh->query("SELECT * FROM svs_customers WHERE contact_phone1 LIKE '%$phone%' LIMIT 1")->fetch();
    $response['order'] = $order;
    $response['customer'] = $customer;
    $response['phone'] = $phone;
    $dbh->query("UPDATE svs_users SET yahoo = NULL WHERE id = " . $manager['id']);
    echo json_encode($response);
}
