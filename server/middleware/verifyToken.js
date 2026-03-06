const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  //get auth header

  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) return res.sendStatus(403);

  const bearer = bearerHeader.split(" ");
  const bearerToken = bearer[1];
  //req.token = bearerToken;

  try {
    const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
    req.user = { id: decoded.id, username: decoded.username };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

module.exports = verifyToken;
