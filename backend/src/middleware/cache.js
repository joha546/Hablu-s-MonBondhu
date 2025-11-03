// backend/src/middleware/cache.js
import { logger } from '../utils/logger.js';

// Simple in-memory cache for development
const cache = new Map();

/**
 * Cache middleware for API responses
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware function
 */
export const cacheMiddleware = (ttl = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and query parameters
    const cacheKey = `${req.originalUrl || req.url}:${JSON.stringify(req.query)}`;
    
    // Check if response is cached
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse && Date.now() < cachedResponse.expiresAt) {
      logger.debug(`Cache hit for ${cacheKey}`);
      return res.json(cachedResponse.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Cache the response
      cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + (ttl * 1000)
      });
      
      logger.debug(`Cache set for ${cacheKey} (TTL: ${ttl}s)`);
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key to clear
 */
export const clearCache = (key) => {
  cache.delete(key);
  logger.debug(`Cache cleared for key: ${key}`);
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  cache.clear();
  logger.debug('All cache cleared');
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const [key, value] of cache.entries()) {
    if (now < value.expiresAt) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }
  
  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries
  };
};

/**
 * Clean up expired cache entries
 */
export const cleanupExpiredCache = () => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, value] of cache.entries()) {
    if (now >= value.expiresAt) {
      cache.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    logger.debug(`Cleaned up ${cleanedCount} expired cache entries`);
  }
  
  return cleanedCount;
};

// Auto-cleanup expired cache entries every 5 minutes
setInterval(cleanupExpiredCache, 5 * 60 * 1000);

export default {
  cacheMiddleware,
  clearCache,
  clearAllCache,
  getCacheStats,
  cleanupExpiredCache
};