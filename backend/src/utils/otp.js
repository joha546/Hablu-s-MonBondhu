// backend/src/utils/otp.js
import { logger } from './logger.js';

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (simulated for now)
export const sendOTP = async (phoneNumber, otp) => {
  try {
    // In production, you would integrate with an SMS service like Twilio, Vonage, etc.
    // For now, we'll just log the OTP
    logger.info(`OTP for ${phoneNumber}: ${otp}`);
    
    // Example of how you might integrate with an SMS service:
    // const response = await smsService.send({
    //   to: phoneNumber,
    //   message: `Your verification code for Hablu's-MonBondhu is: ${otp}. It will expire in 10 minutes.`
    // });
    
    return true;
  } catch (error) {
    logger.error('Failed to send OTP:', error);
    throw new Error('Failed to send OTP');
  }
};