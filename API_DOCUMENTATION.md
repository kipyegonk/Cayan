# QuoteSystem API Documentation

Complete REST API reference for QuoteSystem.

## 📡 Base URL
```
http://localhost/q/api
```

## 🔐 Authentication

All endpoints (except auth) require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### JWT Token Format
- **Issuer**: QuoteSystem
- **Algorithm**: HS256
- **Expiration**: 7 days
- **Claims**: user_id, email, role

## 📡 Response Format

All responses are JSON:

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "error": "Error message",
  "success": false
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Server Error

## 🔑 Authentication Endpoints

### POST /auth/login
User login with email and password.

**Request:**
```json
{
  "email": "admin@company.com",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "uuid-here",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "admin"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! An administrator will verify your account"
}
```

### GET /auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (Valid):**
```json
{
  "valid": true,
  "user": {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "admin",
    "iat": 1629760000,
    "exp": 1630364800
  }
}
```

**Response (Invalid):**
```json
{
  "valid": false
}
```

## 👥 Users Endpoints (Admin Only)

### GET /users
Get all users.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@company.com",
    "role": "admin",
    "verified": true,
    "created_at": "2024-01-15 10:30:00"
  }
]
```

### POST /users
Create a new user (Admin only).

**Request:**
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "temp123",
  "role": "user",
  "verified": false
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-of-new-user"
}
```

### PUT /users/{id}
Update user details.

**Request:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "role": "admin",
  "verified": true
}
```

**Response:**
```json
{
  "success": true
}
```

### DELETE /users/{id}
Delete a user.

**Response:**
```json
{
  "success": true
}
```

## 🏢 Company Settings Endpoints

### GET /company
Get company settings.

**Response:**
```json
{
  "id": 1,
  "name": "My Company",
  "email": "company@example.com",
  "phone": "+254 20 123 4567",
  "address": "123 Business St\nNairobi",
  "vat": "P001234567A",
  "currency": "KES",
  "logo": "data:image/png;base64,...",
  "terms": "Payment is due within 30 days...",
  "bank_details": "Bank: ABC Bank\nAccount: 123456789"
}
```

### POST /company
Save/update company settings.

**Request:**
```json
{
  "name": "My Company",
  "email": "info@company.com",
  "phone": "+254 20 123 4567",
  "address": "123 Business St\nNairobi",
  "vat": "P001234567A",
  "currency": "KES",
  "logo": "data:image/png;base64,...",
  "terms": "Payment terms...",
  "bank_details": "Bank details..."
}
```

**Response:**
```json
{
  "success": true
}
```

## 📦 Catalog Endpoints

### GET /catalog
Get all catalog items.

**Query Parameters:**
- `search`: Search by name

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Professional Consultation",
    "category": "Services",
    "description": "Expert advisory services",
    "cost_price": 5000.00,
    "margin": 30,
    "unit": "hr",
    "created_at": "2024-01-15 10:30:00"
  }
]
```

### GET /catalog/{id}
Get single catalog item.

**Response:**
```json
{
  "id": "uuid",
  "name": "Professional Consultation",
  "category": "Services",
  "description": "Expert advisory services",
  "cost_price": 5000.00,
  "margin": 30,
  "unit": "hr"
}
```

### POST /catalog
Create new catalog item.

**Request:**
```json
{
  "name": "Professional Consultation",
  "category": "Services",
  "description": "Expert advisory services",
  "cost_price": 5000.00,
  "margin": 30,
  "unit": "hr"
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-of-item"
}
```

### PUT /catalog/{id}
Update catalog item.

**Request:**
```json
{
  "name": "Updated Name",
  "category": "Services",
  "description": "Updated description",
  "cost_price": 6000.00,
  "margin": 35,
  "unit": "day"
}
```

**Response:**
```json
{
  "success": true
}
```

### DELETE /catalog/{id}
Delete catalog item.

**Response:**
```json
{
  "success": true
}
```

## 👤 Clients Endpoints

### GET /clients
Get all clients.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corporation",
    "company": "ACME Ltd",
    "email": "contact@acme.com",
    "phone": "+254 20 123 4567",
    "address": "123 Corporate Ave",
    "vat": "P001234567A",
    "contact_person": "John Smith",
    "created_at": "2024-01-15 10:30:00"
  }
]
```

### GET /clients/{id}
Get single client.

**Response:** (Same as GET /clients item)

### POST /clients
Create new client.

**Request:**
```json
{
  "name": "Acme Corporation",
  "company": "ACME Ltd",
  "email": "contact@acme.com",
  "phone": "+254 20 123 4567",
  "address": "123 Corporate Ave",
  "vat": "P001234567A",
  "contact_person": "John Smith"
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-of-client"
}
```

### PUT /clients/{id}
Update client.

**Request:** (Same fields as POST)

**Response:**
```json
{
  "success": true
}
```

### DELETE /clients/{id}
Delete client.

**Response:**
```json
{
  "success": true
}
```

## 📄 Quotes Endpoints

### GET /quotes
Get all quotes.

**Response:**
```json
[
  {
    "id": "uuid",
    "number": "QT-2024-1001",
    "client_id": "uuid",
    "client_name": "Acme Corporation",
    "client_company": "ACME Ltd",
    "quote_date": "2024-01-15",
    "valid_days": 30,
    "valid_until": "2024-02-14",
    "subtotal": 50000.00,
    "vat_rate": 16,
    "vat_amount": 8000.00,
    "total": 58000.00,
    "include_vat": true,
    "status": "pending",
    "notes": "Special discount included",
    "created_at": "2024-01-15 10:30:00"
  }
]
```

### GET /quotes/{id}
Get single quote with items.

**Response:**
```json
{
  "id": "uuid",
  "number": "QT-2024-1001",
  "client_id": "uuid",
  "client_name": "Acme Corporation",
  "client_company": "ACME Ltd",
  "quote_date": "2024-01-15",
  "valid_days": 30,
  "valid_until": "2024-02-14",
  "subtotal": 50000.00,
  "vat_rate": 16,
  "vat_amount": 8000.00,
  "total": 58000.00,
  "include_vat": true,
  "status": "pending",
  "notes": "Special discount included",
  "items": [
    {
      "id": "uuid",
      "name": "Professional Consultation",
      "description": "Expert advisory",
      "quantity": 10,
      "unit": "hr",
      "unit_price": 5000.00,
      "margin": 30
    }
  ]
}
```

### POST /quotes
Create new quote.

**Request:**
```json
{
  "client_id": "uuid",
  "client_name": "Acme Corporation",
  "client_company": "ACME Ltd",
  "quote_date": "2024-01-15",
  "valid_days": 30,
  "valid_until": "2024-02-14",
  "subtotal": 50000.00,
  "vat_rate": 16,
  "vat_amount": 8000.00,
  "total": 58000.00,
  "include_vat": true,
  "status": "draft",
  "notes": "Special discount",
  "items": [
    {
      "name": "Professional Consultation",
      "description": "Expert advisory",
      "quantity": 10,
      "unit": "hr",
      "unit_price": 5000.00,
      "margin": 30
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid-of-quote",
  "number": "QT-2024-1001"
}
```

### PUT /quotes/{id}
Update quote.

**Request:** (Same as POST)

**Response:**
```json
{
  "success": true
}
```

### DELETE /quotes/{id}
Delete quote.

**Response:**
```json
{
  "success": true
}
```

## 📊 Statistics Endpoints

### GET /stats
Get dashboard statistics.

**Response:**
```json
{
  "total_quotes": 45,
  "total_value": 2350000.50,
  "pending": 8,
  "accepted": 25,
  "clients": 15
}
```

## 🔄 Common Workflows

### Workflow 1: User Login
1. POST /auth/login
2. Receive token and user data
3. Store token in localStorage
4. Send token in Authorization header for all requests

### Workflow 2: Create Quote
1. GET /clients (get client list)
2. GET /catalog (get items)
3. POST /quotes (create quote with items)
4. PUT /quotes/{id} (update if needed)

### Workflow 3: Manage Catalog
1. GET /catalog (view items)
2. POST /catalog (add new item)
3. PUT /catalog/{id} (update item)
4. DELETE /catalog/{id} (remove item)

## 🛠️ Example Requests

### Login with curl
```bash
curl -X POST http://localhost/q/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

### Get all clients with token
```bash
curl -X GET http://localhost/q/api/clients \
  -H "Authorization: Bearer <your-token>"
```

### Create new catalog item
```bash
curl -X POST http://localhost/q/api/catalog \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "New Item",
    "category": "Services",
    "description": "Item description",
    "cost_price": 1000.00,
    "margin": 25,
    "unit": "unit"
  }'
```

## 📝 Rate Limiting

Currently no rate limiting is enforced. For production, implement:

```php
// Add to config.php
define('RATE_LIMIT_ENABLED', true);
define('RATE_LIMIT_REQUESTS', 100); // per minute
define('RATE_LIMIT_WINDOW', 60); // seconds
```

## 🔐 Security Notes

- All passwords are hashed with bcrypt
- JWT tokens expire after 7 days
- Tokens use HS256 signing algorithm
- All user inputs are validated
- Prepared statements prevent SQL injection
- Error messages don't expose sensitive data

---

**API Version**: 1.0.0  
**Last Updated**: 2024
