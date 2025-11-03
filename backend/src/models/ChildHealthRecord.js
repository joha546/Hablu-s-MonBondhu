import mongoose from 'mongoose';

const childHealthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  maternalRecordId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MaternalHealthRecord'
  },
  name: {
    type: String,
    required: true
  },
  sex: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  birthWeight: {
    type: Number
  },
  birthLength: {
    type: Number
  },
  birthPlace: {
    type: String,
    enum: ['home', 'facility', 'other']
  },
  deliveryType: {
    type: String,
    enum: ['normal', 'cesarean', 'assisted', 'other']
  },
  apgarScore: {
    oneMinute: {
      type: Number,
      min: 0,
      max: 10
    },
    fiveMinute: {
      type: Number,
      min: 0,
      max: 10
    }
  },
  complications: [{
    type: String
  }],
  vaccinations: [{
    vaccine: {
      type: String,
      required: true
    },
    vaccineCode: {
      type: String,
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    administeredDate: Date,
    administeredBy: String,
    batchNumber: String,
    nextDueDate: Date,
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'administered', 'missed', 'delayed'],
      default: 'scheduled'
    }
  }],
  growthMeasurements: [{
    date: {
      type: Date,
      required: true
    },
    weight: {
      type: Number,
      required: true
    },
    height: Number,
    headCircumference: Number,
    muac: Number, // Mid-upper arm circumference
    notes: String
  }],
  developmentalMilestones: [{
    milestone: {
      type: String,
      required: true
    },
    expectedAge: String,
    achievedDate: Date,
    notes: String,
    achieved: {
      type: Boolean,
      default: false
    }
  }],
  illnesses: [{
    diagnosis: String,
    startDate: Date,
    endDate: Date,
    treatment: String,
    notes: String
  }],
  allergies: [{
    substance: String,
    reaction: String,
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe']
    }
  }],
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
childHealthRecordSchema.index({ userId: 1, isActive: 1 });
childHealthRecordSchema.index({ sessionId: 1 });
childHealthRecordSchema.index({ birthDate: 1 });

const ChildHealthRecord = mongoose.model('ChildHealthRecord', childHealthRecordSchema);
export default ChildHealthRecord;