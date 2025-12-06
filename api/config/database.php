<?php
class Database {
    private $host = "localhost";
    private $db_name = "kuala_outdoor";
    private $username = "root";
    private $password = "";
    public $conn;

    // ✅ METHOD connect() YANG BENAR
    public function connect() {
        $this->conn = null;
        
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password,
                array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
            );
            
            // Set character set
            $this->conn->exec("set names utf8");
            
        } catch(PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            throw new Exception("Database connection failed: " . $e->getMessage());
        }
        
        return $this->conn;
    }

    // ✅ METHOD ALTERNATIVE JIKA PERLU
    public function getConnection() {
        return $this->connect();
    }
}
?>