import mongoose from 'mongoose';

const healthEventSchema = new mongoose.Schema({
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
  eventType: {
    type: String,
    enum: ['health_checkup', 'blood_donation', 'vaccination_drive', 'mental_health_session', 'maternal_health_workshop', 'health_awareness', 'other'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String
  },
  location: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    upazila: {
      type: String,
      required: true
    },
    district: {
      type: String,
      required: true
    },
    division: {
      type: String,
      required: true
    }
  },
  organizer: {
    name: {
      type: String,
      required: true
    },
    contactPerson: {
      name: String,
      phone: String,
      email: String
    },
    organization: String
  },
  targetAudience: {
    type: String,
    enum: ['general', 'children', 'elderly', 'pregnant_women', 'chronic_patients', 'all'],
    default: 'general'
  },
  services: [{
    service: String,
    serviceBangla: String,
    description: String,
    descriptionBangla: String
  }],
  requirements: [{
    requirement: String,
    requirementBangla: String,
    description: String,
    descriptionBangla: String
  }],
  capacity: {
    maxParticipants: Number,
    currentParticipants: {
      type: Number,
      default: 0
    }
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationDeadline: Date,
  registrationLink: String,
  registrationContact: String,
  images: [{
    type: {
      type: String,
      enum: ['poster', 'venue', 'activity'],
      default: 'poster'
    },
    url: String,
    caption: String,
    captionBangla: String
  }],
  reminders: [{
    timeBefore: {
      type: Number,
      required: true
    },
    timeUnit: {
      type: String,
      enum: ['hours', 'days', 'weeks'],
      required: true
    },
    message: String,
    messageBangla: String,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'organization_only'],
    default: 'public'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  },
  tags: [String],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
healthEventSchema.index({ startDate: 1, status: 1 });
healthEventSchema.index({ upazila: 1, district: 1 });
healthEventSchema.index({ eventType: 1, status: 1 });
healthEventSchema.index({ 'location.coordinates': '2dsphere' });

const HealthEvent = mongoose.model('HealthEvent', healthEventSchema);
export default HealthEvent;