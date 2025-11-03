import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateOTP, sendOTP } from '../utils/otp.js';
import { authMiddleware } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';
import config from '../config/index.js';

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, age, nid, phoneNumber, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ nid }, { phoneNumber }]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this NID or phone number already exists' 
      });
    }
    
    // Create new user
    const user = new User({
      name,
      age,
      nid,
      phoneNumber,
      password
    });
    
    await user.save();
    
    // Generate OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    // Send OTP (in production, this would be an SMS service)
    await sendOTP(phoneNumber, otp);
    
    logger.info(`New user registered with phone: ${phoneNumber}`);
    
    res.status(201).json({
      message: 'Registration successful. Please verify your phone number with the OTP sent.',
      userId: user._id
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );
    
    logger.info(`User verified: ${user.phoneNumber}`);
    
    res.status(200).json({
      message: 'Phone number verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        nid: user.nid,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    logger.error('OTP verification error:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    
    // Find user by phone number
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is verified
    if (!user.isVerified) {
      // Generate new OTP
      const otp = generateOTP();
      user.otp = otp;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      await user.save();
      
      // Send OTP
      await sendOTP(phoneNumber, otp);
      
      return res.status(403).json({
        message: 'Please verify your phone number with the OTP sent',
        userId: user._id,
        requiresVerification: true
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );
    
    logger.info(`User logged in: ${phoneNumber}`);
    
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        age: user.age,
        nid: user.nid,
        phoneNumber: user.phoneNumber
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();
    
    // Send OTP
    await sendOTP(user.phoneNumber, otp);
    
    logger.info(`OTP resent to: ${user.phoneNumber}`);
    
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    logger.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Failed to resend OTP', error: error.message });
  }
});

// Get user profile (protected route)
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -otp -otpExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ user });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile', error: error.message });
  }
});

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - age
 *         - nid
 *         - phoneNumber
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         age:
 *           type: number
 *           description: The user's age
 *         nid:
 *           type: string
 *           description: The user's National ID
 *         phoneNumber:
 *           type: string
 *           description: The user's phone number
 *         password:
 *           type: string
 *           description: The user's password
 *         isVerified:
 *           type: boolean
 *           description: Whether the user's phone number is verified
 *       example:
 *         id: d5fE_asz
 *         name: John Doe
 *         age: 30
 *         nid: 1234567890123
 *         phoneNumber: +8801712345678
 *         password: password123
 *         isVerified: true
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - age
 *               - nid
 *               - phoneNumber
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               age:
 *                 type: number
 *               nid:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 userId:
 *                   type: string
 *       400:
 *         description: User already exists
 *       500:
 *         description: Registration failed
 */