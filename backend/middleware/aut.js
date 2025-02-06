require("dotenv").config();
const jwt = require("jsonwebtoken");

const authorization = (req, res, next) => {
  const token = req.cookies.token;

  console.log(req.body);
  

  if (!token) {
    return res.status(401).json({ msg: "Unauthorized" });
  }
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ msg: "Invalid Token" });
    }
    req.user = user;
    next();
  });
};

module.exports = authorization;       
