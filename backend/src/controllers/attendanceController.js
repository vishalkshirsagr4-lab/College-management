const Attendance = require('../models/attendence');
const Student = require('../models/student');
const Subject = require('../models/subject');

const createAttendance = async (req, res, next) => {
  try {
    const { studentId, subjectId, date, status } = req.body;
    if (!studentId || !subjectId || !status) {
      return res.status(400).json({ message: 'studentId, subjectId, and status are required' });
    }

    const student = await Student.findById(studentId);
    const subject = await Subject.findById(subjectId);
    if (!student || !subject) {
      return res.status(404).json({ message: 'Student or subject not found' });
    }

    const attendance = await Attendance.create({ studentId, subjectId, date: date || new Date(), status });
    res.status(201).json({ message: 'Attendance marked', attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      const records = await Attendance.find({ studentId: student._id }).populate('subjectId', 'subjectName subjectCode');
      return res.status(200).json({ attendance: records });
    }

    const attendance = await Attendance.find().populate('studentId', 'usn section semester').populate('subjectId', 'subjectName subjectCode');
    res.status(200).json({ attendance });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByStudent = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student || student._id.toString() !== studentId) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const records = await Attendance.find({ studentId }).populate('subjectId', 'subjectName subjectCode');
    res.status(200).json({ attendance: records });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    attendance.status = req.body.status || attendance.status;
    attendance.date = req.body.date || attendance.date;
    await attendance.save();

    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error) {
    next(error);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    await attendance.remove();
    res.status(200).json({ message: 'Attendance deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAttendance,
  getAttendance,
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance,
};