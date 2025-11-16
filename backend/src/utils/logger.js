import winston from "winston";

const env = process.env.NODE_ENV || 'development';

const baseFormat = 
    env === 'development'
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            winston.format.printf(({timestamp, level, message, ...meta}) => {
                const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
                return `${timestamp} [${level}]: ${message}${metaString}`;
            })
        )
        : winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        )

// Centralized logger.
export const logger = winston.createLogger({
    level: env === 'development' ? 'debug' : 'info',
    format: baseFormat,
    transports: [new winston.transports.Console()],
});

// Express request logging middleware
export const requestLogger = (req, res, next) => {
    // logger.info(`${req.method} ${req.url}`)
    // next();
    const start = Date.now();
    const requestId = req.Id || req.headers["x-request-id"];

    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info("HTTP request completed", {
            method: req.method,
            url: req.originalUrl || req.url,
            statusCode: res.statusCode,
            durationMs: duration,
            requestId,
            userAgent: req.headers["user-agent"],
            ip: req.ip,
        });
    });

    next();
}