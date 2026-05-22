// Configuration
$db_host = 'localhost';
$db_username = 'root';
$db_password = '';
$db_name = 'online_library';

// Connect to database
$conn = new mysqli($db_host, $db_username, $db_password, $db_name);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Function to generate JWT
function generate_jwt($user_id, $username) {
    $secret_key = 'your_secret_key';
    $payload = array(
        'user_id' => $user_id,
        'username' => $username,
        'iat' => time(),
        'exp' => time() + 3600 // expires in 1 hour
    );
    $jwt = \Firebase\JWT\JWT::encode($payload, $secret_key, 'HS256');
    return $jwt;
}

// Registration controller
if (isset($_POST['register'])) {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];

    // Validate password
    if ($password !== $confirm_password) {
        echo 'Passwords do not match';
        exit;
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Check if username or email already exists
    $query = "SELECT * FROM users WHERE username = '$username' OR email = '$email'";
    $result = $conn->query($query);
    if ($result->num_rows > 0) {
        echo 'Username or email already exists';
        exit;
    }

    // Insert user into database
    $query = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$hashed_password')";
    if ($conn->query($query) === TRUE) {
        echo 'Registration successful';
    } else {
        echo 'Error: ' . $conn->error;
    }
}

// Login controller
if (isset($_POST['login'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Check if username exists
    $query = "SELECT * FROM users WHERE username = '$username'";
    $result = $conn->query($query);
    if ($result->num_rows === 0) {
        echo 'Username does not exist';
        exit;
    }

    // Get user data
    $user_data = $result->fetch_assoc();

    // Verify password
    if (!password_verify($password, $user_data['password'])) {
        echo 'Incorrect password';
        exit;
    }

    // Generate JWT
    $jwt = generate_jwt($user_data['id'], $username);
    echo $jwt;
}

// Close database connection
$conn->close();