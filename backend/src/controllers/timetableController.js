const Timetable = require('../models/timetable');
const Subject = require('../models/subject');
const Teacher = require('../models/teacher');

const createTimetable = async (req, res, next) => {
  try {
    const data = req.body; // expect array or single
    if (Array.isArray(data)) {
      const docs = await Timetable.insertMany(data);
      return res.status(201).json({ message: 'Timetable entries created', docs });
    }
    const tt = await Timetable.create(data);
    res.status(201).json({ message: 'Timetable entry created', tt });
  } catch (error) {
    next(error);
  }
};

const getTimetable = async (req, res, next) => {
  try {
    const { semester, section } = req.query;
    const query = {};
    if (semester) query.semester = semester;
    if (section) query.section = section;
    const list = await Timetable.find(query).populate('subjectId', 'subjectName subjectCode').populate('teacherId', 'userId').sort({ day: 1, period: 1 });
    res.status(200).json({ timetable: list });
  } catch (error) {
    next(error);
  }
};

const Teacher = require('../models/teacher');

const getTodaysClasses = async (req, res, next) => {
  try {
    const day = req.query.day || new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const query = { day };
    if (req.query.semester) query.semester = req.query.semester;
    if (req.query.section) query.section = req.query.section;

    if (req.user?.role === 'teacher') {
      // map user to teacher document
      const teacherDoc = await Teacher.findOne({ userId: req.user.id });
      if (teacherDoc) query.teacherId = teacherDoc._id;
    }

    const list = await Timetable.find(query).populate('subjectId', 'subjectName subjectCode').populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } });
    res.status(200).json({ classes: list });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTimetable, getTimetable, getTodaysClasses };
