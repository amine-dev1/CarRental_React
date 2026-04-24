import { logger } from "../lib/logger.js";

export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "production") {
    // Production: Don't leak stack traces
    if (err.isOperational) {
      // Operational error: trusted error, send message to client
      return res.status(err.statusCode).json({
        status: err.status,
        error: err.message,
      });
    } else {
      // Programmer or unknown error: don't leak details
      logger.error(`[UNEXPECTED ERROR] ${err.message}`, { stack: err.stack });
      return res.status(500).json({
        status: "error",
        error: "Internal server error",
      });
    }
  } else {
    // Development: Send full stack trace
    return res.status(err.statusCode).json({
      status: err.status,
      error: err.message,
      stack: err.stack,
    });
  }
};
