<?php
$host = 'seekingagents.cdciwk4kesz5.us-east-2.rds.amazonaws.com';
$username = 'dev';
$password = 'Newpass1one!';
$dbname = 'seekingagents';

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT DISTINCT usertype FROM UserType";
$result = $conn->query($sql);

$userTypes = [];

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $userTypes[] = $row['usertype'];
    }
    echo json_encode($userTypes);
} else {
    echo "0 results";
}

$conn->close();
?>
