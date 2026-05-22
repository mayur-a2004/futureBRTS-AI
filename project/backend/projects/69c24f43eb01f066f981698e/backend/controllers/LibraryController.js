class LibraryController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function create($title, $author, $publication_date, $isbn) {
        $query = "INSERT INTO libraries (title, author, publication_date, isbn) VALUES (?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ssss", $title, $author, $publication_date, $isbn);
        if ($stmt->execute()) {
            return $this->db->insert_id;
        } else {
            throw new Exception("Failed to create library");
        }
    }

    public function read($id) {
        $query = "SELECT * FROM libraries WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            return $result->fetch_assoc();
        } else {
            throw new Exception("Library not found");
        }
    }

    public function update($id, $title, $author, $publication_date, $isbn) {
        $query = "UPDATE libraries SET title = ?, author = ?, publication_date = ?, isbn = ? WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ssssi", $title, $author, $publication_date, $isbn, $id);
        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Failed to update library");
        }
    }

    public function delete($id) {
        $query = "DELETE FROM libraries WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $id);
        if ($stmt->execute()) {
            return true;
        } else {
            throw new Exception("Failed to delete library");
        }
    }

    public function getAll() {
        $query = "SELECT * FROM libraries";
        $result = $this->db->query($query);
        if ($result->num_rows > 0) {
            $libraries = array();
            while ($row = $result->fetch_assoc()) {
                $libraries[] = $row;
            }
            return $libraries;
        } else {
            return array();
        }
    }
}

class Database {
    private $host;
    private $username;
    private $password;
    private $database;

    public function __construct($host, $username, $password, $database) {
        $this->host = $host;
        $this->username = $username;
        $this->password = $password;
        $this->database = $database;
    }

    public function connect() {
        $this->db = new mysqli($this->host, $this->username, $this->password, $this->database);
        if ($this->db->connect_error) {
            throw new Exception("Failed to connect to database");
        }
    }

    public function prepare($query) {
        return $this->db->prepare($query);
    }

    public function query($query) {
        return $this->db->query($query);
    }

    public function insert_id() {
        return $this->db->insert_id;
    }
}

$db = new Database("localhost", "root", "", "online_library");
$db->connect();

$libraryController = new LibraryController($db);

// Example usage:
$libraryId = $libraryController->create("To Kill a Mockingbird", "Harper Lee", "1960-07-11", "978-0061120084");
echo "Library created with ID: $libraryId\n";

$library = $libraryController->read($libraryId);
echo "Library title: " . $library["title"] . "\n";

$libraryController->update($libraryId, "To Kill a Mockingbird (Updated)", "Harper Lee", "1960-07-11", "978-0061120084");
echo "Library updated\n";

$libraries = $libraryController->getAll();
echo "All libraries:\n";
foreach ($libraries as $library) {
    echo "ID: " . $library["id"] . ", Title: " . $library["title"] . "\n";
}

$libraryController->delete($libraryId);
echo "Library deleted\n";

?>