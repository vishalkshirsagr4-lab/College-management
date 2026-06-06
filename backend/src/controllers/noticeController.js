const Notice = require('../models/notice');
const { uploadToS3, deleteFromS3 } = require('../config/aws-s3');

const createNotice = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const notice = new Notice({ title, description, createdBy: req.user.id });
    if (req.file) {
      const uploadResult = await uploadToS3(req.file.buffer, 'college-management/notices', req.file.originalname);
      notice.attachment = {
        url: uploadResult.url,
        key: uploadResult.key,
      };
    }

    await notice.save();
    res.status(201).json({ message: 'Notice created', notice });
  } catch (error) {
    next(error);
  }
};

const getNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find().populate('createdBy', 'name email role');
    res.status(200).json({ notices });
  } catch (error) {
    next(error);
  }
};

const getNoticeById = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('createdBy', 'name email role');
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    res.status(200).json({ notice });
  } catch (error) {
    next(error);
  }
};

const updateNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    notice.title = req.body.title || notice.title;
    notice.description = req.body.description || notice.description;

    if (req.file) {
      if (notice.attachment?.key) {
        await deleteFromS3(notice.attachment.key);
      }
      const uploadResult = await uploadToS3(req.file.buffer, 'college-management/notices', req.file.originalname);
      notice.attachment = {
        url: uploadResult.url,
        key: uploadResult.key,
      };
    }

    await notice.save();
    res.status(200).json({ message: 'Notice updated', notice });
  } catch (error) {
    next(error);
  }
};

const deleteNotice = async (req, res, next) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    if (notice.attachment?.key) {
      await deleteFromS3(notice.attachment.key);
    }

    await notice.remove();
    res.status(200).json({ message: 'Notice deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotice,
  getNotices,
  getNoticeById,
  updateNotice,
  deleteNotice,
};