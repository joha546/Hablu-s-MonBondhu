import express from "express";
import User from "../models/User.model.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { magicLinkQueue } from "../services/magicLinkQueue.js";

const router = express.Router();

router.post("/request-magic-link", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "ইমেইল প্রয়োজন" });

    // Upsert user
    let user = await User.findOne({ email });
    if(!user){
        user = await User.create({ email, verified: false });
    }

    const token = generateToken({ id: user._id, email });
    await magicLinkQueue.add("send-link", { email, token });

    res.status(200).json({ message: "ম্যাজিক লিঙ্ক প্রেরণ করা হয়েছে। আপনার ইমেইল চেক করুন।" });
});

// 2. Magic Link Login
router.get("/magic-login", async (req, res) => {
    const { token } = req.query;
    const decoded = verifyToken(token);
    if (!decoded){
        return res.status(401).json({ message: "লিঙ্ক অবৈধ বা মেয়াদোত্তীর্ণ" });
    }
    const user = await User.findById(decoded.id);
    if(!user){
        return res.status(404).json({ message: "ব্যবহারকারী পাওয়া যায়নি" });
    }
    
    // Mark user as verified
    user.verified = true;
    await user.save();

    res.status(200).json({ message: "সফলভাবে লগইন হয়েছে", user: { id: user._id, email: user.email } });
});

export default router;


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Bad request / User exists
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Log out a user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
