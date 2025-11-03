import express from 'express';
import SymptomGuide from '../models/SymptomGuide.js';
import SymptomAnalysis from '../models/SymptomAnalysis.js';
import { analyzeSymptoms } from '../utils/symptomAnalyzer.js';
import proximityService, { ProximityService } from '../utils/proximityService.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Symptom Guide
 *   description: উপসর্গ সচেতনতা গাইড (Symptoms Awareness Guide)
 */

/**
 * @swagger
 * /symptom-guide/categories:
 *   get:
 *     summary: Get all symptom guide categories
 *     tags: [Symptom Guide]
 *     responses:
 *       200:
 *         description: Symptom guide categories
 */
router.get('/categories', cacheMiddleware(7200), async (req, res) => {
  try {
    const categories = [
      {
        id: 'general',
        name: 'সাধারণ',
        nameBangla: 'সাধারণ',
        description: 'সাধারণ স্বাস্থ্য উপসর্গ',
        icon: 'general'
      },
      {
        id: 'maternal',
        name: 'মাতৃস্বাস্থ্য',
        nameBangla: 'মাতৃস্বাস্থ্য',
        description: 'গর্ভাবস্থায় স্বাস্থ্য উপসর্গ',
        icon: 'maternal'
      },
      {
        id: 'child',
        name: 'শিশু স্বাস্থ্য',
        nameBangla: 'শিশু স্বাস্থ্য',
        description: 'শিশুদের স্বাস্থ্য উপসর্গ',
        icon: 'child'
      },
      {
        id: 'mental_health',
        name: 'মানসিক স্বাস্থ্য',
        nameBangla: 'মানসিক স্বাস্থ্য',
        description: 'মানসিক স্বাস্থ্য সম্পর্কিত উপসর্গ',
        icon: 'mental'
      },
      {
        id: 'infectious_disease',
        name: 'সংক্রামক রোগ',
        nameBangla: 'সংক্রামক রোগ',
        description: 'সংক্রামক রোগের উপসর্গ',
        icon: 'infectious'
      },
      {
        id: 'chronic_disease',
        name: 'দীর্ঘস্থায়ী রোগ',
        nameBangla: 'দীর্ঘস্থায়ী রোগ',
        description: 'দীর্ঘস্থায়ী রোগের উপসর্গ',
        icon: 'chronic'
      },
      {
        id: 'emergency',
        name: 'জরুরি',
        nameBangla: 'জরুরি',
        description: 'জরুরি স্বাস্থ্য উপসর্গ',
        icon: 'emergency'
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
 * /symptom-guide/category/{category}:
 *   get:
 *     summary: Get symptom guides by category
 *     tags: [Symptom Guide]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [general, maternal, child, mental_health, infectious_disease, chronic_disease, emergency]
 *         description: Category name
 *     responses:
 *       200:
 *         description: Symptom guides for the specified category
 */
router.get('/category/:category', cacheMiddleware(3600), async (req, res) => {
  try {
    const { category } = req.params;
    
    if (!['general', 'maternal', 'child', 'mental_health', 'infectious_disease', 'chronic_disease', 'emergency'].includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    
    const guides = await SymptomGuide.find({ 
      category, 
      isActive: true 
    }).sort({ 'symptoms.severity': -1 });
    
    res.status(200).json({
      category,
      guides
    });
  } catch (error) {
    logger.error('Error fetching symptom guides:', error);
    res.status(500).json({ 
      message: 'উপসর্গ গাইড পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /symptom-guide/analyze:
 *   post:
 *     summary: Analyze symptoms and provide guidance
 *     tags: [Symptom Guide]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symptoms
 *             properties:
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     severity:
 *                       type: string
 *                       enum: [mild, moderate, severe, emergency]
 *                     duration:
 *                       type: string
 *                     additionalInfo:
 *                       type: string
 *               demographicInfo:
 *                 type: object
 *                 properties:
 *                   ageGroup:
 *                     type: string
 *                     enum: [infant, child, teen, adult, elderly]
 *                   gender:
 *                     type: string
 *                     enum: [male, female, other]
 *                   pregnant:
 *                     type: boolean
 *                   chronicConditions:
 *                     type: array
 *                     items:
 *                       type: string
 *               location:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: User location [longitude, latitude]
 *     responses:
 *       200:
 *         description: Symptom analysis results
 */
router.post('/analyze', async (req, res) => {
  try {
    const { symptoms, demographicInfo, location } = req.body;
    
    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ 
        message: 'অন্তত একটি উপসর্গ প্রদান করতে হবে' 
      });
    }
    
    // Generate session ID
    const sessionId = generateSessionId(req);
    
    // Analyze symptoms
    const analysis = await analyzeSymptoms(symptoms, demographicInfo);
    
    // Find nearby facilities if location is provided
    let suggestedFacilities = [];
    if (location && location.length === 2) {
      try {
        suggestedFacilities = await proximityService.findNearestFacilities(location, 10000, 5);
      } catch (error) {
        logger.error('Error finding nearby facilities:', error);
      }
    }
    
    // Save analysis for future reference
    const symptomAnalysis = new SymptomAnalysis({
      sessionId,
      symptoms,
      demographicInfo,
      analysis,
      suggestedFacilities
    });
    
    await symptomAnalysis.save();
    logger.info(`Symptom analysis created: ${symptomAnalysis._id}`);
    
    res.status(200).json({
      analysis,
      suggestedFacilities,
      sessionId: symptomAnalysis._id,
      disclaimer: 'এটি চিকিৎসা নয়, এটি কেবল তথ্য ভিত্তিক সাধারণ তথ্য। চিকিৎসকের পরামর্শ নিন।'
    });
  } catch (error) {
    logger.error('Error analyzing symptoms:', error);
    res.status(500).json({ 
      message: 'উপসর্গ বিশ্লেষণ করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /symptom-guide/search:
 *   get:
 *     summary: Search symptom guides by keyword
 *     tags: [Symptom Guide]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search keyword
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', cacheMiddleware(1800), async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'অনুসন্ধান শব্দ প্রদান করতে হবে' });
    }
    
    const guides = await SymptomGuide.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { titleBangla: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { descriptionBangla: { $regex: q, $options: 'i' } },
            { 'symptoms.name': { $regex: q, $options: 'i' } },
            { 'symptoms.nameBangla': { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).sort({ 'symptoms.severity': -1 });
    
    res.status(200).json({
      query: q,
      results: guides
    });
  } catch (error) {
    logger.error('Error searching symptom guides:', error);
    res.status(500).json({ 
      message: 'অনুসন্ধান করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /symptom-guide/{id}:
 *   get:
 *     summary: Get details of a specific symptom guide
 *     tags: [Symptom Guide]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Symptom guide ID
 *     responses:
 *       200:
 *         description: Symptom guide details
 */
router.get('/:id', cacheMiddleware(3600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const guide = await SymptomGuide.findById(id);
    
    if (!guide) {
      return res.status(404).json({ message: 'উপসর্গ গাইড পাওয়া যায়নি' });
    }
    
    res.status(200).json(guide);
  } catch (error) {
    logger.error('Error fetching symptom guide:', error);
    res.status(500).json({ 
      message: 'উপসর্গ গাইড পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

// Helper function to generate session ID
function generateSessionId(req) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const userAgentHash = req.get('User-Agent') ? 
    req.get('User-Agent').substring(0, 5) : 'unknown';
  
  return `symptom_${timestamp}_${randomString}_${userAgentHash}`;
}

export default router;