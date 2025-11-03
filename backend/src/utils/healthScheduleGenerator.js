import VaccinationSchedule from '../models/VaccinationSchedule.js';
import { logger } from './logger.js';

/**
 * Generate ANC visit schedule based on LMP and EDD
 * @param {Date} lmp - Last menstrual period
 * @param {Date} edd - Expected date of delivery
 * @returns {Array} ANC visit schedule
 */
export function generateANCVisits(lmp, edd) {
  const visits = [];
  
  // First ANC visit: Up to 12 weeks (ideally 8-12 weeks)
  const firstVisitDate = new Date(lmp);
  firstVisitDate.setDate(firstVisitDate.getDate() + (8 * 7)); // 8 weeks
  visits.push({
    visitNumber: 1,
    scheduledDate: firstVisitDate,
    title: 'প্রথম ANC ভিজিট',
    titleBangla: 'প্রথম ANC ভিজিট',
    description: 'প্রথম প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'প্রথম প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  // Second ANC visit: 13-24 weeks
  const secondVisitDate = new Date(lmp);
  secondVisitDate.setDate(secondVisitDate.getDate() + (20 * 7)); // 20 weeks
  visits.push({
    visitNumber: 2,
    scheduledDate: secondVisitDate,
    title: 'দ্বিতীয় ANC ভিজিট',
    titleBangla: 'দ্বিতীয় ANC ভিজিট',
    description: 'দ্বিতীয় প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'দ্বিতীয় প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  // Third ANC visit: 24-28 weeks
  const thirdVisitDate = new Date(lmp);
  thirdVisitDate.setDate(thirdVisitDate.getDate() + (26 * 7)); // 26 weeks
  visits.push({
    visitNumber: 3,
    scheduledDate: thirdVisitDate,
    title: 'তৃতীয় ANC ভিজিট',
    titleBangla: 'তৃতীয় ANC ভিজিট',
    description: 'তৃতীয় প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'তৃতীয় প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  // Fourth ANC visit: 28-32 weeks
  const fourthVisitDate = new Date(lmp);
  fourthVisitDate.setDate(fourthVisitDate.getDate() + (30 * 7)); // 30 weeks
  visits.push({
    visitNumber: 4,
    scheduledDate: fourthVisitDate,
    title: 'চতুর্থ ANC ভিজিট',
    titleBangla: 'চতুর্থ ANC ভিজিট',
    description: 'চতুর্থ প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'চতুর্থ প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  // Fifth ANC visit: 32-36 weeks
  const fifthVisitDate = new Date(lmp);
  fifthVisitDate.setDate(fifthVisitDate.getDate() + (34 * 7)); // 34 weeks
  visits.push({
    visitNumber: 5,
    scheduledDate: fifthVisitDate,
    title: 'পঞ্চম ANC ভিজিট',
    titleBangla: 'পঞ্চম ANC ভিজিট',
    description: 'পঞ্চম প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'পঞ্চম প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  // Sixth ANC visit: 36-38 weeks
  const sixthVisitDate = new Date(lmp);
  sixthVisitDate.setDate(sixthVisitDate.getDate() + (37 * 7)); // 37 weeks
  visits.push({
    visitNumber: 6,
    scheduledDate: sixthVisitDate,
    title: 'ষষ্ঠ ANC ভিজিট',
    titleBangla: 'ষষ্ঠ ANC ভিজিট',
    description: 'ষষ্ঠ প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'ষষ্ঠ প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  // Seventh ANC visit: 38-40 weeks
  const seventhVisitDate = new Date(lmp);
  seventhVisitDate.setDate(seventhVisitDate.getDate() + (39 * 7)); // 39 weeks
  visits.push({
    visitNumber: 7,
    scheduledDate: seventhVisitDate,
    title: 'সপ্তম ANC ভিজিট',
    titleBangla: 'সপ্তম ANC ভিজিট',
    description: 'সপ্তম প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'সপ্তম প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  // Eighth ANC visit: 40-41 weeks
  const eighthVisitDate = new Date(lmp);
  eighthVisitDate.setDate(eighthVisitDate.getDate() + (40 * 7)); // 40 weeks
  visits.push({
    visitNumber: 8,
    scheduledDate: eighthVisitDate,
    title: 'অষ্টম ANC ভিজিট',
    titleBangla: 'অষ্টম ANC ভিজিট',
    description: 'অষ্টম প্রাক-প্রসব পরীক্ষা',
    descriptionBangla: 'অষ্টম প্রাক-প্রসব পরীক্ষা',
    completed: false
  });
  
  return visits;
}

/**
 * Generate vaccination schedule based on Bangladesh EPI
 * @param {Date} birthDate - Child's birth date
 * @returns {Array} Vaccination schedule
 */
export async function generateVaccinationSchedule(birthDate) {
  try {
    // Get vaccination schedule from database
    const scheduleData = await VaccinationSchedule.find({ 
      targetGroup: 'infant', 
      isActive: true 
    }).sort({ 'doses.0.minAgeWeeks': 1 });
    
    const vaccinations = [];
    
    // Generate vaccination schedule based on Bangladesh EPI
    const epiSchedule = [
      // BCG (at birth)
      {
        vaccine: 'BCG',
        vaccineCode: 'BCG',
        scheduledDate: new Date(birthDate),
        description: 'টিউবারকুলোসিস (TB) প্রতিরোধের টিকা',
        descriptionBangla: 'টিউবারকুলোসিস (TB) প্রতিরোধের টিকা',
        status: 'scheduled'
      },
      // OPV-0 (at birth)
      {
        vaccine: 'OPV-0',
        vaccineCode: 'OPV0',
        scheduledDate: new Date(birthDate),
        description: 'পোলিও টিকা (প্রথম ডোজ)',
        descriptionBangla: 'পোলিও টিকা (প্রথম ডোজ)',
        status: 'scheduled'
      },
      // Hepatitis B - Birth Dose (at birth)
      {
        vaccine: 'Hepatitis B - Birth Dose',
        vaccineCode: 'HEPB_BIRTH',
        scheduledDate: new Date(birthDate),
        description: 'হেপাটাইটিস বি টিকা (জন্ম ডোজ)',
        descriptionBangla: 'হেপাটাইটিস বি টিকা (জন্ম ডোজ)',
        status: 'scheduled'
      },
      // OPV-1, Penta-1, PCV-1, Rota-1 (6 weeks)
      {
        vaccine: 'OPV-1, Penta-1, PCV-1, Rota-1',
        vaccineCode: 'OPV1_PENTA1_PCV1_ROTA1',
        scheduledDate: new Date(birthDate.getTime() + (6 * 7 * 24 * 60 * 60 * 1000)), // 6 weeks
        description: 'পোলিও, ডিপথেরিয়া, হেপাটাইটিস বি, হিব, রোটাভাইরাস টিকা (প্রথম ডোজ)',
        descriptionBangla: 'পোলিও, ডিপথেরিয়া, হেপাটাইটিস বি, হিব, রোটাভাইরাস টিকা (প্রথম ডোজ)',
        status: 'scheduled'
      },
      // OPV-2, Penta-2, PCV-2, Rota-2 (10 weeks)
      {
        vaccine: 'OPV-2, Penta-2, PCV-2, Rota-2',
        vaccineCode: 'OPV2_PENTA2_PCV2_ROTA2',
        scheduledDate: new Date(birthDate.getTime() + (10 * 7 * 24 * 60 * 60 * 1000)), // 10 weeks
        description: 'পোলিও, ডিপথেরিয়া, হেপাটাইটিস বি, হিব, রোটাভাইরাস টিকা (দ্বিতীয় ডোজ)',
        descriptionBangla: 'পোলিও, ডিপথেরিয়া, হেপাটাইটিস বি, হিব, রোটাভাইরাস টিকা (দ্বিতীয় ডোজ)',
        status: 'scheduled'
      },
      // OPV-3, Penta-3, PCV-3 (14 weeks)
      {
        vaccine: 'OPV-3, Penta-3, PCV-3',
        vaccineCode: 'OPV3_PENTA3_PCV3',
        scheduledDate: new Date(birthDate.getTime() + (14 * 7 * 24 * 60 * 60 * 1000)), // 14 weeks
        description: 'পোলিও, ডিপথেরিয়া, হেপাটাইটিস বি, হিব টিকা (তৃতীয় ডোজ)',
        descriptionBangla: 'পোলিও, ডিপথেরিয়া, হেপাটাইটিস বি, হিব টিকা (তৃতীয় ডোজ)',
        status: 'scheduled'
      },
      // MR-1 (9 months)
      {
        vaccine: 'MR-1',
        vaccineCode: 'MR1',
        scheduledDate: new Date(birthDate.getTime() + (39 * 7 * 24 * 60 * 60 * 1000)), // 9 months
        description: 'হাম ও রুবেলা টিকা (প্রথম ডোজ)',
        descriptionBangla: 'হাম ও রুবেলা টিকা (প্রথম ডোজ)',
        status: 'scheduled'
      },
      // JE-1 (9 months, in endemic districts)
      {
        vaccine: 'JE-1',
        vaccineCode: 'JE1',
        scheduledDate: new Date(birthDate.getTime() + (39 * 7 * 24 * 60 * 60 * 1000)), // 9 months
        description: 'জাপানিজ এনসেফালাইটিস টিকা (প্রথম ডোজ)',
        descriptionBangla: 'জাপানিজ এনসেফালাইটিস টিকা (প্রথম ডোজ)',
        status: 'scheduled'
      },
      // DPT-2 (16-18 months)
      {
        vaccine: 'DPT-2',
        vaccineCode: 'DPT2',
        scheduledDate: new Date(birthDate.getTime() + (70 * 7 * 24 * 60 * 60 * 1000)), // 16 months
        description: 'ডিপথেরিয়া, পারটুসিস, টিটেনাস টিকা (দ্বিতীয় ডোজ)',
        descriptionBangla: 'ডিপথেরিয়া, পারটুসিস, টিটেনাস টিকা (দ্বিতীয় ডোজ)',
        status: 'scheduled'
      },
      // MR-2 (16-18 months)
      {
        vaccine: 'MR-2',
        vaccineCode: 'MR2',
        scheduledDate: new Date(birthDate.getTime() + (70 * 7 * 24 * 60 * 60 * 1000)), // 16 months
        description: 'হাম ও রুবেলা টিকা (দ্বিতীয় ডোজ)',
        descriptionBangla: 'হাম ও রুবেলা টিকা (দ্বিতীয় ডোজ)',
        status: 'scheduled'
      },
      // OPV-4 (16-18 months)
      {
        vaccine: 'OPV-4',
        vaccineCode: 'OPV4',
        scheduledDate: new Date(birthDate.getTime() + (70 * 7 * 24 * 60 * 60 * 1000)), // 16 months
        description: 'পোলিও টিকা (চতুর্থ ডোজ)',
        descriptionBangla: 'পোলিও টিকা (চতুর্থ ডোজ)',
        status: 'scheduled'
      },
      // DPT-3 (4-5 years)
      {
        vaccine: 'DPT-3',
        vaccineCode: 'DPT3',
        scheduledDate: new Date(birthDate.getTime() + (208 * 7 * 24 * 60 * 60 * 1000)), // 4 years
        description: 'ডিপথেরিয়া, পারটুসিস, টিটেনাস টিকা (তৃতীয় ডোজ)',
        descriptionBangla: 'ডিপথেরিয়া, পারটুসিস, টিটেনাস টিকা (তৃতীয় ডোজ)',
        status: 'scheduled'
      },
      // JE-2 (4-5 years, in endemic districts)
      {
        vaccine: 'JE-2',
        vaccineCode: 'JE2',
        scheduledDate: new Date(birthDate.getTime() + (208 * 7 * 24 * 60 * 60 * 1000)), // 4 years
        description: 'জাপানিজ এনসেফালাইটিস টিকা (দ্বিতীয় ডোজ)',
        descriptionBangla: 'জাপানিজ এনসেফালাইটিস টিকা (দ্বিতীয় ডোজ)',
        status: 'scheduled'
      },
      // TT-2 (4-5 years)
      {
        vaccine: 'TT-2',
        vaccineCode: 'TT2',
        scheduledDate: new Date(birthDate.getTime() + (208 * 7 * 24 * 60 * 60 * 1000)), // 4 years
        description: 'টিটেনাস টিকা (দ্বিতীয় ডোজ)',
        descriptionBangla: 'টিটেনাস টিকা (দ্বিতীয় ডোজ)',
        status: 'scheduled'
      },
      // TT-5 (10 years)
      {
        vaccine: 'TT-5',
        vaccineCode: 'TT5',
        scheduledDate: new Date(birthDate.getTime() + (520 * 7 * 24 * 60 * 60 * 1000)), // 10 years
        description: 'টিটেনাস টিকা (পঞ্চম ডোজ)',
        descriptionBangla: 'টিটেনাস টিকা (পঞ্চম ডোজ)',
        status: 'scheduled'
      },
      // TT-6 (16 years)
      {
        vaccine: 'TT-6',
        vaccineCode: 'TT6',
        scheduledDate: new Date(birthDate.getTime() + (832 * 7 * 24 * 60 * 60 * 1000)), // 16 years
        description: 'টিটেনাস টিকা (ষষ্ট ডোজ)',
        descriptionBangla: 'টিটেনাস টিকা (ষষ্ট ডোজ)',
        status: 'scheduled'
      }
    ];
    
    return epiSchedule;
  } catch (error) {
    logger.error('Error generating vaccination schedule:', error);
    throw error;
  }
}