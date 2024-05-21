<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "batt_life_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve JSON data from POST request
$jsonData = file_get_contents('php://input');

// Log received JSON data
error_log("Received JSON data: " . $jsonData);

// Decode the JSON data into a PHP associative array
$data = json_decode($jsonData, true);

// Check if data is not null and contains the expected elements
if ($data && isset($data['battery_level'])) {
    $batteryPercentage = intval($data['battery_level']); 

    $updateQuery = "UPDATE `status1` SET `battery_status` = ? WHERE `id` = 1";
    $stmt = $conn->prepare($updateQuery);
    if ($stmt) {
        $stmt->bind_param("i", $batteryPercentage); 
        $stmt->execute();

        echo "Battery percentage updated successfully\n";
    } else {
        echo "Error preparing statement: " . $conn->error . "\n";
    }

    // Update on_off column based on battery percentage value
    if ($batteryPercentage <= 20) {
        $onOffValue = 1;
    } elseif ($batteryPercentage >=95) {
        $onOffValue = 0;
    } else {
        echo "No action required for battery percentage: $batteryPercentage\n";
    }
    
    if (isset($onOffValue)) {
        // Update on_off column
        $updateOnOffQuery = "UPDATE `status1` SET `on_off` = ? WHERE `id` = 1";
        $stmt2 = $conn->prepare($updateOnOffQuery);
        if ($stmt2) {
            $stmt2->bind_param("i", $onOffValue);
            $stmt2->execute();
            echo "On/Off value updated successfully\n";
        } else {
            echo "Error preparing statement: " . $conn->error . "\n";
        }
    }

    // Close prepared statements
    if ($stmt) $stmt->close();
    if ($stmt2) $stmt2->close();
} else {
    // Log missing or invalid data
    error_log("Received invalid data: " . $jsonData);
    echo "Invalid data received\n ";
}

// Close connection
$conn->close();
?>
