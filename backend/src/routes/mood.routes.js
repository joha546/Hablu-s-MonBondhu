// backend/src/routes/mood.routes.js
import express from "express";
import MoodLog from "../models/MoodLog.model.js";
import {
    generateAIPrompt,
    generatePersonalizedGreeting,
} from "../utils/aiService.js";
import { logger } from "../utils/logger.js";

const router = express.Router();

// Apply authentication middleware to all routes
// router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Mood
 *   description: মানসিক স্বাস্থ্য ডাটা (Mood Check-in)
 */

/**
 * @swagger
 * /api/mood/checkin:
 *   post:
 *     summary: নতুন মানসিক স্বাস্থ্য লগ করুন
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood_level
 *             properties:
 *               mood_level:
 *                 type: number
 *                 description: মানসিক অবস্থা স্কেল (1-5)
 *                 example: 3
 *               note:
 *                 type: string
 *                 description: ব্যবহারকারীর নোট / মন্তব্য (বাংলায়)
 *                 example: "আজ একটু চিন্তিত লাগছে"
 *     responses:
 *       201:
 *         description: লগ সফলভাবে তৈরি হয়েছে
 *         content:
 *           application/json:
 *             example:
 *               message: "মুড লগ সংরক্ষিত হয়েছে"
 *               data:
 *                 id: "64f1d2c4e6b0c123456789ab"
 *                 mood_level: 3
 *                 note: "আজ একটু চিন্তিত লাগছে"
 *                 timestamp: "2025-11-03T08:00:00.000Z"
 */
router.post("/checkin", async (req, res) => {
    try {
        const { mood_level, note } = req.body;
        const userId = req.user._id; // always get from token

        if (!mood_level || mood_level < 1 || mood_level > 5) {
            return res
                .status(400)
                .json({ message: "মুড লেভেল ১ থেকে ৫ এর মধ্যে হতে হবে" });
        }

        const moodLabels = ["খুব খারাপ", "খারাপ", "সাধারণ", "ভালো", "খুব ভালো"];
        const mood_label = moodLabels[mood_level - 1];

        const newLog = new MoodLog({
            userId,
            mood_level,
            mood_label,
            note: note || "",
            timestamp: new Date(),
        });
        await newLog.save();

        const aiPrompt = await generateAIPrompt(mood_level, note);

        res.status(201).json({
            message: "মুড লগ সংরক্ষিত হয়েছে",
            data: newLog,
            aiPrompt,
        });
    } catch (err) {
        console.error("Mood check-in error:", err);
        res.status(500).json({ message: "সার্ভার ত্রুটি", error: err.message });
    }
});

/**
 * @swagger
 * /api/mood/greeting:
 *   get:
 *     summary: ব্যবহারকারীর জন্য ব্যক্তিগতকৃত অভিবাদন বার্তা পান
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ব্যক্তিগতকৃত অভিবাদন বার্তা
 *         content:
 *           application/json:
 *             example:
 *               message: "আপনি ৩ দিন পর ফিরে এসেছেন! আপনার অনুপস্থিতিতে আমরা আপনাকে মিস করেছি। আজ কেমন আছেন?"
 *               daysSinceLastCheckin: 3
 *               showNudge: true
 */
router.get("/greeting", async (req, res) => {
    try {
        const userId = req.user.userId;

        // Get the most recent mood log
        const lastMoodLog = await MoodLog.findOne({ userId }).sort({
            timestamp: -1,
        });

        // Calculate days since last check-in
        const daysSinceLastCheckin = lastMoodLog
            ? Math.floor(
                  (new Date() - new Date(lastMoodLog.timestamp)) /
                      (1000 * 60 * 60 * 24)
              )
            : null;

        // Generate personalized greeting
        const greeting = await generatePersonalizedGreeting(
            req.user.name,
            daysSinceLastCheckin,
            lastMoodLog?.mood_level
        );

        // Determine if we should show a gentle nudge
        // Addressing the riddle: How to nudge without shaming
        const showNudge =
            daysSinceLastCheckin !== null && daysSinceLastCheckin >= 3;

        res.status(200).json({
            message: greeting,
            daysSinceLastCheckin,
            showNudge,
            lastMoodLevel: lastMoodLog?.mood_level || null,
        });
    } catch (err) {
        logger.error("Greeting generation error:", err);
        res.status(500).json({ message: "সার্ভার ত্রুটি", error: err.message });
    }
});

/**
 * @swagger
 * /api/mood/history:
 *   get:
 *     summary: ব্যবহারকারীর মানসিক স্বাস্থ্য ইতিহাস পান (গ্রাফের জন্য ফরম্যাটেড)
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: কত দিনের ডেটা প্রয়োজন
 *     responses:
 *       200:
 *         description: মানসিক স্বাস্থ্য ইতিহাস
 *         content:
 *           application/json:
 *             example:
 *               data:
 *                 - date: "2025-11-01"
 *                   mood_level: 4
 *                   mood_label: "ভালো"
 *                 - date: "2025-11-02"
 *                   mood_level: 3
 *                   mood_label: "সাধারণ"
 *               streak: 5
 *               average: 3.5
 */
router.get("/history", async (req, res) => {
    try {
        const userId = req.user.userId;
        const days = parseInt(req.query.days) || 30;

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        // Get mood logs within the date range
        const moodLogs = await MoodLog.find({
            userId,
            timestamp: { $gte: startDate, $lte: endDate },
        }).sort({ timestamp: 1 });

        // Format data for graph visualization
        const graphData = moodLogs.map((log) => ({
            date: log.timestamp.toISOString().split("T")[0],
            mood_level: log.mood_level,
            mood_label: log.mood_label,
        }));

        // Calculate streak and average
        const streak = calculateStreak(moodLogs);
        const average = calculateAverage(moodLogs);

        res.status(200).json({
            data: graphData,
            streak,
            average,
            totalDays: moodLogs.length,
        });
    } catch (err) {
        logger.error("Mood history error:", err);
        res.status(500).json({ message: "সার্ভার ত্রুটি", error: err.message });
    }
});

/**
 * @swagger
 * /api/mood/sync:
 *   post:
 *     summary: অফলাইন মুড লগ সিঙ্ক করুন
 *     tags: [Mood]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - logs
 *             properties:
 *               logs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     mood_level:
 *                       type: number
 *                     note:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: লগ সফলভাবে সিঙ্ক হয়েছে
 */
router.post("/sync", async (req, res) => {
    try {
        const userId = req.user.userId;
        const { logs } = req.body;

        if (!Array.isArray(logs) || logs.length === 0) {
            return res
                .status(400)
                .json({ message: "সিঙ্ক করার জন্য কমপক্ষে একটি লগ প্রয়োজন" });
        }

        // Process each log
        const moodLabels = ["খুব খারাপ", "খারাপ", "সাধারণ", "ভালো", "খুব ভালো"];
        const processedLogs = [];

        for (const log of logs) {
            if (!log.mood_level || log.mood_level < 1 || log.mood_level > 5) {
                continue; // Skip invalid logs
            }

            const mood_label = moodLabels[log.mood_level - 1];

            processedLogs.push({
                userId,
                mood_level: log.mood_level,
                mood_label,
                note: log.note || "",
                timestamp: new Date(log.timestamp),
                synced: true,
            });
        }

        // Insert logs
        if (processedLogs.length > 0) {
            await MoodLog.insertMany(processedLogs);
        }

        logger.info(`User ${userId} synced ${processedLogs.length} mood logs`);

        res.status(200).json({
            message: `${processedLogs.length} টি মুড লগ সফলভাবে সিঙ্ক হয়েছে`,
            synced: processedLogs.length,
        });
    } catch (err) {
        logger.error("Mood sync error:", err);
        res.status(500).json({ message: "সার্ভার ত্রুটি", error: err.message });
    }
});

// Helper functions
function calculateStreak(logs) {
    if (logs.length === 0) return 0;

    let streak = 1;
    const sortedLogs = [...logs].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    for (let i = 0; i < sortedLogs.length - 1; i++) {
        const current = new Date(sortedLogs[i].timestamp);
        const next = new Date(sortedLogs[i + 1].timestamp);

        // Check if logs are consecutive days
        const diffTime = Math.abs(current - next);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

function calculateAverage(logs) {
    if (logs.length === 0) return 0;

    const sum = logs.reduce((acc, log) => acc + log.mood_level, 0);
    return (sum / logs.length).toFixed(1);
}

export default router;
