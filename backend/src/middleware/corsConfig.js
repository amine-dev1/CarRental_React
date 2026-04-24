import cors from "cors";

export const corsConfig = () => {
  const allowedOriginsStr = process.env.ALLOWED_ORIGINS || "";
  const allowedOrigins = allowedOriginsStr.split(',').map(o => o.trim()).filter(Boolean);

  return cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      // allow localhost or local IP
      if (origin.startsWith("http://localhost") || origin.startsWith("http://192.168")) {
        return callback(null, true);
      }

      // allow Vercel previews if ALLOW_VERCEL_PREVIEWS is true (or unset, default true)
      const allowVercel = process.env.ALLOW_VERCEL_PREVIEWS !== "false";
      if (allowVercel && origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // explicit allowlist
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS not allowed: " + origin));
    },
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  });
};
