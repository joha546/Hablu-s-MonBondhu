import mongoose from 'mongoose';

const maternalHealthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  lmp: {
    type: Date,
    required: true
  },
  edd: {
    type: Date,
    required: true
  },
  gravida: {
    type: Number,
    required: true
  },
  para: {
    type: Number,
    default: 0
  },
  abortions: {
    type: Number,
    default: 0
  },
  livingChildren: {
    type: Number,
    default: 0
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  height: {
    type: Number
  },
  weight: {
    type: Number
  },
  complications: [{
    type: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }],
  allergies: [{
    substance: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
  ancVisits: [{
    visitNumber: {
      type: Number,
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    actualDate: Date,
    weight: Number,
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    fundalHeight: Number,
    fetalHeartRate: Number,
    urineProtein: {
      type: String,
      enum: ['negative', 'trace', '1+', '2+', '3+']
    },
    hemoglobin: Number,
    bloodSugar: Number,
    medications: [String],
    notes: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  highRiskFactors: [{
    factor: String,
    identifiedDate: Date,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  deliveryPlan: {
    plannedFacility: String,
    mode: {
      type: String,
      enum: ['vaginal', 'cesarean', 'undecided']
    },
    birthCompanion: String,
    transport: String
  },
  emergencyContacts: [{
    name: String,
    relationship: String,
    phone: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
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
maternalHealthRecordSchema.index({ userId: 1, isActive: 1 });
maternalHealthRecordSchema.index({ sessionId: 1 });
maternalHealthRecordSchema.index({ edd: 1 });

const MaternalHealthRecord = mongoose.model('MaternalHealthRecord', maternalHealthRecordSchema);
export default MaternalHealthRecord;