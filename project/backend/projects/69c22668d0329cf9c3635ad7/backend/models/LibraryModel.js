class Library {
    private $id;
    private $name;
    private $address;
    private $city;
    private $state;
    private $country;
    private $zipCode;
    private $phoneNumber;
    private $email;
    private $createdAt;
    private $updatedAt;

    public function __construct($id = null, $name = null, $address = null, $city = null, $state = null, $country = null, $zipCode = null, $phoneNumber = null, $email = null) {
        $this->id = $id;
        $this->name = $name;
        $this->address = $address;
        $this->city = $city;
        $this->state = $state;
        $this->country = $country;
        $this->zipCode = $zipCode;
        $this->phoneNumber = $phoneNumber;
        $this->email = $email;
        $this->createdAt = date('Y-m-d H:i:s');
        $this->updatedAt = date('Y-m-d H:i:s');
    }

    public function getId() {
        return $this->id;
    }

    public function getName() {
        return $this->name;
    }

    public function getAddress() {
        return $this->address;
    }

    public function getCity() {
        return $this->city;
    }

    public function getState() {
        return $this->state;
    }

    public function getCountry() {
        return $this->country;
    }

    public function getZipCode() {
        return $this->zipCode;
    }

    public function getPhoneNumber() {
        return $this->phoneNumber;
    }

    public function getEmail() {
        return $this->email;
    }

    public function getCreatedAt() {
        return $this->createdAt;
    }

    public function getUpdatedAt() {
        return $this->updatedAt;
    }

    public function setName($name) {
        $this->name = $name;
    }

    public function setAddress($address) {
        $this->address = $address;
    }

    public function setCity($city) {
        $this->city = $city;
    }

    public function setState($state) {
        $this->state = $state;
    }

    public function setCountry($country) {
        $this->country = $country;
    }

    public function setZipCode($zipCode) {
        $this->zipCode = $zipCode;
    }

    public function setPhoneNumber($phoneNumber) {
        $this->phoneNumber = $phoneNumber;
    }

    public function setEmail($email) {
        $this->email = $email;
    }

    public function setUpdatedAt($updatedAt) {
        $this->updatedAt = $updatedAt;
    }
}

class LibraryRepository {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function createTable() {
        $query = "CREATE TABLE IF NOT EXISTS libraries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(100) NOT NULL,
            country VARCHAR(100) NOT NULL,
            zip_code VARCHAR(20) NOT NULL,
            phone_number VARCHAR(20) NOT NULL,
            email VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        $this->db->query($query);
    }

    public function insert(Library $library) {
        $query = "INSERT INTO libraries (name, address, city, state, country, zip_code, phone_number, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("ssssssss", $library->getName(), $library->getAddress(), $library->getCity(), $library->getState(), $library->getCountry(), $library->getZipCode(), $library->getPhoneNumber(), $library->getEmail());
        $stmt->execute();
    }

    public function update(Library $library) {
        $query = "UPDATE libraries SET name = ?, address = ?, city = ?, state = ?, country = ?, zip_code = ?, phone_number = ?, email = ?, updated_at = ? WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("sssssssss", $library->getName(), $library->getAddress(), $library->getCity(), $library->getState(), $library->getCountry(), $library->getZipCode(), $library->getPhoneNumber(), $library->getEmail(), $library->getUpdatedAt(), $library->getId());
        $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM libraries WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
    }

    public function getAll() {
        $query = "SELECT * FROM libraries";
        $result = $this->db->query($query);
        $libraries = array();
        while ($row = $result->fetch_assoc()) {
            $library = new Library($row['id'], $row['name'], $row['address'], $row['city'], $row['state'], $row['country'], $row['zip_code'], $row['phone_number'], $row['email']);
            $library->setCreatedAt($row['created_at']);
            $library->setUpdatedAt($row['updated_at']);
            $libraries[] = $library;
        }
        return $libraries;
    }

    public function getById($id) {
        $query = "SELECT * FROM libraries WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        if ($row) {
            $library = new Library($row['id'], $row['name'], $row['address'], $row['city'], $row['state'], $row['country'], $row['zip_code'], $row['phone_number'], $row['email']);
            $library->setCreatedAt($row['created_at']);
            $library->setUpdatedAt($row['updated_at']);
            return $library;
        } else {
            return null;
        }
    }
}

$db = new mysqli("localhost", "root", "", "online_library");
if ($db->connect_error) {
    die("Connection failed: " . $db->connect_error);
}

$libraryRepository = new LibraryRepository($db);
$libraryRepository->createTable();

$library = new Library(null, "Central Library", "123 Main St", "New York", "NY", "USA", "10001", "123-456-7890", "info@example.com");
$libraryRepository->insert($library);

$libraries = $libraryRepository->getAll();
foreach ($libraries as $lib) {
    echo $lib->getName() . "\n";
}

$library->setName("Updated Library");
$libraryRepository->update($library);

$libraryRepository->delete(1);

$db->close();