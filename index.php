<?php

try {
    $dbh = new PDO('mysql:dbname=ekrupnox_svs1;host=localhost', 'ekrupnox_svs1', 'Bloulders20', [
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo $e->getMessage();
    die();
}


if ($_SERVER['REQUEST_URI'] == '/mango/events/call' && isset($_POST['json'])) {
    $data = json_decode($_POST['json']);
    if ($data->location == 'abonent' && ($data->call_state == 'Connected' || $data->call_state == 'Disconnected')) {
        if($data->from->extension AND $data->to->extension) {

        } else {
            $extension = 0;
            if($data->from->extension) {
                $extension = (int)$data->from->extension;
                $customer_number = trim($data->to->number);
            }
            if($data->to->extension) {
                $extension = (int)$data->to->extension;
                $customer_number = trim($data->from->number);
            }
            $manager = $dbh->query("SELECT * FROM  svs_users WHERE fax = '$extension' LIMIT 1")->fetch();
            if ($manager) {
                if($data->call_state == 'Connected') {
                    $query = $dbh->prepare("UPDATE svs_users SET yahoo = ? WHERE id = ?")->execute([$customer_number,  $manager['id']]);
                }

                if($data->call_state == 'Disconnected') {
                    $query = $dbh->prepare("UPDATE svs_users SET yahoo = NULL WHERE id = ?")->execute([$manager['id']]);
                }
            }
        }
    }
    $file = 'data/' . base64_decode($data->entry_id) . '.call';
    $data = date("Y-m-d H:i:s") . "\n" . $_POST['json'] . "\n" . print_r(json_decode($_POST['json']), true);
    //file_put_contents($file, $data, FILE_APPEND);
}
