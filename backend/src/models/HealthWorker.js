import mongoose from 'mongoose';

const healthWorkerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['CHW', 'doctor', 'nurse', 'midwife', 'volunteer'],
    required: true
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
      enum: ['Polygon'],
      default: 'Polygon'
    },
    coordinates: [[[Number]]] // Polygon coordinates
  },
  contact: {
    phone: {
      type: String,
      required: true
    },
    whatsapp: {
      type: String,
      default: function() {
        return this.contact.phone; // Default to phone number
      }
    }
  },
  skills: [String],
  availability: {
    type: String,
    enum: ['full_time', 'part_time', 'on_call'],
    default: 'on_call'
  },
  organization: String,
  verified: {
    type: Boolean,
    default: false
  },
  languages: [String], // e.g., Bangla, English, local dialects
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for efficient queries
healthWorkerSchema.index({ location: '2dsphere' });

const HealthWorker = mongoose.model('HealthWorker', healthWorkerSchema);
export default HealthWorker;