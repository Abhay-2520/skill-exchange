const express = require("express");
const { body } = require("express-validator");
const { createReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.post(
  "/",
  protect,
  [
    body("reviewee").isMongoId().withMessage("Reviewee is required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1 to 5")
  ],
  validate,
  createReview
);

module.exports = router;
