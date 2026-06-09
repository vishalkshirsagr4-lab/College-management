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


    const existCheck = await Timetable.findOne({
      day,
      periodNo,
      subjectName,
    });

    if (existCheck ) {
        return res.status(400).json({
            success: false,
            message: "This time slot already exists",
        });
    }

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


const updateTimetable = async (req, res) => {
  try {
    const { timetableId } = req.params;

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
      room,
    } = req.body;

    const timetable = await Timetable.findById(timetableId);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    const existingSlot = await Timetable.findOne({
      _id: { $ne: timetableId },
      facultyId,
      day,
      periodNo,
    });

     const existCheck = await Timetable.findOne({
      day,
      periodNo,
      subjectName,
    });

    if (existCheck ) {
        return res.status(400).json({
            success: false,
            message: "This time slot already exists",
        });
    }

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: "Faculty already has a class in this period",
      });
    }

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      timetableId,
      {
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
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Timetable updated successfully",
      timetable: updatedTimetable,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already assigned",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const { timetableId } = req.params;

    const timetable = await Timetable.findById(timetableId);

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: "Timetable not found",
      });
    }

    await Timetable.findByIdAndDelete(timetableId);

    res.status(200).json({
      success: true,
      message: "Timetable deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  updateTimetable,
  createTimetable,
  deleteTimetable
};