const Assignment = require('../models/assignment');
const Subject = require('../models/subject');
const Teacher = require('../models/teacher');
const Student = require('../models/student');
const { uploadToS3, deleteFromS3 } = require('../config/aws-s3');

const createAssignment = async (req, res, next) => {
  try {
    const { title, description, subjectId, dueDate } = req.body;
    if (!title || !subjectId || !dueDate) {
      return res.status(400).json({ message: 'Title, subjectId, and due date are required' });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    const assignmentData = {
      title,
      description,
      subjectId,
      dueDate,
      semester: subject.semester,
    };

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      const subjectAssigned = teacher.subjects.some((id) => id.toString() === subjectId);
      if (!subjectAssigned) {
        return res.status(403).json({ message: 'You are not assigned to this subject' });
      }
      assignmentData.teacherId = teacher._id;
    }

    const assignment = new Assignment(assignmentData);
    if (req.file) {
      const uploadResult = await uploadToS3(req.file.buffer, 'college-management/assignments', req.file.originalname);
      assignment.file = {
        url: uploadResult.url,
        key: uploadResult.key,
      };
    }

    await assignment.save();
    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (error) {
    next(error);
  }
};

const getAssignments = async (req, res, next) => {
  try {
    const { subjectId, semester } = req.query;
    const query = {};
    if (subjectId) query.subjectId = subjectId;
    if (semester) query.semester = Number(semester);

    if (req.user.role === 'student') {
      const student = await Student.findOne({ userId: req.user.id });
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      query.semester = student.semester;
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher) {
        return res.status(404).json({ message: 'Teacher not found' });
      }
      if (subjectId) {
        const subjectAssigned = teacher.subjects.some((id) => id.toString() === subjectId);
        if (!subjectAssigned) {
          return res.status(403).json({ message: 'You are not assigned to this subject' });
        }
      } else {
        query.subjectId = { $in: teacher.subjects };
      }
    }

    const assignments = await Assignment.find(query)
      .populate('subjectId', 'subjectName subjectCode semester')
      .populate({ path: 'teacherId', populate: { path: 'userId', select: 'name email' } })
      .sort({ dueDate: 1 });
    res.status(200).json({ assignments });
  } catch (error) {
    next(error);
  }
};

const getAssignmentById = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('subjectId', 'subjectName subjectCode');
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.status(200).json({ assignment });
  } catch (error) {
    next(error);
  }
};

const updateAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || !assignment.teacherId || assignment.teacherId.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'Permission denied: cannot modify this assignment' });
      }
    }

    assignment.title = req.body.title || assignment.title;
    assignment.description = req.body.description || assignment.description;
    assignment.dueDate = req.body.dueDate || assignment.dueDate;

    if (req.body.subjectId && req.body.subjectId !== assignment.subjectId.toString()) {
      const subject = await Subject.findById(req.body.subjectId);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      if (req.user.role === 'teacher') {
        const teacher = await Teacher.findOne({ userId: req.user.id });
        if (!teacher || !teacher.subjects.some((id) => id.toString() === req.body.subjectId)) {
          return res.status(403).json({ message: 'You are not assigned to this subject' });
        }
      }
      assignment.subjectId = req.body.subjectId;
      assignment.semester = subject.semester;
    }

    if (req.file) {
      if (assignment.file?.key) {
        await deleteFromS3(assignment.file.key);
      }
      const uploadResult = await uploadToS3(req.file.buffer, 'college-management/assignments', req.file.originalname);
      assignment.file = {
        url: uploadResult.url,
        key: uploadResult.key,
      };
    }

    await assignment.save();
    res.status(200).json({ message: 'Assignment updated', assignment });
  } catch (error) {
    next(error);
  }
};

const deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ userId: req.user.id });
      if (!teacher || !assignment.teacherId || assignment.teacherId.toString() !== teacher._id.toString()) {
        return res.status(403).json({ message: 'Permission denied: cannot delete this assignment' });
      }
    }

    if (assignment.file?.key) {
      await deleteFromS3(assignment.file.key);
    }

    await assignment.remove();
    res.status(200).json({ message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
};