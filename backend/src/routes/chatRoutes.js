const express = require("express");
const { getConversations, getMessages } = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/conversations", getConversations);
router.get("/:userId/messages", getMessages);

module.exports = router;
