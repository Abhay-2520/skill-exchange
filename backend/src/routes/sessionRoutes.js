const express = require("express");
const { body } = require("express-validator");
const {
  createSession,
  getSessions,
  updateSession
} = require("../controllers/sessionController");
const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");

const router = express.Router();

router.use(protect);
router.get("/", getSessions);
router.post(
  "/",
  [
    body("guest").isMongoId().withMessage("Guest is required"),
    body("teachSkill").trim().notEmpty().withMessage("Teach skill is required"),
    body("learnSkill").trim().notEmpty().withMessage("Learn skill is required"),
    body("scheduledFor").isISO8601().withMessage("Scheduled date is required")
  ],
  validate,
  createSession
);
router.patch("/:id", updateSession);

module.exports = router;
