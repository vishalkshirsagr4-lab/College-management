const Subject = require('../models/subject');

const createSubject = async (req, res, next) => {
  try {
    const { subjectName, subjectCode, semester } = req.body;
    if (!subjectName || !subjectCode || !semester) {
      return res.status(400).json({ message: 'Subject name, code, and semester are required' });
    }

    const existing = await Subject.findOne({ subjectCode });
    if (existing) {
      return res.status(400).json({ message: 'Subject with the same code already exists' });
    }

    const subject = await Subject.create({ subjectName, subjectCode, semester });
    res.status(201).json({ message: 'Subject created', subject });
  } catch (error) {
    next(error);
  }
};

const getSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json({ subjects });
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.status(200).json({ subject });
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.subjectName = req.body.subjectName || subject.subjectName;
    subject.subjectCode = req.body.subjectCode || subject.subjectCode;
    subject.semester = req.body.semester || subject.semester;

    await subject.save();
    res.status(200).json({ message: 'Subject updated', subject });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    await subject.remove();
    res.status(200).json({ message: 'Subject deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
};