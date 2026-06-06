const Teacher = require('../models/teacher');
const Subject = require('../models/subject');
const Attendance = require('../models/attendence');
const Result = require('../models/result');
const { uploadToS3, deleteFromS3 } = require('../config/aws-s3');

const getTeacherProfile = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id })
      .populate('userId', 'name email profileImage')
      .populate('subjects', 'subjectName subjectCode semester');

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    res.status(200).json({ teacher });
  } catch (error) {
    next(error);
  }
};

const updateTeacherProfile = async (req, res, next) => {
  try {
    const { department } = req.body;
    const teacher = await Teacher.findOne({ userId: req.user.id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher profile not found' });
    }

    teacher.department = department || teacher.department;

    if (req.file) {
      if (teacher.photo?.key) {
        await deleteFromS3(teacher.photo.key);
      }
      const uploadResult = await uploadToS3(req.file.buffer, 'college-management/teachers', req.file.originalname);
      teacher.photo = {
        url: uploadResult.url,
        key: uploadResult.key,
      };
    }

    await teacher.save();
    res.status(200).json({ message: 'Teacher profile updated', teacher });
  } catch (error) {
    next(error);
  }
};

const getTeacherSubjects = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id }).populate('subjects');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.status(200).json({ subjects: teacher.subjects });
  } catch (error) {
    next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const { studentId, subjectId, date, status } = req.body;

    if (!studentId || !subjectId || !status) {
      return res.status(400).json({ message: 'studentId, subjectId, and status are required' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const isSubjectAssigned = teacher.subjects.some((id) => id.toString() === subjectId);
    if (!isSubjectAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this subject' });
    }

    const attendance = await Attendance.create({
      studentId,
      subjectId,
      date: date || new Date(),
      status,
    });

    res.status(201).json({ message: 'Attendance marked', attendance });
  } catch (error) {
    next(error);
  }
};

const uploadMarks = async (req, res, next) => {
  try {
    const { studentId, subjectId, marks, grade } = req.body;

    if (!studentId || !subjectId || marks == null || !grade) {
      return res.status(400).json({ message: 'studentId, subjectId, marks, and grade are required' });
    }

    const teacher = await Teacher.findOne({ userId: req.user.id });
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const isSubjectAssigned = teacher.subjects.some((id) => id.toString() === subjectId);
    if (!isSubjectAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this subject' });
    }

    const existingResult = await Result.findOne({ studentId, subjectId });
    if (existingResult) {
      existingResult.marks = marks;
      existingResult.grade = grade;
      await existingResult.save();
      return res.status(200).json({ message: 'Result updated', result: existingResult });
    }

    const result = await Result.create({ studentId, subjectId, marks, grade });
    res.status(201).json({ message: 'Result created', result });
  } catch (error) {
    next(error);
  }
};

const getStudentAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const teacher = await Teacher.findOne({ userId: req.user.id });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const attendance = await Attendance.find({ studentId })
      .populate('subjectId', 'subjectName subjectCode');

    res.status(200).json({ attendance });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeacherProfile,
  updateTeacherProfile,
  getTeacherSubjects,
  markAttendance,
  uploadMarks,
  getStudentAttendance,
};
