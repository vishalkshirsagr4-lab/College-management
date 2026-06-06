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
    const students = await Student.find()
      .populate('userId', 'name email isVerified')
      .select('-__v');

    res.status(200).json({ students });
  } catch (error) {
    next(error);
  }
};

const getAllTeachers = async (req, res, next) => {
  try {
    const teachers = await Teacher.find()
      .populate('userId', 'name email')
      .populate('subjects', 'subjectName subjectCode')
      .select('-__v');

    res.status(200).json({ teachers });
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

module.exports = {
  createTeacher,
  createSubject,
  assignTeacherToSubject,
  getAllStudents,
  getAllTeachers,
  getAllSubjects,
  blockUser,
  searchUsers,
  convertUserToTeacher,
};
