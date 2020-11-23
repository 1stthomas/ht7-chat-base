<?php
/**
 * Setup the vendor autoloader.
 */
$loader = require './vendor/autoload.php';
?>
<!DOCTYPE html>
<html>
    <head>
        <title>ht7 - chat</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link
            rel="stylesheet"
            href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
            integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
            crossorigin="anonymous"
            >
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.6.0/css/all.css" rel="stylesheet">
        <link href="./src/css/ht7.chat.main.css" rel="stylesheet">
        <script
            src="http://code.jquery.com/jquery-3.5.1.slim.min.js"
            integrity="sha256-4+XzXVhsDmqanXGHaHvgh1gMQKX40OUvDEBTu8JcmNs="
            crossorigin="anonymous"
        ></script>
    </head>
    <body>
        <pre><?php print_r($_REQUEST); ?></pre>
        <div class="container">
            <div class="row">
                <div class="col-xs-12">
                    <h1>ht7 - chat</h1>
                    <div class="ht7-chat-container" data-url="ws://localhost:8080" id="ht7-chat-test-01">
                        <?php include './src/elements/base.php'; ?>
                    </div>
                </div>
            </div>
        </div>
        <script
            src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
            integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
            crossorigin="anonymous"
        ></script>
        <script src="./src/js/ht7.chat.js"></script>
    </body>
</html>