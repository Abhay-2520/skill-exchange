const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Expert"],
      default: "Beginner"
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    bio: { type: String, default: "" },
    location: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    skillsToTeach: { type: [skillSchema], default: [] },
    skillsToLearn: { type: [skillSchema], default: [] },
    availability: { type: [String], default: [] },
    online: { type: Boolean, default: false },
    lastSeenAt: { type: Date, default: Date.now },
    lastLoginAt: Date
  },
  { timestamps: true }
);

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
