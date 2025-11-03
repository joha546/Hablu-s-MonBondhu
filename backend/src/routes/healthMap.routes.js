// backend/src/routes/healthMap.routes.js
import express from 'express';
import HealthFacility from '../models/HealthFacility.js';
import HealthWorker from '../models/HealthWorker.js';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import proximityService from '../services/proximityService.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /healthmap/facilities:
 *   get:
 *     summary: Get all healthcare facilities
 *     tags: [Health Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by facility type
 *       - in: query
 *         name: upazila
 *         schema:
 *           type: string
 *         description: Filter by upazila
 *       - in: query
 *         name: district
 *         schema:
 *           type: string
 *         description: Filter by district
 *     responses:
 *       200:
 *         description: List of healthcare facilities
 */
router.get('/facilities', cacheMiddleware(3600), async (req, res) => {
  try {
    const { type, upazila, district } = req.query;
    const filter = {};
    
    if (type) filter.type = type;
    if (upazila) filter.upazila = upazila;
    if (district) filter.district = district;
    
    const facilities = await HealthFacility.find(filter);
    
    res.status(200).json(facilities);
  } catch (error) {
    logger.error('Error fetching facilities:', error);
    res.status(500).json({ message: 'Failed to fetch facilities', error: error.message });
  }
});

/**
 * @swagger
 * /healthmap/nearest:
 *   post:
 *     summary: Find nearest healthcare facilities
 *     tags: [Health Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               location:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: User location [longitude, latitude]
 *               limit:
 *                 type: number
 *                 default: 10
 *                 description: Maximum number of results
 *               maxDistance:
 *                 type: number
 *                 default: 10000
 *                 description: Maximum distance in meters
 *     responses:
 *       200:
 *         description: List of nearest healthcare facilities with accessibility scores
 */
router.post('/nearest', async (req, res) => {
  try {
    const { location, limit = 10, maxDistance = 10000 } = req.body;
    
    if (!location || !Array.isArray(location) || location.length !== 2) {
      return res.status(400).json({ message: 'Valid location [longitude, latitude] is required' });
    }
    
    const facilities = await proximityService.findNearestFacilities(location, maxDistance, limit);
    
    res.status(200).json(facilities);
  } catch (error) {
    logger.error('Error finding nearest facilities:', error);
    res.status(500).json({ message: 'Failed to find nearest facilities', error: error.message });
  }
});

/**
 * @swagger
 * /healthmap/workers:
 *   get:
 *     summary: Get health workers in an area
 *     tags: [Health Map]
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
 *     responses:
 *       200:
 *         description: List of health workers
 */
router.get('/workers', async (req, res) => {
  try {
    const { location, radius = 5000, skill } = req.query;
    
    if (!location) {
      return res.status(400).json({ message: 'Location parameter is required' });
    }
    
    const [lng, lat] = location.split(',').map(parseFloat);
    
    const filter = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: radius
        }
      }
    };
    
    if (skill) {
      filter.skills = skill;
    }
    
    const workers = await HealthWorker.find(filter);
    
    res.status(200).json(workers);
  } catch (error) {
    logger.error('Error fetching health workers:', error);
    res.status(500).json({ message: 'Failed to fetch health workers', error: error.message });
  }
});

/**
 * @swagger
 * /healthmap/facility/{id}:
 *   get:
 *     summary: Get details of a specific healthcare facility
 *     tags: [Health Map]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Facility ID
 *     responses:
 *       200:
 *         description: Facility details
 *       404:
 *         description: Facility not found
 */
router.get('/facility/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const facility = await HealthFacility.findById(id);
    
    if (!facility) {
      return res.status(404).json({ message: 'Facility not found' });
    }
    
    res.status(200).json(facility);
  } catch (error) {
    logger.error('Error fetching facility details:', error);
    res.status(500).json({ message: 'Failed to fetch facility details', error: error.message });
  }
});

/**
 * @swagger
 * /healthmap/directions:
 *   post:
 *     summary: Get directions to a healthcare facility
 *     tags: [Health Map]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - from
 *               - to
 *             properties:
 *               from:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Starting location [longitude, latitude]
 *               to:
 *                 type: array
 *                 items:
 *                   type: number
 *                 description: Destination location [longitude, latitude]
 *               mode:
 *                 type: string
 *                 enum: [walking, driving, public_transport]
 *                 default: walking
 *     responses:
 *       200:
 *         description: Directions to the facility
 */
router.post('/directions', async (req, res) => {
  try {
    const { from, to, mode = 'walking' } = req.body;
    
    if (!from || !to || !Array.isArray(from) || !Array.isArray(to)) {
      return res.status(400).json({ message: 'Valid from and to locations are required' });
    }
    
    // In a real implementation, you would use a routing service like OSRM or Mapbox Directions API
    // For this example, we'll return a simple straight-line direction
    
    const distance = proximityService.calculateDistance(from, to);
    const bearing = proximityService.calculateBearing(from, to);
    
    res.status(200).json({
      distance,
      bearing,
      mode,
      instructions: [
        `আপনার গন্তব্য ${Math.round(distance)} মিটার দূরে`,
        `${bearing} দিকে যান`
      ]
    });
  } catch (error) {
    logger.error('Error getting directions:', error);
    res.status(500).json({ message: 'Failed to get directions', error: error.message });
  }
});

export default router;