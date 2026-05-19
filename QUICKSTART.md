# QuoteSystem - Quick Start Guide

Get started with QuoteSystem in 10 minutes!

## 📥 Installation

### Option 1: Using Apache (Recommended)

1. **Download and extract files**
```bash
cd /var/www/html
unzip quote-system.zip
cd q
mkdir -p uploads logs
```

2. **Create database**
```sql
CREATE DATABASE quote_system;
CREATE USER 'quote_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON quote_system.* TO 'quote_user'@'localhost';
FLUSH PRIVILEGES;
```

3. **Configure application**
- Edit `config.php`
- Update database credentials
- Change `SECRET_KEY` and `JWT_SECRET` to random values

4. **Set permissions**
```bash
chmod 755 api classes
chmod 777 uploads logs
chmod 644 config.php .htaccess
```

5. **Access**
```
http://localhost/q/
admin@company.com / admin123
```

### Option 2: Using Docker

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  php:
    image: php:8.0-apache
    ports:
      - "80:80"
    volumes:
      - .:/var/www/html
    environment:
      - PHP_DISPLAY_ERRORS=0

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: quote_system
      MYSQL_USER: quote_user
      MYSQL_PASSWORD: password123
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Run:
```bash
docker-compose up -d
```

## 🎯 First Steps

### Step 1: Login
- Open http://localhost/q/
- Email: `admin@company.com`
- Password: `admin123`

### Step 2: Change Password
1. Click user profile (top right)
2. Update password
3. Save changes

### Step 3: Configure Company
1. Go to Settings ⚙️
2. Enter company details:
   - Name
   - Email
   - Phone
   - Address
   - VAT Number
3. Upload logo
4. Set currency
5. Add payment terms
6. Save

### Step 4: Add Catalog Items
1. Go to Catalog 📦
2. Click "+ Add Item"
3. Enter details:
   - Name: "Professional Consultation"
   - Category: "Services"
   - Cost: 5000
   - Margin: 30%
   - Unit: "hour"
4. Click "Save Item"
5. Repeat for other items

### Step 5: Add Clients
1. Go to Clients 👥
2. Click "+ Add Client"
3. Enter details:
   - Contact Name: "John Doe"
   - Company: "ABC Corp"
   - Email: "john@abc.com"
   - Phone: "+254 20 123 4567"
4. Click "Save Client"

### Step 6: Create First Quote
1. Go to "New Quote" 📝
2. Select client
3. Click "+ From Catalog"
4. Select items to add
5. Adjust quantities and prices if needed
6. Review totals
7. Click "Save Quote"
8. Select status (pending/accepted)

### Step 7: Send Quote
1. Go to "All Quotes" 📄
2. Click "View" next to your quote
3. Click "Print / Export PDF"
4. Print or save as PDF
5. Share with client

## 🔧 Essential Configuration

### Change Admin Password
1. Login
2. Settings → Users (if admin)
3. Edit admin user
4. Set new password
5. Save

### Add New User
1. Go to Users 🔑
2. Click "+ Add User"
3. Fill details:
   - Name
   - Email
   - Password
   - Role (user/admin)
4. Check "Account Verified"
5. Click "Save User"

### Set Currency
1. Settings ⚙️
2. Select currency (KES, USD, EUR, etc.)
3. Save

### Customize VAT
1. When creating quote
2. Check "Include VAT"
3. Set rate (default 16%)
4. Or leave unchecked for no VAT

## 📋 Common Tasks

### Create Multiple Quotes
1. New Quote
2. Select client
3. Add items from catalog
4. Adjust as needed
5. Save

### Export Quote
1. All Quotes
2. View quote
3. Press Ctrl+P or Print button
4. Choose "Save as PDF"

### Search Quotes
1. All Quotes
2. Type in search box
3. Find by number or client name

### Update Quote Status
1. All Quotes
2. Click status dropdown
3. Change: draft → pending → accepted
4. Save

### Track Statistics
1. Dashboard
2. See total quotes value
3. View pending/accepted count
4. Monitor clients

## 🔐 Security Checklist

- [ ] Changed admin password
- [ ] Updated SECRET_KEY
- [ ] Updated JWT_SECRET
- [ ] Set proper file permissions
- [ ] Configured HTTPS (in production)
- [ ] Enabled error logging
- [ ] Set up regular backups

## 🐛 Troubleshooting

### Can't login
- Clear browser cache (Ctrl+Shift+Del)
- Check email and password
- Verify database is running
- Check error log

### Can't create quotes
- Verify you've added clients
- Check catalog items exist
- Verify database connection
- Check file permissions

### Quotes not saving
- Check file permissions on `/uploads`
- Verify database connection
- Review error logs
- Check available disk space

### Can't access at http://localhost/q/
- Verify Apache is running
- Check .htaccess exists
- Enable mod_rewrite: `sudo a2enmod rewrite`
- Restart Apache: `sudo systemctl restart apache2`

## 📞 Getting Help

1. Check error logs: `/logs/error.log`
2. Read API documentation: `API_DOCUMENTATION.md`
3. Review setup guide: `SETUP.md`
4. Check main README: `README.md`

## 🚀 Next Steps

- Customize quote templates
- Set up automated backups
- Create additional users
- Configure payment terms
- Set up company branding

## 📊 Dashboard Overview

The Dashboard shows:
- **Total Quotes**: Number of quotes created
- **Total Value**: Sum of all quote amounts
- **Pending**: Quotes awaiting client response
- **Accepted**: Quotes client agreed to
- **Clients**: Number of clients in system

## 💡 Pro Tips

1. **Use catalog for consistency** - Pre-set items maintain pricing
2. **Add margins to items** - Automatically calculate profit
3. **Template terms and conditions** - Set defaults in settings
4. **Create multiple users** - Separate admin and sales staff
5. **Regular backups** - Backup database weekly
6. **Monitor statistics** - Track business metrics on dashboard

## 🎓 Learning Resources

- Complete documentation in `README.md`
- API reference in `API_DOCUMENTATION.md`
- Setup details in `SETUP.md`
- Database schema in `README.md` under "Database Schema"

---

**Version**: 1.0.0  
**Need Help?**: See documentation files for detailed information
