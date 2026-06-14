const Student = require("../models/student");
const Assignment = require("../models/assignment");

const getMyAssignments = async (req, res) => {
  try {
    // roleMiddleware("student") is enforced by route
    const student = await Student.findOne({ userID: req.user.id });
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const assignments = await Assignment.find({
      department: student.department,
      semester: student.semester,
      section: student.section,
    })
      .sort({ dueDate: 1, createdAt: -1 })
      .select("title description subject dueDate fileUrl");

    return res.status(200).json({
      success: true,
      message: "",
      data: assignments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMyAssignments,
};

