import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 2222,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "replace_this_secret",
  env: process.env.NODE_ENV || "development",
  jwtExpiry: "48h",
  nodemailer: {
      user: process.env.SMTP_USER || "user@example.com",
      pass: process.env.SMTP_PASS || "password"
  },
  // redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379"
};