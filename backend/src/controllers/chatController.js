const Message = require("../models/Message");

const conversationKeyFor = (a, b) => [String(a), String(b)].sort().join(":");

exports.conversationKeyFor = conversationKeyFor;

exports.getConversations = async (req, res, next) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }]
    })
      .populate("sender recipient", "name avatarUrl online lastSeenAt")
      .sort({ createdAt: -1 });

    const conversations = [];
    const seen = new Set();
    messages.forEach((message) => {
      if (seen.has(message.conversationKey)) return;
      seen.add(message.conversationKey);
      conversations.push(message);
    });

    res.json({ conversations });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const conversationKey = conversationKeyFor(req.user._id, req.params.userId);
    const messages = await Message.find({ conversationKey })
      .populate("sender recipient", "name avatarUrl online lastSeenAt")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};
