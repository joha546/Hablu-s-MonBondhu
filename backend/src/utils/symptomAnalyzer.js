import SymptomGuide from '../models/SymptomGuide.js';
import { logger } from './logger.js';

/**
 * Analyze symptoms and provide guidance
 * @param {Array} symptoms - Array of symptoms
 * @param {Object} demographicInfo - Demographic information
 * @returns {Object} Analysis results
 */
export async function analyzeSymptoms(symptoms, demographicInfo) {
  try {
    // Check for emergency symptoms first
    const emergencySymptoms = checkForEmergencySymptoms(symptoms);
    if (emergencySymptoms.length > 0) {
      return {
        possibleConditions: [{
          condition: 'Emergency Medical Condition',
          conditionBangla: 'জরুরি চিকিৎসা প্রয়োজন',
          probability: 'high',
          urgency: 'critical'
        }],
        dangerSigns: emergencySymptoms,
        recommendations: [{
          recommendation: 'Seek immediate medical attention',
          recommendationBangla: 'অবিলম্বে চিকিৎসকের সাহায্য নিন',
          priority: 'critical'
        }],
        whenToSeeDoctor: {
          condition: 'Emergency symptoms detected',
          conditionBangla: 'জরুরি উপসর্গ সনাক্ত হয়েছে',
          timeframe: 'immediately',
          urgency: 'critical'
        }
      };
    }
    
    // Get relevant symptom guides based on symptoms and demographic info
    const relevantGuides = await getRelevantGuides(symptoms, demographicInfo);
    
    // Analyze symptoms against guides
    const analysis = analyzeAgainstGuides(symptoms, relevantGuides, demographicInfo);
    
    return analysis;
  } catch (error) {
    logger.error('Error analyzing symptoms:', error);
    throw error;
  }
}

/**
 * Check for emergency symptoms
 * @param {Array} symptoms - Array of symptoms
 * @returns {Array} Emergency symptoms
 */
function checkForEmergencySymptoms(symptoms) {
  const emergencyKeywords = [
    'chest pain', 'বুকে ব্যথা', 'difficulty breathing', 'শ্বাসকষ্ট',
    'unconscious', 'অজ্ঞান', 'seizure', 'খিঁচুনি',
    'severe bleeding', 'অতিরিক্ত রক্তক্ষরণ', 'high fever', 'উচ্চ জ্বর',
    'sudden severe headache', 'হঠাৎ তীব্র মাথাব্যথা',
    'vision changes', 'দৃষ্টি পরিবর্তন', 'confusion', 'বিভ্রম',
    'slurred speech', 'অস্পষ্ট বক্তব', 'weakness on one side', 'একপাশে দুর্বলতা'
  ];
  
  const emergencySymptoms = [];
  
  symptoms.forEach(symptom => {
    const symptomText = `${symptom.name} ${symptom.additionalInfo || ''}`.toLowerCase();
    
    emergencyKeywords.forEach(keyword => {
      if (symptomText.includes(keyword.toLowerCase())) {
        emergencySymptoms.push({
          sign: symptom.name,
          signBangla: symptom.nameBangla || symptom.name,
          urgency: 'immediate',
          action: 'Seek immediate medical attention',
          actionBangla: 'অবিলম্বে চিকিৎসকের সাহায্য নিন'
        });
      }
    });
  });
  
  return emergencySymptoms;
}

/**
 * Get relevant symptom guides based on symptoms and demographic info
 * @param {Array} symptoms - Array of symptoms
 * @param {Object} demographicInfo - Demographic information
 * @returns {Array} Relevant symptom guides
 */
async function getRelevantGuides(symptoms, demographicInfo) {
  try {
    // Determine target audience based on demographic info
    let targetAudience = 'general';
    if (demographicInfo) {
      if (demographicInfo.ageGroup === 'infant' || demographicInfo.ageGroup === 'child') {
        targetAudience = 'child';
      } else if (demographicInfo.ageGroup === 'elderly') {
        targetAudience = 'elderly';
      } else if (demographicInfo.pregnant) {
        targetAudience = 'pregnant_women';
      }
    }
    
    // Get all guides for the target audience
    const guides = await SymptomGuide.find({
      $or: [
        { targetAudience },
        { targetAudience: 'general' }
      ],
      isActive: true
    });
    
    // Filter guides based on symptoms
    const relevantGuides = guides.filter(guide => {
      return symptoms.some(symptom => 
        guide.symptoms.some(guideSymptom => 
          symptom.name.toLowerCase().includes(guideSymptom.name.toLowerCase()) ||
          guideSymptom.name.toLowerCase().includes(symptom.name.toLowerCase())
        )
      );
    });
    
    return relevantGuides;
  } catch (error) {
    logger.error('Error getting relevant guides:', error);
    return [];
  }
}

/**
 * Analyze symptoms against guides
 * @param {Array} symptoms - Array of symptoms
 * @param {Array} guides - Relevant symptom guides
 * @param {Object} demographicInfo - Demographic information
 * @returns {Object} Analysis results
 */
function analyzeAgainstGuides(symptoms, guides, demographicInfo) {
  const possibleConditions = [];
  const dangerSigns = [];
  const recommendations = [];
  let whenToSeeDoctor = null;
  let maxUrgency = 'low';
  
  guides.forEach(guide => {
    // Check for matching symptoms
    const matchingSymptoms = guide.symptoms.filter(guideSymptom =>
      symptoms.some(symptom => 
        symptom.name.toLowerCase().includes(guideSymptom.name.toLowerCase()) ||
        guideSymptom.name.toLowerCase().includes(symptom.name.toLowerCase())
      )
    );
    
    if (matchingSymptoms.length > 0) {
      // Add possible conditions
      if (guide.relatedConditions && guide.relatedConditions.length > 0) {
        guide.relatedConditions.forEach(condition => {
          possibleConditions.push({
            condition: condition.condition,
            conditionBangla: condition.conditionBangla,
            probability: condition.probability,
            urgency: getUrgencyFromSeverity(matchingSymptoms)
          });
          
          if (condition.probability === 'high') {
            maxUrgency = 'high';
          }
        });
      }
      
      // Add danger signs
      if (guide.dangerSigns && guide.dangerSigns.length > 0) {
        guide.dangerSigns.forEach(sign => {
          dangerSigns.push(sign);
          
          if (sign.urgency === 'immediate') {
            maxUrgency = 'critical';
          } else if (sign.urgency === 'same_day' && maxUrgency !== 'critical') {
            maxUrgency = 'high';
          }
        });
      }
      
      // Add immediate actions
      if (guide.immediateActions && guide.immediateActions.length > 0) {
        guide.immediateActions.forEach(action => {
          recommendations.push({
            recommendation: action.action,
            recommendationBangla: action.actionBangla,
            priority: action.priority
          });
        });
      }
      
      // Set when to see doctor
      if (guide.whenToSeeDoctor && (!whenToSeeDoctor || getUrgencyLevel(guide.whenToSeeDoctor.urgency) > getUrgencyLevel(whenToSeeDoctor.urgency))) {
        whenToSeeDoctor = guide.whenToSeeDoctor;
      }
    }
  });
  
  // If no specific conditions found, provide general guidance
  if (possibleConditions.length === 0) {
    possibleConditions.push({
      condition: 'General Health Concern',
      conditionBangla: 'সাধারণ স্বাস্থ্য সমস্যা',
      probability: 'medium',
      urgency: maxUrgency
    });
  }
  
  // If no specific recommendations found, provide general recommendations
  if (recommendations.length === 0) {
    recommendations.push({
      recommendation: 'Monitor symptoms and seek medical advice if they worsen',
      recommendationBangla: 'উপসর্গগুলি পর্যবেক্ষণ করুন এবং খারাপ হলে চিকিৎসকের পরামর্শ নিন',
      priority: 'medium'
    });
  }
  
  // If no specific when to see doctor found, provide general guidance
  if (!whenToSeeDoctor) {
    whenToSeeDoctor = {
      condition: 'Persistent or worsening symptoms',
      conditionBangla: 'স্থায়ী বা খারাপ হওয়া উপসর্গ',
      timeframe: 'within_week',
      urgency: maxUrgency
    };
  }
  
  return {
    possibleConditions,
    dangerSigns,
    recommendations,
    whenToSeeDoctor
  };
}

/**
 * Get urgency level from severity
 * @param {Array} symptoms - Array of symptoms
 * @returns {string} Urgency level
 */
function getUrgencyFromSeverity(symptoms) {
  let maxSeverity = 'mild';
  
  symptoms.forEach(symptom => {
    if (symptom.severity === 'emergency') {
      maxSeverity = 'emergency';
    } else if (symptom.severity === 'severe' && maxSeverity !== 'emergency') {
      maxSeverity = 'severe';
    } else if (symptom.severity === 'moderate' && 
               (maxSeverity === 'mild' || maxSeverity === 'moderate')) {
      maxSeverity = 'moderate';
    }
  });
  
  switch (maxSeverity) {
    case 'emergency':
      return 'critical';
    case 'severe':
      return 'high';
    case 'moderate':
      return 'medium';
    default:
      return 'low';
  }
}

/**
 * Get urgency level from urgency string
 * @param {string} urgency - Urgency string
 * @returns {number} Urgency level (higher is more urgent)
 */
function getUrgencyLevel(urgency) {
  switch (urgency) {
    case 'immediate':
      return 4;
    case 'same_day':
      return 3;
    case 'within_week':
      return 2;
    default:
      return 1;
  }
}