const Review = require("../models/Review");

exports.createReview = async (req, res, next) => {
  try {
    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: req.body.reviewee,
      rating: req.body.rating,
      comment: req.body.comment,
      session: req.body.session
    });
    await review.populate("reviewer", "name avatarUrl");
    res.status(201).json({ review });
  } catch (error) {
    next(error);
  }
};
