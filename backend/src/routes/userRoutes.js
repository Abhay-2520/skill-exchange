const express = require("express");
const {
  getProfile,
  updateProfile,
  getMatches,
  getSmartSuggestions,
  getUserReviews
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/me", getProfile);
router.patch("/me", updateProfile);
router.get("/matches", getMatches);
router.get("/suggestions", getSmartSuggestions);
router.get("/:userId/reviews", getUserReviews);

module.exports = router;
