import {randomUUID} from 'crypto';

export const requestIdMiddleware = (req, res, next) => {
    const existing = req.headers["x-request-id"];
    const id = existing || randomUUID();

    req.id = id;
    res.setHeader("X-Request-ID", id);

    next();
}