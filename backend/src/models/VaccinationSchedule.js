import mongoose from 'mongoose';

const vaccinationScheduleSchema = new mongoose.Schema({
  vaccineCode: {
    type: String,
    required: true,
    unique: true
  },
  vaccineName: {
    type: String,
    required: true
  },
  vaccineNameBangla: {
    type: String,
    required: true
  },
  disease: {
    type: String,
    required: true
  },
  diseaseBangla: {
    type: String,
    required: true
  },
  doses: [{
    doseNumber: {
      type: Number,
      required: true
    },
    minAgeWeeks: {
      type: Number,
      required: true
    },
    maxAgeWeeks: {
      type: Number,
      required: true
    },
    minIntervalDays: Number,
    description: String,
    descriptionBangla: String,
    route: {
      type: String,
      enum: ['intramuscular', 'subcutaneous', 'oral', 'intradermal'],
      required: true
    },
    site: String,
    precautions: [String],
    precautionsBangla: [String],
    sideEffects: [String],
    sideEffectsBangla: [String]
  }],
  scheduleType: {
    type: String,
    enum: ['routine', 'catchup', 'outbreak'],
    default: 'routine'
  },
  targetGroup: {
    type: String,
    enum: ['infant', 'child', 'adolescent', 'pregnant_woman', 'all'],
    default: 'infant'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
vaccinationScheduleSchema.index({ vaccineCode: 1 });
vaccinationScheduleSchema.index({ targetGroup: 1, isActive: 1 });

const VaccinationSchedule = mongoose.model('VaccinationSchedule', vaccinationScheduleSchema);
export default VaccinationSchedule;