const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  sendNotification,
  getMyNotifications,
  markNotificationAsRead,
  getAllNotifications,
} = require("../controlls/notificationControl");

// Admin + Faculty
router.post(
  "/send",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "faculty") return next();
    return res.status(403).json({ success: false, message: "Forbidden" });
  },
  sendNotification
);

// Student
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("student"),
  getMyNotifications
);

router.post(
  "/read",
  authMiddleware,
  roleMiddleware("student"),
  markNotificationAsRead
);

// Admin: list all notifications
router.get(
  "/all",
  authMiddleware,
  (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "faculty") return next();
    return res.status(403).json({ success: false, message: "Forbidden" });
  },
  getAllNotifications
);

module.exports = router;


