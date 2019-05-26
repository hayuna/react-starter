const jwt = require("jsonwebtoken");
const config = require("config");
const messages = require("../controllers/messages");
const User = require("../models/User");

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if not token
  if (!token) {
    return res
      .status(401)
      .json({ msg: messages.NO_TOKEN_AUTHORIZATION_DENIED });
  }

  // Verify token
  jwt.verify(token, config.get("jwtSecret"), (err, decoded) => {
    if (err) {
      res.status(401).json({ msg: messages.TOKEN_IS_INVALID });
    } else {
      User.findOne({ _id: decoded.user.id }).then(user => {
        if (user.emailVerified) {
          req.user = decoded.user;
          next();
        } else {
          res.status(401).json({ msg: messages.EMAIL_NOT_VERIFIED });
        }
      });
    }
  });
};