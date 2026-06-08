const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    // ✅ Support: "Bearer token"
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIX: use decoded.id (NOT userId)
    const user = await User.findById(decoded.id).select("-password");

    console.log("Authenticated user:", user);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    // attach full user
    req.user = user;

    // optional: attach role separately
    req.role = user.role;

    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

module.exports = authMiddleware;