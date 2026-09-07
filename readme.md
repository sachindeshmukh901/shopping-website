# ORGOS – Garment Management System

ORGOS is a full-stack **Garment Management System** designed to manage garment products, vendors, users, inventory, and AI-powered assistance through a centralized platform.

The system is divided into three major modules:

* **Admin** – Manage users, vendors, products, and overall system activities.
* **Vendor** – Manage products, inventory, and vendor-related activities.
* **User** – Browse products, generate outfits, and interact with the AI chatbot.

The **User module** contains separate **Frontend** and **Backend** applications.

---

## 📌 Modules

### 👨‍💼 Admin

The Admin module provides complete control over the platform.

* Manage users
* Manage vendors
* Manage products
* Monitor system activities
* Manage platform-level operations

### 🏪 Vendor

The Vendor module allows vendors to manage their products and inventory.

* Add products
* Update products
* Delete products
* Manage inventory
* Manage vendor activities

### 👤 User

The User module provides the customer-facing functionality.

* Browse products
* View product details
* Generate outfits
* Interact with the AI chatbot
* Get product-related assistance

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication

### Database

* MySQL

### AI

* Google Gemini AI

---

# 🚀 Installation

## 1. Clone the Repository

```bash
git clone https://github.com/ritvikchandrikapure/ORGOS.git

cd ORGOS
```

---

## 2. Install Dependencies

### Admin

```bash
cd admin
npm install
```

### Vendor

```bash
cd ../vendor
npm install
```

### User Frontend

```bash
cd ../user/frontend
npm install
```

### User Backend

```bash
cd ../user/backend
npm install
```

---

# 🔐 Environment Variables

The backend applications require environment variables for database configuration, authentication, and the AI chatbot.

**Do not upload your `.env` file to GitHub.**

## 1. Create the `.env` file

Inside the required backend directory, create a file named:

```text
.env
```

Add the following configuration:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=orgos_db

JWT_SECRET=your_jwt_secret

# Optional: Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key
```

### Environment Variables Explained

| Variable         | Description                            |
| ---------------- | -------------------------------------- |
| `PORT`           | Port on which the backend server runs  |
| `DB_HOST`        | MySQL database host                    |
| `DB_PORT`        | MySQL database port                    |
| `DB_USER`        | MySQL username                         |
| `DB_PASSWORD`    | MySQL password                         |
| `DB_NAME`        | MySQL database name                    |
| `JWT_SECRET`     | Secret key used for JWT authentication |
| `GEMINI_API_KEY` | Optional Google Gemini API key         |

---

# 🤖 Google Gemini AI Setup

The Gemini API key is **optional**.

You can generate a free Gemini API key from:

https://aistudio.google.com/app/apikey

No credit card is required to obtain the API key.

Add your key to the `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
```

If you don't provide a Gemini API key, the application can use the built-in **rule-based chatbot**.

The chatbot uses live data fetched from the application's database. The Gemini API key is used to provide more natural conversations and better handling of follow-up questions.

> **Important:** Never commit or upload your `.env` file, database password, JWT secret, or API key to GitHub.

---

# 🗄️ Database Setup

ORGOS uses **MySQL** as its database.

Make sure MySQL is installed and running on your system.

Create a database named:

```sql
CREATE DATABASE orgos_db;
```

Then configure your database credentials in the `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=orgos_db
```

Make sure the database credentials match your local MySQL configuration.

---

# ▶️ Running the Project

Each module needs to be run separately.

## Admin

Open a terminal:

```bash
cd admin
npm run dev
```

---

## Vendor

Open another terminal:

```bash
cd vendor
npm run dev
```

---

## User Frontend

Open another terminal:

```bash
cd user/frontend
npm run dev
```

---

## User Backend

Open another terminal:

```bash
cd user/backend
npm run dev
```

After starting the applications, open the frontend URL shown in the terminal.

---

# 📁 Project Structure

```text
ORGOS/
│
├── admin/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── vendor/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── user/
│   │
│   ├── frontend/
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   │
│   └── backend/
│       ├── src/
│       ├── package.json
│       ├── .env
│       └── ...
│
├── .gitignore
└── README.md
```

---

# 🔒 Security

For security reasons, sensitive configuration should never be committed to the repository.

Make sure your `.gitignore` contains:

```gitignore
.env
.env.*
!.env.example
```

You can optionally provide an `.env.example` file so other developers know which environment variables are required:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=orgos_db
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

---

# 📋 Requirements

Before running ORGOS, make sure you have installed:

* Node.js
* npm
* MySQL
* Git

---

# 👨‍💻 Development

ORGOS is developed using a modular architecture where Admin, Vendor, and User functionalities are separated into independent applications.

This structure makes the system easier to develop, maintain, and scale.

---

# 📄 License

This project is developed for educational and project purposes.
