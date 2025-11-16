import client from 'prom-client'

const collectDefaultMetrics = client.collectDefaultMetrics;

// Default metrics (Nodejs process, event loop, GC, etc.)
collectDefaultMetrics({
    prefix: "monbondhu_"
});

export const httpRequestDuration = new client.Histogram({
    name: "monbondhu_http_request_duration_ms",
    help: "HTTP request duration in ms",
    labelNames: ["method", "route", "status_code"],
    buckets: [50, 100, 200, 300, 500, 1000, 2000, 5000],
})

export const httpRequestCounter = new client.Counter({
  name: "monbondhu_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
});

export const httpErrorCounter = new client.Counter({
  name: "monbondhu_http_errors_total",
  help: "Total number of HTTP errors",
  labelNames: ["method", "route", "status_code"],
});

export const register = client.register;