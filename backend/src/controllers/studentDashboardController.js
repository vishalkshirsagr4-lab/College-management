const Student = require('../models/student');
const Attendance = require('../models/attendence');
const Fee = require('../models/fee');
const Notice = require('../models/notice');
const Result = require('../models/result');
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

module.exports = {
  getStudentDashboard,
};

