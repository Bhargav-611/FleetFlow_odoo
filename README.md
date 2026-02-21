# 🚛 FleetFlow – Fleet & Logistics Management System (MERN)

FleetFlow is a modular fleet and logistics management system designed to replace manual logbooks with a centralized digital platform.

It provides:
- Trip management
- Route optimization
- Driver & vehicle management
- License expiry monitoring
- Maintenance reminders
- Email notifications
- SaaS monetization ready architecture

---

# 🛠️ Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router
- Leaflet (Maps)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

### Third-Party Integrations
- OpenRouteService (Route & Distance API)
- SendGrid (Email Notifications)

---

# 📂 Project Structure

fleetflow/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── jobs/
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── styles/
│
└── README.md

---

# 🚀 Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/fleetflow.git
cd fleetflow
```

---

# ⚙️ Backend Setup

## 📦 Install Dependencies

```bash
cd backend
npm install
```

## 🔐 Create `.env` File

Create `backend/.env`

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret

OPENROUTE_API_KEY=your_openroute_key
SENDGRID_API_KEY=your_sendgrid_key
EMAIL_FROM=fleetflow@yourdomain.com
```

## ▶️ Run Backend

```bash
npm run dev
```

Server runs on:
```
http://localhost:5000
```

---

# 💻 Frontend Setup

## 📦 Install Dependencies

```bash
cd frontend
npm install
```

## 🔐 Create `.env`

Create `frontend/.env`

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## ▶️ Run Frontend

```bash
npm run dev
```

Frontend runs on:
```
http://localhost:5173
```

---

# 🌍 Environment Variables Explained

| Variable | Description |
|----------|-------------|
| MONGO_URI | MongoDB connection string |
| JWT_SECRET | Secret key for authentication |
| OPENROUTE_API_KEY | API key for route calculation |
| SENDGRID_API_KEY | Email notification API key |
| EMAIL_FROM | Sender email address |

---

# 🗺️ Features Implemented

✔ Trip Creation  
✔ Route Distance & ETA Calculation  
✔ Cost Estimation  
✔ Interactive Map Display  
✔ Driver & Vehicle Management  
✔ License Expiry Alerts  
✔ Maintenance Reminders  
✔ Email Notifications  
✔ Trip Completion Workflow  

---

# 🧪 API Endpoints

### Auth
```
POST /api/auth/register
POST /api/auth/login
```

### Trips
```
POST   /api/trips
GET    /api/trips
GET    /api/trips/:id
PATCH  /api/trips/:id/complete
```

### Route Calculation
```
POST /api/routes/calculate
```

### Notifications
```
POST /api/notifications/email
```

---

# 🔄 License Expiry Automation

- Cron job runs daily
- Detects expiry within 7 days
- Sends reminder email
- Blocks expired drivers

---

# 📊 Future Roadmap

- Multi-stop route optimization
- Real-time GPS tracking
- Fleet analytics dashboard
- SaaS subscription model
- Payment integration
- Role-based access (Admin, Manager, Driver)

---

# 🛡️ Security Practices

- JWT authentication
- Password hashing (bcrypt)
- Environment variable protection
- API error handling
- Input validation

---

# 📦 Production Deployment

Backend:
- Render / AWS / DigitalOcean

Frontend:
- Vercel / Netlify

Database:
- MongoDB Atlas

---

# 👨‍💻 Developer

Bhargav Chalodiya  
MERN Stack Developer  

---

# 📄 License

MIT License

---

# ⭐ Support

If you like this project:
- Star the repo
- Fork it
- Contribute

---

# 🚀 FleetFlow – Smarter Fleet Management
