const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((error) => error.msg);
    return res.status(400).json({
      message: messages.join(". "),
      errors: errors.array()
    });
  }

  next();
};

module.exports = validate;
