import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger, requestLogger } from './utils/logger.js';
import authRoutes from "./routes/auth.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import HealthRoutes from './routes/healthMap.routes.js';
import AnonymousRequestRoutes from './routes/anonymousHealth.routes.js';
import seasonalHealthRoutes from "./routes/seasonalHealth.routes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(requestLogger);  // logs incoming requests.

app.get('/api/healthCheck', (req, res) => {
    res.status(200).json({message: 'It is working'});
})

// apis 
app.use("/api/auth", authRoutes);
app.use("/api/mood-checkin", moodRoutes);
app.use("/api/healthmap", HealthRoutes);
app.use("/api/anonymous-health", AnonymousRequestRoutes);
app.use("/api/seasonal-health", seasonalHealthRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Not found"});
})

// Global Error handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
})

export default app;