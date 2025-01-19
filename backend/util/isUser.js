const jwt = require("jsonwebtoken");

function isUser(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const bearerToken = bearerHeader.split(" ")[1];

  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    // middleware check good, move into function
    next();
  });
}

module.exports = { isUser };
