import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import slowDown from "express-slow-down";

// Smart key generator — user ID for authenticated, IP fallback for anonymous
const keyGenerator = (req, res) => {
  if (req.user && req.user.id) {
    return req.user.id.toString();
  }
  return ipKeyGenerator(req, res);
};

// 1. General API Limiter — in-memory store (Redis can be added later)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  message: { error: "Trop de requêtes, veuillez réessayer après 15 minutes." }
});

// 2. Strict Auth Limiter — skips successful requests (only penalizes failures)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  // Omit custom keyGenerator here; defaults to ipKeyGenerator securely
  skipSuccessfulRequests: true,
  message: { error: "Trop de tentatives d'authentification échouées. Veuillez réessayer après 1 heure." }
});

// 3. Slow-down Limiter — delays instead of hard-blocks (for search/filter routes)
export const slowDownLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 20,            // free requests before delay kicks in
  delayMs: (hits) => hits * 500, // +500ms per request above threshold
  keyGenerator,
});

// 4. Upload Limiter — hard block for file upload routes
export const uploadLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator,
  message: { error: "Limite de téléchargement atteinte. Veuillez réessayer après 30 minutes." }
});
