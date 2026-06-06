const Result = require('../models/result');
const Student = require('../models/student');
const Subject = require('../models/subject');

const createResult = async (req, res, next) => {
  try {
    const { studentId, subjectId, marks, grade } = req.body;
    if (!studentId || !subjectId || marks == null || !grade) {
      return res.status(400).json({ message: 'studentId, subjectId, marks, and grade are required' });
    }

    const student = await Student.findById(studentId);
    const subject = await Subject.findById(subjectId);
    if (!student || !subject) {
      return res.status(404).json({ message: 'Student or subject not found' });
    }

    const result = await Result.create({ studentId, subjectId, marks, grade });
    res.status(201).json({ message: 'Result created', result });
  } catch (error) {
    next(error);
  }
};

const getResults = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      const results = await Result.find({ studentId: student._id }).populate('subjectId', 'subjectName subjectCode');
      return res.status(200).json({ results });
    }

    const results = await Result.find().populate('studentId', 'usn semester section').populate('subjectId', 'subjectName subjectCode');
    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

const getResultById = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id).populate('studentId', 'usn semester section').populate('subjectId', 'subjectName subjectCode');
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      const resultStudentId = result.studentId?._id?.toString() || result.studentId?.toString();
      if (!student || student._id.toString() !== resultStudentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    res.status(200).json({ result });
  } catch (error) {
    next(error);
  }
};

const updateResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    result.marks = req.body.marks == null ? result.marks : req.body.marks;
    result.grade = req.body.grade || result.grade;
    if (req.body.subjectId) {
      const subject = await Subject.findById(req.body.subjectId);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      result.subjectId = req.body.subjectId;
    }
    if (req.body.studentId) {
      const student = await Student.findById(req.body.studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      result.studentId = req.body.studentId;
    }

    await result.save();
    res.status(200).json({ message: 'Result updated', result });
  } catch (error) {
    next(error);
  }
};

const deleteResult = async (req, res, next) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }
    await result.remove();
    res.status(200).json({ message: 'Result deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResult,
  getResults,
  getResultById,
  updateResult,
  deleteResult,
};