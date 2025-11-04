import mongoose from 'mongoose';

const healthWorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameBangla: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['CHW', 'doctor', 'nurse', 'midwife', 'volunteer', 'traditional_healer'],
    required: true
  },
  photo: {
    type: String,
    default: null
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  education: {
    type: String,
    enum: ['no_formal', 'primary', 'secondary', 'higher_secondary', 'bachelor', 'masters', 'doctorate']
  },
  experience: {
    type: Number,
    default: 0
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  serviceArea: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
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
  },
  skills: [{
    type: String,
    required: true
  }],
  languages: [String], // e.g., Bangla, English, local dialects
  availability: {
    type: {
      type: String,
      enum: ['full_time', 'part_time', 'on_call', 'on_demand']
    },
    availabilitySchedule: [{
      dayOfWeek: String,
      startTime: String,
      endTime: String,
      availability: {
        type: String,
        enum: ['available', 'busy', 'unavailable']
      }
    }]
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    whatsapp: {
      type: String
    },
    email: {
      type: String
    },
    socialMedia: {
      facebook: String,
      twitter: String
    }
  },
  organization: String,
  verified: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: {
      type: String
    },
    organization: String,
    verificationDate: Date
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create geospatial index for efficient queries
healthWorkerSchema.index({ location: '2dsphere' });
healthWorkerSchema.index({ upazila: 1, district: 1 });
healthWorkerSchema.index({ 'availabilitySchedule.dayOfWeek': 1, 'availability.availability': 1 });

const HealthWorker = mongoose.model('HealthWorker', healthWorkerSchema);
export default HealthWorker;