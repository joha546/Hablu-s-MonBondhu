import mongoose from 'mongoose';

const seasonalHealthTipSchema = new mongoose.Schema({
  season: {
    type: String,
    enum: ['monsoon', 'winter', 'summer', 'year_round'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  titleBangla: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  descriptionBangla: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['disease_prevention', 'general_health', 'food_safety', 'water_safety', 'environmental'],
    required: true
  },
  targetAudience: {
    type: String,
    enum: ['general', 'children', 'elderly', 'pregnant_women', 'chronic_patients'],
    default: 'general'
  },
  diseases: [{
    type: String
  }],
  preventiveMeasures: [{
    measure: String,
    measureBangla: String,
    icon: String,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }],
  visualAids: [{
    type: {
      type: String,
      enum: ['image', 'diagram', 'infographic'],
      default: 'image'
    },
    url: String,
    caption: String,
    captionBangla: String
  }],
  practicalTips: [{
    tip: String,
    tipBangla: String,
    icon: String
  }],
  warningSigns: [{
    sign: String,
    signBangla: String,
    action: String,
    actionBangla: String,
    urgency: {
      type: String,
      enum: ['immediate', 'same_day', 'within_week'],
      default: 'same_day'
    }
  }],
  localResources: [{
    name: String,
    nameBangla: String,
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'chw', 'hotline'],
      default: 'clinic'
    },
    contact: String,
    description: String,
    descriptionBangla: String
  }],
  validityPeriod: {
    startMonth: {
      type: Number,
      min: 1,
      max: 12
    },
    endMonth: {
      type: Number,
      min: 1,
      max: 12
    }
  },
  language: {
    type: String,
    enum: ['bangla', 'english', 'both'],
    default: 'both'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  reviewedByExpert: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
seasonalHealthTipSchema.index({ season: 1, category: 1 });
seasonalHealthTipSchema.index({ 'validityPeriod.startMonth': 1, 'validityPeriod.endMonth': 1 });
seasonalHealthTipSchema.index({ targetAudience: 1 });

const SeasonalHealthTip = mongoose.model('SeasonalHealthTip', seasonalHealthTipSchema);
export default SeasonalHealthTip;