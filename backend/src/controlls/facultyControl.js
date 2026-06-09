const Faculty = require("../models/faculty");
const student = require("../models/student");
const Timetable = require("../models/timetable");

const getFacultyProfile = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userID: req.user.id,
    }).populate("userID", "-password");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getMyStudents = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userID: req.user.id,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const semesters = faculty.teachingAssignments.map(
      (assignment) => assignment.semester
    );

    const subjects = faculty.teachingAssignments.flatMap(
      (assignment) => assignment.subjects
    );

    const students = await Student.find({
      semester: { $in: semesters },
      subjects: { $in: subjects },
      isActive: true,
    })
      .populate("userID", "name email")
      .select("-__v");

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyTimetable = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      userID: req.user.id,
    });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const timetable = await Timetable.find({
      facultyId: faculty._id,
    });

    res.status(200).json({
      success: true,
      count: timetable.length,
      data: timetable,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getFacultyProfile,
    getMyStudents,
    getMyTimetable,
};