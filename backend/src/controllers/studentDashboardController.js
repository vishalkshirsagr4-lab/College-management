const Student = require('../models/student');
const Attendance = require('../models/attendance');
const Fee = require('../models/fee');
const Notice = require('../models/notice');
const Result = require('../models/result');
const Assignment = require('../models/assignment');
const StudyMaterial = require('../models/studyMaterial');
const Exam = require('../models/exam');
const Subject = require('../models/subject');
const Teacher = require('../models/teacher');
const { Types } = require('mongoose');

const toObjectIdString = (v) => {
  try {
    if (!v) return null;
    if (typeof v === 'string') return new Types.ObjectId(v).toString();
    return v.toString();
  } catch {
    return v?.toString?.() ?? null;
  }
};

const getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email role profileImage');
    if (!student) {
      return res.status(200).json({
        dashboard: null,
      });
    }

    const studentId = student._id;

    const [attendanceRecords, notices, results, fees] = await Promise.all([
      Attendance.find({ studentId })
        .populate('subjectId', 'subjectName subjectCode')
        .sort({ date: -1 }),
      Notice.find()
        .populate('createdBy', 'name email role')
        .sort({ createdAt: -1 })
        .limit(5),
      Result.find({ studentId })
        .populate('subjectId', 'subjectName subjectCode')
        .sort({ createdAt: -1 })
        .limit(10),
      Fee.find({ studentId }).sort({ createdAt: -1 }),
    ]);

    const feesSummary = fees.reduce(
      (acc, f) => {
        const status = f.status;
        acc.totalAmount += Number(f.amount || 0);
        if (status === 'Paid') acc.paidAmount += Number(f.amount || 0);
        if (status === 'Unpaid') acc.unpaidAmount += Number(f.amount || 0);
        return acc;
      },
      { totalAmount: 0, paidAmount: 0, unpaidAmount: 0 }
    );

    res.status(200).json({
      dashboard: {
        student: {
          _id: student._id,
          usn: student.usn,
          semester: student.semester,
          section: student.section,
          phone: student.phone,
          photo: student.photo,
          userId: student.userId,
        },
        attendance: {
          count: attendanceRecords.length,
          latest: attendanceRecords.slice(0, 5),
        },
        notices,
        results,
        fees,
        feesSummary,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getStudentTeachers = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email profileImage' } } });
    if (!student) return res.status(200).json({ teachers: [] });

    const teachersMap = new Map();
    (student.subjects || []).forEach((sub) => {
      if (sub.teacherId) {
        const t = sub.teacherId;
        const id = toObjectIdString(t._id);
        if (!teachersMap.has(id)) {
          teachersMap.set(id, {
            _id: t._id,
            department: t.department,
            phone: t.phone,
            officeHours: t.officeHours || '',
            photo: t.photo,
            user: t.userId || null,
            subjects: [],
          });
        }
        const entry = teachersMap.get(id);
        entry.subjects.push({ _id: sub._id, subjectName: sub.subjectName, subjectCode: sub.subjectCode, semester: sub.semester });
      }
    });

    res.status(200).json({ teachers: Array.from(teachersMap.values()) });
  } catch (error) {
    next(error);
  }
};

const getStudentSubjects = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email profileImage' } } });
    if (!student) return res.status(200).json({ subjects: [] });
    res.status(200).json({ subjects: student.subjects || [] });
  } catch (error) {
    next(error);
  }
};

const getStudentAssignments = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(200).json({ assignments: [] });
    const subjectIds = (student.subjects || []).map((s) => s.toString());
    const assignments = await Assignment.find({ subjectId: { $in: subjectIds } })
      .populate('subjectId', 'subjectName subjectCode credits')
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email profileImage' } })
      .sort({ dueDate: 1 });
    res.status(200).json({ assignments });
  } catch (error) {
    next(error);
  }
};

const getStudentMaterials = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(200).json({ materials: [] });
    const subjectIds = (student.subjects || []).map((s) => s.toString());
    const materials = await StudyMaterial.find({ subjectId: { $in: subjectIds } })
      .populate('subjectId', 'subjectName subjectCode')
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email profileImage' } })
      .sort({ createdAt: -1 });
    res.status(200).json({ materials });
  } catch (error) {
    next(error);
  }
};

const getStudentAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(200).json({ attendance: [] });
    const studentId = student._id;
    const subjectIds = (student.subjects || []).map((s) => s.toString());

    const attendanceSummary = [];
    for (const sid of subjectIds) {
      const totalSessions = await Attendance.countDocuments({ subjectId: sid });
      const records = await Attendance.find({ subjectId: sid, 'entries.studentId': studentId }).lean();
      let present = 0;
      const history = [];
      records.forEach((r) => {
        const entry = (r.entries || []).find((e) => toObjectIdString(e.studentId) === toObjectIdString(studentId));
        const status = entry?.status || 'absent';
        if (['present', 'late', 'approved', 'medical'].includes(status)) present += 1;
        history.push({ date: r.date, status, period: r.period, teacherId: r.teacherId });
      });
      const percent = totalSessions === 0 ? 0 : Math.round((present / totalSessions) * 100);
      attendanceSummary.push({ subjectId: sid, totalSessions, present, percentage: percent, history });
    }

    res.status(200).json({ attendance: attendanceSummary });
  } catch (error) {
    next(error);
  }
};

const getStudentNotices = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(200).json({ notices: [] });
    const subjectIds = (student.subjects || []).map((s) => s.toString());
    const notices = await Notice.find({
      $or: [
        { subjectId: { $in: subjectIds } },
        { targetSemester: student.semester },
        { subjectId: { $exists: false } },
      ],
    })
      .populate('createdBy', 'name email role')
      .populate('subjectId', 'subjectName subjectCode')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ notices });
  } catch (error) {
    next(error);
  }
};

const getStudentExams = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(200).json({ exams: [] });
    const subjectIds = (student.subjects || []).map((s) => s.toString());
    const exams = await Exam.find({ subjectId: { $in: subjectIds } }).populate('subjectId', 'subjectName subjectCode').sort({ date: 1 });
    res.status(200).json({ exams });
  } catch (error) {
    next(error);
  }
};

const getStudentResults = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id });
    if (!student) return res.status(200).json({ results: [] });
    const results = await Result.find({ studentId: student._id }).populate('subjectId', 'subjectName subjectCode').sort({ createdAt: -1 });
    res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudentDashboard,
  getStudentTeachers,
  getStudentSubjects,
  getStudentAssignments,
  getStudentMaterials,
  getStudentAttendance,
  getStudentNotices,
  getStudentExams,
  getStudentResults,
};


