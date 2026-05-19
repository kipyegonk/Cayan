# QuoteSystem PHP - Setup Guide

A comprehensive setup guide for deploying QuoteSystem PHP with database backend.

## 🚀 Quick Start (5 minutes)

### 1. Extract Files
```bash
unzip quote-system.zip
cd q
```

### 2. Create Database
```sql
CREATE DATABASE quote_system;
CREATE USER 'quote_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON quote_system.* TO 'quote_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Update Configuration
Edit `config.php`:
```php
define('DB_USER', 'quote_user');
define('DB_PASS', 'password123');
define('DB_NAME', 'quote_system');
define('JWT_SECRET', 'change-this-to-random-string');
define('SECRET_KEY', 'change-this-to-random-string');
```

### 4. Set Permissions
```bash
mkdir -p uploads logs
chmod 755 api classes uploads logs
chmod 777 uploads logs
```

### 5. Access Application
```
http://localhost/q/
Default: admin@company.com / admin123
```

## 📋 File Structure

```
q/
├── index.html              # Frontend SPA
├── config.php              # Configuration file
├── .htaccess              # Apache routing rules
├── api/
│   └── index.php          # REST API router
├── classes/
│   ├── Database.php       # Database abstraction layer
│   └── Auth.php           # Authentication & JWT
├── uploads/               # Logo and file uploads
├── logs/                  # Application error logs
└── README.md              # Full documentation
```

## 🔧 Server Requirements

### Minimum
- PHP 7.4
- MySQL 5.7
- 256MB RAM
- 100MB disk space

### Recommended
- PHP 8.0+
- MySQL 8.0+
- 512MB RAM
- 1GB disk space
- SSD storage

### PHP Extensions Required
- mysqli (MySQL support)
- json (JSON support)
- openssl (JWT signing)
- gzip (Compression)
- fileinfo (File uploads)

Verify with:
```bash
php -m | grep -E 'mysqli|json|openssl'
```

## 🔐 Security Configuration

### Step 1: Generate Secret Keys
```php
// Generate random keys
echo bin2hex(random_bytes(32)); // For SECRET_KEY and JWT_SECRET
```

### Step 2: Update config.php
```php
define('SECRET_KEY', 'generated-key-here');
define('JWT_SECRET', 'generated-jwt-key-here');
```

### Step 3: Set File Permissions
```bash
# Set correct ownership (if needed)
sudo chown -R www-data:www-data /var/www/html/q

# Set directories
chmod 755 /var/www/html/q
chmod 755 /var/www/html/q/api
chmod 755 /var/www/html/q/classes
chmod 755 /var/www/html/q/logs
chmod 777 /var/www/html/q/uploads

# Set files
chmod 644 /var/www/html/q/*.php
chmod 644 /var/www/html/q/*.html
chmod 644 /var/www/html/q/.htaccess
```

### Step 4: Configure HTTPS
```apache
# In your Apache vhost:
<VirtualHost *:443>
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    DocumentRoot /var/www/html/q
    <Directory /var/www/html/q>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName example.com
    Redirect permanent / https://example.com/
</VirtualHost>
```

## 📦 Folder Permissions Reference

| Path | Permission | Owner | Purpose |
|------|-----------|-------|---------|
| `/q` | 755 | www-data | Application root |
| `/q/api` | 755 | www-data | API endpoints |
| `/q/classes` | 755 | www-data | Core classes |
| `/q/uploads` | 777 | www-data | User files |
| `/q/logs` | 777 | www-data | Error logs |
| `*.php` | 644 | www-data | PHP files |
| `.htaccess` | 644 | www-data | Apache config |

## 🔄 Database Initialization

The database tables are automatically created on first access to the API. However, you can manually initialize by:

1. Opening developer console in browser
2. Making a GET request to `/q/api/auth/verify`
3. Or running this script:

```php
<?php
require_once 'config.php';
require_once 'classes/Database.php';

$db = new Database();
$db->createTables();

echo "Tables created successfully!";
?>
```

## 🧪 Testing the Setup

### 1. Test Database Connection
```bash
# SSH into server
ssh user@server.com

# Test MySQL connection
mysql -h localhost -u quote_user -p quote_system
# Type password: password123

# If successful, you'll see: mysql>
# Type: exit
```

### 2. Test API Endpoints
Using curl or Postman:

```bash
# Test login endpoint
curl -X POST http://localhost/q/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'

# Expected response:
# {"success":true,"token":"jwt-token-here","user":{...}}
```

### 3. Test Frontend Access
```bash
# In browser developer console:
fetch('/q/api/stats').then(r => r.json()).then(console.log)

# Should return statistics JSON
```

## 📱 Deployment Checklist

### Before Going Live

- [ ] Change default admin password
- [ ] Update SECRET_KEY in config.php
- [ ] Update JWT_SECRET in config.php
- [ ] Enable HTTPS/SSL
- [ ] Set up automatic backups
- [ ] Configure firewall rules
- [ ] Enable error logging
- [ ] Disable PHP error display
- [ ] Set up monitoring
- [ ] Test all features
- [ ] Test on mobile devices
- [ ] Create admin backup user
- [ ] Document any customizations
- [ ] Test database restore process

## 🆘 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify credentials in config.php
2. Check MySQL is running: `sudo service mysql status`
3. Test connection: `mysql -u quote_user -p quote_system`
4. Check file permissions on logs directory
5. Review `/logs/error.log`

### Issue: "API returns 404"

**Solution:**
1. Verify .htaccess exists and is readable
2. Check mod_rewrite is enabled:
   ```bash
   sudo a2enmod rewrite
   sudo systemctl restart apache2
   ```
3. Check AllowOverride in Apache vhost:
   ```apache
   <Directory /var/www/html/q>
       AllowOverride All
   </Directory>
   ```

### Issue: "Cannot upload files"

**Solution:**
1. Check `/uploads` is writable: `ls -ld uploads`
2. Check permissions: `chmod 777 uploads`
3. Check PHP configuration:
   ```bash
   php -i | grep upload
   ```
4. Verify file size limit in php.ini:
   ```
   upload_max_filesize = 10M
   post_max_size = 10M
   ```

### Issue: "Login not working"

**Solution:**
1. Clear browser cache: Ctrl+Shift+Delete
2. Check localStorage: Open DevTools → Application → LocalStorage
3. Verify JWT_SECRET matches between requests
4. Check token expiration in Auth.php (7 days)
5. Verify database has users table

## 🔍 Monitoring & Maintenance

### Daily Tasks
- [ ] Check error logs
- [ ] Verify backups completed
- [ ] Monitor disk space
- [ ] Check API response times

### Weekly Tasks
- [ ] Review user activity
- [ ] Verify all features working
- [ ] Check security logs
- [ ] Update PHP/MySQL if patches available

### Monthly Tasks
- [ ] Full database backup
- [ ] Security audit
- [ ] Performance optimization
- [ ] User account cleanup

## 📊 Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for common queries
ALTER TABLE quotes ADD INDEX idx_client (client_id);
ALTER TABLE quotes ADD INDEX idx_status (status);
ALTER TABLE quotes ADD INDEX idx_date (quote_date);

-- Optimize tables
OPTIMIZE TABLE users;
OPTIMIZE TABLE quotes;
OPTIMIZE TABLE catalog;
OPTIMIZE TABLE clients;
```

### 2. Enable Caching Headers
Already configured in .htaccess:
- Static assets: 1 month cache
- CSS/JS: 1 month cache
- HTML: 2 hours cache
- Default: 2 days cache

### 3. Enable Compression
Already configured in .htaccess via gzip

### 4. Database Maintenance
```bash
# Schedule this weekly
mysql -u quote_user -p quote_system -e "OPTIMIZE TABLE quotes; OPTIMIZE TABLE clients; OPTIMIZE TABLE users;"
```

## 🔐 Backup Strategy

### Automated Daily Backup Script

Create `/usr/local/bin/backup-quote-system.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/backups/quote-system"
DB_NAME="quote_system"
DB_USER="quote_user"
DB_PASS="password123"
DATE=$(date +%Y-%m-%d_%H-%M-%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/html/q/uploads

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

# Log the backup
echo "[$(date)] Backup completed" >> /var/log/quote-system-backup.log
```

Make executable and add to crontab:
```bash
chmod +x /usr/local/bin/backup-quote-system.sh

# Run daily at 2 AM
crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-quote-system.sh
```

## 📞 Support Resources

- PHP Manual: https://www.php.net/manual/
- MySQL Manual: https://dev.mysql.com/doc/
- Apache Documentation: https://httpd.apache.org/docs/
- JWT Information: https://jwt.io/

## 🎓 Learning Path

1. **Basics**: Understand the project structure
2. **Database**: Learn the schema and relationships
3. **API**: Study the REST endpoints
4. **Frontend**: Understand the JavaScript app
5. **Security**: Review authentication flow
6. **Deployment**: Practice on test server
7. **Maintenance**: Learn backup and monitoring

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Support**: Check logs/error.log for issues
