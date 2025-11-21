import { Router } from "express";
import mongoose from 'mongoose';
import os from 'os';

const router = Router();

// Liveness: is the process up?
router.get('/live', (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() });
})

// Readiness: can this instance handle traffic? (DB, queues, etc.)
router.get('/ready', async(req, res) => {
    const mongoState = mongoose.connection.readyState;  // 1 = connected.
    const dbReady = mongoState === 1;

    if(!dbReady){
        return res.status(503).json({
            status: 'degraded',
            mongoState,
        });
    }

    res.status(200).json({
        status: "ready",
        mongoState,
    })
});

// Info: useful for debugging
router.get("/info", (req, res) => {
  res.json({
    name: "monbondhu-backend",
    env: process.env.NODE_ENV || "development",
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpuCount: os.cpus().length,
    version: process.env.GIT_SHA || "dev",
  });
});

export default router;