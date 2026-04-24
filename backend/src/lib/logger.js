import winston from "winston";

const { combine, timestamp, json, printf, colorize } = winston.format;

// Redact sensitive fields from logs
const redactSensitiveInfo = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'authorization', 'stripe_key', 'secret'];
  
  const redact = (obj) => {
    if (typeof obj !== 'object' || obj === null) return;
    for (const key in obj) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        obj[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object') {
        redact(obj[key]);
      }
    }
  };

  redact(info);
  return info;
});

const isProduction = process.env.NODE_ENV === 'production';

// Custom format for dev console
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    timestamp(),
    redactSensitiveInfo(),
    isProduction ? json() : devFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});

// Stream for Morgan integration
export const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};
