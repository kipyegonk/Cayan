# QuoteSystem - Quote Management System

A complete, production-ready quote management application with user authentication, client management, product catalog, and professional quote generation.

##  Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Admin Panel**: User management and system administration
- **Client Management**: Store and manage customer information
- **Product Catalog**: Create and manage items/services with pricing
- **Quote Creation**: Generate professional quotes with customizable items
- **Quote Management**: Track quote status (draft, pending, accepted, declined)
- **Company Settings**: Configure company details, logo, and terms
- **Professional Preview**: Print-ready quote previews
- **Responsive Design**: Works on desktop and tablet devices
- **Role-Based Access**: Admin and user role management
- **Dashboard Analytics**: Real-time statistics and overview

##  Project Structure

```
/q
├── index.html              # Frontend UI (Single Page App)
├── config.php              # Application configuration
├── api/
│   └── index.php          # REST API endpoints
├── classes/
│   ├── Database.php       # Database connection & operations
│   └── Auth.php           # Authentication & JWT handling
├── uploads/               # User uploaded files (logo, etc)
├── logs/                  # Application logs
└── README.md              # This file
```

##  Technical Stack

- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+ or MariaDB
- **Frontend**: Vanilla JavaScript (no frameworks)
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful architecture

##  Installation

### Prerequisites
- PHP 7.4 or higher
- MySQL 5.7 or higher
- Apache/Nginx web server with mod_rewrite enabled
- Composer (optional, for dependency management)

### Step 1: Download & Setup

1. Clone or download the project:
```bash
cd /var/www/html
git clone <repository-url> q
cd q
```

2. Create uploads and logs directories:
```bash
mkdir -p uploads logs
chmod 755 uploads logs
```

### Step 2: Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE quote_system;
CREATE USER 'quote_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON quote_system.* TO 'quote_user'@'localhost';
FLUSH PRIVILEGES;
```

2. Update `config.php` with your database credentials:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'quote_user');
define('DB_PASS', 'password123');
define('DB_NAME', 'quote_system');
```

3. Update security keys in `config.php`:
```php
define('SECRET_KEY', 'your-secret-key-change-this');
define('JWT_SECRET', 'your-jwt-secret-change-this');
```

### Step 3: Web Server Configuration

#### Apache (.htaccess)
Create `.htaccess` in the root directory:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /q/
    RewriteRule ^api/(.*)$ api/index.php?request=$1 [QSA,L]
</IfModule>
```

#### Nginx
Add to your server block:
```nginx
location /q/api/ {
    rewrite ^/q/api/(.*)$ /q/api/index.php?request=$1 last;
}
```

### Step 4: File Permissions

```bash
chmod 644 *.php
chmod 755 classes api
chmod 777 uploads logs
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost/q/
```

##  Default Credentials

When you first access the system, the database tables are automatically created with a default admin user:

- **Email**: `admin@company.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change these credentials immediately after first login!

##  API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| GET | `/api/auth/verify` | Verify JWT token |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

### Company Settings (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company` | Get company settings |
| POST | `/api/company` | Save company settings |

### Catalog

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/catalog` | List all catalog items |
| GET | `/api/catalog/{id}` | Get single item |
| POST | `/api/catalog` | Create item |
| PUT | `/api/catalog/{id}` | Update item |
| DELETE | `/api/catalog/{id}` | Delete item |

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clients` | List all clients |
| GET | `/api/clients/{id}` | Get single client |
| POST | `/api/clients` | Create client |
| PUT | `/api/clients/{id}` | Update client |
| DELETE | `/api/clients/{id}` | Delete client |

### Quotes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quotes` | List all quotes |
| GET | `/api/quotes/{id}` | Get single quote |
| POST | `/api/quotes` | Create quote |
| PUT | `/api/quotes/{id}` | Update quote |
| DELETE | `/api/quotes/{id}` | Delete quote |

### Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |

##  Database Schema

### Users Table
```sql
- id (VARCHAR 36) - UUID
- name (VARCHAR 255)
- email (VARCHAR 255) - UNIQUE
- password (VARCHAR 255) - bcrypt hash
- role (ENUM: admin, user)
- verified (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Company Table
```sql
- id (INT) - Primary key = 1
- name (VARCHAR 255)
- email (VARCHAR 255)
- phone (VARCHAR 20)
- address (TEXT)
- vat (VARCHAR 50)
- currency (VARCHAR 10) - Default: KES
- logo (LONGTEXT) - Base64 encoded
- terms (TEXT)
- bank_details (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Catalog Table
```sql
- id (VARCHAR 36) - UUID
- name (VARCHAR 255)
- category (VARCHAR 100)
- description (TEXT)
- cost_price (DECIMAL 10,2)
- margin (INT) - Percentage
- unit (VARCHAR 50) - hr, day, unit, etc.
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Clients Table
```sql
- id (VARCHAR 36) - UUID
- name (VARCHAR 255)
- company (VARCHAR 255)
- email (VARCHAR 255)
- phone (VARCHAR 20)
- address (TEXT)
- vat (VARCHAR 50)
- contact_person (VARCHAR 255)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Quotes Table
```sql
- id (VARCHAR 36) - UUID
- number (VARCHAR 50) - UNIQUE
- client_id (VARCHAR 36) - FK
- client_name (VARCHAR 255)
- client_company (VARCHAR 255)
- quote_date (DATE)
- valid_days (INT)
- valid_until (DATE)
- subtotal (DECIMAL 12,2)
- vat_rate (INT)
- vat_amount (DECIMAL 12,2)
- total (DECIMAL 12,2)
- include_vat (BOOLEAN)
- status (ENUM: draft, pending, accepted, declined)
- notes (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Quote Items Table
```sql
- id (VARCHAR 36) - UUID
- quote_id (VARCHAR 36) - FK
- name (VARCHAR 255)
- description (TEXT)
- quantity (INT)
- unit (VARCHAR 50)
- unit_price (DECIMAL 10,2)
- margin (INT)
- created_at (TIMESTAMP)
```

##  Security Features

- **Password Hashing**: BCrypt with cost=12
- **JWT Authentication**: 7-day token expiration
- **CORS Support**: Cross-origin requests handling
- **Input Validation**: All user inputs validated
- **SQL Injection Protection**: Prepared statements
- **XSS Protection**: JSON encoding for output
- **Session Management**: Token-based stateless sessions
- **Role-Based Access Control**: Admin and user roles
- **Error Logging**: Secure error logging to files

##  Usage Guide

### 1. Initial Setup
1. Log in with admin credentials
2. Go to Settings to configure:
   - Company name and details
   - Upload company logo
   - Set default currency
   - Add payment terms
3. Add catalog items (products/services)
4. Create client profiles

### 2. Creating Users (Admin)
1. Go to Users section
2. Click "Add User"
3. Enter user details
4. Check "Account Verified" if immediate access needed
5. Users will receive login credentials

### 3. Creating Quotes
1. Go to "New Quote"
2. Select a client
3. Add items from catalog or create custom items
4. Set quantity and unit prices
5. Configure VAT settings
6. Add notes or special terms
7. Save as draft or send to pending
8. Preview and print

### 4. Quote Management
1. View all quotes in "All Quotes"
2. Search by quote number or client name
3. Update status (draft → pending → accepted/declined)
4. Preview quotes before printing
5. Export as PDF using browser print function

##  Frontend Architecture

The frontend is a Single Page Application (SPA) built with vanilla JavaScript. Key components:

- **Authentication Screen**: Login and registration
- **Dashboard**: Statistics and overview
- **Navigation**: Sidebar with role-based menu
- **Views**: Modular view components
- **Forms**: Dynamic form generation
- **Tables**: Sortable, searchable data tables
- **Modals**: Pop-up dialogs for editing
- **Notifications**: Toast notifications for feedback

##  Configuration Options

Edit `config.php` to customize:

```php
// Database
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'quote_system');

// Security
define('SECRET_KEY', 'change-this');
define('JWT_SECRET', 'change-this');

// Files
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('UPLOAD_DIR', __DIR__ . '/uploads/');

// Session
define('SESSION_TIMEOUT', 3600); // 1 hour
```

##  Troubleshooting

### Database Connection Failed
- Check database credentials in `config.php`
- Verify MySQL is running
- Ensure database user has proper permissions
- Check error logs in `/logs/error.log`

### API Returns 404
- Verify mod_rewrite is enabled (Apache)
- Check .htaccess file exists
- Verify API folder permissions
- Check URL structure matches endpoint

### Authentication Issues
- Verify JWT_SECRET is set correctly
- Check token expiration (7 days)
- Clear browser cache and localStorage
- Check Authorization header format: `Bearer token`

### File Upload Issues
- Verify `/uploads` directory exists and is writable
- Check file size is under MAX_FILE_SIZE
- Verify file type is in ALLOWED_EXTENSIONS
- Check PHP max_upload_size configuration

### Permission Denied Errors
- Run: `chmod 755 api classes`
- Run: `chmod 777 uploads logs`
- Verify web server user owns files

##  Performance Tips

1. **Database Optimization**
   - Add indexes on frequently searched columns
   - Regular database backups
   - Archive old quotes

2. **Caching**
   - Cache API responses on frontend
   - Use browser caching for static assets
   - Consider Redis for session storage

3. **API Optimization**
   - Paginate large result sets
   - Filter queries on backend
   - Use database views for complex queries

##  Backup & Recovery

### Daily Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DB_NAME="quote_system"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

mysqldump -u root -p quote_system > $BACKUP_DIR/quote_system_$DATE.sql

# Archive files
tar -czf $BACKUP_DIR/quote_system_$DATE.tar.gz /var/www/html/q

# Keep last 30 days
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
```

##  Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

##  Support

For issues or questions:
1. Check the logs: `/logs/error.log`
2. Verify all configurations
3. Test API endpoints with Postman
4. Check browser console for errors

##  License

This project is provided as-is for commercial use.

##  Roadmap

Future features:
- Email notification system
- Invoice generation
- Multiple language support
- Mobile app
- Payment gateway integration
- Advanced reporting
- Automatic quote reminders
- Customer portal

##  Security Checklist

Before deploying to production:
- [ ] Change admin credentials
- [ ] Update SECRET_KEY in config.php
- [ ] Update JWT_SECRET in config.php
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Set up regular backups
- [ ] Review database permissions
- [ ] Disable debug mode in production
- [ ] Monitor error logs regularly
- [ ] Keep PHP and MySQL updated

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Author**: Soy
