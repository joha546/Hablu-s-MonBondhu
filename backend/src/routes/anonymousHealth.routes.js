import express from 'express';
import AnonymousHealthRequest from '../models/AnonymousHealthRequest.js';
import HealthResponse from '../models/HealthResponse.js';
import { generateAnonymousId } from '../utils/anonymousUtils.js';
import { generateHealthResponse } from '../utils/healthResponseGenerator.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Anonymous Health
 *   description: গোপনীয় স্বাস্থ্য সাহায্য অনুরোধ (Anonymous Health Request)
 */

/**
 * @swagger
 * /anonymous-health/request:
 *   post:
 *     summary: নতুন গোপনীয় স্বাস্থ্য অনুরোধ জমা দিন
 *     tags: [Anonymous Health]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category
 *               - severity
 *               - symptoms
 *               - ageGroup
 *               - gender
 *               - location
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [maternal_health, child_health, mental_health, infectious_disease, chronic_disease, general]
 *               severity:
 *                 type: string
 *                 enum: [mild, moderate, severe, emergency]
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *               description:
 *                 type: string
 *                 maxlength: 500
 *               ageGroup:
 *                 type: string
 *                 enum: [child, teen, adult, elderly]
 *               gender:
 *                 type: string
 *                 enum: [male, female, other, prefer_not_to_say]
 *               location:
 *                 type: string
 *                 description: জেলা পর্যায়ের অবস্থান (সঠিক ঠিকানা নয়)
 *               urgency:
 *                 type: string
 *                 enum: [information, advice, immediate_help]
 *               preferredLanguage:
 *                 type: string
 *                 enum: [bangla, english]
 *               culturalContext:
 *                 type: string
 *                 maxlength: 300
 *     responses:
 *       201:
 *         description: অনুরোধ সফলভাবে জমা হয়েছে
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 requestId:
 *                   type: string
 *                 sessionId:
 *                   type: string
 *                 trustInfo:
 *                   type: object
 *                   properties:
 *                     anonymous:
 *                       type: boolean
 *                     noTracking:
 *                       type: boolean
 *                     dataRetention:
 *                       type: string
 */
router.post('/request', async (req, res) => {
  try {
    const {
      category,
      severity,
      symptoms,
      description,
      ageGroup,
      gender,
      location,
      urgency,
      preferredLanguage,
      culturalContext
    } = req.body;

    // Generate anonymous session ID
    const sessionId = generateAnonymousId(req);
    
    // Create anonymous health request
    const healthRequest = new AnonymousHealthRequest({
      sessionId,
      category,
      severity,
      symptoms,
      description,
      ageGroup,
      gender,
      location,
      urgency,
      preferredLanguage,
      culturalContext,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        fingerprintHash: generateFingerprintHash(req)
      }
    });

    await healthRequest.save();
    logger.info(`Anonymous health request created: ${healthRequest._id}`);

    // Generate AI-powered response
    const response = await generateHealthResponse(healthRequest);
    
    // Update request with response
    healthRequest.response = response._id;
    healthRequest.status = 'responded';
    await healthRequest.save();

    res.status(201).json({
      message: 'আপনার স্বাস্থ্য অনুরোধ গোপনীয়ভাবে গ্রহণ করা হয়েছে',
      requestId: healthRequest._id,
      sessionId,
      response: {
        id: response._id,
        primaryAdvice: response.primaryAdvice,
        immediateActions: response.immediateActions,
        culturalConsiderations: response.culturalConsiderations,
        trustSignals: response.trustSignals
      },
      trustInfo: {
        anonymous: true,
        noTracking: true,
        dataRetention: '৩০ দিনের পরে স্বয়ংক্রিয়ভাবে ডিলিট হবে',
        noPersonalInfo: 'কোনো ব্যক্তিগত তথ্য সংরক্ষণ করা হয়নি'
      }
    });
  } catch (error) {
    logger.error('Error creating anonymous health request:', error);
    res.status(500).json({ 
      message: 'অনুরোধ প্রক্রিয়া করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /anonymous-health/request/{sessionId}:
 *   get:
 *     summary: সেশন আইডি দিয়ে পূর্ববর্তী অনুরোধগুলি দেখুন
 *     tags: [Anonymous Health]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: সেশন আইডি
 *     responses:
 *       200:
 *         description: পূর্ববর্তী অনুরোধগুলি
 */
router.get('/request/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const requests = await AnonymousHealthRequest.find({ sessionId })
      .populate('response')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      requests: requests.map(request => ({
        id: request._id,
        category: request.category,
        severity: request.severity,
        symptoms: request.symptoms,
        createdAt: request.createdAt,
        status: request.status,
        response: request.response ? {
          id: request.response._id,
          primaryAdvice: request.response.primaryAdvice,
          immediateActions: request.response.immediateActions
        } : null
      }))
    });
  } catch (error) {
    logger.error('Error fetching anonymous health requests:', error);
    res.status(500).json({ 
      message: 'অনুরোধগুলি পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /anonymous-health/categories:
 *   get:
 *     summary: স্বাস্থ্য বিভাগসমূহ দেখুন
 *     tags: [Anonymous Health]
 *     responses:
 *       200:
 *         description: স্বাস্থ্য বিভাগসমূহ
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = [
      {
        id: 'maternal_health',
        name: 'মাতৃস্বাস্থ্য',
        description: 'গর্ভাবস্থা, প্রসব, স্তন্যপান সংক্রান্ত সমস্যা',
        icon: 'maternal',
        commonSymptoms: ['পেটে ব্যথা', 'অনিয়মিত ঋতুস্রাব', 'গর্ভাবস্থায় জ্বর', 'স্তন্যপান সমস্যা']
      },
      {
        id: 'child_health',
        name: 'শিশু স্বাস্থ্য',
        description: 'শিশুদের সাধারণ অসুস্থতা, টিকা, পুষ্টি',
        icon: 'child',
        commonSymptoms: ['জ্বর', 'ডায়রিয়া', 'শ্বাসকষ্ট', '�িঁচুনি']
      },
      {
        id: 'mental_health',
        name: 'মানসিক স্বাস্থ্য',
        description: 'মানসিক চাপ, উদ্বেগ, অবসাদ, ঘুমের সমস্যা',
        icon: 'mental',
        commonSymptoms: ['মানসিক চাপ', 'অবসাদ', 'ঘুমের সমস্যা', 'উদ্বেগ']
      },
      {
        id: 'infectious_disease',
        name: 'সংক্রামক রোগ',
        description: 'ডেঙ্গু, ম্যালেরিয়া, যক্ষ্মা, কোভিড-১৯',
        icon: 'infectious',
        commonSymptoms: ['জ্বর', 'সর্দি-কাশি', 'শরীরে ব্যথা', 'ডায়রিয়া']
      },
      {
        id: 'chronic_disease',
        name: 'দীর্ঘস্থায়ী রোগ',
        description: 'ডায়াবেটিস, উচ্চ রক্তচাপ, হৃদরোগ',
        icon: 'chronic',
        commonSymptoms: ['ডায়াবেটিস', 'উচ্চ রক্তচাপ', 'হৃদরোগের লক্ষণগুলি']
      },
      {
        id: 'general',
        name: 'সাধারণ স্বাস্থ্য',
        description: 'অন্যান্য স্বাস্থ্য সমস্যা',
        icon: 'general',
        commonSymptoms: ['মাথা ব্যথা', 'পেট ব্যথা', 'সাধারণ দুর্বলতা']
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
 * /anonymous-health/trust-info:
 *   get:
 *     summary: গোপনীয়তা ও বিশ্বাসযোগ্যতা তথ্য
 *     tags: [Anonymous Health]
 *     responses:
 *       200:
 *         description: গোপনীয়তা ও বিশ্বাসযোগ্যতা তথ্য
 */
router.get('/trust-info', async (req, res) => {
  try {
    const trustInfo = {
      privacy: {
        anonymous: 'আপনার কোনো ব্যক্তিগত তথ্য সংরক্ষণ করা হয় না',
        noTracking: 'আপনাকে ট্র্যাক করা হয় না',
        dataRetention: '৩০ দিনের পরে সব ডেটা স্বয়ংক্রিয়ভাবে ডিলিট হয়ে যায়',
        encryption: 'সব ডেটা এনক্রিপ্টেড থাকে'
      },
      trust: {
        medicalProfessionals: 'সব পরামর্শ চিকিৎসকদের দ্বারা পর্যালোচিত',
        evidenceBased: 'প্রমাণ-ভিত্তিক চিকিৎসা তথ্য',
        culturalSensitive: 'বাংলাদেশের প্রেক্ষাপটে তৈরি',
        emergencySupport: 'জরুরি পরিস্থিতিতে সাহায্য পাওয়ার ব্যবস্থা'
      },
      safety: {
        noJudgment: 'আপনার সমস্যা নিয়ে কোনো বিচার করা হবে না',
        confidential: 'আপনার তথ্য সম্পূর্ণ গোপনীয় থাকবে',
        supportive: 'আপনাকে সাহায্য করার জন্য এখানে',
        respectful: 'আপনার সংস্কৃতি ও মূল্যবোধের প্রতি সম্মান'
      }
    };

    res.status(200).json(trustInfo);
  } catch (error) {
    logger.error('Error fetching trust info:', error);
    res.status(500).json({ 
      message: 'তথ্য পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

export default router;