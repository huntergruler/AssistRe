<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

$filePath = '../Credentials';
$config = json_decode(file_get_contents($filePath), true);

// Example of accessing a config value
$MYSQL_HOST = $config['database']['MYSQL_HOST'];
$MYSQL_USERNAME = $config['database']['MYSQL_USERNAME'];
$MYSQL_PASSWORD = $config['database']['MYSQL_PASSWORD'];
$MYSQL_DATABASE = $config['database']['MYSQL_DATABASE'];
$SMTP_HOST = $config['email']['SMTP_HOST'];
$SMTP_PORT = $config['email']['SMTP_PORT'];
$SMTP_USERNAME = $config['email']['SMTP_USERNAME'];
$SMTP_PASSWORD = $config['email']['SMTP_PASSWORD'];

// Create connection
$conn = new mysqli($MYSQL_HOST, $MYSQL_USERNAME, $MYSQL_PASSWORD, $MYSQL_DATABASE);

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
$sql = "INSERT INTO Agents (usertype, firstname, lastname, email, phonenumber, password, userphoto, emailverified, verificationToken) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)";

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
    $mail = new PHPMailer(true);
try {
    //Server settings
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;                       // Enable verbose debug output
    $mail->isSMTP();                                             // Set mailer to use SMTP
    $mail->Host = $GLOBALS['SMTP_HOST'];          // Specify main SMTP server for Amazon SES
    $mail->SMTPAuth   = true;                                    // Enable SMTP authentication
    $mail->Username   = $GLOBALS['SMTP_USERNAME'];                    // SMTP username from AWS SES
    $mail->Password   = $GLOBALS['SMTP_PASSWORD'];                    // SMTP_PASSWORD;                    // SMTP password from AWS SES
    $mail->SMTPDebug = 0;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;          // Enable TLS encryption, `ssl` is also accepted
    $mail->Port       = $GLOBALS['SMTP_PORT'];                                     // TCP port to connect to

    //Recipients
    $mail->setFrom('noreply@seekingagents.com', 'Mailer');
    $mail->addAddress('gruler@mac.com', 'Jim Gruler');      // Add a recipient, must be verified if your account is in the sandbox

    // Content
    $mail->isHTML(true);                                         // Set email format to HTML
    $mail->Subject = 'Verify Your Email';
    $mail->Body    = 'Please click on the link below to verify your email: <a href="'.$verificationLink.'">Verify Email</a>';
//    $mail->AltBody = 'Please click on the link below to verify your email: verification-link';

    $mail->send();
    echo 'Verification email sent.';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}
}
?>
