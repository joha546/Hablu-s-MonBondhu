import mongoose from 'mongoose';

const symptomGuideSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['general', 'maternal', 'child', 'mental_health', 'infectious_disease', 'chronic_disease', 'emergency'],
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
  symptoms: [{
    name: {
      type: String,
      required: true
    },
    nameBangla: {
      type: String,
      required: true
    },
    description: String,
    descriptionBangla: String,
    icon: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'emergency'],
      default: 'moderate'
    }
  }],
  dangerSigns: [{
    sign: {
      type: String,
      required: true
    },
    signBangla: {
      type: String,
      required: true
    },
    description: String,
    descriptionBangla: String,
    urgency: {
      type: String,
      enum: ['immediate', 'same_day', 'within_week'],
      required: true
    },
    action: {
      type: String,
      required: true
    },
    actionBangla: {
      type: String,
      required: true
    }
  }],
  immediateActions: [{
    action: {
      type: String,
      required: true
    },
    actionBangla: {
      type: String,
      required: true
    },
    description: String,
    descriptionBangla: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  homeRemedies: [{
    remedy: {
      type: String,
      required: true
    },
    remedyBangla: {
      type: String,
      required: true
    },
    description: String,
    descriptionBangla: String,
    safe: {
      type: Boolean,
      default: true
    },
    caution: String,
    cautionBangla: String
  }],
  whenToSeeDoctor: {
    condition: {
      type: String,
      required: true
    },
    conditionBangla: {
      type: String,
      required: true
    },
    timeframe: {
      type: String,
      enum: ['immediately', 'within_hours', 'same_day', 'within_week'],
      required: true
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    }
  },
  relatedConditions: [{
    condition: {
      type: String,
      required: true
    },
    conditionBangla: {
      type: String,
      required: true
    },
    probability: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  targetAudience: {
    type: String,
    enum: ['general', 'children', 'elderly', 'pregnant_women', 'chronic_patients'],
    default: 'general'
  },
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
  culturalConsiderations: [{
    consideration: String,
    considerationBangla: String,
    explanation: String,
    explanationBangla: String
  }],
  commonMyths: [{
    myth: String,
    mythBangla: String,
    fact: String,
    factBangla: String
  }],
  relatedFacilities: [{
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'specialist'],
      default: 'clinic'
    },
    description: String,
    descriptionBangla: String
  }],
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
symptomGuideSchema.index({ category: 1, isActive: 1 });
symptomGuideSchema.index({ targetAudience: 1, isActive: 1 });
symptomGuideSchema.index({ 'symptoms.severity': 1 });

const SymptomGuide = mongoose.model('SymptomGuide', symptomGuideSchema);
export default SymptomGuide;