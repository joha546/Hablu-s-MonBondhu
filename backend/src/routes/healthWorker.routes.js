// backend/src/routes/healthWorker.routes.js
import express from 'express';
import HealthWorker from '../models/HealthWorker.js';
import { authMiddleware } from '../middleware/auth.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Health Worker Directory
 *   description: স্বেচ্ছাসেবক ও স্বাস্থ্যকর্মী ডিরেক্টরি (Volunteer and Health Worker Directory)
 */

/**
 * @swagger
 * /health-workers:
 *   get:
 *     summary: Get all health workers
 *     tags: [Health Worker Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location [longitude,latitude]
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 5000
 *         description: Search radius in meters
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *         description: Filter by skill
 *       - in: query
 *         name: upazila
 *         schema:
 *           type: string
 *         description: Filter by upazila
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: List of health workers
 */
router.get('/', cacheMiddleware(1800), async (req, res) => {
  try {
    const { location, radius = 5000, skill, upazila, verified } = req.query;
    
    const filter = {};
    
    if (verified !== undefined) {
      filter['verified.isVerified'] = verified === 'true';
    }
    
    if (upazila) {
      filter.upazila = upazila;
    }
    
    if (skill) {
      filter.skills = skill;
    }
    
    let workers = [];
    
    // If location is provided, use geospatial query
    if (location) {
      const [lng, lat] = location.split(',').map(parseFloat);
      
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius
        }
      };
      
      workers = await HealthWorker.find(filter);
    } else {
      // If no location, get all workers
      workers = await HealthWorker.find(filter)
        .sort({ upazila: 1, 'verified.isVerified': -1, name: 1 });
    }
    
    res.status(200).json({ workers });
  } catch (error) {
    logger.error('Error fetching health workers:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্যকর্মী ডিরেক্টরি পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /health-workers/{id}:
 *   get:
 *     summary: Get details of a specific health worker
 *     tags: [Health Worker Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health worker ID
 *     responses:
 *       200:
 *         description: Health worker details
 */
router.get('/:id', cacheMiddleware(3600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const worker = await HealthWorker.findById(id);
    
    if (!worker) {
      return res.status(404).json({ message: 'স্বাস্থ্যকর্মী পাওয়া যায়নি' });
    }
    
    res.status(200).json({ worker });
  } catch (error) {
    logger.error('Error fetching health worker details:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্যকর্মী বিস্তারিত পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /health-workers/search:
 *   get:
 *     summary: Search health workers by name or skill
 *     tags: [Health Worker Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', cacheMiddleware(1800), async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'অনুসন্ধান শব্দ প্রদান করুন' });
    }
    
    const searchRegex = new RegExp(q, 'i');
    
    const workers = await HealthWorker.find({
      $or: [
        { name: { $regex: searchRegex } },
        { nameBangla: { $regex: searchRegex } },
        { skills: { $in: [searchRegex] } }
      ]
    }).sort({ 'verified.isVerified': -1, name: 1 });
    
    res.status(200).json({ workers });
  } catch (error) {
    logger.error('Error searching health workers:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্যকর্মী অনুসন্ধান করতে সমস্যা হয়েছে',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health-workers/skills:
 *   get:
 *     summary: Get all available skills
 *     tags: [Health Worker Directory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available skills
 */
router.get('/skills', cacheMiddleware(7200), async (req, res) => {
  try {
    // Get all unique skills from health workers
    const workers = await HealthWorker.find({});
    
    // Extract all skills
    const allSkills = new Set();
    workers.forEach(worker => {
      if (worker.skills && Array.isArray(worker.skills)) {
        worker.skills.forEach(skill => allSkills.add(skill));
      }
    });
    
    const skillsArray = Array.from(allSkills).sort();
    
    res.status(200).json({ skills: skillsArray });
  } catch (error) {
    logger.error('Error fetching skills:', error);
    res.status(500).json({ 
      message: 'দক্ষতা পেতে সমস্যা হয়েছে',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /health-workers/contact/{id}:
 *   post:
 *     summary: Log contact with a health worker
 *     tags: [Health Worker Directory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Health worker ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *               anonymous:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Contact logged successfully
 */
router.post('/:id/contact', async (req, res) => {
  try {
    const { id } = req.params;
    const { message, anonymous } = req.body;
    const userId = req.user.userId;
    
    // Find the health worker
    const worker = await HealthWorker.findById(id);
    
    if (!worker) {
      return res.status(404).json({ message: 'স্বাস্থ্যকর্মী পাওয়া যায়নি' });
    }
    
    // Log the contact
    const contactLog = {
      userId: anonymous ? null : userId,
      workerId: id,
      message,
      timestamp: new Date(),
      anonymous
    };
    
    // In a real implementation, this would send a notification to the health worker
    // For now, we'll just log it
    logger.info(`Contact request for health worker ${id}: ${message} (Anonymous: ${anonymous})`);
    
    res.status(200).json({
      message: 'স্বাস্থ্যকর্মীর সাথে যোগাযোগ পাঠানো হয়েছে'
    });
  } catch (error) {
    logger.error('Error logging contact with health worker:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্যকর্মীর সাথে যোগাযোগ পাঠাতে সমস্যা হয়েছে',
      error: error.message
    });
  }
});

export default router;