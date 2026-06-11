const Notification = require("../models/notification");
const Faculty = require("../models/faculty");
const Student = require("../models/student");

const normalizeTargetPayload = (body = {}) => {
  const {
    title,
    message,
    target,
    department,
    semester,
    section,
  } = body;

  return {
    title,
    message,
    target,
    department: department ?? "",
    semester: semester ?? null,
    section: section ?? "",
  };
};

const validateSendPayload = (payload) => {
  const required = ["title", "message", "target"];
  for (const k of required) {
    if (payload[k] === undefined || payload[k] === null || payload[k] === "") {
      return `${k} is required`;
    }
  }
  return null;
};

const getFacultyTeachingSet = async (facultyUserId) => {
  const faculty = await Faculty.findOne({ userID: facultyUserId });
  if (!faculty) return null;

  // teachingAssignments: {department, semester, section}
  const set = faculty.teachingAssignments || [];
  return { faculty, set };
};

const senderIsAllowedForFaculty = (facultySet, payload) => {
  // Faculty can only send notifications for their assigned department/semester/section.
  // We interpret this as: there must exist at least one teaching assignment entry
  // that matches all relevant fields.

  const { target, department, semester, section } = payload;
  if (!Array.isArray(facultySet) || facultySet.length === 0) return false;

  // all target: block unless faculty is allowed? Spec says faculty can send notifications only to their assigned class.
  // So faculty cannot send global notifications.
  if (target === "all") return false;

  const matches = facultySet.some((a) => {
    const depOk = target === "department" ? a.department === department : a.department === department;
    const semOk = target === "semester" ? a.semester === semester : a.semester === semester;
    const secOk = target === "section" ? a.section === section : a.section === section;

    // For simplicity, enforce field matching based on target. Also accept if
    // facultySet entry contains the requested values.
    if (target === "department") {
      return a.department === department;
    }
    if (target === "semester") {
      return a.semester === semester;
    }
    if (target === "section") {
      return a.section === section;
    }
    return depOk && semOk && secOk;
  });

  return matches;
};

const sendNotification = async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin" && role !== "faculty") {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const payload = normalizeTargetPayload(req.body);
    const err = validateSendPayload(payload);
    if (err) {
      return res.status(400).json({ success: false, message: err });
    }

    // Enforce senderRole
    const senderRole = role === "admin" ? "admin" : "faculty";

    // Validate fields according to target
    if (payload.target === "department" && !payload.department) {
      return res.status(400).json({
        success: false,
        message: "department is required for target=department",
      });
    }
    if (payload.target === "semester" && (payload.semester === null || payload.semester === undefined)) {
      return res.status(400).json({
        success: false,
        message: "semester is required for target=semester",
      });
    }
    if (payload.target === "section" && !payload.section) {
      return res.status(400).json({
        success: false,
        message: "section is required for target=section",
      });
    }

    // Faculty restriction
    if (senderRole === "faculty") {
      const facultyData = await getFacultyTeachingSet(req.user.id);
      if (!facultyData) {
        return res.status(404).json({
          success: false,
          message: "Faculty profile not found",
        });
      }

      const allowed = senderIsAllowedForFaculty(facultyData.set, payload);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message:
            "Forbidden - faculty can only send notifications for their assigned department/semester/section",
        });
      }
    }

    const notification = await Notification.create({
      title: payload.title,
      message: payload.message,
      senderRole,
      senderId: req.user.id,
      target: payload.target,
      department: payload.department || "",
      semester: payload.semester,
      section: payload.section || "",
      readBy: [],
    });

    return res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const buildStudentQuery = (student) => {
  // Student should receive:
  // all notifications, department, semester, section.
  // Query model:
  // target=all OR (department match) OR (semester match) OR (section match)

  return {
    $or: [
      { target: "all" },
      { target: "department", department: student.department },
      { target: "semester", semester: student.semester },
      { target: "section", section: student.section },
    ],
  };
};

const getMyNotifications = async (req, res) => {
  try {
    const student = await Student.findOne({ userID: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const query = buildStudentQuery(student);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "notificationId is required",
      });
    }

    const student = await Student.findOne({ userID: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const studentId = student._id;

    const alreadyRead = notification.readBy.some((id) => id.toString() === studentId.toString());
    if (!alreadyRead) {
      notification.readBy.push(studentId);
      await notification.save();
    }

    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: {
        notificationId: notification._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendNotification,
  getMyNotifications,
  markNotificationAsRead,
  getAllNotifications,
};


