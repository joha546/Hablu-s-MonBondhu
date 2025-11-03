import { logger } from './logger.js';

/**
 * Generate seasonal health tips using AI
 * @param {Object} params - Parameters for tip generation
 * @returns {Object} Generated health tip
 */
export async function generateSeasonalTips(params) {
  try {
    const { season, category, targetAudience } = params;
    
    // In a real implementation, this would call an AI service
    // For now, we'll use predefined templates based on season and category
    
    const templates = getTemplatesBySeasonAndCategory(season, category, targetAudience);
    
    // Select a random template
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Generate the tip based on the template
    const tip = {
      season,
      category,
      targetAudience,
      title: template.title,
      titleBangla: template.titleBangla,
      description: template.description,
      descriptionBangla: template.descriptionBangla,
      diseases: template.diseases,
      preventiveMeasures: template.preventiveMeasures,
      visualAids: template.visualAids,
      practicalTips: template.practicalTips,
      warningSigns: template.warningSigns,
      localResources: template.localResources,
      validityPeriod: template.validityPeriod,
      language: 'both'
    };
    
    return tip;
  } catch (error) {
    logger.error('Error generating seasonal tips:', error);
    throw error;
  }
}

/**
 * Get templates by season and category
 * @param {string} season - Season
 * @param {string} category - Category
 * @param {string} targetAudience - Target audience
 * @returns {Array} Array of templates
 */
function getTemplatesBySeasonAndCategory(season, category, targetAudience) {
  const templates = [];
  
  // Monsoon templates
  if (season === 'monsoon') {
    if (category === 'disease_prevention') {
      templates.push({
        title: 'Dengue Prevention',
        titleBangla: 'ডেঙ্গু প্রতিরোধ',
        description: 'Prevent dengue by eliminating mosquito breeding sites and using protection',
        descriptionBangla: 'মশার প্রজনন স্থল দূর করে এবং সুরক্ষা ব্যবহার করে ডেঙ্গু প্রতিরোধ করুন',
        diseases: ['dengue', 'malaria', 'chikungunya'],
        diseasesBangla: ['ডেঙ্গু', 'ম্যালেরিয়া', 'চিকুনগুনিয়া'],
        preventiveMeasures: [
          {
            measure: 'Remove standing water',
            measureBangla: 'স্থির জল দূর করুন',
            icon: 'water-drop',
            priority: 'high'
          },
          {
            measure: 'Use mosquito nets',
            measureBangla: 'মশারি ব্যবহার করুন',
            icon: 'mosquito-net',
            priority: 'high'
          },
          {
            measure: 'Wear protective clothing',
            measureBangla: 'সুরক্ষামূলক পোশাক পরুন',
            icon: 'clothing',
            priority: 'medium'
          },
          {
            measure: 'Use mosquito repellent',
            measureBangla: 'মশা তাড়ানো স্প্রে ব্যবহার করুন',
            icon: 'spray',
            priority: 'medium'
          }
        ],
        visualAids: [
          {
            type: 'image',
            url: '/images/dengue-prevention.jpg',
            caption: 'How to prevent dengue',
            captionBangla: 'ডেঙ্গু প্রতিরোধের উপায়'
          }
        ],
        practicalTips: [
          {
            tip: 'Check for water in flower pots, old tires, and containers',
            tipBangla: 'ফুলের টব, পুরনো টায়ার এবং পাত্রে জল আছে কিনা পরীক্ষা করুন',
            icon: 'search'
          },
          {
            tip: 'Clean water storage containers weekly',
            tipBangla: 'জল সংরক্ষণ পাত্র সাপ্তাহিক পরিষ্কার করুন',
            icon: 'clean'
          },
          {
            tip: 'Use screens on windows and doors',
            tipBangla: 'জানালা এবং দরজায় জাল ব্যবহার করুন',
            icon: 'window'
          }
        ],
        warningSigns: [
          {
            sign: 'High fever with severe headache',
            signBangla: 'তীব্র মাথাব্যথা সহ উচ্চ জ্বর',
            action: 'Seek medical help immediately',
            actionBangla: 'অবিলম্বে চিকিৎসকের সাহায্য নিন',
            urgency: 'immediate'
          },
          {
            sign: 'Pain behind the eyes',
            signBangla: 'চোখের পিছনে ব্যথা',
            action: 'Consult a doctor',
            actionBangla: 'ডাক্তারের পরামর্শ নিন',
            urgency: 'same_day'
          }
        ],
        localResources: [
          {
            name: 'Dengue Control Room',
            nameBangla: 'ডেঙ্গু নিয়ন্ত্রণ কক্ষ',
            type: 'hotline',
            contact: '১৬২৬৩',
            description: '24/7 dengue helpline',
            descriptionBangla: '২৪/৭ ডেঙ্গু হেল্পলাইন'
          }
        ],
        validityPeriod: {
          startMonth: 6,
          endMonth: 9
        }
      });
    }
    
    if (category === 'water_safety') {
      templates.push({
        title: 'Safe Drinking Water in Monsoon',
        titleBangla: 'বর্ষাকালে নিরাপদ পানীয় জল',
        description: 'Ensure safe drinking water during monsoon to prevent waterborne diseases',
        descriptionBangla: 'জলবাহিত রোগ প্রতিরোধের জন্য বর্ষাকালে নিরাপদ পানীয় জল নিশ্চিত করুন',
        diseases: ['cholera', 'typhoid', 'hepatitis A', 'diarrhea'],
        diseasesBangla: ['কলেরা', 'টাইফয়েড', 'হেপাটাইটিস এ', 'ডায়রিয়া'],
        preventiveMeasures: [
          {
            measure: 'Boil water for 10 minutes',
            measureBangla: 'পানি ১০ মিনিট ফুটান',
            icon: 'boil',
            priority: 'high'
          },
          {
            measure: 'Use water purification tablets',
            measureBangla: 'জল পরিশোধন ট্যাবলেট ব্যবহার করুন',
            icon: 'tablet',
            priority: 'high'
          },
          {
            measure: 'Store water in clean containers',
            measureBangla: 'পরিষ্কার পাত্রে জল সংরক্ষণ করুন',
            icon: 'container',
            priority: 'medium'
          }
        ],
        practicalTips: [
          {
            tip: 'Cover water containers to prevent contamination',
            tipBangla: 'দূষণ রোধ করতে জলের পাত্র ঢেকে রাখুন',
            icon: 'cover'
          },
          {
            tip: 'Use a clean ladle to take water from containers',
            tipBangla: 'পাত্র থেকে জল নেওয়ার জন্য পরিষ্কার চামচ ব্যবহার করুন',
            icon: 'ladle'
          }
        ],
        warningSigns: [
          {
            sign: 'Frequent loose stools',
            signBangla: 'ঘন ঘন পাতলা পায়খানা',
            action: 'Increase fluid intake and consult a doctor',
            actionBangla: 'তরল গ্রহণ বাড়ান এবং ডাক্তারের পরামর্শ নিন',
            urgency: 'same_day'
          }
        ],
        localResources: [
          {
            name: 'Local Health Center',
            nameBangla: 'স্থানীয় স্বাস্থ্য কেন্দ্র',
            type: 'clinic',
            contact: 'স্থানীয় নম্বর দেখুন',
            description: 'Free ORS and medical consultation',
            descriptionBangla: 'বিনামূল্যে ORS এবং চিকিৎসা পরামর্শ'
          }
        ],
        validityPeriod: {
          startMonth: 6,
          endMonth: 9
        }
      });
    }
  }
  
  // Winter templates
  if (season === 'winter') {
    if (category === 'disease_prevention') {
      templates.push({
        title: 'Cold and Flu Prevention',
        titleBangla: 'সর্দি-কাশি এবং ফ্লু প্রতিরোধ',
        description: 'Prevent cold and flu during winter season with simple measures',
        descriptionBangla: 'সাধারণ ব্যবস্থায় শীতকালে সর্দি-কাশি এবং ফ্লু প্রতিরোধ করুন',
        diseases: ['cold', 'flu', 'pneumonia'],
        diseasesBangla: ['সর্দি-কাশি', 'ফ্লু', 'নিউমোনিয়া'],
        preventiveMeasures: [
          {
            measure: 'Wash hands frequently with soap',
            measureBangla: 'সাবান দিয়ে ঘন ঘন হাত ধোবেন',
            icon: 'hand-wash',
            priority: 'high'
          },
          {
            measure: 'Keep warm with proper clothing',
            measureBangla: 'উপযুক্ত পোশাকের সাহায্যে উষ্ণ থাকুন',
            icon: 'warm-clothing',
            priority: 'high'
          },
          {
            measure: 'Avoid crowded places',
            measureBangla: 'ভিড় এড়িয়ে চলুন',
            icon: 'social-distancing',
            priority: 'medium'
          }
        ],
        practicalTips: [
          {
            tip: 'Cover mouth and nose when coughing or sneezing',
            tipBangla: 'কাশি বা হাঁচির সময় মুখ এবং নাক ঢেকে রাখুন',
            icon: 'cover-mouth'
          },
          {
            tip: 'Drink warm fluids like tea and soup',
            tipBangla: 'চা এবং স্যুপের মতো উষ্ণ তরল পান করুন',
            icon: 'warm-drink'
          }
        ],
        warningSigns: [
          {
            sign: 'Difficulty breathing in children',
            signBangla: 'শিশুদের শ্বাসকষ্ট',
            action: 'Seek immediate medical attention',
            actionBangla: 'অবিলম্বে চিকিৎসকের সাহায্য নিন',
            urgency: 'immediate'
          },
          {
            sign: 'High fever with cough',
            signBangla: 'কাশি সহ উচ্চ জ্বর',
            action: 'Consult a doctor',
            actionBangla: 'ডাক্তারের পরামর্শ নিন',
            urgency: 'same_day'
          }
        ],
        localResources: [
          {
            name: 'Child Health Clinic',
            nameBangla: 'শিশু স্বাস্থ্য ক্লিনিক',
            type: 'clinic',
            contact: 'স্থানীয় নম্বর দেখুন',
            description: 'Special care for children with respiratory issues',
            descriptionBangla: 'শ্বাসয়ত সমস্যাযুক্ত শিশুদের বিশেষ যত্ন'
          }
        ],
        validityPeriod: {
          startMonth: 12,
          endMonth: 2
        }
      });
    }
  }
  
  // Summer templates
  if (season === 'summer') {
    if (category === 'disease_prevention') {
      templates.push({
        title: 'Heat Stroke Prevention',
        titleBangla: 'তাপপ্রদাহ প্রতিরোধ',
        description: 'Prevent heat stroke during hot summer months',
        descriptionBangla: 'গরম গ্রীষ্মকালে তাপপ্রদাহ প্রতিরোধ করুন',
        diseases: ['heat_stroke', 'dehydration', 'sunburn'],
        diseasesBangla: ['তাপপ্রদাহ', 'ডিহাইড্রেশন', 'সানবার্ন'],
        preventiveMeasures: [
          {
            measure: 'Drink plenty of water',
            measureBangla: 'প্রচুর পরিমাণে জল পান করুন',
            icon: 'water',
            priority: 'high'
          },
          {
            measure: 'Avoid direct sun exposure',
            measureBangla: 'সরাসরি সূর্যের এক্সপোজার এড়িয়ে চলুন',
            icon: 'shade',
            priority: 'high'
          },
          {
            measure: 'Wear light-colored, loose clothing',
            measureBangla: 'হালকা রঙের, ঢিলা পোশাক পরুন',
            icon: 'clothing',
            priority: 'medium'
          }
        ],
        practicalTips: [
          {
            tip: 'Keep wet cloth on head and neck',
            tipBangla: 'মাথা এবং ঘাড়ায় ভেজা কাপড় রাখুন',
            icon: 'wet-cloth'
          },
          {
            tip: 'Take cool showers',
            tipBangla: 'ঠান্ডা স্নান নিন',
            icon: 'shower'
          }
        ],
        warningSigns: [
          {
            sign: 'Dizziness and confusion',
            signBangla: 'মাথা ঘোরা এবং বিভ্রম',
            action: 'Move to a cool place and seek medical help',
            actionBangla: 'একটি শীতল স্থানে যান এবং চিকিৎসকের সাহায্য নিন',
            urgency: 'immediate'
          }
        ],
        localResources: [
          {
            name: 'Emergency Medical Services',
            nameBangla: 'জরুরি চিকিৎসা পরিষেবা',
            type: 'hotline',
            contact: '১৬২৬৩',
            description: '24/7 emergency medical assistance',
            descriptionBangla: '২৪/৭ জরুরি চিকিৎসা সহায়তা'
          }
        ],
        validityPeriod: {
          startMonth: 3,
          endMonth: 5
        }
      });
    }
  }
  
  // Year-round templates
  if (season === 'year_round') {
    if (category === 'general_health') {
      templates.push({
        title: 'Handwashing for Disease Prevention',
        titleBangla: 'রোগ প্রতিরোধে হাত ধোয়া',
        description: 'Proper handwashing technique to prevent diseases',
        descriptionBangla: 'রোগ প্রতিরোধের জন্য সঠিক হাত ধোয়া কৌশল',
        diseases: ['diarrhea', 'respiratory_infections', 'covid_19'],
        diseasesBangla: ['ডায়রিয়া', 'শ্বাসয়ত সংক্রমণ', 'কোভিড-১৯'],
        preventiveMeasures: [
          {
            measure: 'Wash hands with soap for 20 seconds',
            measureBangla: 'সাবান দিয়ে ২০ সেকেন্ড হাত ধোবেন',
            icon: 'hand-wash',
            priority: 'high'
          },
          {
            measure: 'Use alcohol-based hand sanitizer',
            measureBangla: 'অ্যালকোহল-ভিত্তিক হ্যান্ড স্যানিটাইজার ব্যবহার করুন',
            icon: 'sanitizer',
            priority: 'medium'
          }
        ],
        practicalTips: [
          {
            tip: 'Wash hands before eating and after using toilet',
            tipBangla: 'খাওয়ার আগে এবং টয়লেট ব্যবহারের পরে হাত ধোবেন',
            icon: 'timing'
          },
          {
            tip: 'Teach children proper handwashing',
            tipBangla: 'শিশুদের সঠিকভাবে হাত ধোয়া শিখান',
            icon: 'teach'
          }
        ],
        warningSigns: [
          {
            sign: 'Frequent stomach infections',
            signBangla: 'ঘন ঘন পেটের সংক্রমণ',
            action: 'Improve hand hygiene and consult a doctor',
            actionBangla: 'হাতের স্বাস্থ্যবিধি উন্নত করুন এবং ডাক্তারের পরামর্শ নিন',
            urgency: 'within_week'
          }
        ],
        localResources: [
          {
            name: 'Community Health Worker',
            nameBangla: 'কমিউনিটি হেলথ ওয়ার্কার',
            type: 'chw',
            contact: 'স্থানীয় নম্বর দেখুন',
            description: 'Free health education and basic medical support',
            descriptionBangla: 'বিনামূল্যে স্বাস্থ্য শিক্ষা এবং প্রাথমিক চিকিৎসা সহায়তা'
          }
        ],
        validityPeriod: {
          startMonth: 1,
          endMonth: 12
        }
      });
    }
  }
  
  // If no specific templates found, return a generic one
  if (templates.length === 0) {
    templates.push({
      title: 'General Health Tips',
      titleBangla: 'সাধারণ স্বাস্থ্য টিপস',
      description: 'General health tips for maintaining good health',
      descriptionBangla: 'ভাল স্বাস্থ্য বজায় রাখার জন্য সাধারণ স্বাস্থ্য টিপস',
      diseases: ['general'],
      diseasesBangla: ['সাধারণ'],
      preventiveMeasures: [
        {
          measure: 'Maintain good hygiene',
          measureBangla: '�াল স্বাস্থ্যবিধি বজায় রাখুন',
          icon: 'hygiene',
          priority: 'high'
        },
        {
          measure: 'Eat a balanced diet',
          measureBangla: 'ভারসাম্যপূর্ণ খাদ্য খান',
          icon: 'diet',
          priority: 'medium'
        }
      ],
      practicalTips: [
        {
          tip: 'Exercise regularly',
          tipBangla: 'নিয়মিত ব্যায়াম করুন',
          icon: 'exercise'
        }
      ],
      warningSigns: [
        {
          sign: 'Persistent health issues',
          signBangla: 'স্থায়ী স্বাস্থ্য সমস্যা',
          action: 'Consult a healthcare provider',
          actionBangla: 'স্বাস্থ্যসেবা প্রদানকারীর সাথে পরামর্শ করুন',
          urgency: 'within_week'
        }
      ],
      localResources: [
        {
          name: 'Local Health Center',
          nameBangla: 'স্থানীয় স্বাস্থ্য কেন্দ্র',
          type: 'clinic',
          contact: 'স্থানীয় নম্বর দেখুন',
          description: 'General healthcare services',
          descriptionBangla: 'সাধারণ স্বাস্থ্যসেবা'
        }
      ],
      validityPeriod: {
        startMonth: 1,
        endMonth: 12
      }
    });
  }
  
  return templates;
}