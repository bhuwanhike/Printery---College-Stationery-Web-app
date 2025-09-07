# 🖨️ Printery---College-Stationery-Web-app

Printery is a full-stack MERN web application designed to simplify the process of file uploading, printing, and order management.

🚀 Built with **MongoDB, Express, React, and Node.js (MERN)**

---

## 📌 Features

### 👤 User Features

- 📂 Upload and preview files before printing
- 🛒 Place and manage print orders
- 📊 Track order progress (pending, in-progress, completed)
- 💳 Secure payments - Not implemented yet
- 🔍 Search & filter files or orders
- 🌐 Fully responsive design

### 🛠️ Admin Features

- 🗂️ Manage orders (approve/reject/process)
- 👥 Manage users
- 📈 View analytics dashboard

---

## 🛠️ Tech Stack

- **Frontend:** React.js
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Authentication:** JWT
- **Payments:** Razorpay - Not implemented yet
- **Deployment:** Render

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js & npm installed
- MongoDB (local or Atlas)

### Steps

1. Clone repository:

   ```bash
   git clone https://github.com/bhuwanhike/Printery---College-Stationery-Web-app.git

   cd printery

   ```

2. Install dependencies:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env

   ```

   🔹 Backend (backend/.env)

   ```bash
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_url
   CORS_ORIGIN=http://localhost:5173
   ```

🔹 Frontend (frontend/.env)

    ```bash
    VITE_BACKEND_URL=http://localhost:3000
    ```

4. Start development servers:

   ```bash
   cd backend
   npm run dev
   cd ../frontend
   npm run dev
   ```

5. Open in browser:
   ```bash
   http://localhost:3000
   ```
