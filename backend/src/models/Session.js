const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teachSkill: { type: String, required: true, trim: true },
    learnSkill: { type: String, required: true, trim: true },
    scheduledFor: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled"
    },
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", sessionSchema);
