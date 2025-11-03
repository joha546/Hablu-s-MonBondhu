/**
 * Get current season based on current month
 * @returns {string} Current season
 */
export function getCurrentSeason() {
  const month = getCurrentMonth();
  
  if (month >= 3 && month <= 5) return 'summer';
  if (month >= 6 && month <= 9) return 'monsoon';
  if (month >= 10 && month <= 11) return 'autumn'; // Not in our schema but could be added
  if (month === 12 || month <= 2) return 'winter';
  
  return 'summer'; // Default
}

/**
 * Get current month (1-12)
 * @returns {number} Current month
 */
export function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

/**
 * Get season name in Bangla
 * @param {string} season - Season name in English
 * @returns {string} Season name in Bangla
 */
export function getSeasonNameBangla(season) {
  const seasonNames = {
    'summer': 'গ্রীষ্ম',
    'monsoon': 'বর্ষা',
    'winter': 'শীত',
    'year_round': 'সারা বছর'
  };
  
  return seasonNames[season] || season;
}

/**
 * Get month name in Bangla
 * @param {number} month - Month number (1-12)
 * @returns {string} Month name in Bangla
 */
export function getMonthNameBangla(month) {
  const monthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  
  return monthNames[month - 1] || '';
}

/**
 * Check if a tip is currently relevant
 * @param {Object} tip - Health tip object
 * @returns {boolean} Whether the tip is currently relevant
 */
export function isTipCurrentlyRelevant(tip) {
  const currentMonth = getCurrentMonth();
  const currentSeason = getCurrentSeason();
  
  // Check if it's a year-round tip
  if (tip.season === 'year_round') {
    return true;
  }
  
  // Check if it's for the current season
  if (tip.season !== currentSeason) {
    return false;
  }
  
  // Check if it's within the validity period
  if (tip.validityPeriod) {
    const { startMonth, endMonth } = tip.validityPeriod;
    
    // Handle year wrap-around (e.g., Dec-Feb)
    if (startMonth > endMonth) {
      return currentMonth >= startMonth || currentMonth <= endMonth;
    }
    
    return currentMonth >= startMonth && currentMonth <= endMonth;
  }
  
  return true;
}