import mongoose from 'mongoose';

const anonymousHealthRequestSchema = new mongoose.Schema({
  // No user ID - completely anonymous
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['maternal_health', 'child_health', 'mental_health', 'infectious_disease', 'chronic_disease', 'general'],
    required: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe', 'emergency'],
    required: true
  },
  symptoms: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    maxlength: 500
  },
  ageGroup: {
    type: String,
    enum: ['child', 'teen', 'adult', 'elderly'],
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    required: true
  },
  location: {
    // Only approximate district level, no precise location
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['information', 'advice', 'immediate_help'],
    default: 'advice'
  },
  preferredLanguage: {
    type: String,
    enum: ['bangla', 'english'],
    default: 'bangla'
  },
  culturalContext: {
    type: String,
    // Store cultural factors that might affect the health issue
    maxlength: 300
  },
  response: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthResponse'
  },
  status: {
    type: String,
    enum: ['pending', 'responded', 'resolved'],
    default: 'pending'
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    // Store hashed fingerprint for session continuity without identity
    fingerprintHash: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
anonymousHealthRequestSchema.index({ category: 1, severity: 1 });
anonymousHealthRequestSchema.index({ status: 1 });
anonymousHealthRequestSchema.index({ location: 1 });

const AnonymousHealthRequest = mongoose.model('AnonymousHealthRequest', anonymousHealthRequestSchema);
export default AnonymousHealthRequest;