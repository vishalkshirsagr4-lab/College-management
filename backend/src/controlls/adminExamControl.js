const Exam = require("../models/Adminexam");


// ✅ CREATE EXAM
const createExam = async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      data: exam,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// 📌 GET ALL EXAMS
const getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ✏️ UPDATE EXAM
const updateExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      examId,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      data: updatedExam,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ❌ DELETE EXAM
const deleteExam = async (req, res) => {
  console.log(req.params);
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    await Exam.findByIdAndDelete(examId);

    res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createExam,
  getExams,
  updateExam,
  deleteExam,
};