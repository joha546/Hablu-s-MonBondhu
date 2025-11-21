import { Router } from "express";
import mongoose from 'mongoose';
import os from 'os';
import fs from 'fs/promises';
import client from 'prom-client';

const router = Router();

// Check disk read/write capability
async function checkDiskRW(){
    const testFile = "/tmp/healthcheck.tmp";

    try{
        await fs.writeFile(testFile, "health-check-test");
        await fs.readFile(testFile, "utf-8");
        return { ok: true };
    }
    catch(err){
        return { ok: false, error: err.message };
    }
}

// check event loop lag (detect stalls)
async function checkEventLoopLag() {
    const h = new client.Gauge({
        name: "event_loop_lag_ms",
        help: "Event loop lag in ms",
    });

    const start = Date.now();
    await new Promise((resolve) => setImmediate(resolve));
    const lag = Date.now() - start;

    h.set(lag);

    return { ok: lag < 100, lag };
}

function checkMongo() {
  const state = mongoose.connection.readyState; // 1 = connected
  return {
    ok: state === 1,
    state,
  };
}

// Check memory pressure
function checkMemory() {
  const mem = process.memoryUsage();
  const tooHigh =
    mem.heapUsed / mem.heapTotal > 0.98 ||
    mem.rss > 1024 * 1024 * 1024 * 1.5; // >1.5GB

  return {
    ok: !tooHigh,
    usage: mem,
  };
}

// Liveness: is the process up?
router.get('/live', (req, res) => {
    // res.status(200).json({ status: "ok", uptime: process.uptime() });
    return res.json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    })
})

// Local HealthCheck.
router.get('/local', async(req, res) => {
    const disk = await checkDiskRW();
    const eventLoop = await checkEventLoopLag();
    const memory = checkMemory();

    const healthy = disk.ok && eventLoop.ok && memory.ok;

    return res.status(healthy ? 200 : 503).json({
        status: healthy ? "ok" : "degraded",
        checks: {
            disk,
            eventLoop,
            memory,
        },
    });
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

// Full System Health (depends + local)
router.get("/", async (req, res) => {
  const mongo = checkMongo();
  const disk = await checkDiskRW();
  const eventLoop = await checkEventLoopLag();
  const memory = checkMemory();

  const overall = mongo.ok && disk.ok && eventLoop.ok && memory.ok;

  return res.status(overall ? 200 : 503).json({
    name: "monbondhu-backend",
    status: overall ? "healthy" : "unhealthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks: {
      mongo,
      disk,
      eventLoop,
      memory,
    },
  });
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