import express from 'express';
import SeasonalHealthTip from '../models/SeasonalHealthTip.js';
import { getCurrentSeason, getCurrentMonth } from '../utils/seasonUtils.js';
import { generateSeasonalTips } from '../utils/seasonalTipsGenerator.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Seasonal Health
 *   description: ঋতুভিত্তিক স্বাস্থ্য টিপস (Seasonal Preventive Health Tips)
 */

/**
 * @swagger
 * /seasonal-health/current:
 *   get:
 *     summary: Get current season's health tips
 *     tags: [Seasonal Health]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: audience
 *         schema:
 *           type: string
 *         description: Filter by target audience
 *     responses:
 *       200:
 *         description: Current season's health tips
 */
router.get('/current', cacheMiddleware(1800), async (req, res) => {
  try {
    const { category, audience } = req.query;
    const currentSeason = getCurrentSeason();
    const currentMonth = getCurrentMonth();
    
    // Build filter
    const filter = {
      season: currentSeason,
      isActive: true,
      $or: [
        { 'validityPeriod.startMonth': { $lte: currentMonth }, 'validityPeriod.endMonth': { $gte: currentMonth } },
        { season: 'year_round' }
      ]
    };
    
    if (category) filter.category = category;
    if (audience) filter.targetAudience = audience;
    
    const tips = await SeasonalHealthTip.find(filter)
      .sort({ 'preventiveMeasures.priority': -1 });
    
    res.status(200).json({
      season: currentSeason,
      month: currentMonth,
      tips
    });
  } catch (error) {
    logger.error('Error fetching current season tips:', error);
    res.status(500).json({ 
      message: 'বর্তমান মৌসুমের টিপস পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /seasonal-health/season/{season}:
 *   get:
 *     summary: Get health tips for a specific season
 *     tags: [Seasonal Health]
 *     parameters:
 *       - in: path
 *         name: season
 *         required: true
 *         schema:
 *           type: string
 *           enum: [monsoon, winter, summer, year_round]
 *         description: Season name
 *     responses:
 *       200:
 *         description: Health tips for the specified season
 */
router.get('/season/:season', cacheMiddleware(3600), async (req, res) => {
  try {
    const { season } = req.params;
    
    if (!['monsoon', 'winter', 'summer', 'year_round'].includes(season)) {
      return res.status(400).json({ message: 'Invalid season' });
    }
    
    const tips = await SeasonalHealthTip.find({ season, isActive: true })
      .sort({ 'preventiveMeasures.priority': -1 });
    
    res.status(200).json({
      season,
      tips
    });
  } catch (error) {
    logger.error('Error fetching season tips:', error);
    res.status(500).json({ 
      message: 'মৌসুমের টিপস পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /seasonal-health/categories:
 *   get:
 *     summary: Get all health tip categories
 *     tags: [Seasonal Health]
 *     responses:
 *       200:
 *         description: Health tip categories
 */
router.get('/categories', cacheMiddleware(7200), async (req, res) => {
  try {
    const categories = [
      {
        id: 'disease_prevention',
        name: 'রোগ প্রতিরোধ',
        nameBangla: 'রোগ প্রতিরোধ',
        description: 'বিভিন্ন রোগ প্রতিরোধের উপায়',
        icon: 'shield'
      },
      {
        id: 'general_health',
        name: 'সাধারণ স্বাস্থ্য',
        nameBangla: 'সাধারণ স্বাস্থ্য',
        description: 'সাধারণ স্বাস্থ্য রক্ষণের উপায়',
        icon: 'heart'
      },
      {
        id: 'food_safety',
        name: 'খাদ্য নিরাপত্তা',
        nameBangla: 'খাদ্য নিরাপত্তা',
        description: 'নিরাপদ খাদ্য গ্রহণ ও সংরক্ষণ',
        icon: 'food'
      },
      {
        id: 'water_safety',
        name: 'পানি নিরাপত্তা',
        nameBangla: 'পানি নিরাপত্তা',
        description: 'নিরাপদ পানি ব্যবহার',
        icon: 'water'
      },
      {
        id: 'environmental',
        name: 'পরিবেশগত',
        nameBangla: 'পরিবেশগত',
        description: 'পরিবেশগত স্বাস্থ্য ঝুঁকি',
        icon: 'environment'
      }
    ];

    res.status(200).json({ categories });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'বিভাগগুলি পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /seasonal-health/seasons:
 *   get:
 *     summary: Get all seasons with their time periods
 *     tags: [Seasonal Health]
 *     responses:
 *       200:
 *         description: Seasons with time periods
 */
router.get('/seasons', cacheMiddleware(7200), async (req, res) => {
  try {
    const seasons = [
      {
        id: 'summer',
        name: 'গ্রীষ্ম',
        nameBangla: 'গ্রীষ্ম',
        months: [3, 4, 5],
        description: 'মার্চ থেকে মে',
        descriptionBangla: 'মার্চ থেকে মে',
        commonDiseases: ['তাপপ্রদাহ', 'ডায়রিয়া', 'জলবসন্ত'],
        commonDiseasesBangla: ['তাপপ্রদাহ', 'ডায়রিয়া', 'জলবসন্ত'],
        icon: 'sun'
      },
      {
        id: 'monsoon',
        name: 'বর্ষা',
        nameBangla: 'বর্ষা',
        months: [6, 7, 8, 9],
        description: 'জুন থেকে সেপ্টেম্বর',
        descriptionBangla: 'জুন থেকে সেপ্টেম্বর',
        commonDiseases: ['ডেঙ্গু', 'ম্যালেরিয়া', 'ডায়রিয়া'],
        commonDiseasesBangla: ['ডেঙ্গু', 'ম্যালেরিয়া', 'ডায়রিয়া'],
        icon: 'rain'
      },
      {
        id: 'winter',
        name: 'শীত',
        nameBangla: 'শীত',
        months: [12, 1, 2],
        description: 'ডিসেম্বর থেকে ফেব্রুয়ারি',
        descriptionBangla: 'ডিসেম্বর থেকে ফেব্রুয়ারি',
        commonDiseases: ['সর্দি-কাশি', 'নিউমোনিয়া', '�্লু'],
        commonDiseasesBangla: ['সর্দি-কাশি', 'নিউমোনিয়া', 'ফ্লু'],
        icon: 'snow'
      },
      {
        id: 'year_round',
        name: 'সারা বছর',
        nameBangla: 'সারা বছর',
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        description: 'সারা বছর প্রযোজ্য',
        descriptionBangla: 'সারা বছর প্রযোজ্য',
        commonDiseases: ['হাত ধোয়া', 'নিরাপদ খাদ্য', '�িশুদ্ধ পানি'],
        commonDiseasesBangla: ['হাত ধোয়া', 'নিরাপদ খাদ্য', 'বিশুদ্ধ পানি'],
        icon: 'calendar'
      }
    ];

    res.status(200).json({ seasons });
  } catch (error) {
    logger.error('Error fetching seasons:', error);
    res.status(500).json({ 
      message: 'মৌসুমগুলি পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /seasonal-health/tip/{id}:
 *   get:
 *     summary: Get details of a specific health tip
 *     tags: [Seasonal Health]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health tip ID
 *     responses:
 *       200:
 *         description: Health tip details
 */
router.get('/tip/:id', cacheMiddleware(3600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const tip = await SeasonalHealthTip.findById(id);
    
    if (!tip) {
      return res.status(404).json({ message: 'Health tip not found' });
    }
    
    res.status(200).json(tip);
  } catch (error) {
    logger.error('Error fetching health tip:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্য টিপস পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /seasonal-health/generate:
 *   post:
 *     summary: Generate new seasonal health tips using AI
 *     tags: [Seasonal Health]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - season
 *               - category
 *             properties:
 *               season:
 *                 type: string
 *                 enum: [monsoon, winter, summer, year_round]
 *               category:
 *                 type: string
 *                 enum: [disease_prevention, general_health, food_safety, water_safety, environmental]
 *               targetAudience:
 *                 type: string
 *                 enum: [general, children, elderly, pregnant_women, chronic_patients]
 *     responses:
 *       201:
 *         description: Generated health tip
 */
router.post('/generate', async (req, res) => {
  try {
    const { season, category, targetAudience } = req.body;
    
    if (!season || !category) {
      return res.status(400).json({ 
        message: 'Season and category are required' 
      });
    }
    
    // Generate health tip using AI
    const generatedTip = await generateSeasonalTips({
      season,
      category,
      targetAudience: targetAudience || 'general'
    });
    
    // Save to database
    const tip = new SeasonalHealthTip({
      ...generatedTip,
      aiGenerated: true,
      reviewedByExpert: false
    });
    
    await tip.save();
    logger.info(`Generated new seasonal health tip: ${tip._id}`);
    
    res.status(201).json({
      message: 'স্বাস্থ্য টিপস সফলভাবে তৈরি হয়েছে',
      tip
    });
  } catch (error) {
    logger.error('Error generating health tip:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্য টিপস তৈরি করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

export default router;