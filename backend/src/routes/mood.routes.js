import express from "express";
import MoodLog from "../models/MoodLog.model.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Mood
 *   description: মানসিক স্বাস্থ্য ডাটা (Mood Check-in)
 */

/**
 * @swagger
 * /api/mood-checkin:
 *   post:
 *     summary: নতুন মানসিক স্বাস্থ্য লগ করুন
 *     tags: [Mood]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mood_level
 *               - local_uuid
 *             properties:
 *               mood_level:
 *                 type: number
 *                 description: মানসিক অবস্থা স্কেল (1-5)
 *                 example: 3
 *               note:
 *                 type: string
 *                 description: ব্যবহারকারীর নোট / মন্তব্য (বাংলায়)
 *                 example: "আজ একটু চিন্তিত লাগছে"
 *               local_uuid:
 *                 type: string
 *                 description: স্থানীয় UUID (অ্যানোনিমাস ব্যবহারকারীর জন্য)
 *                 example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
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
router.post("/", async (req, res) => {
    let logs = req.body;

    // Ensure it's always an array
    if (!Array.isArray(logs)){
        logs = [logs];
    }

    // Validate each log
    for(const log of logs){
        if (!log.mood_level || !log.local_uuid) {
            return res.status(400).json({ message: "প্রতিটি লগের জন্য mood_level এবং local_uuid প্রয়োজন" });
        }
    }

    try{
        const createdLogs = await MoodLog.insertMany(
            logs.map(l => ({
                mood_level: l.mood_level,
                note: l.note || "",
                local_uuid: l.local_uuid,
                synced: false,
                timestamp: l.timestamp ? new Date(l.timestamp) : new Date()
            }))
        );

        res.status(201).json({
            message: `${createdLogs.length} টি মুড লগ সংরক্ষিত হয়েছে`,
            data: createdLogs
        });
    } catch (err) {
        res.status(500).json({ message: "সার্ভার ত্রুটি", error: err.message });
    }
});


/**
 * @swagger
 * /api/mood-checkin/aggregate:
 *   get:
 *     summary: ব্যবহারকারীর আগ্রিগেটেড মানসিক স্বাস্থ্য লগ (সার্ভারে sync হয়েছে এমন)
 *     tags: [Mood]
 *     parameters:
 *       - in: query
 *         name: local_uuid
 *         schema:
 *           type: string
 *         required: true
 *         description: স্থানীয় UUID
 *     responses:
 *       200:
 *         description: আগ্রিগেটেড মুড লগ ডেটা
 *         content:
 *           application/json:
 *             example:
 *               local_uuid: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *               logs:
 *                 - timestamp: "2025-11-01T08:00:00.000Z"
 *                   mood_level: 4
 *                 - timestamp: "2025-11-02T08:00:00.000Z"
 *                   mood_level: 3
 */
router.get("/aggregate", async (req, res) => {
    const { local_uuid } = req.query;
    if(!local_uuid){
        return res.status(400).json({ message: "local_uuid প্রয়োজন" });
    }
    try{
        const logs = await MoodLog.find({ local_uuid, synced: true }).sort({ timestamp: 1 });
        res.status(200).json({ local_uuid, logs });
    }
    catch (err) {
        res.status(500).json({ message: "সার্ভার ত্রুটি", error: err.message });
    }
});

export default router;
