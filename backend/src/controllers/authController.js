const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const authResponse = (user) => ({
  token: generateToken(user._id),
  user: user.toSafeJSON ? user.toSafeJSON() : user
});

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({ name, email, password });
    res.status(201).json(authResponse(user));
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.lastLoginAt = new Date();
    await user.save();
    res.json(authResponse(user));
  } catch (error) {
    next(error);
  }
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
