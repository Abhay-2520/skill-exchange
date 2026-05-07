const Session = require("../models/Session");

exports.createSession = async (req, res, next) => {
  try {
    const session = await Session.create({
      host: req.user._id,
      guest: req.body.guest,
      teachSkill: req.body.teachSkill,
      learnSkill: req.body.learnSkill,
      scheduledFor: req.body.scheduledFor,
      notes: req.body.notes
    });
    await session.populate("host guest", "name avatarUrl");
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
};

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      $or: [{ host: req.user._id }, { guest: req.user._id }]
    })
      .populate("host guest", "name avatarUrl")
      .sort({ scheduledFor: 1 });
    res.json({ sessions });
  } catch (error) {
    next(error);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const session = await Session.findOneAndUpdate(
      {
        _id: req.params.id,
        $or: [{ host: req.user._id }, { guest: req.user._id }]
      },
      { status: req.body.status, notes: req.body.notes },
      { new: true, runValidators: true }
    ).populate("host guest", "name avatarUrl");

    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json({ session });
  } catch (error) {
    next(error);
  }
};
