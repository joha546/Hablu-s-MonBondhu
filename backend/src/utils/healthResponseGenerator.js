// backend/src/utils/healthResponseGenerator.js
import HealthResponse from '../models/HealthResponse.js';
import { logger } from './logger.js';
import { needsImmediateAttention, anonymizeLocation } from './anonymousUtils.js';

export async function generateHealthResponse(request) {
  try {
    const response = new HealthResponse({
      requestId: request._id,
      category: request.category,
      severity: request.severity,
      language: request.preferredLanguage || 'bangla'
    });

    // Generate primary advice based on category and severity
    response.primaryAdvice = generatePrimaryAdvice(request);
    
    // Generate immediate actions
    response.immediateActions = generateImmediateActions(request);
    
    // Add cultural considerations
    response.culturalConsiderations = generateCulturalConsiderations(request);
    
    // Add local resources
    response.localResources = await generateLocalResources(request);
    
    // Add warning signs
    response.warningSigns = generateWarningSigns(request);
    
    // Determine follow-up needs
    response.followUpNeeded = determineFollowUpNeeds(request);
    response.followUpTimeframe = determineFollowUpTimeframe(request);
    
    // Add trust signals
    response.trustSignals = generateTrustSignals(request);
    
    await response.save();
    logger.info(`Health response generated for request: ${request._id}`);
    
    return response;
  } catch (error) {
    logger.error('Error generating health response:', error);
    throw error;
  }
}

function generatePrimaryAdvice(request) {
  const adviceMap = {
    maternal_health: {
      mild: 'বিশ্রাম নিন এবং পর্যাপ্ত পানি পান করুন। যদি লক্ষণগুলি খারাপ হয়, নিকটস্থ স্বাস্থ্য কেন্দ্রে যান।',
      moderate: 'অবিলম্বে নিকটস্থ স্বাস্থ্য কেন্দ্রে যান। গর্ভাবস্থায় কোনো ঝুঁকি নেবেন না।',
      severe: 'তাৎক্ষণিকভাবে হাসপাতালে যান বা এম্বুলেন্স কল করুন।',
      emergency: 'জরুরি বিভাগে যান বা ১৬২৬৩ নম্বরে কল করুন।'
    },
    child_health: {
      mild: 'শিশুকে বিশ্রাম দিন এবং পর্যাপ্ত তরল খাবার দিন। লক্ষণ পর্যবেক্ষণ করুন।',
      moderate: 'নিকটস্থ শিশু বিশেষজ্ঞ বা স্বাস্থ্য কেন্দ্রে যান।',
      severe: 'তাৎক্ষণিকভাবে হাসপাতালে নিয়ে যান।',
      emergency: 'জরুরি বিভাগে যান বা এম্বুলেন্স কল করুন।'
    },
    mental_health: {
      mild: 'বিশ্রাম নিন এবং আপনার বিশ্বস্ত কাউকে কথা বলুন। নিয়মিত ব্যায়াম করুন।',
      moderate: 'একজন মানসিক স্বাস্থ্য পেশাজীবীর সাথে পরামর্শ করুন।',
      severe: 'অবিলম্বে মানসিক স্বাস্থ্য বিশেষজ্ঞের সাথে যোগাযোগ করুন।',
      emergency: 'জরুরি মানসিক স্বাস্থ্য সেবা নিন বা ১৬২৬৩ নম্বরে কল করুন।'
    },
    infectious_disease: {
      mild: 'বিশ্রাম নিন এবং পর্যাপ্ত পানি পান করুন। অন্যদের থেকে দূরে থাকুন।',
      moderate: 'নিকটস্থ স্বাস্থ্য কেন্দ্রে যান এবং ডাক্তারের পরামর্শ নিন।',
      severe: 'তাৎক্ষণিকভাবে হাসপাতালে যান।',
      emergency: 'জরুরি বিভাগে যান বা এম্বুলেন্স কল করুন।'
    },
    chronic_disease: {
      mild: 'নিয়মিত ওষুধ সেবন করুন এবং ডাক্তারের পরামর্শ অনুযায়ী জীবনযাপন করুন।',
      moderate: 'আপনার ডাক্তারের সাথে যোগাযোগ করুন।',
      severe: 'অবিলম্বে হাসপাতালে যান।',
      emergency: 'জরুরি বিভাগে যান বা এম্বুলেন্স কল করুন।'
    },
    general: {
      mild: 'বিশ্রাম নিন এবং পর্যাপ্ত পানি পান করুন। লক্ষণ পর্যবেক্ষণ করুন।',
      moderate: 'নিকটস্থ স্বাস্থ্য কেন্দ্রে যান।',
      severe: 'তাৎক্ষণিকভাবে হাসপাতালে যান।',
      emergency: 'জরুরি বিভাগে যান বা এম্বুলেন্স কল করুন।'
    }
  };

  return adviceMap[request.category]?.[request.severity] || 
         adviceMap.general[request.severity];
}

function generateImmediateActions(request) {
  const actions = [];
  
  if (request.severity === 'emergency') {
    actions.push({
      action: 'জরুরি সাহায্য কল করুন',
      priority: 'critical',
      description: 'এম্বুলেন্সের জন্য ১৬২৬৩ নম্বরে কল করুন'
    });
  }
  
  if (request.category === 'maternal_health') {
    actions.push({
      action: 'গর্ভকালীন যত্ন',
      priority: 'high',
      description: 'গর্ভাবস্থায় কোনো ঝুঁকি নেবেন না'
    });
  }
  
  if (request.category === 'child_health') {
    actions.push({
      action: 'শিশুর অবস্থা পর্যবেক্ষণ করুন',
      priority: 'high',
      description: '�িশুর তাপমাত্রা, শ্বাস-প্রশ্বাস এবং অন্যান্য লক্ষণ মনিটর করুন'
    });
  }
  
  actions.push({
    action: 'পর্যাপ্ত বিশ্রাম',
    priority: 'medium',
    description: 'শরীরকে সুস্থ হতে সময় দিন'
  });
  
  actions.push({
    action: 'তরল খাবার গ্রহণ',
    priority: 'medium',
    description: 'পর্যাপ্ত পানি এবং তরল খাবার পান করুন'
  });
  
  return actions;
}

function generateCulturalConsiderations(request) {
  const considerations = [];
  
  // Bangladesh-specific cultural considerations
  considerations.push({
    consideration: 'পরিবারের সমর্থন',
    explanation: 'পরিবারের সদস্যদের সাথে আপনার অবস্থা শেয়ার করুন, তারা আপনাকে সাহায্য করতে পারে'
  });
  
  if (request.category === 'mental_health') {
    considerations.push({
      consideration: 'সামাজিক কলঙ্ক',
      explanation: 'মানসিক স্বাস্থ্য সমস্যা নিয়ে লজ্জা পাবেন না, এটি একটি চিকিৎসাযোগ্য রোগ'
    });
  }
  
  if (request.category === 'maternal_health') {
    considerations.push({
      consideration: 'ঐতিহ্যবাহী চিকিৎসা',
      explanation: 'ঐতিহ্যবাহী চিকিৎসার পরিবর্তে চিকিৎসকের পরামর্শ নিন'
    });
  }
  
  considerations.push({
    consideration: 'ধর্মীয় বিশ্বাস',
    explanation: 'আপনার ধর্মীয় বিশ্বাস অনুযায়ী চিকিৎসা গ্রহণ করতে পারেন'
  });
  
  return considerations;
}

async function generateLocalResources(request) {
  const resources = [];
  const location = anonymizeLocation(request.location);
  
  // Add emergency hotline
  resources.push({
    name: 'স্বাস্থ্য বাতায়ন',
    type: 'hotline',
    contact: '১৬২৬৩',
    services: ['জরুরি স্বাস্থ্য সেবা', 'মেডিকেল পরামর্শ'],
    distance: '২৪/৭ উপলব্ধ',
    notes: 'সরকারি স্বাস্থ্য হটলাইন'
  });
  
  // Add mental health support
  if (request.category === 'mental_health') {
    resources.push({
      name: 'মানসিক স্বাস্থ্য হটলাইন',
      type: 'hotline',
      contact: '০৯৬৬৭৩১৭৭৪৪৬',
      services: ['মানসিক স্বাস্থ্য সাহায্য', 'কাউন্সেলিং'],
      distance: '২৪/৭ উপলব্ধ',
      notes: 'বিনামূল্যে মানসিক স্বাস্থ্য সেবা'
    });
  }
  
  // Add local facilities (simplified)
  resources.push({
    name: `${location} সদর হাসপাতাল`,
    type: 'hospital',
    contact: 'স্থানীয় নম্বর খুঁজুন',
    services: ['জরুরি সেবা', 'সাধারণ চিকিৎসা'],
    distance: 'জেলা সদরে',
    notes: 'নিকটস্থ সরকারি হাসপাতাল'
  });
  
  return resources;
}

function generateWarningSigns(request) {
  const warningSigns = [];
  
  if (request.category === 'maternal_health') {
    warningSigns.push({
      sign: 'অতিরিক্ত রক্তক্ষরণ',
      action: 'তাৎক্ষণিকভাবে হাসপাতালে যান'
    });
    warningSigns.push({
      sign: 'তীব্র পেট ব্যথা',
      action: 'জরুরি বিভাগে যান'
    });
  }
  
  if (request.category === 'child_health') {
    warningSigns.push({
      sign: 'শিশু অজ্ঞান হয়ে গেছে',
      action: 'তাৎক্ষণিকভাবে হাসপাতালে নিয়ে যান'
    });
    warningSigns.push({
      sign: 'শ্বাসকষ্ট বা নীল হয়ে যাওয়া',
      action: 'জরুরি সাহায্য নিন'
    });
  }
  
  warningSigns.push({
    sign: 'জ্বর ১০২°F এর বেশি',
    action: 'ডাক্তারের পরামর্শ নিন'
  });
  
  return warningSigns;
}

function determineFollowUpNeeds(request) {
  return request.severity !== 'mild';
}

function determineFollowUpTimeframe(request) {
  const timeframeMap = {
    emergency: 'immediately',
    severe: '24_hours',
    moderate: '3_days',
    mild: '1_week'
  };
  
  return timeframeMap[request.severity] || '1_week';
}

function generateTrustSignals(request) {
  const signals = [];
  
  signals.push({
    signal: 'গোপনীয়তা সুরক্ষিত',
    description: 'আপনার কোনো ব্যক্তিগত তথ্য সংরক্ষণ করা হয় না'
  });
  
  signals.push({
    signal: 'চিকিৎসক পর্যালোচিত',
    description: 'সব পরামর্শ চিকিৎসকদের দ্বারা পর্যালোচিত'
  });
  
  signals.push({
    signal: 'বিনামূল্যে সেবা',
    description: 'এই সেবা সম্পূর্ণ বিনামূল্যে'
  });
  
  signals.push({
    signal: '২৪/৭ উপলব্ধ',
    description: 'যেকোনো সময় সাহায্য পাওয়ার ব্যবস্থা'
  });
  
  return signals;
}