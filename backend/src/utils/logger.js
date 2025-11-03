import winston from "winston";

// Centralized logger.
export const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(
            ({timestamp, level, message}) => `${timestamp} [${level}]: ${message}`
        )
    ),
    transports: [new winston.transports.Console()],
});

// Express request logging middleware
export const requestLogger = (req, res, next) => {
    logger.info(`${req.method} ${req.url}`)
    next();
}