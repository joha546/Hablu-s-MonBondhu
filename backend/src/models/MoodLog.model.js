import mongoose from "mongoose";

const MoodLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    mood_level: {
        type: Number, // 1–5 scale (or any scale you prefer)
        required: true
    },
    note: {
        type: String, // optional free-text in Bangla
        default: ""
    },
    local_uuid: {
        type: String, // For anonymous / offline users
        required: true
    },
    synced: {
        type: Boolean,
        default: false // Whether this log has been synced to the server
    }
});

export default mongoose.model("MoodLog", MoodLogSchema);