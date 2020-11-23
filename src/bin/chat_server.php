<?php

use \Ratchet\Server\IoServer;
use \Ratchet\Http\HttpServer;
use \Ratchet\WebSocket\WsServer;
use \Ht7\ChatBase\App;

require dirname(__DIR__) . '../../vendor/autoload.php';

$server = IoServer::factory(
                new HttpServer(
                        new WsServer(
                                new App\Chat()
                        )
                ),
                8080
);

$server->run();
