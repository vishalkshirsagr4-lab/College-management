const Student = require('../models/student');
const User = require('../models/user');
const { uploadToS3, deleteFromS3 } = require('../config/aws-s3');

const createStudentProfile = async (req, res, next) => {
  try {
    const { userId, usn, semester, section, phone } = req.body;
    const requestUserId = req.user.id;
    const targetUserId = userId || requestUserId;

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingProfile = await Student.findOne({ userId: targetUserId });
    if (existingProfile) {
      return res.status(400).json({ message: 'Student profile already exists' });
    }

    const studentProfile = new Student({
      userId: targetUserId,
      usn,
      semester,
      section,
      phone,
    });

    if (req.file) {
      const uploadResult = await uploadToS3(req.file.buffer, 'college-management/students', req.file.originalname);
      studentProfile.photo = {
        url: uploadResult.url,
        key: uploadResult.key,
      };
    }

    await studentProfile.save();
    res.status(201).json({ message: 'Student profile created', student: studentProfile });
  } catch (error) {
    next(error);
  }
};

const getAllStudents = async (req, res, next) => {
  try {
    const students = await Student.find().populate('userId', 'name email role profileImage');
    res.status(200).json({ students });
  } catch (error) {
    next(error);
  }
};

const getMyStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findOne({ userId: req.user.id }).populate('userId', 'name email role profileImage');
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.status(200).json({ student });
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email role profileImage');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ student });
  } catch (error) {
    next(error);
  }
};

const updateStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (req.user.role === 'student' && student.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    student.usn = req.body.usn || student.usn;
    student.semester = req.body.semester || student.semester;
    student.section = req.body.section || student.section;
    student.phone = req.body.phone || student.phone;

    if (req.file) {
      if (student.photo?.key) {
        await deleteFromS3(student.photo.key);
      }
      const uploadResult = await uploadToS3(req.file.buffer, 'college-management/students', req.file.originalname);
      student.photo = {
        url: uploadResult.url,
        key: uploadResult.key,
      };
    }

    await student.save();
    res.status(200).json({ message: 'Student profile updated', student });
  } catch (error) {
    next(error);
  }
};

const deleteStudentProfile = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (student.photo?.key) {
      await deleteFromS3(student.photo.key);
    }

    await student.remove();
    res.status(200).json({ message: 'Student profile deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudentProfile,
  getAllStudents,
  getMyStudentProfile,
  getStudentById,
  updateStudentProfile,
  deleteStudentProfile,
};