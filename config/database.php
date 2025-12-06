<?php
class Database {
    private $host = "localhost";
    private $db_name = "kuala_outdoor";
    private $username = "root";
    private $password = "";
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new mysqli(
                $this->host,
                $this->username,
                $this->password,
                $this->db_name
            );

            if ($this->conn->connect_error) {
                throw new Exception("Connection failed: " . $this->conn->connect_error);
            }

            $this->conn->set_charset("utf8mb4");

        } catch(Exception $e) {
            echo json_encode([
                'success' => false,
                'error' => 'Database connection failed',
                'message' => $e->getMessage()
            ]);
            exit();
        }

        return $this->conn;
    }
}
?>