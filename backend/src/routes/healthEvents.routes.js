import express from 'express';
import HealthEvent from '../models/HealthEvent.js';
import EventParticipation from '../models/EventParticipation.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendEventReminder } from '../utils/notificationService.js';
import { cacheMiddleware } from '../middleware/cache.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Health Events
 *   description: স্বাস্থ্য ইভেন্ট (Community Health Events)
 */

/**
 * @swagger
 * /health-events:
 *   get:
 *     summary: Get all health events
 *     tags: [Health Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *         description: Filter by event type
 *       - in: query
 *         name: upazila
 *         schema:
 *           type: string
 *         description: Filter by upazila
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: List of health events
 */
router.get('/', cacheMiddleware(1800), async (req, res) => {
  try {
    const { eventType, upazila, status } = req.query;
    const today = new Date();
    
    // Build filter
    const filter = {
      startDate: { $gte: today }
    };
    
    if (eventType) filter.eventType = eventType;
    if (upazila) filter.upazila = upazila;
    if (status) filter.status = status;
    
    const events = await HealthEvent.find(filter)
      .sort({ startDate: 1 })
      .populate('createdBy', 'name email');
    
    res.status(200).json({ events });
  } catch (error) {
    logger.error('Error fetching health events:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্য ইভেন্ট পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /health-events/{id}:
 *   get:
 *     summary: Get details of a specific health event
 *     tags: [Health Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     responses:
 *       200:
 *         description: Health event details
 */
router.get('/:id', cacheMiddleware(3600), async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await HealthEvent.findById(id)
      .populate('createdBy', 'name email');
    
    if (!event) {
      return res.status(404).json({ message: 'স্বাস্থ্য ইভেন্ট পাওয়া যায়নি' });
    }
    
    res.status(200).json({ event });
  } catch (error) {
    logger.error('Error fetching health event:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্য ইভেন্ট পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /health-events:
 *   post:
 *     summary: Create a new health event
 *     tags: [Health Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - titleBangla
 *               - description
 *               - descriptionBangla
 *               - eventType
 *               - startDate
 *               - endDate
 *               - startTime
 *               - location
 *               - organizer
 *             properties:
 *               title:
 *                 type: string
 *               titleBangla:
 *                 type: string
 *               description:
 *                 type: string
 *               descriptionBangla:
 *                 type: string
 *               eventType:
 *                 type: string
 *                 enum: [health_checkup, blood_donation, vaccination_drive, mental_health_session, maternal_health_workshop, health_awareness, other]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   address:
 *                     type: string
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                   upazila:
 *                     type: string
 *                   district:
 *                     type: string
 *                   division:
 *                     type: string
 *               organizer:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   contactPerson:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                   organization:
 *                     type: string
 *               targetAudience:
 *                 type: string
 *                 enum: [general, children, elderly, pregnant_women, chronic_patients, all]
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                     serviceBangla:
 *                       type: string
 *                     description:
 *                       type: string
 *                     descriptionBangla:
 *                       type: string
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     requirement:
 *                       type: string
 *                     requirementBangla:
 *                       type: string
 *                     description:
 *                       type: string
 *                     descriptionBangla:
 *                       type: string
 *               capacity:
 *                 type: object
 *                 properties:
 *                   maxParticipants:
 *                     type: number
 *               registrationRequired:
 *                 type: boolean
 *               registrationDeadline:
 *                 type: string
 *                 format: date
 *               registrationLink:
 *                 type: string
 *               registrationContact:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Health event created successfully
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      title,
      titleBangla,
      description,
      descriptionBangla,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      organizer,
      targetAudience,
      services,
      requirements,
      capacity,
      registrationRequired,
      registrationDeadline,
      registrationLink,
      registrationContact,
      tags
    } = req.body;
    
    // Create new health event
    const event = new HealthEvent({
      title,
      titleBangla,
      description,
      descriptionBangla,
      eventType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime,
      endTime,
      location,
      organizer,
      targetAudience,
      services,
      requirements,
      capacity,
      registrationRequired,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      registrationLink,
      registrationContact,
      tags,
      createdBy: userId
    });
    
    await event.save();
    logger.info(`Health event created: ${event._id}`);
    
    // Schedule reminders for the event
    if (event.reminders && event.reminders.length > 0) {
      scheduleEventReminders(event);
    }
    
    res.status(201).json({
      message: 'স্বাস্থ্য ইভেন্ট সফলভাবে তৈরি হয়েছে',
      event
    });
  } catch (error) {
    logger.error('Error creating health event:', error);
    res.status(500).json({ 
      message: 'স্বাস্থ্য ইভেন্ট তৈরি করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /health-events/{id}/register:
 *   post:
 *     summary: Register for a health event
 *     tags: [Health Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               anonymous:
 *                 type: boolean
 *                 description: Register anonymously
 *     responses:
 *       200:
 *         description: Registration successful
 */
router.post('/:id/register', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { anonymous } = req.body;
    
    // Check if event exists and is upcoming
    const event = await HealthEvent.findById(id);
    
    if (!event) {
      return res.status(404).json({ message: 'স্বাস্থ্য ইভেন্ট পাওয়া যায়নি' });
    }
    
    if (event.status !== 'upcoming') {
      return res.status(400).json({ message: 'এইটি সমাপ্রতিত ইভেন্টের জন্য রেজিস্ট্রেশন করা যাবে না' });
    }
    
    // Check if registration is still open
    if (event.registrationRequired && event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ message: 'রেজিস্ট্রেশনের সময়সম শেষ হয়ে গেছে' });
    }
    
    // Check if event has reached capacity
    if (event.capacity && event.capacity.maxParticipants && 
        event.capacity.currentParticipants >= event.capacity.maxParticipants) {
      return res.status(400). json({ message: 'ইভেন্টের স্থান পূর্ণ' });
    }
    
    // Create participation record
    const participation = new EventParticipation({
      eventId: id,
      userId: anonymous ? null : userId,
      sessionId: anonymous ? generateSessionId(req) : userId,
      anonymous
    });
    
    await participation.save();
    
    // Update event participant count
    event.capacity.currentParticipants += 1;
    await event.save();
    
    logger.info(`User ${userId} registered for event: ${id}`);
    
    res.status(200).json({
      message: 'ইভেন্টের জন্য রেজিস্ট্রেশন সফলভাবে হয়েছে',
      participation: {
        id: participation._id,
        status: 'registered'
      }
    });
  } catch (error) {
    logger.error('Error registering for event:', error);
    res.status(500).json({ 
      message: 'ইভেন্টের জন্য রেজিস্ট্রেশন করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /health-events/{id}/feedback:
 *   post:
 *     summary: Submit feedback for a health event
 *     tags: [Health Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Event ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comments:
 *                 type: string
 *               suggestions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 */
router.post('/:id/feedback', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { rating, comments, suggestions } = req.body;
    
    // Find the participation record
    const participation = await EventParticipation.findOne({
      eventId: id,
      userId
    });
    
    if (!participation) {
      return res.status(404).json({ message: 'অংংশগ্রহণ পাওয়া যায়নি' });
    }
    
    // Update participation with feedback
    participation.feedback = {
      rating,
      comments,
      suggestions
    };
    
    await participation.save();
    
    logger.info(`Feedback submitted for event: ${id} by user: ${userId}`);
    
    res.status(200).json({
      message: 'ফিডব্যাক সফলভাবে হয়েছে'
    });
  } catch (error) {
    logger.error('Error submitting feedback:', error);
    res.status(500).json({ 
      message: 'ফিডব্যাক সফলভাবে করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /health-events/types:
 *   get:
 *     summary: Get all health event types
 *     tags: [Health Events]
 *     responses:
 *       200:
 *         description: Health event types
 */
router.get('/types', cacheMiddleware(7200), async (req, res) => {
  try {
    const eventTypes = [
      {
        id: 'health_checkup',
        name: 'স্বাস্থ্য পরীক্ষা',
        nameBangla: 'স্বাস্থ্য পরীক্ষা',
        description: 'বিনামূল্যে স্বাস্থ্য পরীক্ষা ক্যাম্প',
        descriptionBangla: 'বিনামূল্যে স্বাস্থ্য পরীক্ষা ক্যাম্প',
        icon: 'stethoscope'
      },
      {
        id: 'blood_donation',
        name: 'রক্ত দান',
        nameBangla: 'রক্ত দান',
        description: 'রক্ত দান ক্যাম্প',
        descriptionBangla: 'রক্ত দান ক্যাম্প',
        icon: 'blood-drop'
      },
      {
        id: 'vaccination_drive',
        name: 'টিকা ক্যাম্পাইন',
        nameBangla: 'টিকা ক্যাম্পাইন',
        description: 'টিকা ক্যাম্পাইন ক্যাম্প',
        descriptionBangla: 'টিকা ক্যাম্পাইন ক্যাম্প',
        icon: 'syringe'
      },
      {
        id: 'mental_health_session',
        name: 'মানসিক স্বাস্থ্য সেশন',
        nameBangla: 'মানসিক স্বাস্থ্য সেশন',
        description: 'মানসিক স্বাস্থ্য সম্পর্কিত সেশন',
        descriptionBangla: 'মানসিক স্বাস্থ্য সম্পর্কিত সেশন',
        icon: 'brain'
      },
      {
        id: 'maternal_health_workshop',
        name: 'মাতৃস্বাস্থ্য কর্মশালা',
        nameBangla: 'মাতৃস্বাস্থ্য কর্মশালা',
        description: 'মাতৃস্বাস্থ্য বিষয় কর্মশালা',
        descriptionBangla: 'মাতৃস্বাস্থ্য বিষয় কর্মশালা',
        icon: 'mother-child'
      },
      {
        id: 'health_awareness',
        name: 'স্বাস্থ্য সচেতনতা',
        nameBangla: 'স্বাস্থ্য সচেতনতা',
        description: 'স্বাস্থ্য সচেতনতা সেশন',
        descriptionBangla: 'স্বাস্থ্য সচেতনতা সেশন',
        icon: 'awareness'
      },
      {
        id: 'other',
        name: 'অন্যান্য',
        nameBangla: 'অন্যান্য',
        description: 'অন্যান্য স্বাস্থ্য সম্পর্ক',
        descriptionBangla: 'অন্যান্য স্বাস্থ্য সম্পর্ক',
        icon: 'other'
      }
    ];

    res.status(200).json({ eventTypes });
  } catch (error) {
    logger.error('Error fetching event types:', error);
    res.status(500).json({ 
      message: 'ইভেন্ট ধরন পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

// Helper function to generate session ID for anonymous users
function generateSessionId(req) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const userAgentHash = req.get('User-Agent') ? 
    req.get('User-Agent').substring(0, 5) : 'unknown';
  
  return `event_${timestamp}_${randomString}_${userAgentHash}`;
}

// Helper function to schedule event reminders
async function scheduleEventReminders(event) {
  try {
    // Schedule reminders based on event configuration
    if (event.reminders && event.reminders.length > 0) {
      for (const reminder of event.reminders) {
        const reminderTime = new Date(event.startDate);
        
        // Calculate reminder time based on timeBefore and timeUnit
        switch (reminder.timeUnit) {
          case 'hours':
            reminderTime.setHours(reminderTime.getHours() - reminder.timeBefore);
            break;
          case 'days':
            reminderTime.setDate(reminderTime.getDate() - reminder.timeBefore);
            break;
          case 'weeks':
            reminderTime.setDate(reminderTime.getDate() - (reminder.timeBefore * 7));
            break;
        }
        
        // Schedule the reminder (in a real implementation, this would use a job queue)
        logger.info(`Reminder scheduled for event ${event._id} at ${reminderTime}`);
      }
    }
  } catch (error) {
    logger.error('Error scheduling event reminders:', error);
  }
}

export default router;