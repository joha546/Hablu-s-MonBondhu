// backend/src/utils/notificationService.js
import { logger } from './logger.js';

/**
 * Send event reminder to user
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @param {Object} reminder - Reminder object
 * @returns {Promise<boolean>} Success status
 */
export async function sendEventReminder(user, event, reminder) {
  try {
    // In a real implementation, this would send an SMS or push notification
    // For now, we'll just log it
    logger.info(`Sending reminder to user ${user._id} for event ${event._id}: ${reminder.messageBangla}`);
    
    // Mark reminder as sent
    const reminderIndex = event.reminders.findIndex(r => 
      r.timeBefore === reminder.timeBefore && r.timeUnit === reminder.timeUnit
    );
    
    if (reminderIndex !== -1) {
      event.reminders[reminderIndex].sent = true;
      await event.save();
    }
    
    return true;
  } catch (error) {
    logger.error('Error sending event reminder:', error);
    return false;
  }
}

/**
 * Send event confirmation to user
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @param {Object} participation - Participation object
 * @returns {Promise<boolean>} Success status
 */
export async function sendEventConfirmation(user, event, participation) {
  try {
    // In a real implementation, this would send an SMS or push notification
    // For now, we'll just log it
    logger.info(`Sending confirmation to user ${user._id} for event ${event._id}`);
    
    return true;
  } catch (error) {
    logger.error('Error sending event confirmation:', error);
    return false;
  }
}

/**
 * Send event feedback request to user
 * @param {Object} user - User object
 * @param {Object} event - Event object
 * @returns {Promise<boolean>} Success status
 */
export async function sendEventFeedbackRequest(user, event) {
  try {
    // In a real implementation, this would send an SMS or push notification
    // For now, we'll just log it
    logger.info(`Sending feedback request to user ${user._id} for event ${event._id}`);
    
    return true;
  } catch (error) {
    logger.error('Error sending event feedback request:', error);
    return false;
  }
}

export default {
  sendEventReminder,
  sendEventConfirmation,
  sendEventFeedbackRequest
};