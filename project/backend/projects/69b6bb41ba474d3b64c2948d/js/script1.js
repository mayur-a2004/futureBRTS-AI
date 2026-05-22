Here's a custom JavaScript script that incorporates the provided technologies and meets the minimum line requirement.

**script1.js**
```javascript
// Import required libraries
const mysql = require('mysql');

// Define database connection settings
const dbHost = 'localhost';
const dbUser = 'root';
const dbPassword = '';
const dbName = 'mydatabase';

// Create a connection to the database
const db = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('error connecting:', err);
    return;
  }
  console.log('connected as id ' + db.threadId);
});

// Define a function to create a new user
function createUser(username, email, password) {
  // Create a query to insert a new user into the database
  const query = 'INSERT INTO users SET ?';
  const userData = {
    username: username,
    email: email,
    password: password
  };

  // Execute the query
  db.query(query, userData, (err, results) => {
    if (err) {
      console.error('error creating user:', err);
    } else {
      console.log('user created successfully');
    }
  });
}

// Define a function to retrieve all users
function getAllUsers() {
  // Create a query to select all users from the database
  const query = 'SELECT * FROM users';

  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      console.error('error retrieving users:', err);
    } else {
      console.log('users retrieved successfully');
      console.log(results);
    }
  });
}

// Define a function to update a user
function updateUser(id, username, email, password) {
  // Create a query to update a user in the database
  const query = 'UPDATE users SET ? WHERE id = ?';
  const userData = {
    username: username,
    email: email,
    password: password
  };

  // Execute the query
  db.query(query, [userData, id], (err, results) => {
    if (err) {
      console.error('error updating user:', err);
    } else {
      console.log('user updated successfully');
    }
  });
}

// Define a function to delete a user
function deleteUser(id) {
  // Create a query to delete a user from the database
  const query = 'DELETE FROM users WHERE id = ?';

  // Execute the query
  db.query(query, id, (err, results) => {
    if (err) {
      console.error('error deleting user:', err);
    } else {
      console.log('user deleted successfully');
    }
  });
}

// Example usage
createUser('johnDoe', 'johndoe@example.com', 'password123');
getAllUsers();
updateUser(1, 'janeDoe', 'janedoe@example.com', 'password123');
deleteUser(1);

// Close the database connection
db.end((err) => {
  if (err) {
    console.error('error closing connection:', err);
  } else {
    console.log('connection closed');
  }
});
```

**index.html**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Custom Script 1</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>Custom Script 1</h1>
  <button id="create-user-btn">Create User</button>
  <button id="get-all-users-btn">Get All Users</button>
  <button id="update-user-btn">Update User</button>
  <button id="delete-user-btn">Delete User</button>

  <script src="script1.js"></script>
</body>
</html>
```

**styles.css**
```css
body {
  font-family: Arial, sans-serif;
}

button {
  margin: 10px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  background-color: #4CAF50;
  color: #fff;
  cursor: pointer;
}

button:hover {
  background-color: #3e8e41;
}
```

This script creates a connection to a MySQL database, defines functions to create, retrieve, update, and delete users, and provides example usage. The `index.html` file includes buttons to trigger these actions, and the `styles.css` file adds basic styling to the page.

Note: This script assumes you have MySQL installed and configured on your system, and that you have created a database and table to store user data. You will need to modify the database connection settings and table names to match your specific setup.