import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config(); // Loaded

import authRoutes from "./routes/auth.js";
import customersRoutes from "./routes/customers.js";
import vehiclesRoutes from "./routes/vehicles.js";
import rentalsRoutes from "./routes/rentals.js";
import superadminRoutes from "./routes/superadmin.js";
import companyRoutes from "./routes/company.js";

const app = express();

app.use(helmet());
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

    // allow localhost
    if (origin.startsWith("http://localhost")) {
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

app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/rentals", rentalsRoutes);

const port = process.env.PORT || 4000;

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ API running on port ${port}`);
});
