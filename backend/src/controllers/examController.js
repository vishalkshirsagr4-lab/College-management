const Exam = require('../models/exam');
const Subject = require('../models/subject');

const createExam = async (req, res, next) => {
  try {
    const { examName, subjectId, semester, date } = req.body;
    if (!examName || !subjectId || !semester || !date) {
      return res.status(400).json({ message: 'Exam name, subjectId, semester, and date are required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const exam = await Exam.create({ examName, subjectId, semester, date });
    res.status(201).json({ message: 'Exam created', exam });
  } catch (error) {
    next(error);
  }
};

const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find().populate('subjectId', 'subjectName subjectCode');
    res.status(200).json({ exams });
  } catch (error) {
    next(error);
  }
};

const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('subjectId', 'subjectName subjectCode');
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.status(200).json({ exam });
  } catch (error) {
    next(error);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    exam.examName = req.body.examName || exam.examName;
    exam.semester = req.body.semester || exam.semester;
    exam.date = req.body.date || exam.date;

    if (req.body.subjectId && req.body.subjectId !== exam.subjectId.toString()) {
      const subject = await Subject.findById(req.body.subjectId);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      exam.subjectId = req.body.subjectId;
    }

    await exam.save();
    res.status(200).json({ message: 'Exam updated', exam });
  } catch (error) {
    next(error);
  }
};

const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    await exam.remove();
    res.status(200).json({ message: 'Exam deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
};