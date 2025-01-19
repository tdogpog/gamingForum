const jwt = require("jsonwebtoken");

function isAdmin(req, res, next) {
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) {
    return res.status(403).json({ message: "No token provided" });
  }

  const bearerToken = bearerHeader.split(" ")[1];

  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Check if the role is "ADMIN"
    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    //obj sent to the route into the controller func for access like req.user.id
    //thsi is how we associate userID's with submissions, etc, grab it off the jwt
    req.user = decoded;
    // middleware check good, move into function
    next();
  });
}

module.exports = { isAdmin };
