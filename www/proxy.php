<?php
// proxy.php

// Set the target URL
$targetUrl = 'https://192.168.5.235/transfer.php'; // Change this to your HTTP endpoint

// Forward the request to the target URL
$response = file_get_contents($targetUrl);

// Output the response
echo $response;
?>
