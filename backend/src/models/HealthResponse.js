import mongoose from 'mongoose';

const healthResponseSchema = new mongoose.Schema({
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnonymousHealthRequest',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true
  },
  primaryAdvice: {
    type: String,
    required: true,
    maxlength: 1000
  },
  immediateActions: [{
    action: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    description: String
  }],
  culturalConsiderations: [{
    consideration: String,
    explanation: String
  }],
  localResources: [{
    name: String,
    type: {
      type: String,
      enum: ['hospital', 'clinic', 'chw', 'hotline', 'ngo']
    },
    contact: String,
    services: [String],
    distance: String,
    notes: String
  }],
  warningSigns: [{
    sign: String,
    action: String
  }],
  followUpNeeded: {
    type: Boolean,
    default: false
  },
  followUpTimeframe: {
    type: String,
    enum: ['immediately', '24_hours', '3_days', '1_week', '2_weeks']
  },
  trustSignals: [{
    signal: String,
    description: String
  }],
  language: {
    type: String,
    enum: ['bangla', 'english'],
    default: 'bangla'
  },
  aiGenerated: {
    type: Boolean,
    default: true
  },
  reviewedByHuman: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const HealthResponse = mongoose.model('HealthResponse', healthResponseSchema);
export default HealthResponse;