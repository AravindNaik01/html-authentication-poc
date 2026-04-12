# MERN Stack Authentication System with MySQL

> **Assignment:** MERN Stack Authentication & CRUD with MySQL  
> **Institution:** CampusPe  
> **Mentor:** Jacob Dennis  
> **Tech Stack:** MySQL · Express.js · React.js · Node.js  

---

## 📋 Project Overview

A production-ready full-stack web application featuring:
- 🔐 **JWT-based Authentication** — Register, Login, Forgot/Reset Password
- 📊 **Dashboard with CRUD** — Create, Read, Update, Delete items
- 🛡️ **Security** — bcrypt password hashing, parameterized SQL queries (SQL injection prevention)
- 🎨 **Modern UI** — React + Tailwind CSS with glassmorphism design

---

## 🗂️ Project Structure

```
mern-mysql-auth-crud/
├── backend/
│   ├── config/db.js              # MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Forgot/Reset Password
│   │   └── itemController.js     # CRUD + Stats
│   ├── middleware/
│   │   ├── auth.js               # JWT verification middleware
│   │   └── errorHandler.js       # Global error handler
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   └── itemRoutes.js         # /api/items/*
│   ├── .env                      # Environment variables (DO NOT COMMIT)
│   ├── .env.example
│   ├── server.js                 # Express entry point
│   └── package.json
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── axios.js          # Axios instance + interceptors
│       │   ├── authApi.js        # Auth API calls
│       │   └── itemApi.js        # Items API calls
│       ├── context/
│       │   └── AuthContext.jsx   # Global auth state (Context API)
│       ├── components/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── ResetPassword.jsx
│       │   ├── Dashboard.jsx
│       │   ├── ProtectedRoute.jsx
│       │   └── PublicRoute.jsx
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
├── database.sql                  # Complete MySQL schema
└── README.md
```

---

## 🗄️ MySQL Database Setup

### 1. Start MySQL Server

**Option A — Windows Services (run as Administrator):**
```powershell
net start MYSQL80
```

**Option B — Via MySQL Workbench:** Open MySQL Workbench → Start the local connection.

**Option C — XAMPP:** Start Apache & MySQL from XAMPP Control Panel.

### 2. Create Database & Tables

```bash
# Using MySQL CLI
mysql -u root -p < database.sql

# Or run manually in MySQL Workbench / phpMyAdmin:
```

```sql
CREATE DATABASE IF NOT EXISTS mern_auth_db;
USE mern_auth_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_reset_token (reset_token)
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('active', 'pending', 'completed') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

### 3. Verify Tables
```sql
USE mern_auth_db;
SHOW TABLES;
DESCRIBE users;
DESCRIBE items;
```

---

## ⚙️ Backend Setup

```bash
cd backend

# Install dependencies (already done)
npm install

# Configure environment variables
# Edit .env and set your MySQL password:
# DB_PASSWORD=your_mysql_password

# Start development server
npm run dev
```

The backend runs on **http://localhost:5000**

### Environment Variables (`.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(your password)* |
| `DB_NAME` | Database name | `mern_auth_db` |
| `JWT_SECRET` | JWT signing secret | *(change this!)* |
| `JWT_EXPIRE` | Token expiry | `7d` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email address | *(your email)* |
| `EMAIL_PASS` | App password | *(Gmail app password)* |
| `CLIENT_URL` | Frontend URL | `http://localhost:5173` |

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## 🚀 Running Both Projects

Open **two terminal windows**:

**Terminal 1 — Backend:**
```bash
cd mern-mysql-auth-crud/backend
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd mern-mysql-auth-crud/frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 📡 API Endpoint Documentation

### Base URL: `http://localhost:5000/api`

#### Auth Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login & get JWT |
| `POST` | `/auth/forgot-password` | Public | Send reset email |
| `POST` | `/auth/reset-password` | Public | Reset password with token |
| `GET` | `/auth/me` | 🔒 Protected | Get current user |

#### Items Endpoints (all protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/items` | Get all user items |
| `GET` | `/items/:id` | Get single item |
| `POST` | `/items` | Create new item |
| `PUT` | `/items/:id` | Update item |
| `DELETE` | `/items/:id` | Delete item |
| `GET` | `/items/stats` | Get dashboard statistics |

#### Example Requests

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Create Item (with Authorization header):**
```json
POST /api/items
Authorization: Bearer <token>
{
  "title": "My Task",
  "description": "Task description",
  "status": "active"
}
```

---

## 🛡️ Security Features

- ✅ **Parameterized SQL queries** — prevents SQL injection
- ✅ **bcryptjs password hashing** (salt rounds: 10)
- ✅ **JWT tokens** with configurable expiry
- ✅ **Reset tokens** — SHA-256 hashed before DB storage
- ✅ **Connection pooling** — efficient DB resource management
- ✅ **CORS** configured for frontend origin only
- ✅ **Input validation** on both frontend and backend

---

## 📸 Screenshots

See the `screenshots/` folder for:
- Login page
- Registration page
- Dashboard with items
- Add/Edit item modal
- Delete confirmation dialog
- MySQL Workbench showing tables

---

## 🔧 Troubleshooting

**MySQL connection error:**
1. Ensure MySQL service is running (`net start MYSQL80` as admin)
2. Verify `DB_PASSWORD` in `.env` matches your MySQL root password
3. Check database exists: `mysql -u root -p -e "SHOW DATABASES;"`

**Frontend won't start:**
```bash
cd frontend && npm install && npm run dev
```

**Backend won't start:**
```bash
cd backend && npm install && npm run dev
```

**CORS errors:** Ensure `CLIENT_URL=http://localhost:5173` in backend `.env`

---

## 📤 Exporting Database Schema

```bash
mysqldump -u root -p --no-data mern_auth_db > database.sql
```

---

*Built for CampusPe Full Stack Development Assignment 2026*
