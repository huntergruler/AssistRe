<?php
$host = 'seekingagents.cdciwk4kesz5.us-east-2.rds.amazonaws.com';
$username = 'admin';
$password = 'Newpass1one!';
$dbname = 'seekingagents';

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$email = $_POST['email'];
$phoneNumber = $_POST['phoneNumber'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
$userPhoto = $_FILES['userPhoto'];

// Validate email and phone number syntax
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die('Invalid email format');
}

if (!preg_match('/^[0-9]{10}$/', $phoneNumber)) {
    die('Invalid phone number format');
}

// Handle photo upload
$targetDirectory = "uploads/";
$targetFile = $targetDirectory . basename($userPhoto["name"]);
if (!move_uploaded_file($userPhoto["tmp_name"], $targetFile)) {
    die('Error uploading file');
}

// Insert user data into database
$sql = "INSERT INTO Users (usertype, firstname, lastname, email, phonenumber, password, userphoto) VALUES (?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("sssssss", $_POST['userType'], $_POST['firstName'], $_POST['lastName'], $email, $phoneNumber, $password, $targetFile);
if ($stmt->execute()) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$stmt->close();
$conn->close();
?>
