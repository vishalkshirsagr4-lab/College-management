const Leave = require('../models/leave');

const applyLeave = async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    const studentId = req.user?.role === 'student' ? (req.user._id || req.user.id) : req.body.studentId;
    if (!studentId) return res.status(400).json({ message: 'studentId required' });
    const l = await Leave.create({ studentId, type, startDate, endDate, reason });
    res.status(201).json({ message: 'Leave applied', leave: l });
  } catch (error) {
    next(error);
  }
};

const reviewLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // approved/rejected
    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    // If reviewer is a teacher, allow only if the student belongs to one of their subjects
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/teacher');
      const Student = require('../models/student');
      const teacherDoc = await Teacher.findOne({ userId: req.user.id });
      if (!teacherDoc) return res.status(403).json({ message: 'Permission denied' });
      const student = await Student.findById(leave.studentId).populate('subjects');
      const belongs = (student.subjects || []).some((sub) => sub.teacherId && sub.teacherId.toString() === teacherDoc._id.toString());
      if (!belongs) return res.status(403).json({ message: 'Permission denied: student not in your subjects' });
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    await leave.save();
    res.status(200).json({ message: 'Leave reviewed', leave });
  } catch (error) {
    next(error);
  }
};

module.exports = { applyLeave, reviewLeave };
