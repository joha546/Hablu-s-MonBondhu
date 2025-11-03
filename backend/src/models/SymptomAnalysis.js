import mongoose from 'mongoose';

const symptomAnalysisSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  symptoms: [{
    name: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'emergency']
    },
    duration: String,
    additionalInfo: String
  }],
  demographicInfo: {
    ageGroup: {
      type: String,
      enum: ['infant', 'child', 'teen', 'adult', 'elderly']
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    pregnant: {
      type: Boolean,
      default: false
    },
    chronicConditions: [String]
  },
  analysis: {
    possibleConditions: [{
      condition: String,
      conditionBangla: String,
      probability: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }],
    dangerSigns: [{
      sign: String,
      signBangla: String,
      urgency: {
        type: String,
        enum: ['immediate', 'same_day', 'within_week']
      },
      action: String,
      actionBangla: String
    }],
    recommendations: [{
      recommendation: String,
      recommendationBangla: String,
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }],
    whenToSeeDoctor: {
      condition: String,
      conditionBangla: String,
      timeframe: {
        type: String,
        enum: ['immediately', 'within_hours', 'same_day', 'within_week']
      },
      urgency: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical']
      }
    }
  },
  suggestedFacilities: [{
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'specialist']
    },
    name: String,
    distance: String,
    contact: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const SymptomAnalysis = mongoose.model('SymptomAnalysis', symptomAnalysisSchema);
export default SymptomAnalysis;