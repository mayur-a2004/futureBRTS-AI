<?php
/**
 * 🛠️ Relational Database Connection (MySQL / MariaDB)
 * This file establishes a secure connection to the central data nexus.
 */
$host = 'localhost';
$db_name = 'Ecommerce_db';
$username = 'root';
$password = '';

try {
    $conn = new PDO("mysql:host=" . $host . ";dbname=" . $db_name, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // echo "✅ DB_SYNC_SUCCESS";
} catch(PDOException $exception) {
    echo "Connection error: " . $exception->getMessage();
}
?>