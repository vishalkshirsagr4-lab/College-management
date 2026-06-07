const Timetable = require('../models/timetable');
const Subject = require('../models/subject');
const Teacher = require('../models/teacher');

const createTimetable = async (req, res, next) => {
  try {
    const data = req.body; // expect array or single
    const attachAdminId = (item) => ({
      ...item,
      adminId: item.adminId || req.user?.id,
    });

    if (Array.isArray(data)) {
      const docs = await Timetable.insertMany(data.map(attachAdminId));
      return res.status(201).json({ message: 'Timetable entries created', docs });
    }

    const tt = await Timetable.create(attachAdminId(data));
    res.status(201).json({ message: 'Timetable entry created', tt });
  } catch (error) {
    next(error);
  }
};

const updateTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    Object.assign(timetable, req.body);
    await timetable.save();
    res.status(200).json({ message: 'Timetable entry updated', timetable });
  } catch (error) {
    next(error);
  }
};

const deleteTimetable = async (req, res, next) => {
  try {
    const { id } = req.params;
    const timetable = await Timetable.findById(id);
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }
    await timetable.remove();
    res.status(200).json({ message: 'Timetable entry deleted' });
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

const getTimetableById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const timetable = await Timetable.findById(id)
      .populate('subjectId', 'subjectName subjectCode')
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } });
    if (!timetable) {
      return res.status(404).json({ message: 'Timetable entry not found' });
    }

    if (req.user?.role === 'teacher') {
      const teacherDoc = await Teacher.findOne({ userId: req.user.id });
      if (!teacherDoc || timetable.teacherId._id.toString() !== teacherDoc._id.toString()) {
        return res.status(403).json({ message: 'Permission denied: not assigned to this timetable entry' });
      }
    }

    res.status(200).json({ timetable });
  } catch (error) {
    next(error);
  }
};

const getTeacherTimetable = async (req, res, next) => {
  try {
    const teacherDoc = await Teacher.findOne({ userId: req.user.id });
    if (!teacherDoc) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    const list = await Timetable.find({ teacherId: teacherDoc._id })
      .populate('subjectId', 'subjectName subjectCode')
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } })
      .sort({ day: 1, period: 1 });

    res.status(200).json({ timetable: list });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTimetable, getTimetable, getTodaysClasses, getTimetableById, updateTimetable, deleteTimetable, getTeacherTimetable };
