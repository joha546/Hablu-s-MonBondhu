import express from 'express';
import MaternalHealthRecord from '../models/MaternalHealthRecord.js';
import ChildHealthRecord from '../models/ChildHealthRecord.js';
import VaccinationSchedule from '../models/VaccinationSchedule.js';
import { authMiddleware } from '../middleware/auth.js';
import { generateANCVisits, generateVaccinationSchedule } from '../utils/healthScheduleGenerator.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * tags:
 *   name: Maternal Child Health
 *   description: মাতৃ ও শিশু স্বাস্থ্য ট্র্যাকার (Maternal and Child Health Tracker)
 */

/**
 * @swagger
 * /maternal-child-health/maternal:
 *   post:
 *     summary: Create a new maternal health record
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lmp
 *               - gravida
 *             properties:
 *               lmp:
 *                 type: string
 *                 format: date
 *                 description: Last menstrual period
 *               gravida:
 *                 type: number
 *                 description: Number of pregnancies
 *               para:
 *                 type: number
 *                 description: Number of births
 *               bloodGroup:
 *                 type: string
 *                 enum: [A+, A-, B+, B-, AB+, AB-, O+, O-]
 *               height:
 *                 type: number
 *               weight:
 *                 type: number
 *     responses:
 *       201:
 *         description: Maternal health record created successfully
 */
router.post('/maternal', async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.headers['x-session-id'] || 'default';
    
    const {
      lmp,
      gravida,
      para,
      bloodGroup,
      height,
      weight
    } = req.body;
    
    // Calculate EDD (Expected Date of Delivery) - 280 days from LMP
    const lmpDate = new Date(lmp);
    const edd = new Date(lmpDate);
    edd.setDate(edd.getDate() + 280);
    
    // Create maternal health record
    const maternalRecord = new MaternalHealthRecord({
      userId,
      sessionId,
      lmp: lmpDate,
      edd,
      gravida,
      para: para || 0,
      bloodGroup,
      height,
      weight
    });
    
    // Generate ANC visit schedule
    const ancVisits = generateANCVisits(lmpDate, edd);
    maternalRecord.ancVisits = ancVisits;
    
    await maternalRecord.save();
    logger.info(`Maternal health record created for user: ${userId}`);
    
    res.status(201).json({
      message: 'মাতৃ স্বাস্থ্য রেকর্ড সফলভাবে তৈরি হয়েছে',
      record: maternalRecord
    });
  } catch (error) {
    logger.error('Error creating maternal health record:', error);
    res.status(500).json({ 
      message: 'মাতৃ স্বাস্থ্য রেকর্ড তৈরি করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/maternal/{id}:
 *   get:
 *     summary: Get maternal health record by ID
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maternal health record ID
 *     responses:
 *       200:
 *         description: Maternal health record
 */
router.get('/maternal/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const maternalRecord = await MaternalHealthRecord.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    });
    
    if (!maternalRecord) {
      return res.status(404).json({ message: 'মাতৃ স্বাস্থ্য রেকর্ড পাওয়া যায়নি' });
    }
    
    res.status(200).json(maternalRecord);
  } catch (error) {
    logger.error('Error fetching maternal health record:', error);
    res.status(500).json({ 
      message: 'মাতৃ স্বাস্থ্য রেকর্ড পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/maternal/{id}/anc-visits:
 *   get:
 *     summary: Get upcoming ANC visits for a maternal record
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maternal health record ID
 *     responses:
 *       200:
 *         description: Upcoming ANC visits
 */
router.get('/maternal/:id/anc-visits', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const maternalRecord = await MaternalHealthRecord.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    });
    
    if (!maternalRecord) {
      return res.status(404).json({ message: 'মাতৃ স্বাস্থ্য রেকর্ড পাওয়া যায়নি' });
    }
    
    const today = new Date();
    const upcomingVisits = maternalRecord.ancVisits.filter(visit => 
      !visit.completed && new Date(visit.scheduledDate) >= today
    ).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    
    res.status(200).json({
      upcomingVisits,
      totalVisits: maternalRecord.ancVisits.length,
      completedVisits: maternalRecord.ancVisits.filter(v => v.completed).length
    });
  } catch (error) {
    logger.error('Error fetching ANC visits:', error);
    res.status(500).json({ 
      message: 'ANC ভিজিট পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/maternal/{id}/anc-visit:
 *   post:
 *     summary: Record an ANC visit
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maternal health record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visitNumber
 *               - actualDate
 *             properties:
 *               visitNumber:
 *                 type: number
 *               actualDate:
 *                 type: string
 *                 format: date
 *               weight:
 *                 type: number
 *               bloodPressure:
 *                 type: object
 *                 properties:
 *                   systolic:
 *                     type: number
 *                   diastolic:
 *                     type: number
 *               fundalHeight:
 *                 type: number
 *               fetalHeartRate:
 *                 type: number
 *               urineProtein:
 *                 type: string
 *                 enum: [negative, trace, 1+, 2+, 3+]
 *               hemoglobin:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: ANC visit recorded successfully
 */
router.post('/maternal/:id/anc-visit', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const {
      visitNumber,
      actualDate,
      weight,
      bloodPressure,
      fundalHeight,
      fetalHeartRate,
      urineProtein,
      hemoglobin,
      notes
    } = req.body;
    
    const maternalRecord = await MaternalHealthRecord.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    });
    
    if (!maternalRecord) {
      return res.status(404).json({ message: 'মাতৃ স্বাস্থ্য রেকর্ড পাওয়া যায়নি' });
    }
    
    // Find the ANC visit to update
    const visitIndex = maternalRecord.ancVisits.findIndex(
      visit => visit.visitNumber === visitNumber
    );
    
    if (visitIndex === -1) {
      return res.status(404).json({ message: 'ANC ভিজিট পাওয়া যায়নি' });
    }
    
    // Update the visit
    maternalRecord.ancVisits[visitIndex] = {
      ...maternalRecord.ancVisits[visitIndex],
      actualDate: new Date(actualDate),
      weight,
      bloodPressure,
      fundalHeight,
      fetalHeartRate,
      urineProtein,
      hemoglobin,
      notes,
      completed: true
    };
    
    await maternalRecord.save();
    logger.info(`ANC visit recorded for maternal record: ${id}`);
    
    res.status(200).json({
      message: 'ANC ভিজিট সফলভাবে রেকর্ড করা হয়েছে',
      visit: maternalRecord.ancVisits[visitIndex]
    });
  } catch (error) {
    logger.error('Error recording ANC visit:', error);
    res.status(500).json({ 
      message: 'ANC ভিজিট রেকর্ড করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/child:
 *   post:
 *     summary: Create a new child health record
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - sex
 *               - birthDate
 *             properties:
 *               name:
 *                 type: string
 *               sex:
 *                 type: string
 *                 enum: [male, female, other]
 *               birthDate:
 *                 type: string
 *                 format: date
 *               birthWeight:
 *                 type: number
 *               birthLength:
 *                 type: number
 *               birthPlace:
 *                 type: string
 *                 enum: [home, facility, other]
 *               deliveryType:
 *                 type: string
 *                 enum: [normal, cesarean, assisted, other]
 *               maternalRecordId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Child health record created successfully
 */
router.post('/child', async (req, res) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.headers['x-session-id'] || 'default';
    
    const {
      name,
      sex,
      birthDate,
      birthWeight,
      birthLength,
      birthPlace,
      deliveryType,
      maternalRecordId
    } = req.body;
    
    // Create child health record
    const childRecord = new ChildHealthRecord({
      userId,
      sessionId,
      name,
      sex,
      birthDate: new Date(birthDate),
      birthWeight,
      birthLength,
      birthPlace,
      deliveryType,
      maternalRecordId
    });
    
    // Generate vaccination schedule based on Bangladesh EPI
    const vaccinationSchedule = await generateVaccinationSchedule(new Date(birthDate));
    childRecord.vaccinations = vaccinationSchedule;
    
    await childRecord.save();
    logger.info(`Child health record created for user: ${userId}`);
    
    res.status(201).json({
      message: 'শিশু স্বাস্থ্য রেকর্ড সফলভাবে তৈরি হয়েছে',
      record: childRecord
    });
  } catch (error) {
    logger.error('Error creating child health record:', error);
    res.status(500).json({ 
      message: 'শিশু স্বাস্থ্য রেকর্ড তৈরি করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/child/{id}:
 *   get:
 *     summary: Get child health record by ID
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Child health record ID
 *     responses:
 *       200:
 *         description: Child health record
 */
router.get('/child/:id', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const childRecord = await ChildHealthRecord.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    });
    
    if (!childRecord) {
      return res.status(404).json({ message: 'শিশু স্বাস্থ্য রেকর্ড পাওয়া যায়নি' });
    }
    
    res.status(200).json(childRecord);
  } catch (error) {
    logger.error('Error fetching child health record:', error);
    res.status(500).json({ 
      message: 'শিশু স্বাস্থ্য রেকর্ড পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/child/{id}/vaccinations:
 *   get:
 *     summary: Get vaccination schedule for a child
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Child health record ID
 *     responses:
 *       200:
 *         description: Vaccination schedule
 */
router.get('/child/:id/vaccinations', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const childRecord = await ChildHealthRecord.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    });
    
    if (!childRecord) {
      return res.status(404).json({ message: 'শিশু স্বাস্থ্য রেকর্ড পাওয়া যায়নি' });
    }
    
    const today = new Date();
    const upcomingVaccinations = childRecord.vaccinations.filter(vaccine => 
      vaccine.status !== 'administered' && new Date(vaccine.scheduledDate) >= today
    ).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    
    const overdueVaccinations = childRecord.vaccinations.filter(vaccine => 
      vaccine.status === 'scheduled' && new Date(vaccine.scheduledDate) < today
    ).sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
    
    const administeredVaccinations = childRecord.vaccinations.filter(vaccine => 
      vaccine.status === 'administered'
    ).sort((a, b) => new Date(a.administeredDate) - new Date(b.administeredDate));
    
    res.status(200).json({
      upcomingVaccinations,
      overdueVaccinations,
      administeredVaccinations,
      totalVaccinations: childRecord.vaccinations.length
    });
  } catch (error) {
    logger.error('Error fetching vaccination schedule:', error);
    res.status(500).json({ 
      message: 'টিকা সময়সূচী পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/child/{id}/vaccination:
 *   post:
 *     summary: Record a vaccination
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Child health record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - vaccineId
 *               - administeredDate
 *             properties:
 *               vaccineId:
 *                 type: string
 *               administeredDate:
 *                 type: string
 *                 format: date
 *               administeredBy:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vaccination recorded successfully
 */
router.post('/child/:id/vaccination', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    
    const {
      vaccineId,
      administeredDate,
      administeredBy,
      batchNumber,
      notes
    } = req.body;
    
    const childRecord = await ChildHealthRecord.findOne({ 
      _id: id, 
      userId, 
      isActive: true 
    });
    
    if (!childRecord) {
      return res.status(404).json({ message: 'শিশু স্বাস্থ্য রেকর্ড পাওয়া যায়নি' });
    }
    
    // Find the vaccination to update
    const vaccineIndex = childRecord.vaccinations.findIndex(
      vaccine => vaccine._id.toString() === vaccineId
    );
    
    if (vaccineIndex === -1) {
      return res.status(404).json({ message: 'টিকা পাওয়া যায়নি' });
    }
    
    // Update the vaccination
    childRecord.vaccinations[vaccineIndex] = {
      ...childRecord.vaccinations[vaccineIndex],
      administeredDate: new Date(administeredDate),
      administeredBy,
      batchNumber,
      notes,
      status: 'administered'
    };
    
    await childRecord.save();
    logger.info(`Vaccination recorded for child record: ${id}`);
    
    res.status(200).json({
      message: 'টিকা সফলভাবে রেকর্ড করা হয়েছে',
      vaccination: childRecord.vaccinations[vaccineIndex]
    });
  } catch (error) {
    logger.error('Error recording vaccination:', error);
    res.status(500).json({ 
      message: 'টিকা রেকর্ড করতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

/**
 * @swagger
 * /maternal-child-health/vaccination-schedule:
 *   get:
 *     summary: Get the Bangladesh EPI vaccination schedule
 *     tags: [Maternal Child Health]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bangladesh EPI vaccination schedule
 */
router.get('/vaccination-schedule', async (req, res) => {
  try {
    const schedule = await VaccinationSchedule.find({ 
      targetGroup: 'infant', 
      isActive: true 
    }).sort({ 'doses.0.minAgeWeeks': 1 });
    
    res.status(200).json(schedule);
  } catch (error) {
    logger.error('Error fetching vaccination schedule:', error);
    res.status(500).json({ 
      message: 'টিকা সময়সূচী পেতে সমস্যা হয়েছে', 
      error: error.message 
    });
  }
});

export default router;