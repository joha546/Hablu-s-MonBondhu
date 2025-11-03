import mongoose from "mongoose";

// Anonymous users will not be stored in DB; we just generate UUID locally.
const userSchema = new mongoose.Schema({
    name: { type: String },
    phone: { type: String, unique: true }, // for CHWs
    email: { type: String, unique: true },
    role: { type: String, enum: ["CHW"], default: "CHW" },
    verified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", userSchema);
