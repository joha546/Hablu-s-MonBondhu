import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 2222,
  mongoURI: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET || "replace_this_secret",
  env: process.env.NODE_ENV || "development",
};