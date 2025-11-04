import mongoose from 'mongoose';

const eventParticipationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthEvent',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'attended', 'cancelled', 'no_show'],
    default: 'registered'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    suggestions: String
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  anonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
eventParticipationSchema.index({ eventId: 1, userId: 1 });
eventParticipationSchema.index({ userId: 1, status: 1 });

const EventParticipation = mongoose.model('EventParticipation', eventParticipationSchema);
export default EventParticipation;