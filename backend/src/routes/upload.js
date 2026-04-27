import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";

const r = Router();
r.use(requireAuth);
r.use(requireRole("superadmin", "director", "manager", "agent"));

// Ensure uploads directory exists
const vehiclesDir = path.resolve("uploads/vehicles");
const enterprisesDir = path.resolve("uploads/enterprises");

if (!fs.existsSync(vehiclesDir)) fs.mkdirSync(vehiclesDir, { recursive: true });
if (!fs.existsSync(enterprisesDir)) fs.mkdirSync(enterprisesDir, { recursive: true });

const vehicleStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, vehiclesDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `vehicle_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, uniqueName);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed"), false);
    }
};

const uploadVehicle = multer({
    storage: vehicleStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

const enterpriseStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, enterprisesDir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `enterprise_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, uniqueName);
    },
});

const uploadEnterprise = multer({
    storage: enterpriseStorage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// POST /api/upload/vehicle-photo
r.post("/vehicle-photo", uploadVehicle.single("photo"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded or invalid file type." });
    }
    const url = `/uploads/vehicles/${req.file.filename}`;
    res.json({ url });
});

// POST /api/upload/enterprise-logo
r.post("/enterprise-logo", uploadEnterprise.single("logo"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded or invalid file type." });
    }
    const url = `/uploads/enterprises/${req.file.filename}`;
    res.json({ url });
});

export default r;
