<?php
// ════════════════════════════════════════════════════════════════════════════
//  DATABASE CLASS
// ════════════════════════════════════════════════════════════════════════════

class Database {
    private $conn;
    private $dbHost;
    private $dbUser;
    private $dbPass;
    private $dbName;

    public function __construct($host = DB_HOST, $user = DB_USER, $pass = DB_PASS, $name = DB_NAME) {
        $this->dbHost = $host;
        $this->dbUser = $user;
        $this->dbPass = $pass;
        $this->dbName = $name;
        $this->connect();
    }

    private function connect() {
        try {
            $this->conn = new mysqli($this->dbHost, $this->dbUser, $this->dbPass);
            
            if ($this->conn->connect_error) {
                throw new Exception('Database connection failed: ' . $this->conn->connect_error);
            }

            // Create database if not exists
            $this->conn->query("CREATE DATABASE IF NOT EXISTS `{$this->dbName}`");
            $this->conn->select_db($this->dbName);
            $this->conn->set_charset('utf8mb4');
            
        } catch (Exception $e) {
            $this->logError($e->getMessage());
            die(json_encode(['error' => 'Database connection failed']));
        }
    }

    public function createTables() {
        $queries = [
            // Users Table
            "CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role ENUM('admin', 'user') DEFAULT 'user',
                verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_verified (verified)
            )",

            // Company Settings Table
            "CREATE TABLE IF NOT EXISTS company (
                id INT PRIMARY KEY DEFAULT 1,
                name VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(20),
                address TEXT,
                vat VARCHAR(50),
                currency VARCHAR(10) DEFAULT 'KES',
                logo LONGTEXT,
                terms TEXT,
                bank_details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )",

            // Catalog Items Table
            "CREATE TABLE IF NOT EXISTS catalog (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(100),
                description TEXT,
                cost_price DECIMAL(10, 2) NOT NULL,
                margin INT DEFAULT 20,
                unit VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category (category)
            )",

            // Clients Table
            "CREATE TABLE IF NOT EXISTS clients (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                company VARCHAR(255),
                email VARCHAR(255),
                phone VARCHAR(20),
                address TEXT,
                vat VARCHAR(50),
                contact_person VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_name (name),
                INDEX idx_email (email)
            )",

            // Quotes Table
            "CREATE TABLE IF NOT EXISTS quotes (
                id VARCHAR(36) PRIMARY KEY,
                number VARCHAR(50) UNIQUE NOT NULL,
                client_id VARCHAR(36),
                client_name VARCHAR(255),
                client_company VARCHAR(255),
                quote_date DATE,
                valid_days INT DEFAULT 30,
                valid_until DATE,
                subtotal DECIMAL(12, 2),
                vat_rate INT DEFAULT 16,
                vat_amount DECIMAL(12, 2),
                total DECIMAL(12, 2),
                include_vat BOOLEAN DEFAULT TRUE,
                status ENUM('draft', 'pending', 'accepted', 'declined') DEFAULT 'draft',
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (client_id) REFERENCES clients(id),
                INDEX idx_number (number),
                INDEX idx_status (status),
                INDEX idx_client (client_id)
            )",

            // Quote Items Table
            "CREATE TABLE IF NOT EXISTS quote_items (
                id VARCHAR(36) PRIMARY KEY,
                quote_id VARCHAR(36) NOT NULL,
                name VARCHAR(255),
                description TEXT,
                quantity INT,
                unit VARCHAR(50),
                unit_price DECIMAL(10, 2),
                margin INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE,
                INDEX idx_quote (quote_id)
            )",

            // Quote Counter Table
            "CREATE TABLE IF NOT EXISTS quote_counter (
                id INT PRIMARY KEY DEFAULT 1,
                current_value INT DEFAULT 1001
            )"
        ];

        foreach ($queries as $query) {
            if (!$this->conn->query($query)) {
                $this->logError('Table creation failed: ' . $this->conn->error);
            }
        }

        // Insert default quote counter if not exists
        $result = $this->conn->query("SELECT COUNT(*) as cnt FROM quote_counter");
        $row = $result->fetch_assoc();
        if ($row['cnt'] == 0) {
            $this->conn->query("INSERT INTO quote_counter (id, current_value) VALUES (1, 1001)");
        }
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->conn->prepare($sql);
            
            if (!$stmt) {
                throw new Exception('Prepare failed: ' . $this->conn->error);
            }

            if (!empty($params)) {
                $types = '';
                foreach ($params as $param) {
                    if (is_int($param)) $types .= 'i';
                    elseif (is_float($param)) $types .= 'd';
                    else $types .= 's';
                }
                $stmt->bind_param($types, ...$params);
            }

            $stmt->execute();
            return $stmt;
        } catch (Exception $e) {
            $this->logError('Query error: ' . $e->getMessage());
            return false;
        }
    }

    public function getRows($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        if (!$stmt) return [];
        
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        $stmt->close();
        return $rows;
    }

    public function getRow($sql, $params = []) {
        $stmt = $this->query($sql, $params);
        if (!$stmt) return null;
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row;
    }

    public function insert($table, $data) {
        $columns = array_keys($data);
        $values = array_values($data);
        $placeholders = array_fill(0, count($columns), '?');

        $sql = "INSERT INTO `{$table}` (`" . implode('`, `', $columns) . "`) VALUES (" . implode(', ', $placeholders) . ")";
        
        $stmt = $this->query($sql, $values);
        if ($stmt) {
            return $this->conn->insert_id;
        }
        return false;
    }

    public function update($table, $data, $where, $whereParams = []) {
        $set = [];
        $params = [];
        
        foreach ($data as $key => $value) {
            $set[] = "`{$key}` = ?";
            $params[] = $value;
        }

        $params = array_merge($params, $whereParams);
        $sql = "UPDATE `{$table}` SET " . implode(', ', $set) . " WHERE {$where}";
        
        $stmt = $this->query($sql, $params);
        return $stmt ? $this->conn->affected_rows : false;
    }

    public function delete($table, $where, $params = []) {
        $sql = "DELETE FROM `{$table}` WHERE {$where}";
        $stmt = $this->query($sql, $params);
        return $stmt ? $this->conn->affected_rows : false;
    }

    public function lastInsertId() {
        return $this->conn->insert_id;
    }

    public function affectedRows() {
        return $this->conn->affected_rows;
    }

    public function error() {
        return $this->conn->error;
    }

    private function logError($message) {
        $log_file = __DIR__ . '/logs/error.log';
        $timestamp = date('Y-m-d H:i:s');
        error_log("[{$timestamp}] {$message}\n", 3, $log_file);
    }

    public function __destruct() {
        if ($this->conn) {
            $this->conn->close();
        }
    }
}
