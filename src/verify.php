<?php
$host = 'seekingagents.cdciwk4kesz5.us-east-2.rds.amazonaws.com';
$username = 'dev';
$password = 'Newpass1one!';
$dbname = 'seekingagents';

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$token = $_GET['token'];

// Update the database to set emailverified to 1
$sql = "UPDATE Users SET emailverified = 1 WHERE verificationToken = ? AND emailverified = 0";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $token);
if ($stmt->execute()) {
    echo "Email verified successfully!";
} else {
    echo "Error verifying email. Please contact support.";
}

$stmt->close();
$conn->close();
?>
