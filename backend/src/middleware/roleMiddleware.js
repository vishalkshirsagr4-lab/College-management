const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (req.user.role !== requiredRole) {
        return res.status(403).json({ message: "Forbidden" });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  };
};

module.exports = roleMiddleware;