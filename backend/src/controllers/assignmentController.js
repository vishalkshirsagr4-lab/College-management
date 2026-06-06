const Assignment = require('../models/assignment');
const Subject = require('../models/subject');
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

    const assignment = new Assignment({ title, description, subjectId, dueDate });
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
    const assignments = await Assignment.find().populate('subjectId', 'subjectName subjectCode');
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

    assignment.title = req.body.title || assignment.title;
    assignment.description = req.body.description || assignment.description;
    assignment.dueDate = req.body.dueDate || assignment.dueDate;

    if (req.body.subjectId && req.body.subjectId !== assignment.subjectId.toString()) {
      const subject = await Subject.findById(req.body.subjectId);
      if (!subject) {
        return res.status(404).json({ message: 'Subject not found' });
      }
      assignment.subjectId = req.body.subjectId;
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