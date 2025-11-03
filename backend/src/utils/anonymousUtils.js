// backend/src/utils/anonymousUtils.js
import crypto from 'crypto';
import { logger } from './logger.js';

// Generate anonymous session ID
export function generateAnonymousId(req) {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(16).toString('hex');
  const userAgentHash = crypto.createHash('sha256')
    .update(req.get('User-Agent') || '')
    .digest('hex')
    .substring(0, 8);
  
  return `anon_${timestamp}_${randomString}_${userAgentHash}`;
}

// Generate fingerprint hash for session continuity
export function generateFingerprintHash(req) {
  const fingerprint = {
    userAgent: req.get('User-Agent') || '',
    acceptLanguage: req.get('Accept-Language') || '',
    acceptEncoding: req.get('Accept-Encoding') || '',
    // Add more non-identifying factors
  };
  
  return crypto.createHash('sha256')
    .update(JSON.stringify(fingerprint))
    .digest('hex');
}

// Generate emergency code for follow-up
export function generateEmergencyCode() {
  return `EMERG_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// Check if request needs immediate attention
export function needsImmediateAttention(request) {
  const emergencyKeywords = [
    'জরুরি', 'emergency', 'severe', 'critical', 
    'blood', 'bleeding', 'অতিরিক্ত রক্তক্ষরণ',
    'chest pain', 'বুকে ব্যথা', 'difficulty breathing', 'শ্বাসকষ্ট',
    'unconscious', 'অজ্ঞান', 'seizure', 'খিঁচুনি'
  ];
  
  const searchText = `${request.symptoms.join(' ')} ${request.description || ''}`.toLowerCase();
  
  return emergencyKeywords.some(keyword => 
    searchText.includes(keyword.toLowerCase())
  );
}

// Anonymize location to district level
export function anonymizeLocation(location) {
  // Only keep district level information
  const districtPatterns = [
    /ঢাকা/i, /dhaka/i,
    /চট্টগ্রাম/i, /chittagong/i,
    /খুলনা/i, /khulna/i,
    /রাজশাহী/i, /rajshahi/i,
    /সিলেট/i, /sylhet/i,
    /বরিশাল/i, /barisal/i,
    /রংপুর/i, /rangpur/i,
    /ময়মনসিংহ/i, /mymensingh/i
  ];
  
  for (const pattern of districtPatterns) {
    if (pattern.test(location)) {
      return location.match(pattern)[0];
    }
  }
  
  return 'Unknown';
}