import mongoose from "mongoose";
import app from './app.js'
import { logger } from "./utils/logger.js";
import config from './config/index.js'

const PORT = config.port;
const MONGO_URI = config.mongoURI;

mongoose.connect(MONGO_URI)
    .then(() => {
        // Logged message
        logger.info("Connected to Mongodb")
        app.listen(PORT, () => {
            logger.info(`Server is running on ${PORT}`);
        })
    })
    .catch((err) => {
        logger.error("Mongodb connection error:", err);
        process.exit(1);
    })