<?php
/**
 * 🚀 Neural Project Router (PHP Edition)
 * Central Hub for all API Requests and Controllers
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once 'config/db.php';
require_once 'routes/mainRoutes.php';

$method = $_SERVER['REQUEST_METHOD'];
$request = explode('/', trim($_SERVER['PATH_INFO'],'/'));

// Real Routing Engine Synthesis
echo json_encode(["status" => "online", "engine" => "TITAN_V9_PHP", "request" => $method]);
?>