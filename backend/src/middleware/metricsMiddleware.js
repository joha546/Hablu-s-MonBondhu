import { httpRequestDuration, httpRequestCounter, httpErrorCounter } from "../monitoring/metrics.js";

export const metricsMiddleware = (req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        const duration = Date.now() - start;
        const route = req.route?.path || req.originalUrl || req.url;
        const labels = {
            method: req.method,
            route,
            status_code: res.statusCode,
        };
        httpRequestDuration.observe(labels, duration);
        httpRequestCounter.inc(labels);

        if(res.statusCode >= 500){
            httpErrorCounter.inc(labels);
        }
    });
    next();
};