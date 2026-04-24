export const validateEnv = () => {
  const requiredVars = [
    "PORT",
    "DATABASE_URL",
    "JWT_SECRET",
  ];

  const missingVars = requiredVars.filter(envVar => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingVars.join(", ")}`);
    console.error("Please set them in your .env file or environment.");
    process.exit(1);
  }
  
  // Optionally warn about useful but not strictly required variables
  const warningVars = ["ALLOWED_ORIGINS", "STRIPE_SECRET_KEY", "REDIS_URL"];
  const missingWarn = warningVars.filter(envVar => !process.env[envVar]);
  
  if (missingWarn.length > 0) {
    console.warn(`⚠️ Warning: Missing environment variables: ${missingWarn.join(", ")}`);
  }
};
