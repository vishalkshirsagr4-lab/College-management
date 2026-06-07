const User = require('../models/user');
const Teacher = require('../models/teacher');
const Subject = require('../models/subject');
const Student = require('../models/student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const createTeacher = async (req, res, next) => {
  try {
    const { name, email, department, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'teacher',
      isVerified: true,
    });

    const teacher = await Teacher.create({
      userId: user._id,
      department: department || 'Computer Science',
    });

    res.status(201).json({
      message: 'Teacher account created successfully',
      teacher: {
        id: teacher._id,
        userId: user._id,
        name: user.name,
        email: user.email,
        department: teacher.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

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

const assignTeacherToSubject = async (req, res, next) => {
  try {
    const { teacherId, subjectId } = req.body;

    if (!teacherId || !subjectId) {
      return res.status(400).json({ message: 'teacherId and subjectId are required' });
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    subject.teacherId = teacherId;
    await subject.save();

    if (!teacher.subjects.includes(subjectId)) {
      teacher.subjects.push(subjectId);
      await teacher.save();
    }

    res.status(200).json({
      message: 'Teacher assigned to subject',
      subject,
      teacher,
    });
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    // Backward-compatible: if no query params, return all students
    const { q, department, semester, year, section, email, usn, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);
    if (year) query.academicYear = year;
    if (section) query.section = section;
    if (email) query['userId.email'] = email;
    if (usn) query.usn = usn;

    if (q) {
      const re = new RegExp(q, 'i');
      query.$or = [{ name: re }, { usn: re }];
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Populate subjects and user info; also include subject->teacher->user chain
    const students = await Student.find(query)
      .populate({ path: 'userId', select: 'name email isVerified' })
      .populate({ path: 'subjects', select: 'subjectName subjectCode semester teacherId', populate: { path: 'teacherId', select: 'userId department', populate: { path: 'userId', select: 'name email' } } })
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Student.countDocuments(query);

    res.status(200).json({ students, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    next(error);
  }
};

const getAllTeachers = async (req, res, next) => {
  try {
    const { q, department, subject, designation, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (department) query.department = department;
    if (designation) query.designation = designation;
    if (subject) query.subjects = subject;

    if (q) {
      const re = new RegExp(q, 'i');
      // search in teacher name via populated user, or email
      const users = await require('../models/user').find({ $or: [{ name: re }, { email: re }] }).select('_id');
      const userIds = users.map((u) => u._id);
      query.userId = { $in: userIds };
    }

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const teachers = await Teacher.find(query)
      .populate({ path: 'userId', select: 'name email' })
      .populate({ path: 'subjects', select: 'subjectName subjectCode semester' })
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Teacher.countDocuments(query);
    res.status(200).json({ teachers, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (error) {
    next(error);
  }
};

const getAllSubjects = async (req, res, next) => {
  try {
    const subjects = await Subject.find()
      .populate('teacherId', 'userId department')
      .select('-__v');

    res.status(200).json({ subjects });
  } catch (error) {
    next(error);
  }
};

const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const query = {};
    if (q) {
      const re = new RegExp(q, 'i');
      query.$or = [{ name: re }, { email: re }];
    }
    const users = await User.find(query).select('name email role isVerified isBlocked');
    res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};

const convertUserToTeacher = async (req, res, next) => {
  try {
    const { userId, department } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'teacher') {
      return res.status(400).json({ message: 'User is already a teacher' });
    }

    user.role = 'teacher';
    await user.save();

    const teacher = await Teacher.create({ userId: user._id, department: department || 'Computer Science' });

    res.status(200).json({ message: 'User converted to teacher', teacher });
  } catch (error) {
    next(error);
  }
};

const updateTeacherById = async (req, res, next) => {
  try {
    const { teacherId } = req.params;
    const { userId, department } = req.body;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (userId) {
      teacher.userId = userId;
    }
    if (department) {
      teacher.department = department;
    }

    await teacher.save();
    const updated = await Teacher.findById(teacherId).populate('userId', 'name email role').populate('subjects');
    res.status(200).json({ message: 'Teacher updated successfully', teacher: updated });
  } catch (error) {
    next(error);
  }
};

const globalSearch = async (req, res, next) => {
  try {
    const { q = '', type, page = 1, limit = 10 } = req.query;
    const re = new RegExp((q || '').trim(), 'i');
    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const results = {};

    // helper to search users
    const User = require('../models/user');
    if (!q) return res.status(200).json({ results });

    if (!type || type === 'users') {
      const users = await User.find({ $or: [{ name: re }, { email: re }] }).select('name email role');
      results.users = users;
    }

    if (!type || type === 'students') {
      const Student = require('../models/student');
      const users = await require('../models/user').find({ $or: [{ name: re }, { email: re }] }).select('_id');
      const userIds = users.map((u) => u._id);
      const students = await Student.find({ $or: [{ userId: { $in: userIds } }, { usn: re }] })
        .populate('userId', 'name email')
        .skip(skip)
        .limit(Number(limit));
      results.students = students;
    }

    if (!type || type === 'teachers') {
      const Teacher = require('../models/teacher');
      const users = await require('../models/user').find({ $or: [{ name: re }, { email: re }] }).select('_id');
      const userIds = users.map((u) => u._id);
      const teachers = await Teacher.find({ $or: [{ userId: { $in: userIds } }, { department: re }] })
        .populate('userId', 'name email')
        .populate('subjects', 'subjectName subjectCode')
        .skip(skip)
        .limit(Number(limit));
      results.teachers = teachers;
    }

    if (!type || type === 'subjects') {
      const Subject = require('../models/subject');
      const subjects = await Subject.find({ $or: [{ subjectName: re }, { subjectCode: re }] })
        .populate('teacherId', 'userId')
        .skip(skip)
        .limit(Number(limit));
      results.subjects = subjects;
    }

    if (!type || type === 'assignments') {
      const Assignment = require('../models/assignment');
      const assignments = await Assignment.find({ title: re })
        .populate('teacherId', 'userId')
        .populate('subjectId', 'subjectName')
        .skip(skip)
        .limit(Number(limit));
      results.assignments = assignments;
    }

    if (!type || type === 'exams') {
      const Exam = require('../models/exam');
      const exams = await Exam.find({ examName: re })
        .populate('subjectId', 'subjectName')
        .skip(skip)
        .limit(Number(limit));
      results.exams = exams;
    }

    if (!type || type === 'results') {
      const Result = require('../models/result');
      const resultsDocs = await Result.find()
        .populate('studentId', 'userId')
        .populate('subjectId', 'subjectName')
        .skip(skip)
        .limit(Number(limit));
      // filter locally for q match on student name or subject
      results.results = resultsDocs.filter((r) => {
        const sName = r.studentId?.name || '';
        const subj = r.subjectId?.subjectName || '';
        return re.test(sName) || re.test(subj) || re.test(String(r.marks));
      });
    }

    if (!type || type === 'notices') {
      const Notice = require('../models/notice');
      const notices = await Notice.find({ $or: [{ title: re }, { description: re }] })
        .populate('createdBy', 'name email')
        .skip(skip)
        .limit(Number(limit));
      results.notices = notices;
    }

    return res.status(200).json({ results });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const Student = require('../models/student');
    const Teacher = require('../models/teacher');
    const Subject = require('../models/subject');
    const Attendance = require('../models/attendance');
    const Assignment = require('../models/assignment');
    const Exam = require('../models/exam');

    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    const departments = await Student.distinct('department');
    const totalDepartments = departments.length;

    // active classes estimate: distinct combinations of semester+section
    const classes = await Student.aggregate([
      { $group: { _id: { semester: '$semester', section: '$section', department: '$department' } } },
      { $count: 'count' },
    ]);
    const activeClasses = classes[0]?.count || 0;

    // attendance rate: compute percent of present entries across all attendance entries
    const attendanceAgg = await Attendance.aggregate([
      { $unwind: '$entries' },
      { $group: { _id: '$entries.status', count: { $sum: 1 } } },
    ]);
    let present = 0; let total = 0;
    attendanceAgg.forEach((r) => {
      total += r.count;
      if (String(r._id).toLowerCase() === 'present') present += r.count;
      if (String(r._id).toLowerCase() === 'present' || String(r._id).toLowerCase() === 'late' || String(r._id).toLowerCase() === 'approved') present += 0; // already counted
    });
    const attendanceRate = total ? Math.round((present / total) * 100) : 0;

    const upcomingExams = await Exam.countDocuments({ date: { $gte: new Date() } });
    const pendingAssignments = await Assignment.countDocuments({ dueDate: { $gte: new Date() } });

    // simple growth metric: students added in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newStudents = await Student.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    res.status(200).json({
      totals: { totalStudents, totalTeachers, totalSubjects, totalDepartments, activeClasses },
      attendanceRate,
      upcomingExams,
      pendingAssignments,
      growth: { newStudentsLast30Days: newStudents },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeacher,
  createSubject,
  assignTeacherToSubject,
  getAllStudents,
  getAllTeachers,
  getAllSubjects,
  getAllUsers,
  blockUser,
  searchUsers,
  convertUserToTeacher,
  updateTeacherById,
  globalSearch,
  getDashboardStats,
};
