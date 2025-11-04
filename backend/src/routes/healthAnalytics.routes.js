import express from "express";
import mongoose from "mongoose";
import MoodLog from "../models/MoodLog.model.js";
import AnonymousHealthRequest from "../models/AnonymousHealthRequest.js";
import SymptomGuide from "../models/SymptomGuide.js";
import HealthFacility from "../models/HealthFacility.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Health Analytics
 *   description: Aggregated analytics APIs for NGOs and dashboards
 */

/**
 * Utility function: Start of current week (Sunday)
 */
const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay(); // 0=Sunday
  now.setDate(now.getDate() - day);
  now.setHours(0, 0, 0, 0);
  return now;
};

/**
 * @swagger
 * /api/health-analytics/checkins:
 *   get:
 *     summary: Get total mood check-ins for the current week
 *     tags: [Health Analytics]
 *     responses:
 *       200:
 *         description: Weekly mood check-in count
 */
router.get("/checkins", async (req, res) => {
  try {
    const startOfWeek = getStartOfWeek();
    const count = await MoodLog.countDocuments({ createdAt: { $gte: startOfWeek } });
    res.json({ weekStart: startOfWeek, totalCheckIns: count });
  } catch (err) {
    res.status(500).json({ message: "Error fetching check-ins", error: err.message });
  }
});

/**
 * @swagger
 * /api/health-analytics/help-requests:
 *   get:
 *     summary: Get number of anonymous help requests grouped by upazila
 *     tags: [Health Analytics]
 */
router.get("/help-requests", async (req, res) => {
  try {
    const result = await AnonymousHealthRequest.aggregate([
      { $group: { _id: "$location", totalRequests: { $sum: 1 } } },
      { $sort: { totalRequests: -1 } }
    ]);
    res.json({ helpRequestsByUpazila: result });
  } catch (err) {
    res.status(500).json({ message: "Error fetching help request data", error: err.message });
  }
});

/**
 * @swagger
 * /api/health-analytics/content-trends:
 *   get:
 *     summary: Get most-viewed health content topics
 *     tags: [Health Analytics]
 */
router.get("/content-trends", async (req, res) => {
  try {
    // If a `views` field exists on SymptomGuide documents
    const result = await SymptomGuide.aggregate([
      { $match: { isActive: true } },
      { $project: { category: 1, titleBangla: 1, views: { $ifNull: ["$views", 0] } } },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    res.json({ topContentTopics: result });
  } catch (err) {
    res.status(500).json({ message: "Error fetching content trends", error: err.message });
  }
});

/**
 * @swagger
 * /api/health-analytics/facility-trends:
 *   get:
 *     summary: Get facility search trends
 *     tags: [Health Analytics]
 */
router.get("/facility-trends", async (req, res) => {
  try {
    // If search logs exist (extend later)
    const result = await HealthFacility.aggregate([
      { $group: { _id: "$upazila", totalFacilities: { $sum: 1 } } },
      { $sort: { totalFacilities: -1 } }
    ]);
    res.json({ facilitySearchTrends: result });
  } catch (err) {
    res.status(500).json({ message: "Error fetching facility trends", error: err.message });
  }
});

/**
 * @swagger
 * /api/health-analytics/export:
 *   get:
 *     summary: Export combined aggregated data for NGO dashboards
 *     tags: [Health Analytics]
 */
router.get("/export", async (req, res) => {
  try {
    const startOfWeek = getStartOfWeek();

    const [checkinCount, helpRequests, contentTrends, facilityTrends] = await Promise.all([
      MoodLog.countDocuments({ createdAt: { $gte: startOfWeek } }),
      AnonymousHealthRequest.aggregate([
        { $group: { _id: "$location", totalRequests: { $sum: 1 } } },
        { $sort: { totalRequests: -1 } }
      ]),
      SymptomGuide.aggregate([
        { $match: { isActive: true } },
        { $project: { category: 1, titleBangla: 1, views: { $ifNull: ["$views", 0] } } },
        { $sort: { views: -1 } },
        { $limit: 10 }
      ]),
      HealthFacility.aggregate([
        { $group: { _id: "$upazila", totalFacilities: { $sum: 1 } } },
        { $sort: { totalFacilities: -1 } }
      ])
    ]);

    const exportData = {
      generatedAt: new Date(),
      checkInsThisWeek: checkinCount,
      helpRequestsByUpazila: helpRequests,
      topContentTopics: contentTrends,
      facilitySearchTrends: facilityTrends
    };

    res.json(exportData);
  } catch (err) {
    res.status(500).json({ message: "Error exporting aggregated health data", error: err.message });
  }
});

export default router;
