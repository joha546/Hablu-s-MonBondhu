import mongoose from 'mongoose';

const moodLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mood_level: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  note: {
    type: String,
    default: ""
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  synced: {
    type: Boolean,
    default: true
  },
  // Store mood labels in Bangla
  mood_label: {
    type: String,
    enum: ["খুব খারাপ", "খারাপ", "সাধারণ", "�ালো", "খুব ভালো"]
  }
}, {
  timestamps: true
});

// Create index for efficient queries
moodLogSchema.index({ userId: 1, timestamp: -1 });

const MoodLog = mongoose.model('MoodLog', moodLogSchema);
export default MoodLog;