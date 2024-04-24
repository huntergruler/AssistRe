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

// Collect data from form
$email = $_POST['email'];
$phoneNumber = $_POST['phoneNumber'];
$password = password_hash($_POST['password'], PASSWORD_DEFAULT);
$userPhoto = $_FILES['userPhoto'];
$verificationToken = bin2hex(random_bytes(16)); // Generate a random token

// Validate and upload photo
$targetDirectory = "uploads/";
$targetFile = $targetDirectory . basename($userPhoto["name"]);
if (!move_uploaded_file($userPhoto["tmp_name"], $targetFile)) {
    die('Error uploading file');
}

// Insert user data into database
$sql = "INSERT INTO Users (usertype, firstname, lastname, email, phonenumber, password, userphoto, emailverified, verificationToken) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ssssssss", $_POST['userType'], $_POST['firstName'], $_POST['lastName'], $email, $phoneNumber, $password, $targetFile, $verificationToken);
if ($stmt->execute()) {
    echo "New record created successfully";
    sendVerificationEmail($email, $verificationToken);
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$stmt->close();
$conn->close();

function sendVerificationEmail($email, $token) {
    $verificationLink = "http://localhost:8080/src/verify.php?token=" . $token;
    $subject = "Verify Your Email";
    $message = "Please click on the following link to verify your email: " . $verificationLink;
    $headers = "From: noreply@seekingagents.com\r\n";
    $headers .= "Reply-To: noreply@seekingagents.com\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    mail($email, $subject, $message, $headers);
}
?>
