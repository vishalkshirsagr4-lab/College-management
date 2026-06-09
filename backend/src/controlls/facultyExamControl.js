const ExamSubject = require("../models/Adminexam");

const addSubjectToExam = async (req, res) => {
  try {
    const { examId, subject, syllabus } = req.body;

    const data = await ExamSubject.create({
      examId,
      facultyId: req.user.facultyId,
      subject,
      syllabus,
    });

    res.status(201).json({
      success: true,
      message: "Subject added to exam",
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addMarks = async (req, res) => {
  try {
    const { examId, subject, studentId, marksObtained } = req.body;

    const marks = await Marks.create({
      examId,
      subject,
      studentId,
      facultyId: req.user.facultyId,
      marksObtained,
    });

    res.status(201).json({
      success: true,
      message: "Marks added",
      data: marks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addSubjectToExam , addMarks};