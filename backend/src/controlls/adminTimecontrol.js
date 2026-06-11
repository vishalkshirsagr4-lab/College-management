const Timetable = require("../models/timetable");
const Faculty = require("../models/faculty");
const Subject = require("../models/subjects");

// Helper function to check if a subject is assigned to a faculty
const verifyFacultyAssignment = (faculty, dept, sem, sec, subjName) => {
  if (!faculty || !Array.isArray(faculty.teachingAssignments)) return false;

  return faculty.teachingAssignments.some((assignment) =>
    assignment.department.toUpperCase() === String(dept).toUpperCase() &&
    Number(assignment.semester) === Number(sem) &&
    assignment.section.toUpperCase() === String(sec).toUpperCase() &&
    assignment.subjects.some(
      (sub) => String(sub).toLowerCase().trim() === String(subjName).toLowerCase().trim()
    )
  );
};

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
      room,
    } = req.body;

    // 1. Structural Payload Sanitization & Validation
    if (!facultyId || !department || !semester || !section || !day || !periodNo || !subjectId || !room) {
      return res.status(400).json({ success: false, message: "Missing required fields in payload mapping." });
    }

    const normalizedDay = String(day).toLowerCase().trim();

    // 2. Fetch Faculty and cross-verify assignment mapping blocks
    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Target Faculty profile document not found." });
    }

    const isAssigned = verifyFacultyAssignment(faculty, department, semester, section, subjectName);
    if (!isAssigned) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: This lecturer is not assigned to teach '${subjectName}' for ${department} Sem ${semester} (${section}).`,
      });
    }

    // 3. Verify subject master matches target Department & Semester bounds
    const subjectMatch = await Subject.findOne({
      _id: subjectId,
      department: { $regex: new RegExp(`^${department}$`, "i") },
      semester: Number(semester),
    });

    if (!subjectMatch) {
      return res.status(400).json({
        success: false,
        message: "Academic Conflict: Selected subject parameters do not match target Department or Semester boundaries.",
      });
    }

    // 4. Collision Assertions (Time Slot Clashes checks)
    // Constraint A: Is the target class section already occupied during this period?
    const classClash = await Timetable.findOne({
      department: { $regex: new RegExp(`^${department}$`, "i") },
      semester: Number(semester),
      section: { $regex: new RegExp(`^${section}$`, "i") },
      day: normalizedDay,
      periodNo: Number(periodNo),
    });

    if (classClash) {
      return res.status(400).json({
        success: false,
        message: `Classroom allocation conflict: ${department} Sem ${semester} Sec ${section} already has a slot assigned.`,
      });
    }

    // Constraint B: Is the selected faculty member already teaching somewhere else during this period?
    const facultyClash = await Timetable.findOne({
      facultyId,
      day: normalizedDay,
      periodNo: Number(periodNo),
    });

    if (facultyClash) {
      return res.status(400).json({
        success: false,
        message: "Faculty conflict: This lecturer is already assigned to a different class during this period.",
      });
    }

    // 5. Instantiation Block Write execution
    const timetable = await Timetable.create({
      facultyId,
      department: String(department).toUpperCase(),
      semester: Number(semester),
      section: String(section).toUpperCase(),
      day: normalizedDay,
      periodNo: Number(periodNo),
      startTime,
      endTime,
      subjectId,
      subjectName,
      room: String(room).trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Timetable slot mapped successfully.",
      timetable,
    });
  } catch (error) {
    console.error("Timetable Creation Error:", error);
    return res.status(500).json({ success: false, message: error.message });
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

    const normalizedDay = String(day).toLowerCase().trim();

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ success: false, message: "Target Timetable entry log not found." });
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty record not found." });
    }

    const isAssigned = verifyFacultyAssignment(faculty, department, semester, section, subjectName);
    if (!isAssigned) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: This lecturer is not assigned to teach '${subjectName}' for ${department} Sem ${semester} (${section}).`,
      });
    }

    // Check scheduling collision blocks while ignoring the current document ID
    const classClash = await Timetable.findOne({
      _id: { $ne: timetableId },
      department: { $regex: new RegExp(`^${department}$`, "i") },
      semester: Number(semester),
      section: { $regex: new RegExp(`^${section}$`, "i") },
      day: normalizedDay,
      periodNo: Number(periodNo),
    });

    if (classClash) {
      return res.status(400).json({
        success: false,
        message: "Classroom allocation conflict: Target class sequence is already occupied.",
      });
    }

    const facultyClash = await Timetable.findOne({
      _id: { $ne: timetableId },
      facultyId,
      day: normalizedDay,
      periodNo: Number(periodNo),
    });

    if (facultyClash) {
      return res.status(400).json({
        success: false,
        message: "Faculty conflict: Lecturer is scheduled elsewhere during this period.",
      });
    }

    const updatedTimetable = await Timetable.findByIdAndUpdate(
      timetableId,
      {
        facultyId,
        department: String(department).toUpperCase(),
        semester: Number(semester),
        section: String(section).toUpperCase(),
        day: normalizedDay,
        periodNo: Number(periodNo),
        startTime,
        endTime,
        subjectId,
        subjectName,
        room: String(room).trim(),
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Timetable entry modified successfully.",
      timetable: updatedTimetable,
    });
  } catch (error) {
    console.error("Timetable Update Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const { timetableId } = req.params;
    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ success: false, message: "Timetable target mapping element not found." });
    }

    await Timetable.findByIdAndDelete(timetableId);
    return res.status(200).json({ success: true, message: "Timetable entry deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ ADDED: GET ALL TIMETABLE ENTRIES (required by adminRoute.js)
const getAllTimetable = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .sort({ semester: 1, section: 1, day: 1, periodNo: 1 });

    return res.status(200).json({
      success: true,
      count: timetables.length,
      timetables,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getAllTimetable,
};

