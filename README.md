# Rental Car Management System

A professional rental car management platform featuring a multi-tenant architecture, robust authentication, and enterprise fleet management.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. **Clone the repository**
2. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   ```
3. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

## 📦 Dependencies

### Frontend
Built with **React 19**, **Vite**, and **Tailwind CSS**.

| Package | Version | Description |
| :--- | :--- | :--- |
| `react` | ^19.2.0 | Core UI library |
| `react-router-dom` | ^7.12.0 | Routing and navigation |
| `lucide-react` | ^0.562.0 | Modern icon set |
| `react-hot-toast` | ^2.6.0 | Toast notifications |
| `tailwindcss` | ^4.1.18 | Utility-first CSS framework |
| `date-fns` | ^4.1.0 | Date manipulation |
| `clsx` & `tailwind-merge` | - | Utility for class management |

### Backend
Built with **Node.js**, **Express**, and **PostgreSQL**.

| Package | Version | Description |
| :--- | :--- | :--- |
| `express` | ^5.2.1 | Web framework |
| `pg` | ^8.16.3 | PostgreSQL client |
| `jsonwebtoken` | ^9.0.3 | JWT Authentication |
| `bcrypt` | ^6.0.0 | Password hashing |
| `zod` | ^4.3.5 | Schema validation |
| `nodemailer` | ^7.0.12 | Email notifications |
| `dotenv` | ^17.2.3 | Environment variables |
| `cors` & `helmet` | - | Security middleware |
| `morgan` | ^1.10.1 | HTTP request logger |

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Tokens) & Bcrypt

## 🏗️ Project Structure

```text
├── frontend/          # React frontend application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── layouts/    # Layout wrappers
│   │   ├── pages/      # Route pages
│   │   └── api/        # API communication services
└── backend/          # Node.js backend application
    ├── src/
    │   ├── routes/     # API routes
    │   ├── controllers/# Business logic
    │   └── db/         # Database configuration
```

## 📝 Scripts

### Frontend
- `npm run dev`: Starts Vite development server
- `npm run build`: Builds the application for production

### Backend
- `npm run dev`: Starts the server with Nodemon (auto-reload)
- `npm run start`: Starts the server in production mode
