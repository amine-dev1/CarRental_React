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
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/rentals", rentalsRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`✅ API running on :${port}`));
