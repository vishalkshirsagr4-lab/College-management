const Timetable = require("../models/timetable");

const createTimetable = async (req, res) => {
  try {
    const {
      facultyId,
      department,
      semester,
      section,
      day,
      periodNo,
      startTime,
      endTime,
      subjectId,
      subjectName,
    } = req.body;

    const exists = await Timetable.findOne({
        facultyId,
        day,
        periodNo,
    });

    if (exists) {
        return res.status(400).json({
            success: false,
            message: "This time slot already exists",
        });
    }

    const timetable = await Timetable.create({
      facultyId,
      department,
      semester,
      section,
      day,
      periodNo,
      startTime,
      endTime,
      subjectId,
      subjectName,
      room,
    });

    res.status(201).json({
      success: true,
      message: "Timetable created successfully",
      timetable,
    });
  } catch (error) {
    // handle duplicate error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Time slot already assigned for this faculty",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};