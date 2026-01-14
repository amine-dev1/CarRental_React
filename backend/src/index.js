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
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://car-rental-react-git-main-amine-dev1s-projects.vercel.app/"
  ],
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
