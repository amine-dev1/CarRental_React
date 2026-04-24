import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

let redisClient = null;

if (redisUrl) {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1, // Don't hang indefinitely if Redis is down
    retryStrategy(times) {
      if (times > 3) {
        console.warn("⚠️ Redis connection failed. Falling back to in-memory store for rate limiting.");
        return null; // Stop retrying
      }
      return Math.min(times * 50, 2000);
    }
  });

  redisClient.on("error", (err) => {
    // Only log the first error to avoid noise
    if (!redisClient.hasLoggedError) {
      console.warn("⚠️ Redis Client Error:", err.message);
      redisClient.hasLoggedError = true;
    }
  });

  redisClient.on("connect", () => {
    console.log("✅ Connected to Redis for Rate Limiting");
  });
} else {
  console.warn("⚠️ REDIS_URL not set. Using in-memory store for rate limiting (not recommended for production).");
}

export default redisClient;
