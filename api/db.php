<?php
/**
 * Database connection + schema initializer
 * SQLite — single file, zero configuration required
 */

define('DB_PATH', __DIR__ . '/../database.db');

function getDB(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;

    $pdo = new PDO('sqlite:' . DB_PATH);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL');
    $pdo->exec('PRAGMA foreign_keys=ON');

    initSchema($pdo);
    return $pdo;
}

function initSchema(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id            INTEGER PRIMARY KEY AUTOINCREMENT,
            name          TEXT    NOT NULL,
            email         TEXT    NOT NULL UNIQUE,
            password_hash TEXT    NOT NULL,
            role          TEXT    NOT NULL DEFAULT 'user',
            verified      INTEGER NOT NULL DEFAULT 0,
            created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS company (
            id       INTEGER PRIMARY KEY CHECK (id = 1),
            name     TEXT,
            phone    TEXT,
            email    TEXT,
            address  TEXT,
            currency TEXT    DEFAULT 'KES',
            terms    TEXT,
            logo     TEXT
        );

        CREATE TABLE IF NOT EXISTS catalog (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            category    TEXT,
            unit        TEXT,
            cost_price  REAL    DEFAULT 0,
            margin      REAL    DEFAULT 0,
            unit_price  REAL    DEFAULT 0,
            description TEXT,
            created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS clients (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            name           TEXT    NOT NULL,
            email          TEXT,
            phone          TEXT,
            contact_person TEXT,
            location       TEXT,
            address        TEXT,
            created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS quotes (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            number         TEXT    NOT NULL UNIQUE,
            client_id      INTEGER REFERENCES clients(id) ON DELETE SET NULL,
            client_name    TEXT,
            venue          TEXT,
            no_of_guests   TEXT,
            contact_person TEXT,
            quote_date     TEXT,
            valid_until    TEXT,
            vat_rate       REAL    DEFAULT 16,
            subtotal       REAL    DEFAULT 0,
            vat_amount     REAL    DEFAULT 0,
            total          REAL    DEFAULT 0,
            status         TEXT    DEFAULT 'draft',
            notes          TEXT,
            created_by     TEXT,
            created_at     TEXT    NOT NULL DEFAULT (datetime('now')),
            updated_at     TEXT    NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS quote_items (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_id    INTEGER NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
            type        TEXT    NOT NULL DEFAULT 'item',
            section     TEXT,
            subsection  TEXT,
            name        TEXT,
            qty         REAL    DEFAULT 0,
            unit_price  REAL    DEFAULT 0,
            price       REAL    DEFAULT 0,
            sort_order  INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS tokens (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token      TEXT    NOT NULL UNIQUE,
            expires_at TEXT    NOT NULL,
            created_at TEXT    NOT NULL DEFAULT (datetime('now'))
        );
    ");

    // Seed default admin if no users exist
    $count = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($count == 0) {
        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $pdo->prepare("
            INSERT INTO users (name, email, password_hash, role, verified)
            VALUES ('Administrator', 'admin@company.com', ?, 'admin', 1)
        ")->execute([$hash]);
    }

    // Seed default company row
    $comp = $pdo->query("SELECT COUNT(*) FROM company")->fetchColumn();
    if ($comp == 0) {
        $pdo->exec("
            INSERT INTO company (id, name, phone, email, address, currency)
            VALUES (1, 'Cayan Events Ke.', '0737 611 658',
                    'cayaneventsanddecor@gmail.com',
                    'Mokoyeti West Road, Karen', 'KES')
        ");
    }
}
