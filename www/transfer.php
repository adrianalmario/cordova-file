<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "battery_status";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve JSON data from POST request
$jsonData = file_get_contents('php://input');

// Echo the JSON data
echo $jsonData;

// Log received JSON data
error_log("Received JSON data: " . $jsonData);

// Decode the JSON data into a PHP associative array
$data = json_decode($jsonData, true);

// Check if data is not null and contains the expected elements
if ($data && isset($data['battery_level'])) {
    $batteryPercentage = intval($data['battery_level']); // Cast to integer for safety

    // Update batt_percentage column with the received battery percentage
    $updateQuery = "UPDATE `status1` SET `batt_percentage` = ? WHERE `id` = 1";
    $stmt = $conn->prepare($updateQuery);
    if ($stmt) {
        $stmt->bind_param("i", $batteryPercentage); // Bind parameter to avoid SQL injection
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            echo "Battery percentage updated successfully\n";
        } else {
            echo "Error updating battery percentage: " . $stmt->error . "\n";
        }
    } else {
        echo "Error preparing statement: " . $conn->error . "\n";
    }

    // Update on_off column based on batt_percentage value
    $onOffValue = ($batteryPercentage < 20 || $batteryPercentage == 100) ? 1 : 0;
    $updateOnOffQuery = "UPDATE `status1` SET `on_off` = ? WHERE `id` = 1";
    $stmt2 = $conn->prepare($updateOnOffQuery);
    if ($stmt2) {
        $stmt2->bind_param("i", $onOffValue);
        $stmt2->execute();

        if ($stmt2->affected_rows > 0) {
            echo "On/Off value updated successfully\n";
        } else {
            echo "Error updating On/Off value: " . $stmt2->error . "\n";
        }
    } else {
        echo "Error preparing statement: " . $conn->error . "\n";
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
