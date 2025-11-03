// backend/src/utils/aiService.js
import { logger } from './logger.js';

// Generate personalized greeting based on user's last check-in
export const generatePersonalizedGreeting = async (userName, daysSinceLastCheckin, lastMoodLevel) => {
    try {
        if (daysSinceLastCheckin === null) {
            // First time user
            return `স্বাগতম, ${userName}! আজই প্রথম আপনি আপনার মনের অবস্থা শেয়ার করছেন। আপনার মনের কথা শুনতে আমরা এখানে আছি।`;
        }
        
        if (daysSinceLastCheckin >= 7) {
            // Addressing the riddle: Gentle nudge without shaming for long absence
            return `হ্যালো ${userName}, আপনি অনেকদিন পর ফিরে এসেছেন। আপনার মনের খোঁজ নিতে আমরা অপেক্ষা করছি। আজ আপনি কেমন আছেন?`;
        }
        
        if (daysSinceLastCheckin >= 3) {
            // Addressing the riddle: Gentle nudge without shaming for 3+ days
            return `${userName}, আপনি কেমন আছেন? আপনার মনের অবস্থা জানতে আমরা আগ্রহী। আজকের দিনটি কেমন কাটছে?`;
        }
        
        if (daysSinceLastCheckin === 1) {
            // Regular user
            return `আবার দেখা হলো, ${userName}! আজকে আপনার মনের অবস্থা কেমন?`;
        }
        
        // Same day check-in
        return `${userName}, আজকে আবার আপনার মনের খোঁজ নিতে এসেছি। কিছু পরিবর্তন হয়েছে কি?`;
    } catch (error) {
        logger.error("Error generating greeting:", error);
        return `${userName}, আজ আপনি কেমন আছেন?`;
    }
};

// Generate AI-powered contextual prompts based on mood
export const generateAIPrompt = async (moodLevel, note) => {
    try {
        // In a real implementation, this would call an AI service
        // For now, we'll use predefined prompts based on mood level
        
        const prompts = {
            1: { // খুব খারাপ
                text: "আপনি খুব খারাপ বোধ করছেন। এটা একটা কঠিন সময়। মনে রাখবেন, আপনি একা নন। আপনার কাছের কাউকে বা আমাদের সাহায্য লাইনে ফোন করতে পারেন।",
                action: "সাহায্য পেতে এখানে ক্লিক করুন"
            },
            2: { // খারাপ
                text: "আপনি খারাপ বোধ করছেন। কখনো কখনো জীবনে খারাপ সময় আসে। গভীর নিঃশ্বাস নিন এবং মনে রাখবেন এই সময়ও কেটে যাবে।",
                action: "শান্ত হওয়ার কিছু উপায় জানতে এখানে ক্লিক করুন"
            },
            3: { // সাধারণ
                text: "আপনি সাধারণ অনুভব করছেন। প্রতিদিন ছোট ছোট ভালো কাজ করলে মন ভালো থাকতে পারে।",
                action: "মন ভালো রাখার কিছু টিপস জানতে এখানে ক্লিক করুন"
            },
            4: { // ভালো
                text: "আপনি ভালো আছেন, এটা শুনে খুব ভালো লাগলো! আপনার এই ভালো অনুভূতি ধরে রাখার জন্য নিয়মিত কিছু ব্যায়াম করতে পারেন।",
                action: "ভালো থাকার কিছু উপায় জানতে এখানে ক্লিক করুন"
            },
            5: { // খুব ভালো
                text: "আপনি খুব ভালো আছেন! এই অনুভূতিটা অন্যদের সাথে শেয়ার করলে তাদেরও ভালো লাগবে।",
                action: "আপনার আনন্দ অন্যদের সাথে শেয়ার করতে এখানে ক্লিক করুন"
            }
        };
        
        // Special case for depression-related notes
        if (note && (note.toLowerCase().includes('depression') || 
                    note.includes('ডিপ্রেশন') || 
                    note.includes('মন খারাপ'))) {
            return {
                text: "ডিপ্রেশন থেকে বাঁচতে হলে আপনার মনের কথা বলার লোক প্রয়োজন। আমরা আপনার পাশে আছি। আপনি একা নন।",
                action: "সাহায্য পেতে এখানে ক্লিক করুন"
            };
        }
        
        return prompts[moodLevel] || prompts[3];
    } catch (error) {
        logger.error("Error generating AI prompt:", error);
        return {
            text: "আপনার মনের অবস্থা জানানোর জন্য ধন্যবাদ। মনে রাখবেন, আপনি একা নন।",
            action: "আরও সাহায্য পেতে এখানে ক্লিক করুন"
        };
    }
};