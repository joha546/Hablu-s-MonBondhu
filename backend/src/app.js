import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import AnonymousRequestRoutes from "./routes/anonymousHealth.routes.js";
import authRoutes from "./routes/auth.routes.js";
import healthEventsRoutes from "./routes/healthEvents.routes.js";
import HealthRoutes from "./routes/healthMap.routes.js";
import healthWorkerRoutes from "./routes/healthWorker.routes.js";
import maternalChildHealthRoutes from "./routes/maternalChildHealth.routes.js";
import moodRoutes from "./routes/mood.routes.js";
import seasonalHealthRoutes from "./routes/seasonalHealth.routes.js";
import symptomGuideRoutes from "./routes/symptomGuide.routes.js";
import { logger, requestLogger } from "./utils/logger.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger); // logs incoming requests.
app.get("/api/healthCheck", (req, res) => {
    res.status(200).json({ message: "It is working" });
});

// apis
app.use("/api/auth", authRoutes);
app.use("/api/mood", moodRoutes);
app.use("/api/healthmap", HealthRoutes);
app.use("/api/anonymous-health", AnonymousRequestRoutes);
app.use("/api/seasonal-health", seasonalHealthRoutes);
app.use("/api/maternal-child-health", maternalChildHealthRoutes);
app.use("/api/symptom-guide", symptomGuideRoutes);
app.use("/api/health-events", healthEventsRoutes);
app.use("/api/health-workers", healthWorkerRoutes);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Not found" });
});

// Global Error handler
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});

export default app;
