const Attendance = require("../models/attendence");
const Faculty = require("../models/faculty");
const Student = require("../models/student");


const markAttendance = async (req, res) => {
  try {
    const {
      department,
      semester,
      section,
      subject,
      session,
      students,
    } = req.body;

    if (!department || !semester || !section || !subject || !session) {
      return res.status(400).json({
        success: false,
        message:
          "department, semester, section, subject and session are required",
      });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "students must be a non-empty array",
      });
    }

    if (!['Morning', 'Afternoon'].includes(session)) {
      return res.status(400).json({
        success: false,
        message: "session must be either 'Morning' or 'Afternoon'",
      });
    }

    const faculty = await Faculty.findOne({ userID: req.user.id });

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    const assignment = faculty.teachingAssignments.find(
      (t) =>
        t.department === department &&
        t.semester === semester &&
        t.section === section &&
        Array.isArray(t.subjects) &&
        t.subjects.includes(subject)
    );

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message:
          "You are not assigned to this (department, semester, section, subject) class",
      });
    }

    const normalizedStudents = students.map((s, idx) => {
      if (!s || !s.studentId || !s.status) {
        throw new Error(`Invalid student object at index ${idx}`);
      }

      if (!['Present', 'Absent'].includes(s.status)) {
        throw new Error(
          `Invalid status for student at index ${idx}. Use 'Present' or 'Absent'`
        );
      }

      return {
        studentId: s.studentId,
        status: s.status,
      };
    });

    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.create({
      department,
      semester,
      section,
      subject,
      facultyId: faculty._id,
      session,
      date: today,
      students: normalizedStudents,
    });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (err) {
    // Duplicate attendance (unique index)
    if (err && err.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Attendance already marked for this subject, date, session and faculty",
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ userID: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    // Fetch only attendance sessions relevant to this student
    const attendanceDocs = await Attendance.find({
      department: student.department,
      semester: student.semester,
      section: student.section,
      students: { $elemMatch: { studentId: student._id } },
    });

    // Aggregate subject-wise
    const map = new Map();

    for (const doc of attendanceDocs) {
      const subject = doc.subject;

      if (!map.has(subject)) {
        map.set(subject, {
          subject,
          totalClasses: 0,
          attended: 0,
          percentage: 0,
        });
      }

      const entry = map.get(subject);
      entry.totalClasses += 1;

      const studentEntry = doc.students.find(
        (s) => String(s.studentId) === String(student._id)
      );

      if (studentEntry && studentEntry.status === "Present") {
        entry.attended += 1;
      }
    }

    const subjects = Array.from(map.values()).map((x) => {
      const percentage = x.totalClasses === 0 ? 0 : (x.attended / x.totalClasses) * 100;
      return {
        subject: x.subject,
        totalClasses: x.totalClasses,
        attended: x.attended,
        percentage,
      };
    });

    const totalClasses = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
    const attended = subjects.reduce((sum, s) => sum + s.attended, 0);
    const overallPercentage = totalClasses === 0 ? 0 : (attended / totalClasses) * 100;

    return res.status(200).json({
      success: true,
      data: {
        subjects,
        totalClasses,
        attended,
        overallPercentage,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getSemesterAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ userID: req.user.id });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const attendanceDocs = await Attendance.find({
      department: student.department,
      section: student.section,
      students: { $elemMatch: { studentId: student._id } },
    });

    const map = new Map();

    for (const doc of attendanceDocs) {
      const sem = `Sem ${doc.semester}`;

      if (!map.has(sem)) {
        map.set(sem, {
          semester: sem,
          total: 0,
          attended: 0,
        });
      }

      const entry = map.get(sem);

      entry.total += 1;

      const studentEntry = doc.students.find(
        (s) => String(s.studentId) === String(student._id)
      );

      if (studentEntry?.status === "Present") {
        entry.attended += 1;
      }
    }

    // convert to percentage
    const result = Array.from(map.values()).map((x) => ({
      name: x.semester,
      value:
        x.total === 0
          ? 0
          : Math.round((x.attended / x.total) * 100),
    }));

    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { markAttendance, getMyAttendance, getSemesterAttendance };
