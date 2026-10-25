const jwt = require("jsonwebtoken");

// Verifies the JWT and checks the role before the request reaches a microservice.
// On success it forwards the caller's identity to the service as headers.
const verifyTokenAndRole = (requiredRole) => (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }

  if (decoded.role !== requiredRole) {
    return res
      .status(403)
      .json({ message: `A '${decoded.role}' cannot access '${requiredRole}' APIs` });
  }

  req.headers["x-user-email"] = decoded.email;
  req.headers["x-user-role"] = decoded.role;
  next();
};

module.exports = verifyTokenAndRole;
