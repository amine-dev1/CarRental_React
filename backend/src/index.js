import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import hpp from "hpp";

dotenv.config(); // Loaded

// 1. Validate Env before anything else
import { validateEnv } from "./lib/validateEnv.js";
validateEnv();

import { securityHeaders } from "./middleware/securityHeaders.js";
import { corsConfig } from "./middleware/corsConfig.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger, stream } from "./lib/logger.js";
import { AppError } from "./lib/AppError.js";

import authRoutes from "./routes/auth.js";
import customersRoutes from "./routes/customers.js";
import vehiclesRoutes from "./routes/vehicles.js";
import rentalsRoutes from "./routes/rentals.js";
import superadminRoutes from "./routes/superadmin.js";
import companyRoutes from "./routes/company.js";
import demoRoutes from "./routes/demo.js";
import reclamationsRoutes from "./routes/reclamations.js";
import paymentsRoutes from "./routes/payments.js";
import agencesRoutes from "./routes/agences.js";
import reservationsRoutes from "./routes/reservations.js";
import uploadRoutes from "./routes/upload.js";
import profileRoutes from "./routes/profile.js";
import categoriesRoutes from "./routes/categories.js";
import rolesRoutes from "./routes/roles.js";
import teamRoutes from "./routes/team.js";
import pricingRoutes from "./routes/pricing.js";
import contractsRoutes from "./routes/contracts.js";
import templatesRoutes from "./routes/templates.js";
import { fileURLToPath } from "url";
import path from "path";

const app = express();

// 2. Trust proxy for Nginx/Heroku/Fly.io
app.set('trust proxy', 1);

// 3. Security Headers (Helmet + CSP)
app.use(securityHeaders);

// 4. CORS configuration
app.use(corsConfig());

// 5. Stripe Webhook (must be parsed as raw before express.json)
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

// Serve static uploaded files
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 6. Body parsers with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// 7. Prevent HTTP Parameter Pollution
app.use(hpp());

// 8. HTTP Request Logging (piped to Winston)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev", { stream }));

// Health check (no rate limit needed)
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("Car Rental API is running securely"));

// 9. Global API Rate Limiter
// Note: Specific limiters (authLimiter, slowDownLimiter, etc.) are applied in their respective route files.
app.use("/api", apiLimiter);

// 10. Routes
app.use("/api/auth", authRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/customers", customersRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/rentals", rentalsRoutes);
app.use("/api/reclamations", reclamationsRoutes);
app.use("/api/demo", demoRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/agences", agencesRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/contracts", contractsRoutes);
app.use("/api/templates", templatesRoutes);

// 11. 404 Handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// 12. Global Error Handler
app.use(errorHandler);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  logger.info(`✅ API running securely on port ${port}`);
});