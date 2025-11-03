import mongoose from 'mongoose';

const healthFacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['hospital', 'clinic', 'community_clinic', 'upazila_health_complex', 'union_health_center'],
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
  address: {
    type: String,
    required: true
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
  services: [String],
  contact: {
    phone: String,
    email: String
  },
  operatingHours: String,
  accessibility: {
    roadAccess: {
      type: Boolean,
      default: true
    },
    publicTransport: {
      type: Boolean,
      default: false
    },
    transportOptions: [String], // e.g., bus, rickshaw, boat
    accessibilityNotes: String
  },
  verified: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index for efficient queries
healthFacilitySchema.index({ location: '2dsphere' });

const HealthFacility = mongoose.model('HealthFacility', healthFacilitySchema);
export default HealthFacility;