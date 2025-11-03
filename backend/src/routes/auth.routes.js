import express from "express";
import User from "../models/User.model.js";
import { generateToken, verifyToken } from "../utils/jwt.js";
import { magicLinkQueue } from "../services/magicLinkQueue.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs (Bangla-first)
 */

/**
 * @swagger
 * /api/auth/request-magic-link:
 *   post:
 *     summary: ম্যাজিক লিঙ্ক অনুরোধ করুন
 *     tags: [Auth]
 *     requestBody:
 *       description: ব্যবহারকারীর ইমেইল প্রদান করুন
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: testuser@example.com
 *     responses:
 *       200:
 *         description: লিঙ্ক প্রেরণ হয়েছে
 *         content:
 *           application/json:
 *             example:
 *               message: "ম্যাজিক লিঙ্ক প্রেরণ করা হয়েছে। আপনার ইমেইল চেক করুন।"
 *       400:
 *         description: ইমেইল প্রয়োজন
 *         content:
 *           application/json:
 *             example:
 *               message: "ইমেইল প্রয়োজন"
 */

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

/**
 * @swagger
 * /api/auth/magic-login:
 *   get:
 *     summary: ম্যাজিক লিঙ্ক দিয়ে লগইন
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: ইমেইলে প্রাপ্ত ম্যাজিক লিঙ্ক টোকেন
 *     responses:
 *       200:
 *         description: লগইন সফল
 *         content:
 *           application/json:
 *             example:
 *               message: "সফলভাবে লগইন হয়েছে"
 *               user:
 *                 id: "64f1d2c4e6b0c123456789ab"
 *                 email: "testuser@example.com"
 *       401:
 *         description: অবৈধ বা মেয়াদোত্তীর্ণ লিঙ্ক
 *         content:
 *           application/json:
 *             example:
 *               message: "লিঙ্ক অবৈধ বা মেয়াদোত্তীর্ণ"
 *       404:
 *         description: ব্যবহারকারী পাওয়া যায়নি
 *         content:
 *           application/json:
 *             example:
 *               message: "ব্যবহারকারী পাওয়া যায়নি"
 */

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