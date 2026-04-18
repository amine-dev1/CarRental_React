import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
dotenv.config(); // Loaded

import authRoutes from "./routes/auth.js";
import customersRoutes from "./routes/customers.js";
import vehiclesRoutes from "./routes/vehicles.js";
import rentalsRoutes from "./routes/rentals.js";
import superadminRoutes from "./routes/superadmin.js";
import companyRoutes from "./routes/company.js";
import demoRoutes from "./routes/demo.js";
import reclamationsRoutes from "./routes/reclamations.js";
import paymentsRoutes from "./routes/payments.js";

const app = express();

// Configuration du Rate Limiter (protection anti-DDoS basique)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limite à 200 requêtes par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes depuis cette adresse IP, veuillez réessayer après 15 minutes." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limite stricte pour l'authentification
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives, veuillez réessayer après 15 minutes." }
});

app.use(apiLimiter);
app.use(helmet());
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(morgan("dev"));
const allowedOrigins = [
  "http://localhost:5173",
  "https://car-rental-react-seven.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // allow localhost or local IP
    if (origin.startsWith("http://localhost") || origin.startsWith("http://192.168")) {
      return callback(null, true);
    }

    // allow ALL vercel preview domains
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // explicit allowlist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed: " + origin));
  },
  credentials: true
}));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("Car Rental API is running"));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/rentals", rentalsRoutes);
app.use("/api/reclamations", reclamationsRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/payments", paymentsRoutes);

const port = process.env.PORT || 4000;

// production  app.listen(port,'0.0.0.0',() => {
//   console.log(`✅ API running on port ${port}`);
// });
app.listen(port,() => {
console.log(`✅ API running on port ${port}`)});