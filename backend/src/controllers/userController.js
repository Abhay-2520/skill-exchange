const User = require("../models/User");
const Review = require("../models/Review");

const normalize = (value) => value.trim().toLowerCase();

const scoreMatch = (viewer, candidate) => {
  const viewerTeach = new Set(viewer.skillsToTeach.map((skill) => normalize(skill.name)));
  const viewerLearn = new Set(viewer.skillsToLearn.map((skill) => normalize(skill.name)));
  const candidateTeach = candidate.skillsToTeach.map((skill) => normalize(skill.name));
  const candidateLearn = candidate.skillsToLearn.map((skill) => normalize(skill.name));

  const canTeachMe = candidateTeach.filter((skill) => viewerLearn.has(skill));
  const wantsWhatITeach = candidateLearn.filter((skill) => viewerTeach.has(skill));
  const score = canTeachMe.length * 3 + wantsWhatITeach.length * 2;

  return { score, canTeachMe, wantsWhatITeach };
};

exports.getProfile = async (req, res) => {
  res.json({ user: req.user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      "name",
      "bio",
      "location",
      "avatarUrl",
      "skillsToTeach",
      "skillsToLearn",
      "availability"
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });
    await req.user.save();
    res.json({ user: req.user.toSafeJSON() });
  } catch (error) {
    next(error);
  }
};

exports.getMatches = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).lean();
    const matches = users
      .map((candidate) => ({ user: candidate, ...scoreMatch(req.user, candidate) }))
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json({ matches });
  } catch (error) {
    next(error);
  }
};

exports.getSmartSuggestions = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).lean();
    const suggestions = users
      .map((candidate) => {
        const base = scoreMatch(req.user, candidate);
        const sharedAvailability = candidate.availability.filter((slot) =>
          req.user.availability.includes(slot)
        );
        const reviewsBoost = candidate.skillsToTeach.length;
        return {
          user: candidate,
          ...base,
          sharedAvailability,
          smartScore: base.score * 10 + sharedAvailability.length * 4 + reviewsBoost
        };
      })
      .filter((item) => item.smartScore > 0)
      .sort((a, b) => b.smartScore - a.smartScore)
      .slice(0, 6);

    res.json({ suggestions });
  } catch (error) {
    next(error);
  }
};

exports.getUserReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name avatarUrl")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    next(error);
  }
};
