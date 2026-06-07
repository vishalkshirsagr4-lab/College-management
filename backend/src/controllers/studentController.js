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
    const { semester, section } = req.query;
    const query = {};
    if (semester) query.semester = Number(semester);
    if (section) query.section = section;
    const students = await Student.find(query)
      .populate('userId', 'name email role profileImage')
      .populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email' } } });
    res.status(200).json({ students });
  } catch (error) {
    next(error);
  }
};

const getMyStudentProfile = async (req, res, next) => {
  try {
    let student = await Student.findOne({ userId: req.user.id })
      .populate('userId', 'name email role profileImage')
      .populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email' } } });
    if (!student && req.user.role === 'student') {
      const usn = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      const createdStudent = await Student.create({
        userId: req.user.id,
        usn,
        semester: 1,
        section: 'A',
        phone: '',
        department: 'General',
        academicYear: '1st Year',
      });
      student = await Student.findById(createdStudent._id)
        .populate('userId', 'name email role profileImage')
        .populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email' } } });
    }
    res.status(200).json({ student });
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    let student = await Student.findOne({ userId: req.user.id })
      .populate('userId', 'name email role isVerified isBlocked')
      .populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email' } } });
    if (!student && req.user.role === 'student') {
      const usn = `STU-${Math.floor(1000 + Math.random() * 9000)}`;
      const createdStudent = await Student.create({
        userId: req.user.id,
        usn,
        semester: 1,
        section: 'A',
        phone: '',
        department: 'General',
        academicYear: '1st Year',
      });
      student = await Student.findById(createdStudent._id)
        .populate('userId', 'name email role isVerified isBlocked')
        .populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email' } } });
    }
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }
    res.status(200).json({ student });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const { phone, address, emergencyContact, emergencyContactPhone } = req.body;
    const student = await Student.findOne({ userId: req.user.id });

    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    // Update editable fields only
    if (phone) student.phone = phone;
    if (address) student.address = address;
    if (emergencyContact) student.emergencyContact = emergencyContact;
    if (emergencyContactPhone) student.emergencyContactPhone = emergencyContactPhone;

    // Handle photo upload
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
    
    const updated = await Student.findById(student._id)
      .populate('userId', 'name email role isVerified')
      .populate('subjects', 'subjectName subjectCode semester');

    res.status(200).json({ message: 'Profile updated successfully', student: updated });
  } catch (error) {
    next(error);
  }
};

const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).populate('userId', 'name email role profileImage').populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email' } } });
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

const updateStudentSubjects = async (req, res, next) => {
  try {
    const { subjects } = req.body; // expected array of subject IDs
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (req.user.role === 'student' && student.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!Array.isArray(subjects)) {
      return res.status(400).json({ message: 'subjects must be an array of subject IDs' });
    }

    // Normalize ids
    const newSubjects = subjects.map((s) => String(s));

    // Remove student from previous subject.enrolledStudents where not selected anymore
    const Subject = require('../models/subject');
    const Teacher = require('../models/teacher');

    const prevSubjects = (student.subjects || []).map((s) => String(s));
    const toRemove = prevSubjects.filter((s) => !newSubjects.includes(s));
    const toAdd = newSubjects.filter((s) => !prevSubjects.includes(s));

    // Pull student from removed subjects
    if (toRemove.length) {
      await Subject.updateMany({ _id: { $in: toRemove } }, { $pull: { enrolledStudents: student._id } });
      // For removed subjects, also remove from teacher.assignedStudents if teacher exists
      const removedSubjects = await Subject.find({ _id: { $in: toRemove } });
      const removedTeacherIds = removedSubjects.map((rs) => rs.teacherId).filter(Boolean);
      if (removedTeacherIds.length) {
        await Teacher.updateMany({ _id: { $in: removedTeacherIds } }, { $pull: { assignedStudents: student._id } });
      }
    }

    // Add student to newly selected subjects
    if (toAdd.length) {
      await Subject.updateMany({ _id: { $in: toAdd } }, { $addToSet: { enrolledStudents: student._id } });
      // For added subjects, ensure the teacher has this student in assignedStudents
      const addedSubjects = await Subject.find({ _id: { $in: toAdd } });
      const teacherMap = {};
      addedSubjects.forEach((s) => {
        if (s.teacherId) teacherMap[String(s.teacherId)] = true;
      });
      const teacherIds = Object.keys(teacherMap);
      if (teacherIds.length) {
        await Teacher.updateMany({ _id: { $in: teacherIds } }, { $addToSet: { assignedStudents: student._id } });
      }
    }

    // Update student subjects list
    student.subjects = newSubjects;
    await student.save();

    const populated = await Student.findById(student._id)
      .populate({ path: 'subjects', populate: { path: 'teacherId', populate: { path: 'userId', select: 'name email phone' } } })
      .populate('userId', 'name email');

    res.status(200).json({ message: 'Student subjects updated', student: populated });
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
  getMyProfile,
  getStudentById,
  updateStudentProfile,
  updateMyProfile,
  updateStudentSubjects,
  deleteStudentProfile,
};