const Attendance = require('../models/attendance');
const Timetable = require('../models/timetable');
const Student = require('../models/student');
const Holiday = require('../models/holiday');

const takeAttendance = async (req, res, next) => {
  try {
    const { timetableId, date } = req.body;
    if (!timetableId || !date) return res.status(400).json({ message: 'timetableId and date required' });
    const tt = await Timetable.findById(timetableId).populate('subjectId teacherId');
    if (!tt) return res.status(404).json({ message: 'Timetable entry not found' });

    // If the requester is a teacher, ensure they are assigned to this timetable entry
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/teacher');
      const teacherDoc = await Teacher.findOne({ userId: req.user.id });
      if (!teacherDoc || teacherDoc._id.toString() !== tt.teacherId._id.toString()) {
        return res.status(403).json({ message: 'Permission denied: not assigned to this class' });
      }
    }

    // check holiday
    const day = new Date(date).setHours(0,0,0,0);
    const holidays = await Holiday.find({ startDate: { $lte: date }, endDate: { $gte: date } });
    if (holidays.length) {
      return res.status(400).json({ message: 'Holiday on this date, attendance disabled' });
    }

    const entries = req.body.entries || [];
    const att = await Attendance.create({
      date,
      timetableId,
      subjectId: tt.subjectId._id,
      teacherId: tt.teacherId._id,
      section: tt.section,
      period: tt.period,
      entries,
      meta: { status: 'conducted' },
    });
    res.status(201).json({ message: 'Attendance recorded', attendance: att });
  } catch (error) {
    next(error);
  }
};

const getAttendanceByTimetable = async (req, res, next) => {
  try {
    const { timetableId, date } = req.query;
    const query = {};
    if (timetableId) query.timetableId = timetableId;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0,0,0,0));
      const end = new Date(d.setHours(23,59,59,999));
      query.date = { $gte: start, $lte: end };
    }
    const list = await Attendance.find(query).populate({ path: 'entries.studentId', populate: { path: 'userId', select: 'name' } }).populate('subjectId', 'subjectName');
    res.status(200).json({ attendance: list });
  } catch (error) {
    next(error);
  }
};

const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    // Teachers can only update attendance records for their own classes
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/teacher');
      const teacherDoc = await Teacher.findOne({ userId: req.user.id });
      if (!teacherDoc || attendance.teacherId.toString() !== teacherDoc._id.toString()) {
        return res.status(403).json({ message: 'Permission denied: cannot modify this attendance' });
      }
    }

    const { entries, meta } = req.body;
    if (entries) attendance.entries = entries;
    if (meta) attendance.meta = { ...attendance.meta, ...meta };
    await attendance.save();
    res.status(200).json({ message: 'Attendance updated', attendance });
  } catch (error) {
    next(error);
  }
};

const deleteAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findById(id);
    if (!attendance) return res.status(404).json({ message: 'Attendance not found' });
    await attendance.remove();
    res.status(200).json({ message: 'Attendance deleted' });
  } catch (error) {
    next(error);
  }
};

// Student stats: computes attendance percentage excluding holidays/cancelled/etc.
const getStudentStats = async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    // fetch all attendance entries where student present/absent etc.
    const records = await Attendance.find({ 'entries.studentId': studentId }).populate('subjectId');
    let subjectMap = {};
    let totalConducted = 0;
    let totalPresent = 0;
    for (const rec of records) {
      if (['conducted'].includes(rec.meta?.status)) {
        totalConducted += 1;
        const entry = rec.entries.find((e) => e.studentId.toString() === studentId.toString());
        if (entry && entry.status === 'present') totalPresent += 1;
        const sid = rec.subjectId._id.toString();
        subjectMap[sid] = subjectMap[sid] || { subject: rec.subjectId, conducted: 0, present: 0 };
        subjectMap[sid].conducted += 1;
        if (entry && entry.status === 'present') subjectMap[sid].present += 1;
      }
    }
    const overall = totalConducted === 0 ? 0 : (totalPresent / totalConducted) * 100;
    const subjectWise = Object.values(subjectMap).map((s) => ({ subject: s.subject, percentage: s.conducted ? (s.present / s.conducted) * 100 : 0 }));
    res.status(200).json({ overall, subjectWise, totalConducted, totalPresent });
  } catch (error) {
    next(error);
  }
};

const getAttendance = async (req, res, next) => {
  try {
    const { timetableId, date, studentId, subjectId } = req.query;
    const query = {};

    if (timetableId) query.timetableId = timetableId;
    if (subjectId) query.subjectId = subjectId;
    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      query.date = { $gte: start, $lte: end };
    }

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student) {
        return res.status(404).json({ message: 'Student profile not found' });
      }
      query['entries.studentId'] = student._id;
    } else if (studentId) {
      query['entries.studentId'] = studentId;
    }

    const records = await Attendance.find(query)
      .populate({ path: 'entries.studentId', populate: { path: 'userId', select: 'name' } })
      .populate('subjectId', 'subjectName')
      .populate('teacherId', 'userId')
      .sort({ date: -1 });

    res.status(200).json({ attendance: records });
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

    const records = await Attendance.find({ 'entries.studentId': studentId })
      .populate('subjectId', 'subjectName subjectCode');

    res.status(200).json({ attendance: records });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  takeAttendance,
  getAttendance,
  getAttendanceByStudent,
  updateAttendance,
  deleteAttendance,
  getStudentStats,
};